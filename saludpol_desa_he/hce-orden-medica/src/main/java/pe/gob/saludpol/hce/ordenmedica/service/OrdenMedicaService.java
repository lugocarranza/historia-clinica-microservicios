package pe.gob.saludpol.hce.ordenmedica.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.gob.saludpol.hce.ordenmedica.client.FiliacionClient;
import pe.gob.saludpol.hce.ordenmedica.client.MaestrosClient;
import pe.gob.saludpol.hce.ordenmedica.client.dto.AdmisionClientDto;
import pe.gob.saludpol.hce.ordenmedica.client.dto.ApiResponseDto;
import pe.gob.saludpol.hce.ordenmedica.client.dto.EstablecimientoClientDto;
import pe.gob.saludpol.hce.ordenmedica.common.enums.TipoAtencionOrden;
import pe.gob.saludpol.hce.ordenmedica.common.enums.TipoOrdenMedica;
import pe.gob.saludpol.hce.ordenmedica.common.exception.EntityNotFoundException;
import pe.gob.saludpol.hce.ordenmedica.common.exception.EntityUnprocessableException;
import pe.gob.saludpol.hce.ordenmedica.dto.*;
import pe.gob.saludpol.hce.ordenmedica.entity.*;
import pe.gob.saludpol.hce.ordenmedica.repository.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrdenMedicaService {

    private static final String ESTADO_BORRADOR = "BORRADOR";
    private static final String ESTADO_EMITIDA = "EMITIDA";

    private final OrdenMedicaRepository ordenMedicaRepository;
    private final OrdenMedicaDetRepository ordenMedicaDetRepository;
    private final OrdenHemodialisisRepository hemodialisisRepository;
    private final OrdenQuimioterapiaRepository quimioterapiaRepository;
    private final FiliacionClient filiacionClient;
    private final MaestrosClient maestrosClient;

    @Transactional
    public OrdenMedicaDetalleResponse crear(OrdenMedicaRequest request) {
        return crear(request, LocalDateTime.now());
    }

    private OrdenMedicaDetalleResponse crear(OrdenMedicaRequest request, LocalDateTime fechaEmision) {
        TipoOrdenMedica tipoOrden = validarContenidoOrden(request);
        OrdenMedica orden = new OrdenMedica();
        aplicarCabeceraDesdeRequest(orden, request, tipoOrden, fechaEmision);
        orden.setEstado(ESTADO_BORRADOR);
        aplicarDetalles(orden, request.detalles());
        aplicarHemodialisis(orden, request.hemodialisis());
        aplicarQuimioterapia(orden, request.quimioterapia());
        orden.setEstado(ESTADO_EMITIDA);
        OrdenMedica guardada = ordenMedicaRepository.save(orden);
        return obtenerDetalle(guardada.getId());
    }

    @Transactional
    public List<OrdenMedicaDetalleResponse> crearConsolidado(OrdenMedicaRequest request) {
        List<OrdenMedicaDetRequest> detalles = request.detalles() != null ? request.detalles() : List.of();
        boolean tieneDetalles = !detalles.isEmpty();
        boolean tieneHemo = request.hemodialisis() != null;
        boolean tieneQuimio = request.quimioterapia() != null;

        if (!tieneDetalles && !tieneHemo && !tieneQuimio) {
            return List.of(crear(request));
        }

        Map<String, List<OrdenMedicaDetRequest>> detallesPorTipo = new LinkedHashMap<>();
        for (OrdenMedicaDetRequest detalle : detalles) {
            TipoOrdenMedica tipoDetalle = TipoOrdenMedica.fromCodigo(detalle.tipo());
            if (tipoDetalle == null || !tipoDetalle.usaDetallesGenerales()) {
                throw new EntityUnprocessableException(
                        "Cada prestacion general debe indicar un tipo de orden valido: LAB, IMG, PDI, PTE, TES u OTR.");
            }
            detallesPorTipo.computeIfAbsent(tipoDetalle.name(), key -> new ArrayList<>()).add(detalle);
        }

        List<OrdenMedicaDetalleResponse> creadas = new ArrayList<>();
        LocalDateTime fechaBase = LocalDateTime.now();
        int indice = 0;
        for (Map.Entry<String, List<OrdenMedicaDetRequest>> entry : detallesPorTipo.entrySet()) {
            creadas.add(crear(copiarRequest(
                    request,
                    entry.getKey(),
                    entry.getValue(),
                    null,
                    null
            ), fechaBase.plusNanos(indice++)));
        }
        if (tieneHemo) {
            creadas.add(crear(copiarRequest(
                    request,
                    TipoOrdenMedica.HEM.name(),
                    null,
                    request.hemodialisis(),
                    null
            ), fechaBase.plusNanos(indice++)));
        }
        if (tieneQuimio) {
            creadas.add(crear(copiarRequest(
                    request,
                    TipoOrdenMedica.QUI.name(),
                    null,
                    null,
                    request.quimioterapia()
            ), fechaBase.plusNanos(indice)));
        }
        return creadas;
    }

    @Transactional
    public OrdenMedicaDetalleResponse actualizar(Long id, OrdenMedicaRequest request) {
        OrdenMedica orden = ordenMedicaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Orden medica no encontrada con id: " + id));
        validarOrdenEditable(orden);

        TipoOrdenMedica tipoOrden = validarContenidoOrden(request);
        if (!Objects.equals(orden.getTipoOrden(), tipoOrden.name())) {
            throw new EntityUnprocessableException("No se permite cambiar el tipo de orden");
        }
        if (!Objects.equals(orden.getAtencionId(), request.atencionId())
                || !Objects.equals(orden.getTipoAtencion(), request.tipoAtencion())) {
            throw new EntityUnprocessableException("No se permite cambiar la atencion origen de la orden");
        }

        aplicarCabeceraDesdeRequest(orden, request, tipoOrden, orden.getFechaEmision());
        aplicarDetalles(orden, request.detalles());
        aplicarHemodialisis(orden, request.hemodialisis());
        aplicarQuimioterapia(orden, request.quimioterapia());
        if (ESTADO_BORRADOR.equals(orden.getEstado())) {
            orden.setEstado(ESTADO_EMITIDA);
        }

        ordenMedicaRepository.save(orden);
        return obtenerDetalle(id);
    }

    @Transactional(readOnly = true)
    public List<OrdenMedicaResumenDto> listarPorDni(String dniPaciente) {
        return ordenMedicaRepository.findByDniPacienteOrderByFechaEmisionDesc(dniPaciente)
                .stream()
                .map(orden -> toResumen(orden, obtenerAdmisionOrNull(orden.getAdmisionId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrdenMedicaResumenDto> listarPorAtencion(String tipoAtencion, Long atencionId) {
        validarTipoAtencion(tipoAtencion);
        return ordenMedicaRepository
                .findByTipoAtencionAndAtencionIdOrderByFechaEmisionDescTipoOrdenAsc(tipoAtencion, atencionId)
                .stream()
                .map(orden -> toResumen(orden, obtenerAdmisionOrNull(orden.getAdmisionId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrdenMedicaLineaAtencionDto> listarLineasPorAtencion(String tipoAtencion, Long atencionId) {
        validarTipoAtencion(tipoAtencion);
        return ordenMedicaRepository
                .findByTipoAtencionAndAtencionIdOrderByFechaEmisionDescTipoOrdenAsc(tipoAtencion, atencionId)
                .stream()
                .flatMap(orden -> toLineasAtencion(orden).stream())
                .toList();
    }

    @Transactional(readOnly = true)
    public OrdenMedicaDetalleResponse obtenerDetalle(Long id) {
        OrdenMedica orden = ordenMedicaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Orden medica no encontrada con id: " + id));
        List<OrdenMedicaDet> detalles = ordenMedicaDetRepository.findByOrdenMedica_IdOrderByIdAsc(orden.getId());
        OrdenHemodialisis hemo = hemodialisisRepository.findByOrdenMedica_Id(orden.getId()).orElse(null);
        OrdenQuimioterapia quimio = quimioterapiaRepository.findByOrdenMedica_Id(orden.getId()).orElse(null);
        AdmisionClientDto admision = obtenerAdmisionOrNull(orden.getAdmisionId());
        EstablecimientoLookup establecimiento = obtenerEstablecimiento(orden.getIpressCui());

        return new OrdenMedicaDetalleResponse(
                toCabecera(orden, admision),
                toAsegurado(orden, admision),
                toEstablecimiento(orden, establecimiento),
                toCobertura(orden),
                toActoMedico(orden),
                toProfesional(orden),
                agruparPrestaciones(detalles),
                hemo != null ? toHemodialisisDto(hemo) : null,
                quimio != null ? toQuimioterapiaDto(quimio) : null,
                toFirma(orden)
        );
    }

    private OrdenMedicaRequest copiarRequest(
            OrdenMedicaRequest base,
            String tipoOrden,
            List<OrdenMedicaDetRequest> detalles,
            OrdenHemodialisisRequest hemodialisis,
            OrdenQuimioterapiaRequest quimioterapia) {
        return new OrdenMedicaRequest(
                base.nroOap(),
                base.admisionId(),
                base.historiaClinicaId(),
                base.dniPaciente(),
                base.atencionId(),
                base.tipoAtencion(),
                tipoOrden,
                base.nroAps(),
                base.nroCartaGarantia(),
                base.edad(),
                base.tipoSeguro(),
                base.tipoBeneficiario(),
                base.planSeguro(),
                base.tipoCobertura(),
                base.tipoBeneficio(),
                base.condicion(),
                base.parentesco(),
                base.actividad(),
                base.subActividad(),
                base.servicio(),
                base.fechaAtencion(),
                base.ipressCui(),
                base.profNombre(),
                base.profProfesion(),
                base.profDocumento(),
                base.profColegiatura(),
                base.profRne(),
                detalles,
                hemodialisis,
                quimioterapia
        );
    }

    private void aplicarCabeceraDesdeRequest(
            OrdenMedica orden,
            OrdenMedicaRequest request,
            TipoOrdenMedica tipoOrden,
            LocalDateTime fechaEmision) {
        validarTipoAtencion(request.tipoAtencion());
        orden.setNroOap(request.nroOap());
        orden.setAdmisionId(request.admisionId());
        orden.setHistoriaClinicaId(request.historiaClinicaId());
        orden.setDniPaciente(request.dniPaciente());
        orden.setAtencionId(request.atencionId());
        orden.setTipoAtencion(request.tipoAtencion());
        orden.setTipoOrden(tipoOrden.name());
        orden.setEdad(request.edad());
        orden.setTipoSeguro(request.tipoSeguro());
        orden.setTipoBeneficiario(request.tipoBeneficiario());
        orden.setPlanSeguro(request.planSeguro());
        orden.setTipoCobertura(request.tipoCobertura());
        orden.setTipoBeneficio(request.tipoBeneficio());
        orden.setCondicion(request.condicion());
        orden.setParentesco(request.parentesco());
        orden.setActividad(request.actividad());
        orden.setSubActividad(request.subActividad());
        orden.setServicio(request.servicio());
        orden.setFechaAtencion(request.fechaAtencion());
        orden.setIpressCui(request.ipressCui());
        orden.setProfNombre(request.profNombre());
        orden.setProfProfesion(request.profProfesion());
        orden.setProfDocumento(request.profDocumento());
        orden.setProfColegiatura(request.profColegiatura());
        orden.setProfRne(request.profRne());
        orden.setNroAps(request.nroAps());
        orden.setNroCartaGarantia(request.nroCartaGarantia());
        if (orden.getFechaEmision() == null) {
            orden.setFechaEmision(fechaEmision != null ? fechaEmision : LocalDateTime.now());
        }
    }

    private void validarOrdenEditable(OrdenMedica orden) {
        if ("ANULADA".equals(orden.getEstado()) || "ATENDIDA".equals(orden.getEstado())) {
            throw new EntityUnprocessableException(
                    "La orden no puede modificarse porque ya fue " + orden.getEstado().toLowerCase() + ".");
        }
    }

    private TipoAtencionOrden validarTipoAtencion(String codigo) {
        TipoAtencionOrden tipo = TipoAtencionOrden.fromCodigo(codigo);
        if (tipo == null) {
            throw new EntityUnprocessableException("El tipo de atencion no es valido. Use CE, CS, EM o HO.");
        }
        return tipo;
    }

    private TipoOrdenMedica validarContenidoOrden(OrdenMedicaRequest request) {
        TipoOrdenMedica tipoOrden = TipoOrdenMedica.fromCodigo(request.tipoOrden());
        if (tipoOrden == null) {
            throw new EntityUnprocessableException("El tipo de orden no es valido. Use LAB, IMG, PDI, PTE, TES, OTR, HEM o QUI.");
        }
        List<OrdenMedicaDetRequest> detalles = request.detalles() != null ? request.detalles() : List.of();
        boolean tieneDetalles = !detalles.isEmpty();
        boolean tieneHemo = request.hemodialisis() != null;
        boolean tieneQuimio = request.quimioterapia() != null;

        if (!tieneDetalles && !tieneHemo && !tieneQuimio) {
            throw new EntityUnprocessableException("Debe registrar al menos una prestacion para guardar la orden medica.");
        }
        if ((tieneHemo && tieneQuimio) || ((tieneHemo || tieneQuimio) && tieneDetalles)) {
            throw new EntityUnprocessableException("No se puede mezclar Hemodialisis o Quimioterapia con otros tipos de orden medica.");
        }
        if (tipoOrden == TipoOrdenMedica.HEM && !tieneHemo) {
            throw new EntityUnprocessableException("La orden de Hemodialisis requiere completar su bloque especializado.");
        }
        if (tipoOrden == TipoOrdenMedica.QUI && !tieneQuimio) {
            throw new EntityUnprocessableException("La orden de Quimioterapia requiere completar su bloque especializado.");
        }
        if (!tipoOrden.usaDetallesGenerales() && tieneDetalles) {
            throw new EntityUnprocessableException("Las ordenes especializadas no admiten prestaciones generales.");
        }
        if (tipoOrden.usaDetallesGenerales()) {
            if (!tieneDetalles || tieneHemo || tieneQuimio) {
                throw new EntityUnprocessableException("El tipo de orden seleccionado requiere prestaciones generales exclusivas.");
            }
            boolean tiposInvalidos = detalles.stream().anyMatch(det -> !tipoOrden.coincideConDetalle(det.tipo()));
            if (tiposInvalidos) {
                throw new EntityUnprocessableException(
                        "No se pueden mezclar tipos de orden en una misma cabecera. Use el guardado consolidado para separar las cabeceras por tipo.");
            }
        }
        return tipoOrden;
    }

    private OrdenMedicaResumenDto toResumen(OrdenMedica orden, AdmisionClientDto admision) {
        int cantidad = ordenMedicaDetRepository.findByOrdenMedica_IdOrderByIdAsc(orden.getId()).size();
        if (cantidad == 0 && (orden.getHemodialisis() != null || orden.getQuimioterapia() != null)) {
            cantidad = 1;
        }
        return new OrdenMedicaResumenDto(
                orden.getId(),
                orden.getNroOap(),
                orden.getDniPaciente(),
                nombrePaciente(admision),
                orden.getAdmisionId(),
                orden.getHistoriaClinicaId(),
                orden.getFechaEmision(),
                orden.getEstado(),
                orden.getNroAps(),
                orden.getNroCartaGarantia(),
                toTipoAtencionDto(orden.getTipoAtencion()),
                toTipoOrdenDto(orden.getTipoOrden()),
                cantidad
        );
    }

    private OrdenMedicaCabeceraDto toCabecera(OrdenMedica orden, AdmisionClientDto admision) {
        LocalDateTime fecha = orden.getFechaEmision();
        return new OrdenMedicaCabeceraDto(
                orden.getId(),
                orden.getNroOap(),
                admision != null ? admision.nroHc() : null,
                fecha != null ? fecha.toLocalDate() : null,
                fecha != null ? fecha.toLocalTime() : null,
                orden.getNroAps(),
                orden.getNroCartaGarantia(),
                orden.getEstado(),
                toTipoAtencionDto(orden.getTipoAtencion()),
                toTipoOrdenDto(orden.getTipoOrden()),
                orden.getAtencionId(),
                orden.getAdmisionId(),
                orden.getHistoriaClinicaId(),
                orden.getDniPaciente(),
                orden.getEdad(),
                orden.getTipoSeguro(),
                orden.getTipoBeneficiario(),
                orden.getPlanSeguro()
        );
    }

    private AseguradoDto toAsegurado(OrdenMedica orden, AdmisionClientDto admision) {
        Integer edad = orden.getEdad();
        String edadTexto = edad != null ? String.valueOf(edad) : null;
        String documento = orden.getDniPaciente() != null ? "DNI " + orden.getDniPaciente() : null;
        return new AseguradoDto(
                nombrePaciente(admision),
                edad,
                edadTexto,
                admision != null ? admision.sexo() : null,
                admision != null ? admision.fechaNac() : null,
                documento,
                orden.getTipoBeneficiario(),
                orden.getCondicion(),
                orden.getParentesco()
        );
    }

    private EstablecimientoDto toEstablecimiento(
            OrdenMedica orden,
            EstablecimientoLookup lookup) {
        EstablecimientoClientDto establecimiento = lookup != null ? lookup.establecimiento() : null;
        return new EstablecimientoDto(
                orden.getIpressCui(),
                establecimiento != null ? establecimiento.nombreIpress() : null,
                establecimiento != null ? establecimiento.sede() : null,
                establecimiento != null ? establecimiento.departamentoIpress() : null,
                establecimiento != null ? establecimiento.categoriaIpress() : null,
                orden.getPlanSeguro(),
                lookup != null ? lookup.errorMaestros() : null
        );
    }

    private CoberturaDto toCobertura(OrdenMedica orden) {
        return new CoberturaDto(
                orden.getTipoSeguro(),
                orden.getPlanSeguro(),
                orden.getTipoCobertura(),
                orden.getTipoBeneficio()
        );
    }

    private ActoMedicoDto toActoMedico(OrdenMedica orden) {
        return new ActoMedicoDto(
                toTipoAtencionDto(orden.getTipoAtencion()).nombre(),
                orden.getActividad(),
                orden.getSubActividad(),
                orden.getServicio(),
                orden.getFechaAtencion()
        );
    }

    private ProfesionalDto toProfesional(OrdenMedica orden) {
        return new ProfesionalDto(
                orden.getProfNombre(),
                orden.getProfProfesion(),
                orden.getProfDocumento(),
                orden.getProfColegiatura(),
                orden.getProfRne()
        );
    }

    private FirmaProfesionalDto toFirma(OrdenMedica orden) {
        return new FirmaProfesionalDto(
                orden.getProfNombre(),
                orden.getProfDocumento(),
                orden.getProfColegiatura(),
                orden.getProfRne(),
                null
        );
    }

    private PrestacionesAgrupadasDto agruparPrestaciones(List<OrdenMedicaDet> detalles) {
        List<OrdenMedicaDetDto> laboratorio = new ArrayList<>();
        List<OrdenMedicaDetDto> imagen = new ArrayList<>();
        List<OrdenMedicaDetDto> procedimientoDiagnostico = new ArrayList<>();
        List<OrdenMedicaDetDto> procedimientoTerapeutico = new ArrayList<>();
        List<OrdenMedicaDetDto> terapiaEspecializada = new ArrayList<>();
        List<OrdenMedicaDetDto> otros = new ArrayList<>();

        for (OrdenMedicaDet det : detalles) {
            OrdenMedicaDetDto dto = toDetDto(det);
            switch (det.getTipo()) {
                case "LAB" -> laboratorio.add(dto);
                case "IMG" -> imagen.add(dto);
                case "PDI" -> procedimientoDiagnostico.add(dto);
                case "PTE" -> procedimientoTerapeutico.add(dto);
                case "TES" -> terapiaEspecializada.add(dto);
                default -> otros.add(dto);
            }
        }

        return new PrestacionesAgrupadasDto(
                laboratorio,
                imagen,
                procedimientoDiagnostico,
                procedimientoTerapeutico,
                terapiaEspecializada,
                otros);
    }

    private OrdenMedicaDetDto toDetDto(OrdenMedicaDet det) {
        return new OrdenMedicaDetDto(
                det.getId(),
                det.getTipo(),
                det.getCodigoCie10(),
                det.getCodigoCpms(),
                det.getCodigoSegus(),
                det.getDescripcion(),
                det.getCantidad(),
                det.getPrioridad(),
                det.getObservaciones(),
                det.getEstado()
        );
    }

    private List<OrdenMedicaLineaAtencionDto> toLineasAtencion(OrdenMedica orden) {
        List<OrdenMedicaLineaAtencionDto> lineas = new ArrayList<>();
        ordenMedicaDetRepository.findByOrdenMedica_IdOrderByIdAsc(orden.getId())
                .forEach(det -> lineas.add(new OrdenMedicaLineaAtencionDto(
                        orden.getId(),
                        det.getId(),
                        orden.getNroOap(),
                        orden.getEstado(),
                        orden.getFechaEmision(),
                        toTipoAtencionDto(orden.getTipoAtencion()),
                        orden.getAtencionId(),
                        toTipoOrdenDto(orden.getTipoOrden()),
                        det.getTipo(),
                        det.getCodigoCie10(),
                        det.getCodigoCpms(),
                        det.getCodigoSegus(),
                        det.getDescripcion(),
                        det.getCantidad(),
                        det.getPrioridad(),
                        det.getObservaciones()
                )));

        hemodialisisRepository.findByOrdenMedica_Id(orden.getId()).ifPresent(hemo -> lineas.add(
                new OrdenMedicaLineaAtencionDto(
                        orden.getId(),
                        hemo.getId(),
                        orden.getNroOap(),
                        orden.getEstado(),
                        orden.getFechaEmision(),
                        toTipoAtencionDto(orden.getTipoAtencion()),
                        orden.getAtencionId(),
                        toTipoOrdenDto(orden.getTipoOrden()),
                        "HEM",
                        null,
                        null,
                        null,
                        hemo.getTipoDialisis(),
                        null,
                        hemo.getFrecuencia(),
                        hemo.getObservaciones()
                )));

        quimioterapiaRepository.findByOrdenMedica_Id(orden.getId()).ifPresent(quimio -> lineas.add(
                new OrdenMedicaLineaAtencionDto(
                        orden.getId(),
                        quimio.getId(),
                        orden.getNroOap(),
                        orden.getEstado(),
                        orden.getFechaEmision(),
                        toTipoAtencionDto(orden.getTipoAtencion()),
                        orden.getAtencionId(),
                        toTipoOrdenDto(orden.getTipoOrden()),
                        "QUI",
                        null,
                        null,
                        null,
                        quimio.getDiagnosticoOncologico(),
                        null,
                        quimio.getCiclo(),
                        quimio.getObservaciones()
                )));
        return lineas;
    }

    private OrdenHemodialisisDto toHemodialisisDto(OrdenHemodialisis hemo) {
        return new OrdenHemodialisisDto(
                hemo.getId(),
                hemo.getTipoDialisis(),
                hemo.getFrecuencia(),
                hemo.getDuracionSesionMin(),
                hemo.getNumeroSesiones(),
                hemo.getAccesoVascular(),
                hemo.getAnticoagulacion(),
                hemo.getObservaciones()
        );
    }

    private OrdenQuimioterapiaDto toQuimioterapiaDto(OrdenQuimioterapia quimio) {
        return new OrdenQuimioterapiaDto(
                quimio.getId(),
                quimio.getDiagnosticoOncologico(),
                quimio.getEstadio(),
                quimio.getMedicamentos(),
                quimio.getDosis(),
                quimio.getVia(),
                quimio.getFrecuencia(),
                quimio.getProtocoloTerapeutico(),
                quimio.getCiclo(),
                quimio.getDuracionCicloDias(),
                quimio.getObservaciones()
        );
    }

    private void aplicarDetalles(OrdenMedica orden, List<OrdenMedicaDetRequest> requests) {
        List<OrdenMedicaDetRequest> lista = requests != null ? requests : List.of();
        Set<Long> idsEnviados = new HashSet<>();
        for (OrdenMedicaDetRequest req : lista) {
            if (req.id() != null) {
                idsEnviados.add(req.id());
            }
        }

        orden.getDetalles().removeIf(d -> d.getId() != null && !idsEnviados.contains(d.getId()));

        for (OrdenMedicaDetRequest req : lista) {
            OrdenMedicaDet det;
            if (req.id() != null) {
                det = orden.getDetalles().stream()
                        .filter(d -> req.id().equals(d.getId()))
                        .findFirst()
                        .orElseGet(() -> cargarDetalleDeOrden(req.id(), orden));
            } else {
                det = new OrdenMedicaDet();
                det.setOrdenMedica(orden);
                orden.getDetalles().add(det);
            }
            mapearDetalleDesdeRequest(det, req);
        }
    }

    private OrdenMedicaDet cargarDetalleDeOrden(Long detalleId, OrdenMedica orden) {
        OrdenMedicaDet det = ordenMedicaDetRepository.findById(detalleId)
                .orElseThrow(() -> new EntityNotFoundException("Detalle no encontrado con id: " + detalleId));
        if (!Objects.equals(det.getOrdenMedica().getId(), orden.getId())) {
            throw new EntityUnprocessableException("El detalle no pertenece a la orden medica");
        }
        orden.getDetalles().add(det);
        return det;
    }

    private void mapearDetalleDesdeRequest(OrdenMedicaDet det, OrdenMedicaDetRequest req) {
        det.setTipo(req.tipo());
        det.setCodigoCie10(req.codigoCie10());
        det.setCodigoCpms(req.codigoCpms());
        det.setCodigoSegus(req.codigoSegus());
        det.setDescripcion(req.descripcion());
        det.setCantidad(req.cantidad() != null ? req.cantidad() : BigDecimal.ONE);
        det.setPrioridad(req.prioridad() != null ? req.prioridad() : "Normal");
        det.setObservaciones(req.observaciones());
        det.setEstado(req.estado() != null ? req.estado() : "PENDIENTE");
    }

    private void aplicarHemodialisis(OrdenMedica orden, OrdenHemodialisisRequest request) {
        if (request == null) {
            orden.setHemodialisis(null);
            return;
        }
        OrdenHemodialisis hemo = orden.getHemodialisis();
        if (hemo == null) {
            hemo = new OrdenHemodialisis();
            hemo.setOrdenMedica(orden);
            orden.setHemodialisis(hemo);
        }
        hemo.setTipoDialisis(request.tipoDialisis());
        hemo.setFrecuencia(request.frecuencia());
        hemo.setDuracionSesionMin(request.duracionSesionMin());
        hemo.setNumeroSesiones(request.numeroSesiones());
        hemo.setAccesoVascular(request.accesoVascular());
        hemo.setAnticoagulacion(request.anticoagulacion());
        hemo.setObservaciones(request.observaciones());
    }

    private void aplicarQuimioterapia(OrdenMedica orden, OrdenQuimioterapiaRequest request) {
        if (request == null) {
            orden.setQuimioterapia(null);
            return;
        }
        OrdenQuimioterapia quimio = orden.getQuimioterapia();
        if (quimio == null) {
            quimio = new OrdenQuimioterapia();
            quimio.setOrdenMedica(orden);
            orden.setQuimioterapia(quimio);
        }
        quimio.setDiagnosticoOncologico(request.diagnosticoOncologico());
        quimio.setEstadio(request.estadio());
        quimio.setMedicamentos(request.medicamentos());
        quimio.setDosis(request.dosis());
        quimio.setVia(request.via());
        quimio.setFrecuencia(request.frecuencia());
        quimio.setProtocoloTerapeutico(request.protocoloTerapeutico());
        quimio.setCiclo(request.ciclo());
        quimio.setDuracionCicloDias(request.duracionCicloDias());
        quimio.setObservaciones(request.observaciones());
    }

    private CodigoNombreDto toTipoAtencionDto(String codigo) {
        TipoAtencionOrden tipo = TipoAtencionOrden.fromCodigo(codigo);
        return new CodigoNombreDto(codigo, tipo != null ? tipo.getNombre() : codigo);
    }

    private CodigoNombreDto toTipoOrdenDto(String codigo) {
        TipoOrdenMedica tipo = TipoOrdenMedica.fromCodigo(codigo);
        return new CodigoNombreDto(codigo, tipo != null ? tipo.getNombre() : codigo);
    }

    private AdmisionClientDto obtenerAdmisionOrNull(Long admisionId) {
        if (admisionId == null) {
            return null;
        }
        try {
            ApiResponseDto<AdmisionClientDto> response = filiacionClient.obtenerAdmision(admisionId);
            return response != null ? response.data() : null;
        } catch (RuntimeException ex) {
            return null;
        }
    }

    private EstablecimientoLookup obtenerEstablecimiento(String ipressCui) {
        if (ipressCui == null || ipressCui.isBlank()) {
            return new EstablecimientoLookup(null, "Orden medica no tiene CUI IPRESS registrado.");
        }
        String codigo = ipressCui.trim();
        try {
            ApiResponseDto<EstablecimientoClientDto> response = maestrosClient.buscarEstablecimiento(codigo);
            EstablecimientoClientDto establecimiento = response != null ? response.data() : null;
            if (establecimiento == null) {
                String message = response != null ? response.message() : null;
                String detalle = message != null && !message.isBlank() ? " Mensaje: " + message : "";
                return new EstablecimientoLookup(null, "Maestros no devolvio datos para IPRESS " + codigo + "." + detalle);
            }
            return new EstablecimientoLookup(establecimiento, null);
        } catch (RuntimeException ex) {
            log.warn("No se pudo obtener datos de IPRESS {} desde Maestros: {}", codigo, ex.getMessage());
            return new EstablecimientoLookup(null, errorDetallado(ex));
        }
    }

    private String errorDetallado(Throwable ex) {
        StringBuilder detalle = new StringBuilder();
        Throwable actual = ex;
        while (actual != null) {
            if (!detalle.isEmpty()) {
                detalle.append(" | Causa: ");
            }
            detalle.append(actual.getClass().getSimpleName());
            if (actual.getMessage() != null && !actual.getMessage().isBlank()) {
                detalle.append(": ").append(actual.getMessage());
            }
            actual = actual.getCause();
        }
        return detalle.toString();
    }

    private record EstablecimientoLookup(
            EstablecimientoClientDto establecimiento,
            String errorMaestros
    ) {}

    private String nombrePaciente(AdmisionClientDto admision) {
        if (admision == null) {
            return null;
        }
        String apellidos = admision.apellidosPaciente() != null ? admision.apellidosPaciente().trim() : "";
        String nombres = admision.nombresPaciente() != null ? admision.nombresPaciente().trim() : "";
        if (apellidos.isEmpty() && nombres.isEmpty()) {
            return null;
        }
        if (apellidos.isEmpty()) {
            return nombres;
        }
        if (nombres.isEmpty()) {
            return apellidos;
        }
        return apellidos + " " + nombres;
    }

}
