package pe.gob.saludpol.hce.filiacion.service;

import lombok.RequiredArgsConstructor;
import pe.gob.saludpol.hce.filiacion.client.MaestrosFeignClient;
import pe.gob.saludpol.hce.filiacion.client.PadronFeignClient;
import pe.gob.saludpol.hce.filiacion.client.dto.AseguradoDto;
import pe.gob.saludpol.hce.filiacion.client.dto.EstablecimientoDto;
import pe.gob.saludpol.hce.filiacion.common.exception.EntityNotFoundException;
import pe.gob.saludpol.hce.filiacion.common.exception.EntityUnprocessableException;
import pe.gob.saludpol.hce.filiacion.dto.AdmisionRequest;
import pe.gob.saludpol.hce.filiacion.dto.AdmisionResponse;
import pe.gob.saludpol.hce.filiacion.dto.HistoriaClinicaResponse;
import pe.gob.saludpol.hce.filiacion.entity.Admision;
import pe.gob.saludpol.hce.filiacion.entity.HistoriaClinica;
import pe.gob.saludpol.hce.filiacion.mapper.AdmisionMapper;
import pe.gob.saludpol.hce.filiacion.repository.AdmisionRepository;
import pe.gob.saludpol.hce.filiacion.repository.HistoriaClinicaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AdmisionService {

    private final AdmisionRepository admisionRepository;
    private final HistoriaClinicaRepository historiaClinicaRepository;
    private final AdmisionMapper mapper;
    private final PadronFeignClient padronClient;
    private final MaestrosFeignClient maestrosClient;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Transactional
    public AdmisionResponse registrar(AdmisionRequest request) {
        AseguradoDto asegurado = consultarAsegurado(request.dniPaciente());
        HistoriaClinica hc = resolverHistoriaClinica(request, asegurado);
        Admision admision = resolverAdmision(request, hc, asegurado);
        admision = admisionRepository.save(admision);
        return mapper.toAdmisionResponse(admision);
    }

    @Transactional(readOnly = true)
    public AdmisionResponse obtener(Long id) {
        Admision admision = findAdmisionById(id);
        return mapper.toAdmisionResponse(admision);
    }

    @Transactional(readOnly = true)
    public Page<AdmisionResponse> buscar(String dni, String nroHc, Pageable pageable) {
        String dniFiltro = limpiarFiltro(dni);
        String nroHcFiltro = limpiarFiltro(nroHc);
        return admisionRepository.buscar(dniFiltro, nroHcFiltro, pageable)
                .map(mapper::toAdmisionResponse);
    }

    @Transactional(readOnly = true)
    public HistoriaClinicaResponse obtenerHistoriaClinicaPorDni(String dni) {
        HistoriaClinica hc = historiaClinicaRepository.findByDniPaciente(dni)
                .orElseThrow(() -> new EntityNotFoundException("HistoriaClinica no encontrada con el dni: " + dni));
        return mapper.toHistoriaClinicaResponse(hc);
    }

    @Transactional(readOnly = true)
    public List<AdmisionResponse> listarPorHistoriaClinica(Long historiaClinicaId) {
        return admisionRepository.findByHistoriaClinicaIdOrderByFechaAtencionDesc(historiaClinicaId)
                .stream()
                .map(mapper::toAdmisionResponse)
                .toList();
    }

    private AseguradoDto consultarAsegurado(String dni) {
        AseguradoDto asegurado = padronClient.buscarAsegurado(dni).data();
        if (asegurado == null) {
            throw new EntityNotFoundException("No se encontró asegurado con documento: " + dni);
        }
        return asegurado;
    }

    private EstablecimientoDto consultarEstablecimiento(String cuiIpress) {
        if (cuiIpress == null || cuiIpress.isBlank()) return null;
        try {
            return maestrosClient.buscarEstablecimiento(cuiIpress).data();
        } catch (Exception e) {
            return null;
        }
    }

    private HistoriaClinica resolverHistoriaClinica(AdmisionRequest request, AseguradoDto asegurado) {
        return historiaClinicaRepository.findByDniPaciente(request.dniPaciente())
                .map(hc -> actualizarHistoriaClinica(hc, request.dniPaciente()))
                .orElseGet(() -> crearHistoriaClinica(request.dniPaciente(), asegurado));
    }

    private HistoriaClinica actualizarHistoriaClinica(HistoriaClinica hc, String dniPaciente) {
        String nroHcNormalizado = normalizarNroHc(dniPaciente);
        String nroHcActual = normalizarNroHc(hc.getNroHc());

        if (nroHcNormalizado != null && !nroHcNormalizado.equals(nroHcActual)
                && historiaClinicaRepository.existsByNroHc(nroHcNormalizado)) {
            throw new EntityUnprocessableException("El N° de Historia Clinica ya existe: " + nroHcNormalizado);
        }

        hc.setNroHc(nroHcNormalizado);
        return historiaClinicaRepository.save(hc);
    }

    private HistoriaClinica crearHistoriaClinica(String dniPaciente, AseguradoDto asegurado) {
        String nroHcNormalizado = normalizarNroHc(dniPaciente);

        if (historiaClinicaRepository.existsByNroHc(nroHcNormalizado)) {
            throw new EntityUnprocessableException("El N° de Historia Clinica ya existe: " + nroHcNormalizado);
        }
        HistoriaClinica hc = new HistoriaClinica();
        hc.setNroHc(nroHcNormalizado);
        hc.setDniPaciente(dniPaciente);
        hc.setApellidosPaciente(apellidos(asegurado));
        hc.setNombresPaciente(asegurado.nombres());
        hc.setSexo(mapSexo(asegurado.sexo()));
        hc.setFechaNac(parseFechaNacimiento(asegurado.fechaNacimiento()));
        return historiaClinicaRepository.save(hc);
    }

    private Admision resolverAdmision(AdmisionRequest request, HistoriaClinica hc, AseguradoDto asegurado) {
        Admision admision = admisionRepository.findFirstByHistoriaClinicaIdOrderByCreatedAtDesc(hc.getId())
                .orElseGet(Admision::new);

        if (admision.getId() == null) {
            admision.setSituacion(asegurado.estadoAsegurado());
            admision.setCondicion(asegurado.tipoPlan());
            admision.setParentesco(asegurado.tipoPlan());
        }

        aplicarDatosEditablesAdmision(admision, request, hc);
        return admision;
    }

    private void aplicarDatosEditablesAdmision(Admision admision, AdmisionRequest request, HistoriaClinica hc) {

        admision.setHistoriaClinica(hc);
        admision.setCartaGaratiaNro(request.cartaGaratiaNro());
        admision.setTipoSeguro(request.tipoSeguro());
        admision.setPlanSalud(request.planSalud());
        admision.setTipoCobertura(request.tipoCobertura());
        admision.setTipoBeneficio(request.tipoBeneficio());
        admision.setTipoAtencion(request.tipoAtencion());
        admision.setActividad(request.actividad());
        admision.setSubActividad(request.subActividad());
        admision.setConsultaMedica(request.consultaMedica());
        admision.setServicio(request.servicio());
        admision.setFechaAtencion(request.fechaAtencion());
        admision.setCuiIpress(request.cuiIpress());
        admision.setProfesionalNombre(request.profesionalNombre());
        admision.setProfesionalProfesion(request.profesionalProfesion());
        admision.setProfesionalColegiatura(request.profesionalColegiatura());

        if (admision.getId() != null) {
            return;
        }

        EstablecimientoDto ipress = consultarEstablecimiento(request.cuiIpress());
        if (ipress != null) {
            admision.setIpressRazonSocial(ipress != null ? ipress.nombreIpress() : null);
            admision.setIpressSede(ipress != null ? ipress.sede() : null);
            admision.setIpressRegion(ipress != null ? ipress.departamentoIpress() : null);
            admision.setIpressCategoria(ipress != null ? ipress.categoriaIpress() : null);
        }
    }

    private Admision findAdmisionById(Long id) {
        return admisionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Admision no encontrada con id: '" + id + "'"));
    }

    private String limpiarFiltro(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizarNroHc(String nroHc) {
        return nroHc == null ? null : nroHc.trim().toUpperCase(Locale.ROOT);
    }

    private String apellidos(AseguradoDto a) {
        return (a.apellidoPaterno() + " " + a.apellidoMaterno()).trim();
    }

    private String mapSexo(String sexo) {
        if (sexo == null) return null;
        return "MASCULINO".equalsIgnoreCase(sexo) ? "M" : "F";
    }

    private LocalDate parseFechaNacimiento(String fechaNac) {
        if (fechaNac == null || fechaNac.trim().isEmpty()) {
            return null;
        }

        String valor = fechaNac.trim();
        try {
            return LocalDate.parse(valor, DATE_FORMATTER);
        } catch (DateTimeParseException ignored) {
            try {
                return LocalDate.parse(valor, DateTimeFormatter.ISO_LOCAL_DATE);
            } catch (DateTimeParseException ignoredIso) {
                try {
                    return LocalDate.parse(valor, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                } catch (DateTimeParseException ignoredDmy) {
                    return LocalDateTime.parse(valor).toLocalDate();
                }
            }
        }
    }
}
