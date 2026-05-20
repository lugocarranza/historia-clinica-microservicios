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

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultaControlService {

    private final FiliacionClient filiacionClient;
    private final AtencionRepository atencionRepository;
    private final SoapSubjetivoRepository soapSRepo;
    private final SoapObjetivoRepository soapORepo;
    private final SoapAnalisisRepository soapARepo;
    private final SoapPlanRepository soapPRepo;
    private final MedPlanControlRepository medPlanRepo;
    private final PlanControlRepository planControlRepo;
    private final DecisionControlRepository decisionControlRepo;
    private final ListaProblemaRepository listaProblemaRepository;
    private final DiagnosticoRepository diagnosticoRepository;

    private static final String ESTADO_COMPLETADA = "COMPLETADA";

    @Transactional
    public void guardarSoapSubjetivo(Long atencionId, SoapSubjetivoDto dto) {
        Atencion atencion = findAtencionEditable(atencionId);
        SoapSubjetivo entity = soapSRepo.findByAtencionId(atencionId).orElseGet(SoapSubjetivo::new);
        entity.setAtencion(atencion);
        entity.setEvolucion(dto.evolucion());
        entity.setPersistencia(dto.persistencia());
        entity.setAdherencia(dto.adherencia());
        entity.setEventosAdversos(dto.eventosAdversos());
        soapSRepo.save(entity);
    }

    @Transactional
    public void guardarSoapObjetivo(Long atencionId, SoapObjetivoDto dto) {
        Atencion atencion = findAtencionEditable(atencionId);
        SoapObjetivo entity = soapORepo.findByAtencionId(atencionId).orElseGet(SoapObjetivo::new);
        entity.setAtencion(atencion);
        entity.setPaSistolica(dto.paSistolica());
        entity.setPaDiastolica(dto.paDiastolica());
        entity.setFc(dto.fc());
        entity.setFr(dto.fr());
        entity.setTemperatura(dto.temperatura());
        entity.setSatO2(dto.satO2());
        entity.setPeso(dto.peso());
        entity.setTalla(dto.talla());
        entity.setImc(calcularImc(dto.peso(), dto.talla()));
        entity.setHallazgosFisicos(dto.hallazgosFisicos());
        entity.setResultEstudios(dto.resultEstudios());
        entity.setComparacionPrevia(dto.comparacionPrevia());
        soapORepo.save(entity);
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
    public void guardarSoapAnalisis(Long atencionId, SoapAnalisisDto dto) {
        Atencion atencion = findAtencionEditable(atencionId);
        SoapAnalisis entity = soapARepo.findByAtencionId(atencionId).orElseGet(SoapAnalisis::new);
        entity.setAtencion(atencion);
        entity.setEvolucionEstado(dto.evolucionEstado());
        entity.setDiagActualizado(dto.diagActualizado());
        entity.setCambiosSeveridad(dto.cambiosSeveridad());
        entity.setEvalTerapeutica(dto.evalTerapeutica());
        soapARepo.save(entity);
    }

    @Transactional
    public void guardarSoapPlan(Long atencionId, SoapPlanDto dto) {
        Atencion atencion = findAtencionEditable(atencionId);
        SoapPlan entity = soapPRepo.findByAtencionId(atencionId).orElseGet(SoapPlan::new);
        entity.setAtencion(atencion);
        entity.setMantenerTrat(dto.mantenerTrat());
        entity.setAjustarDosis(dto.ajustarDosis());
        entity.setCambiarEsquema(dto.cambiarEsquema());
        entity.setSuspenderTrat(dto.suspenderTrat());
        entity.setNuevosEstudios(dto.nuevosEstudios());
        entity.setInterconsulta(dto.interconsulta());
        entity.setAltaProblema(dto.altaProblema());
        entity.setDetallesPlan(dto.detallesPlan());
        soapPRepo.save(entity);
    }

    @Transactional
    public void guardarListaProblemas(Long atencionId, List<ListaProblemaDto> dtos) {
        Atencion atencion = findAtencionEditable(atencionId);
        for (ListaProblemaDto d : dtos) {
            ListaProblema entity = d.id() != null
                    ? listaProblemaRepository.findById(d.id()).orElseGet(ListaProblema::new)
                    : new ListaProblema();
            entity.setAtencion(atencion);
            entity.setNroProblema(d.nroProblema());
            entity.setDescripcion(d.descripcion());
            entity.setEstado(d.estado());
            entity.setFechaIdentificacion(d.fechaIdentificacion());
            listaProblemaRepository.save(entity);
        }
    }

    @Transactional
    public void guardarDiagnosticos(Long atencionId, List<DiagnosticoDto> dtos) {
        Atencion atencion = findAtencionEditable(atencionId);
        for (DiagnosticoDto d : dtos) {
            Diagnostico entity = d.id() != null
                    ? diagnosticoRepository.findById(d.id()).orElseGet(Diagnostico::new)
                    : new Diagnostico();
            entity.setAtencion(atencion);
            entity.setCodigoCie10(d.codigoCie10());
            entity.setDescripcion(d.descripcion());
            entity.setTipo(d.tipo());
            entity.setCaso(d.caso());
            entity.setNroProblemAsoc(d.nroProblemAsoc());
            diagnosticoRepository.save(entity);
        }
    }

    @Transactional
    public void guardarPlanControl(Long atencionId, PlanControlDto dto) {
        Atencion atencion = findAtencionEditable(atencionId);
        if (dto.medicacion() != null) {
            for (MedPlanControlDto med : dto.medicacion()) {
                MedPlanControl entity = med.id() != null
                        ? medPlanRepo.findById(med.id()).orElseGet(MedPlanControl::new)
                        : new MedPlanControl();
                entity.setAtencion(atencion);
                entity.setCodigo(med.codigo());
                entity.setFarmaco(med.farmaco());
                entity.setDosis(med.dosis());
                entity.setVia(med.via());
                entity.setFrecuencia(med.frecuencia());
                entity.setDuracion(med.duracion());
                entity.setConducta(med.conducta());
                medPlanRepo.save(entity);
            }
        }
        PlanControl plan = planControlRepo.findByAtencionId(atencionId).orElseGet(PlanControl::new);
        plan.setAtencion(atencion);
        plan.setProximaCita(dto.proximaCita());
        plan.setIndicaciones(dto.indicaciones());
        plan.setCriteriosAlarma(dto.criteriosAlarma());
        planControlRepo.save(plan);
    }

    @Transactional
    public void guardarDecisionControl(Long atencionId, DecisionControlDto dto) {
        Atencion atencion = findAtencionEditable(atencionId);
        DecisionControl entity = decisionControlRepo.findByAtencionId(atencionId)
                .orElseGet(DecisionControl::new);
        entity.setAtencion(atencion);
        entity.setDecision(dto.decision());
        entity.setRefPnpIpress(dto.refPnpIpress());
        entity.setRefPnpMotivo(dto.refPnpMotivo());
        entity.setRefNopnpIpress(dto.refNopnpIpress());
        entity.setRefNopnpMotivo(dto.refNopnpMotivo());
        entity.setProfNombres(dto.profNombres());
        entity.setProfDocIdent(dto.profDocIdent());
        entity.setProfColegiatura(dto.profColegiatura());
        entity.setProfRegEspecialidad(dto.profRegEspecialidad());
        entity.setFechaCierre(dto.fechaCierre() != null ? dto.fechaCierre() : LocalDateTime.now());
        entity.setLogUsuario(SecurityContextHolder.getContext().getAuthentication().getName());
        entity.setLogFecha(LocalDateTime.now());
        decisionControlRepo.save(entity);
        completarAtencion(atencion);
    }

    @Transactional(readOnly = true)
    public ConsultaControlResumen obtenerResumen(Long atencionId) {
        Atencion atencion = findAtencion(atencionId);
        SoapSubjetivoDto sS = soapSRepo.findByAtencionId(atencionId).map(this::toSSubDto).orElse(null);
        SoapObjetivoDto sO = soapORepo.findByAtencionId(atencionId).map(this::toSObjDto).orElse(null);
        SoapAnalisisDto sA = soapARepo.findByAtencionId(atencionId).map(this::toSAnalDto).orElse(null);
        SoapPlanDto sP = soapPRepo.findByAtencionId(atencionId).map(this::toSPlanDto).orElse(null);
        List<ListaProblemaDto> probs = listaProblemaRepository
                .findByAtencionIdOrderByNroProblema(atencionId)
                .stream().map(this::toLPDto).toList();
        List<DiagnosticoDto> diags = diagnosticoRepository.findByAtencionId(atencionId)
                .stream().map(this::toDiagDto).toList();
        PlanControlDto plan = buildPlanControlDto(atencionId);
        DecisionControlDto dec = decisionControlRepo.findByAtencionId(atencionId)
                .map(this::toDecDto).orElse(null);
        return new ConsultaControlResumen(atencionId, atencion.getEstado(), sS, sO, sA, sP, probs, diags, plan, dec);
    }

    private PlanControlDto buildPlanControlDto(Long atencionId) {
        List<MedPlanControlDto> meds = medPlanRepo.findByAtencionId(atencionId)
                .stream().map(m -> new MedPlanControlDto(m.getId(), m.getCodigo(), m.getFarmaco(), m.getDosis(),
                        m.getVia(), m.getFrecuencia(), m.getDuracion(), m.getConducta()))
                .toList();
        return planControlRepo.findByAtencionId(atencionId)
                .map(p -> new PlanControlDto(meds, p.getProximaCita(), p.getIndicaciones(), p.getCriteriosAlarma()))
                .orElse(new PlanControlDto(meds, null, null, null));
    }

    private void completarAtencion(Atencion atencion) {
        atencion.setEstado(ESTADO_COMPLETADA);
        atencionRepository.save(atencion);
    }


    @Transactional
    public Long iniciarConsultaControl(Long admisionId) {
        AdmisionClientDto admision;
        try {
            admision = filiacionClient.obtenerAdmision(admisionId).data();
        } catch (FeignException.NotFound e) {
            throw new EntityNotFoundException("Admision no encontrada con id: " + admisionId);
        }
        if (!atencionRepository.existsByAdmisionIdAndTipoAtencionAndEstado(admisionId, "CE", ESTADO_COMPLETADA)) {
            throw new EntityUnprocessableException(
                    "No existe una Consulta Externa completada para esta admisión. Debe completar la consulta externa primero.");
        }
        Atencion at = new Atencion();
        at.setAdmisionId(admisionId);
        at.setHistoriaClinicaId(admision.historiaClinicaId());
        at.setTipoAtencion("CS");
        at.setFechaAtencion(LocalDateTime.now());
        return atencionRepository.save(at).getId();
    }

    @Transactional(readOnly = true)
    public List<AtencionResponse> listarConsultasCS(Long admisionId) {
        return atencionRepository
                .findByAdmisionIdAndTipoAtencionOrderByFechaAtencionDesc(admisionId, "CS")
                .stream()
                .map(item -> new AtencionResponse(
                        item.getId(),
                        item.getAdmisionId(),
                        item.getHistoriaClinicaId(),
                        item.getTipoAtencion(),
                        item.getFechaAtencion(),
                        null,
                        null,
                        item.getEstado(),
                        item.getCreatedAt()))
                .toList();
    }

    private Atencion findAtencion(Long atencionId) {
        Atencion at = atencionRepository.findById(atencionId)
                .orElseThrow(() -> new EntityNotFoundException("Atencion no encontrada con id: " + atencionId));
        if ("ANULADA".equals(at.getEstado())) {
            throw new EntityUnprocessableException("La atencion se encuentra anulada");
        }
        return at;
    }

    private Atencion findAtencionEditable(Long atencionId) {
        Atencion at = findAtencion(atencionId);
        if (ESTADO_COMPLETADA.equals(at.getEstado())) {
            throw new EntityUnprocessableException("La atencion ya se encuentra cerrada y no puede modificarse");
        }
        return at;
    }

    private SoapSubjetivoDto toSSubDto(SoapSubjetivo e) {
        return new SoapSubjetivoDto(e.getEvolucion(), e.getPersistencia(), e.getAdherencia(), e.getEventosAdversos());
    }

    private SoapObjetivoDto toSObjDto(SoapObjetivo e) {
        return new SoapObjetivoDto(e.getPaSistolica(), e.getPaDiastolica(), e.getFc(), e.getFr(),
                e.getTemperatura(), e.getSatO2(), e.getPeso(), e.getTalla(), e.getImc(),
                e.getHallazgosFisicos(), e.getResultEstudios(), e.getComparacionPrevia());
    }

    private SoapAnalisisDto toSAnalDto(SoapAnalisis e) {
        return new SoapAnalisisDto(e.getEvolucionEstado(), e.getDiagActualizado(), e.getCambiosSeveridad(), e.getEvalTerapeutica());
    }

    private SoapPlanDto toSPlanDto(SoapPlan e) {
        return new SoapPlanDto(e.getMantenerTrat(), e.getAjustarDosis(), e.getCambiarEsquema(),
                e.getSuspenderTrat(), e.getNuevosEstudios(), e.getInterconsulta(), e.getAltaProblema(), e.getDetallesPlan());
    }

    private ListaProblemaDto toLPDto(ListaProblema lp) {
        return new ListaProblemaDto(lp.getId(), lp.getNroProblema(), lp.getDescripcion(), lp.getEstado(), lp.getFechaIdentificacion());
    }

    private DiagnosticoDto toDiagDto(Diagnostico d) {
        return new DiagnosticoDto(d.getId(), d.getCodigoCie10(), d.getDescripcion(), d.getTipo(), d.getCaso(), d.getNroProblemAsoc());
    }

    private DecisionControlDto toDecDto(DecisionControl e) {
        return new DecisionControlDto(e.getDecision(), e.getRefPnpIpress(), e.getRefPnpMotivo(),
                e.getRefNopnpIpress(), e.getRefNopnpMotivo(), e.getProfNombres(), e.getProfDocIdent(),
                e.getProfColegiatura(), e.getProfRegEspecialidad(), e.getFechaCierre());
    }
}
