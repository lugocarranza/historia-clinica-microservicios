package pe.gob.saludpol.hce.consultaexterna.dto;

import java.util.List;

public record ConsultaControlResumen(
        Long atencionId,
        String atencionEstado,
        SoapSubjetivoDto soapSubjetivo,
        SoapObjetivoDto soapObjetivo,
        SoapAnalisisDto soapAnalisis,
        SoapPlanDto soapPlan,
        List<ListaProblemaDto> listaProblemas,
        List<DiagnosticoDto> diagnosticos,
        PlanControlDto planControl,
        List<SolicitudApoyoDto> solicitudesApoyo,
        DecisionControlDto decisionControl
) {}
