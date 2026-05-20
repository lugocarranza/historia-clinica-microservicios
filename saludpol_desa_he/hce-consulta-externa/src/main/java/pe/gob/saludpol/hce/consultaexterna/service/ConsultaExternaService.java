package pe.gob.saludpol.hce.consultaexterna.service;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import pe.gob.saludpol.hce.consultaexterna.client.FiliacionClient;
import pe.gob.saludpol.hce.consultaexterna.client.dto.AdmisionClientDto;
import pe.gob.saludpol.hce.consultaexterna.common.exception.EntityNotFoundException;
import pe.gob.saludpol.hce.consultaexterna.common.exception.EntityUnprocessableException;
import pe.gob.saludpol.hce.consultaexterna.dto.*;
import pe.gob.saludpol.hce.consultaexterna.entity.*;
import pe.gob.saludpol.hce.consultaexterna.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultaExternaService {

    private final FiliacionClient filiacionClient;
    private final AtencionRepository atencionRepository;
    private final MotivoConsultaRepository motivoRepository;
    private final AntPersonalRepository antPersonalRepository;
    private final AntFamiliarRepository antFamiliarRepository;
    private final RevisionSistemaRepository revisionSistemaRepository;
    private final ExamenFisicoRepository examenFisicoRepository;
    private final ListaProblemaRepository listaProblemaRepository;
    private final DiagnosticoRepository diagnosticoRepository;
    private final TratamientoRepository tratamientoRepository;
    private final IndicacionNoFarmRepository indicacionNoFarmRepository;
    private final SolicitudApoyoRepository solicitudApoyoRepository;
    private final DecisionClinicaRepository decisionClinicaRepository;

    private Atencion resolverAtencionCE(Long admisionId) {
        AdmisionClientDto admision;
        try {
            admision = filiacionClient.obtenerAdmision(admisionId).data();
        } catch (FeignException.NotFound e) {
            throw new EntityNotFoundException("Admision no encontrada con id: " + admisionId);
        }
        Atencion at = atencionRepository.findByAdmisionIdAndTipoAtencion(admisionId, "CE")
                .orElseGet(Atencion::new);
        if (at.getId() == null) {
            at.setAdmisionId(admisionId);
            at.setHistoriaClinicaId(admision.historiaClinicaId());
            at.setTipoAtencion("CE");
            at.setFechaAtencion(admision.fechaAtencion());
            atencionRepository.save(at);
        }
        if ("ANULADA".equals(at.getEstado())) {
            throw new EntityUnprocessableException("La atencion se encuentra anulada");
        }
        if ("COMPLETADA".equals(at.getEstado())) {
            throw new EntityUnprocessableException("La atencion se encuentra completada y no permite edicion");
        }
        return at;
    }

    @Transactional
    public MotivoConsultaResponse guardarMotivo(Long admisionId, MotivoConsultaRequest request) {
        Atencion atencion = resolverAtencionCE(admisionId);
        Long atencionId = atencion.getId();
        MotivoConsulta motivo = motivoRepository.findByAtencionId(atencionId)
                .orElseGet(MotivoConsulta::new);
        motivo.setAtencion(atencion);
        motivo.setMotivo(request.motivo());
        motivo.setTiempoEnfermedad(request.tiempoEnfermedad());
        motivo.setFormaInicio(request.formaInicio());
        motivo.setCurso(request.curso());
        motivo.setEnfermedadActual(request.enfermedadActual());
        motivo.setSintomasSignos(request.sintomasSignos());
        motivo.setRelatoCronologico(request.relatoCronologico());
        motivo.setFactoresMod(request.factoresMod());
        motivo.setTratamientosPrevios(request.tratamientosPrevios());
        return toMotivoResponse(motivoRepository.save(motivo));
    }

    @Transactional(readOnly = true)
    public MotivoConsultaResponse obtenerMotivo(Long admisionId) {
        Long atencionId = atencionRepository.findByAdmisionIdAndTipoAtencion(admisionId, "CE")
                .map(Atencion::getId).orElse(null);
        if (atencionId == null) return null;
        return motivoRepository.findByAtencionId(atencionId).map(this::toMotivoResponse).orElse(null);
    }

    @Transactional
    public void guardarAntPersonal(Long admisionId, AntPersonalRequest request) {
        Atencion atencion = resolverAtencionCE(admisionId);
        Long atencionId = atencion.getId();
        AntPersonal ant = antPersonalRepository.findByAtencionId(atencionId)
                .orElseGet(AntPersonal::new);
        ant.setAtencion(atencion);
        mapAntPersonal(request, ant);
        antPersonalRepository.save(ant);
    }

    @Transactional
    public void guardarAntFamiliares(Long admisionId, List<AntFamiliarDto> dtos) {
        Atencion atencion = resolverAtencionCE(admisionId);
        for (AntFamiliarDto dto : dtos) {
            AntFamiliar entity = dto.id() != null
                    ? antFamiliarRepository.findById(dto.id()).orElseGet(AntFamiliar::new)
                    : new AntFamiliar();
            entity.setAtencion(atencion);
            entity.setEnfermedad(dto.enfermedad());
            entity.setPadre(dto.padre());
            entity.setMadre(dto.madre());
            entity.setHermanos(dto.hermanos());
            entity.setAbuelos(dto.abuelos());
            entity.setOtros(dto.otros());
            entity.setObservaciones(dto.observaciones());
            antFamiliarRepository.save(entity);
        }
    }

    @Transactional
    public void guardarRevisionSistemas(Long admisionId, List<RevisionSistemaDto> dtos) {
        Atencion atencion = resolverAtencionCE(admisionId);
        for (RevisionSistemaDto dto : dtos) {
            RevisionSistema entity = dto.id() != null
                    ? revisionSistemaRepository.findById(dto.id()).orElseGet(RevisionSistema::new)
                    : new RevisionSistema();
            entity.setAtencion(atencion);
            entity.setSistema(dto.sistema());
            entity.setSintoma(dto.sintoma());
            entity.setPresente(dto.presente());
            entity.setObservacion(dto.observacion());
            revisionSistemaRepository.save(entity);
        }
    }

    @Transactional
    public ExamenFisicoResponse guardarExamenFisico(Long admisionId, ExamenFisicoRequest request) {
        Atencion atencion = resolverAtencionCE(admisionId);
        Long atencionId = atencion.getId();
        ExamenFisico ef = examenFisicoRepository.findByAtencionId(atencionId)
                .orElseGet(ExamenFisico::new);
        ef.setAtencion(atencion);
        ef.setPaSistolica(request.paSistolica());
        ef.setPaDiastolica(request.paDiastolica());
        ef.setFc(request.fc());
        ef.setFr(request.fr());
        ef.setTemperatura(request.temperatura());
        ef.setSatO2(request.satO2());
        ef.setPeso(request.peso());
        ef.setTalla(request.talla());
        ef.setImc(calcularImc(request.peso(), request.talla()));
        ef.getRegiones().clear();
        if (request.regiones() != null) {
            request.regiones().forEach(dto -> {
                ExamenRegion reg = new ExamenRegion();
                reg.setExamenFisico(ef);
                reg.setRegion(dto.region());
                reg.setHallazgos(dto.hallazgos());
                ef.getRegiones().add(reg);
            });
        }
        return toExamenFisicoResponse(examenFisicoRepository.save(ef));
    }

    private BigDecimal calcularImc(BigDecimal peso, BigDecimal tallaCm) {
        if (peso == null || tallaCm == null || tallaCm.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        BigDecimal tallaMetros = tallaCm.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal denominador = tallaMetros.multiply(tallaMetros);
        if (denominador.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        return peso.divide(denominador, 2, RoundingMode.HALF_UP);
    }

    @Transactional
    public void guardarListaProblemas(Long admisionId, List<ListaProblemaDto> dtos) {
        Atencion atencion = resolverAtencionCE(admisionId);
        for (ListaProblemaDto dto : dtos) {
            ListaProblema entity = dto.id() != null
                    ? listaProblemaRepository.findById(dto.id()).orElseGet(ListaProblema::new)
                    : new ListaProblema();
            entity.setAtencion(atencion);
            entity.setNroProblema(dto.nroProblema());
            entity.setDescripcion(dto.descripcion());
            entity.setEstado(dto.estado());
            entity.setFechaIdentificacion(dto.fechaIdentificacion());
            listaProblemaRepository.save(entity);
        }
    }

    @Transactional
    public void guardarDiagnosticos(Long admisionId, List<DiagnosticoDto> dtos) {
        Atencion atencion = resolverAtencionCE(admisionId);
        for (DiagnosticoDto dto : dtos) {
            Diagnostico entity = dto.id() != null
                    ? diagnosticoRepository.findById(dto.id()).orElseGet(Diagnostico::new)
                    : new Diagnostico();
            entity.setAtencion(atencion);
            entity.setCodigoCie10(dto.codigoCie10());
            entity.setDescripcion(dto.descripcion());
            entity.setTipo(dto.tipo());
            entity.setCaso(dto.caso());
            entity.setNroProblemAsoc(dto.nroProblemAsoc());
            diagnosticoRepository.save(entity);
        }
    }

    @Transactional
    public void guardarTratamientos(Long admisionId, List<TratamientoDto> dtos, String indicacionesNoFarm) {
        Atencion atencion = resolverAtencionCE(admisionId);
        Long atencionId = atencion.getId();
        for (TratamientoDto dto : dtos) {
            Tratamiento entity = dto.id() != null
                    ? tratamientoRepository.findById(dto.id()).orElseGet(Tratamiento::new)
                    : new Tratamiento();
            entity.setAtencion(atencion);
            entity.setCodigo(dto.codigo());
            entity.setMedicamento(dto.medicamento());
            entity.setDosis(dto.dosis());
            entity.setVia(dto.via());
            entity.setFrecuencia(dto.frecuencia());
            entity.setDuracion(dto.duracion());
            entity.setIndicaciones(dto.indicaciones());
            tratamientoRepository.save(entity);
        }

        IndicacionNoFarm ind = indicacionNoFarmRepository.findByAtencionId(atencionId)
                .orElseGet(() -> {
                    IndicacionNoFarm nueva = new IndicacionNoFarm();
                    nueva.setAtencion(atencion);
                    return nueva;
                });

        if (ind.getId() == null && indicacionesNoFarm == null) {
            return;
        }

        ind.setIndicaciones(indicacionesNoFarm);
        indicacionNoFarmRepository.save(ind);
    }

    @Transactional
    public void guardarSolicitudesApoyo(Long admisionId, List<SolicitudApoyoDto> dtos) {
        Atencion atencion = resolverAtencionCE(admisionId);
        for (SolicitudApoyoDto dto : dtos) {
            SolicitudApoyo entity = dto.id() != null
                    ? solicitudApoyoRepository.findById(dto.id()).orElseGet(SolicitudApoyo::new)
                    : new SolicitudApoyo();
            entity.setAtencion(atencion);
            entity.setTipo(dto.tipo());
            entity.setDescripcion(dto.descripcion());
            entity.setPrioridad(dto.prioridad());
            entity.setObservaciones(dto.observaciones());
            solicitudApoyoRepository.save(entity);
        }
    }

    @Transactional
    public void guardarDecisionClinica(Long admisionId, DecisionClinicaRequest request) {
        Atencion atencion = resolverAtencionCE(admisionId);
        Long atencionId = atencion.getId();
        DecisionClinica dec = decisionClinicaRepository.findByAtencionId(atencionId)
                .orElseGet(DecisionClinica::new);
        dec.setAtencion(atencion);
        dec.setDecisionAlta(request.decisionAlta());
        dec.setFechaProximaCita(request.fechaProximaCita());
        dec.setEspecialidadRef(request.especialidadRef());
        dec.setPlanManejo(request.planManejo());
        dec.setPronostico(request.pronostico());
        dec.setObservaciones(request.observaciones());
        dec.setMedicoNombre(request.medicoNombre());
        dec.setMedicoCmp(request.medicoCmp());
        decisionClinicaRepository.save(dec);
        completarAtencion(atencion);
    }

    @Transactional(readOnly = true)
    public ConsultaExternaResumen obtenerResumen(Long admisionId) {
        Atencion atencion = atencionRepository.findByAdmisionIdAndTipoAtencion(admisionId, "CE")
                .orElse(null);
        if (atencion == null) {
            return new ConsultaExternaResumen(null, null, null, null,
                    List.of(), List.of(), null, List.of(), List.of(),
                    List.of(), null, List.of(), null);
        }
        Long atencionId = atencion.getId();
        MotivoConsultaResponse motivo = motivoRepository.findByAtencionId(atencionId)
                .map(this::toMotivoResponse).orElse(null);
        AntPersonalRequest antPersonal = antPersonalRepository.findByAtencionId(atencionId)
            .map(this::toAntPersonalRequest)
            .orElse(null);
        List<AntFamiliarDto> antFam = antFamiliarRepository.findByAtencionId(atencionId)
                .stream().map(this::toAntFamiliarDto).toList();
        List<RevisionSistemaDto> revSist = revisionSistemaRepository.findByAtencionId(atencionId)
                .stream().map(this::toRevSistemaDto).toList();
        ExamenFisicoResponse exFis = examenFisicoRepository.findByAtencionId(atencionId)
                .map(this::toExamenFisicoResponse).orElse(null);
        List<ListaProblemaDto> listaProb = listaProblemaRepository
                .findByAtencionIdOrderByNroProblema(atencionId)
                .stream().map(this::toListaProblemaDto).toList();
        List<DiagnosticoDto> diags = diagnosticoRepository.findByAtencionId(atencionId)
                .stream().map(this::toDiagnosticoDto).toList();
        List<TratamientoDto> tratas = tratamientoRepository.findByAtencionId(atencionId)
                .stream().map(this::toTratamientoDto).toList();
        String indicacionesNoFarm = indicacionNoFarmRepository.findByAtencionId(atencionId)
            .map(IndicacionNoFarm::getIndicaciones)
            .orElse(null);
        List<SolicitudApoyoDto> solic = solicitudApoyoRepository.findByAtencionId(atencionId)
                .stream().map(this::toSolicitudDto).toList();
        DecisionClinicaRequest dec = decisionClinicaRepository.findByAtencionId(atencionId)
                .map(this::toDecisionRequest).orElse(null);
        return new ConsultaExternaResumen(atencionId, atencion.getEstado(), motivo, antPersonal,
            antFam, revSist, exFis, listaProb, diags, tratas, indicacionesNoFarm, solic, dec);
    }

    private void completarAtencion(Atencion atencion) {
        atencion.setEstado("COMPLETADA");
        atencionRepository.save(atencion);
    }

    private void mapAntPersonal(AntPersonalRequest request, AntPersonal ant) {
        mapDatosPerinatales(request, ant);
        mapAppList(request, ant);
        mapQuirurgicos(request, ant);
        mapAlergico(request, ant);
        mapMedicacionCronica(request, ant);
        mapHabitoRiesgo(request, ant);
        mapGineco(request, ant);
    }

    private void mapDatosPerinatales(AntPersonalRequest request, AntPersonal ant) {
        ant.setTipoParto(request.tipoParto());
        ant.setEdadGestacional(request.edadGestacional());
        ant.setPesoNacer(request.pesoNacer());
        ant.setTallaNacer(request.tallaNacer());
        ant.setApgar(request.apgar());
        ant.setCompNeonatal(request.compNeonatal());
        ant.setCompNeonatalDesc(request.compNeonatalDesc());
    }

    private void mapAppList(AntPersonalRequest request, AntPersonal ant) {
        if (request.appList() == null) return;
        for (AppItemDto dto : request.appList()) {
            App app = ant.getAppList().stream()
                    .filter(a -> a.getCondicion().equals(dto.condicion()))
                    .findFirst()
                    .orElseGet(() -> { App a = new App(); a.setAntPersonal(ant); ant.getAppList().add(a); return a; });
            app.setCondicion(dto.condicion());
            app.setTiene(dto.tiene());
            app.setAnoDx(dto.anoDx());
            app.setTratamientoActual(dto.tratamientoActual());
            app.setObservaciones(dto.observaciones());
        }
    }

    private void mapQuirurgicos(AntPersonalRequest request, AntPersonal ant) {
        if (request.quirurgicos() == null) return;
        for (AntQuirurgicoDto dto : request.quirurgicos()) {
            AntQuirurgico q = dto.id() != null
                    ? ant.getQuirurgicos().stream().filter(x -> dto.id().equals(x.getId())).findFirst().orElseGet(AntQuirurgico::new)
                    : new AntQuirurgico();
            q.setAntPersonal(ant);
            q.setProcedimiento(dto.procedimiento());
            q.setAno(dto.ano());
            q.setComplicaciones(dto.complicaciones());
            if (!ant.getQuirurgicos().contains(q)) ant.getQuirurgicos().add(q);
        }
    }

    private void mapAlergico(AntPersonalRequest request, AntPersonal ant) {
        if (request.alergico() == null) return;
        AntAlergico al = ant.getAlergico() != null ? ant.getAlergico() : new AntAlergico();
        al.setAntPersonal(ant);
        al.setAlergiaMed(request.alergico().alergiaMed());
        al.setAlergiaMedDesc(request.alergico().alergiaMedDesc());
        al.setAlergiaAli(request.alergico().alergiaAli());
        al.setAlergiaAliDesc(request.alergico().alergiaAliDesc());
        al.setAlergiaOtros(request.alergico().alergiaOtros());
        al.setAlergiaOtrosDesc(request.alergico().alergiaOtrosDesc());
        al.setTipoReaccion(request.alergico().tipoReaccion());
        ant.setAlergico(al);
    }

    private void mapMedicacionCronica(AntPersonalRequest request, AntPersonal ant) {
        if (request.medicacionCronica() == null) return;
        for (MedicacionCronicaDto dto : request.medicacionCronica()) {
            MedicacionCronica m = dto.id() != null
                    ? ant.getMedicacionCronica().stream().filter(x -> dto.id().equals(x.getId())).findFirst().orElseGet(MedicacionCronica::new)
                    : new MedicacionCronica();
            m.setAntPersonal(ant);
            m.setFarmaco(dto.farmaco());
            m.setDosis(dto.dosis());
            m.setFrecuencia(dto.frecuencia());
            m.setIndicacion(dto.indicacion());
            if (!ant.getMedicacionCronica().contains(m)) ant.getMedicacionCronica().add(m);
        }
    }

    private void mapHabitoRiesgo(AntPersonalRequest request, AntPersonal ant) {
        if (request.habitoRiesgo() == null) return;
        HabitoRiesgo h = ant.getHabitoRiesgo() != null ? ant.getHabitoRiesgo() : new HabitoRiesgo();
        h.setAntPersonal(ant);
        h.setTabaco(request.habitoRiesgo().tabaco());
        h.setTabacoPaquetesAno(request.habitoRiesgo().tabacoPaquetesAno());
        h.setAlcohol(request.habitoRiesgo().alcohol());
        h.setDrogas(request.habitoRiesgo().drogas());
        h.setDrogasTipo(request.habitoRiesgo().drogasTipo());
        h.setSedentarismo(request.habitoRiesgo().sedentarismo());
        h.setOtrosFactores(request.habitoRiesgo().otrosFactores());
        ant.setHabitoRiesgo(h);
    }

    private void mapGineco(AntPersonalRequest request, AntPersonal ant) {
        if (request.gineco() == null) return;
        AntGineco g = ant.getGineco() != null ? ant.getGineco() : new AntGineco();
        g.setAntPersonal(ant);
        g.setMenarquia(request.gineco().menarquia());
        g.setGestaciones(request.gineco().gestaciones());
        g.setPartos(request.gineco().partos());
        g.setCesareas(request.gineco().cesareas());
        g.setAbortos(request.gineco().abortos());
        g.setFur(request.gineco().fur());
        g.setMenopausia(request.gineco().menopausia());
        g.setMenopausiaAno(request.gineco().menopausiaAno());
        g.setCompObstetricas(request.gineco().compObstetricas());
        ant.setGineco(g);
    }

    private MotivoConsultaResponse toMotivoResponse(MotivoConsulta m) {
        return new MotivoConsultaResponse(m.getId(), m.getAtencion().getId(),
                m.getMotivo(), m.getTiempoEnfermedad(), m.getFormaInicio(), m.getCurso(),
                m.getEnfermedadActual(), m.getSintomasSignos(), m.getRelatoCronologico(),
                m.getFactoresMod(), m.getTratamientosPrevios());
    }

    private ExamenFisicoResponse toExamenFisicoResponse(ExamenFisico ef) {
        List<ExamenRegionDto> regiones = ef.getRegiones().stream()
                .map(r -> new ExamenRegionDto(r.getRegion(), r.getHallazgos()))
                .toList();
        return new ExamenFisicoResponse(ef.getId(), ef.getAtencion().getId(),
                ef.getPaSistolica(), ef.getPaDiastolica(), ef.getFc(), ef.getFr(), ef.getTemperatura(),
                ef.getSatO2(), ef.getPeso(), ef.getTalla(), ef.getImc(), regiones);
    }

    private AntFamiliarDto toAntFamiliarDto(AntFamiliar a) {
        return new AntFamiliarDto(a.getId(), a.getEnfermedad(), a.getPadre(), a.getMadre(),
                a.getHermanos(), a.getAbuelos(), a.getOtros(), a.getObservaciones());
    }

    private RevisionSistemaDto toRevSistemaDto(RevisionSistema r) {
        return new RevisionSistemaDto(r.getId(), r.getSistema(), r.getSintoma(), r.getPresente(), r.getObservacion());
    }

    private ListaProblemaDto toListaProblemaDto(ListaProblema lp) {
        return new ListaProblemaDto(lp.getId(), lp.getNroProblema(), lp.getDescripcion(),
                lp.getEstado(), lp.getFechaIdentificacion());
    }

    private DiagnosticoDto toDiagnosticoDto(Diagnostico d) {
        return new DiagnosticoDto(
                d.getId(),
                d.getCodigoCie10(), d.getDescripcion(), d.getTipo(),
                d.getCaso(), d.getNroProblemAsoc());
    }

    private TratamientoDto toTratamientoDto(Tratamiento t) {
        return new TratamientoDto(t.getId(), t.getCodigo(), t.getMedicamento(), t.getDosis(), t.getVia(),
                t.getFrecuencia(), t.getDuracion(), t.getIndicaciones());
    }

    private SolicitudApoyoDto toSolicitudDto(SolicitudApoyo s) {
        return new SolicitudApoyoDto(s.getId(), s.getTipo(), s.getDescripcion(), s.getPrioridad(), s.getObservaciones());
    }

    private DecisionClinicaRequest toDecisionRequest(DecisionClinica d) {
        return new DecisionClinicaRequest(d.getDecisionAlta(), d.getFechaProximaCita(),
                d.getEspecialidadRef(), d.getPlanManejo(), d.getPronostico(),
                d.getObservaciones(), d.getMedicoNombre(), d.getMedicoCmp());
    }

    private AntPersonalRequest toAntPersonalRequest(AntPersonal ant) {
        List<AppItemDto> appList = ant.getAppList().stream()
                .map(this::toAppItemDto)
                .toList();
        List<AntQuirurgicoDto> quirurgicos = ant.getQuirurgicos().stream()
                .map(this::toAntQuirurgicoDto)
                .toList();
        AntAlergicoDto alergico = ant.getAlergico() != null ? toAntAlergicoDto(ant.getAlergico()) : null;
        List<MedicacionCronicaDto> medicacionCronica = ant.getMedicacionCronica().stream()
                .map(this::toMedicacionCronicaDto)
                .toList();
        HabitoRiesgoDto habitoRiesgo = ant.getHabitoRiesgo() != null ? toHabitoRiesgoDto(ant.getHabitoRiesgo()) : null;
        AntGinecoDto gineco = ant.getGineco() != null ? toAntGinecoDto(ant.getGineco()) : null;

        return new AntPersonalRequest(
                ant.getTipoParto(),
                ant.getEdadGestacional(),
                ant.getPesoNacer(),
                ant.getTallaNacer(),
                ant.getApgar(),
                ant.getCompNeonatal(),
                ant.getCompNeonatalDesc(),
                appList,
                quirurgicos,
                alergico,
                medicacionCronica,
                habitoRiesgo,
                gineco
        );
    }

    private AppItemDto toAppItemDto(App app) {
        return new AppItemDto(
                app.getCondicion(),
                app.getTiene(),
                app.getAnoDx(),
                app.getTratamientoActual(),
                app.getObservaciones()
        );
    }

    private AntQuirurgicoDto toAntQuirurgicoDto(AntQuirurgico q) {
        return new AntQuirurgicoDto(
                q.getId(),
                q.getProcedimiento(),
                q.getAno(),
                q.getComplicaciones()
        );
    }

    private AntAlergicoDto toAntAlergicoDto(AntAlergico a) {
        return new AntAlergicoDto(
                a.getAlergiaMed(),
                a.getAlergiaMedDesc(),
                a.getAlergiaAli(),
                a.getAlergiaAliDesc(),
                a.getAlergiaOtros(),
                a.getAlergiaOtrosDesc(),
                a.getTipoReaccion()
        );
    }

    private HabitoRiesgoDto toHabitoRiesgoDto(HabitoRiesgo h) {
        return new HabitoRiesgoDto(
                h.getTabaco(),
                h.getTabacoPaquetesAno(),
                h.getAlcohol(),
                h.getDrogas(),
                h.getDrogasTipo(),
                h.getSedentarismo(),
                h.getOtrosFactores()
        );
    }

    private AntGinecoDto toAntGinecoDto(AntGineco g) {
        return new AntGinecoDto(
                g.getMenarquia(),
                g.getGestaciones(),
                g.getPartos(),
                g.getCesareas(),
                g.getAbortos(),
                g.getFur(),
                g.getMenopausia(),
                g.getMenopausiaAno(),
                g.getCompObstetricas()
        );
    }

    private MedicacionCronicaDto toMedicacionCronicaDto(MedicacionCronica m) {
        return new MedicacionCronicaDto(
                m.getId(),
                m.getFarmaco(),
                m.getDosis(),
                m.getFrecuencia(),
                m.getIndicacion()
        );
    }

}
