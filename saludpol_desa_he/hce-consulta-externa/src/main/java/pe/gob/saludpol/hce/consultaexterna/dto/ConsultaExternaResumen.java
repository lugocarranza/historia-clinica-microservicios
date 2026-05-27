package pe.gob.saludpol.hce.consultaexterna.dto;

import java.util.List;

public record ConsultaExternaResumen(
        Long atencionId,
        String atencionEstado,
        String servicio,
        MotivoConsultaResponse motivo,
        AntPersonalRequest antPersonal,
        List<AntFamiliarDto> antFamiliares,
        List<RevisionSistemaDto> revisionSistemas,
        ExamenFisicoResponse examenFisico,
        List<ListaProblemaDto> listaProblemas,
        List<DiagnosticoDto> diagnosticos,
        List<TratamientoDto> tratamientos,
        String indicacionesNoFarm,
        List<SolicitudApoyoDto> solicitudesApoyo,
        DecisionClinicaRequest decisionClinica
) {}
