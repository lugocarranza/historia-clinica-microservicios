package pe.gob.saludpol.hce.consultaexterna.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import pe.gob.saludpol.hce.consultaexterna.common.dto.ApiResponse;
import pe.gob.saludpol.hce.consultaexterna.dto.*;
import pe.gob.saludpol.hce.consultaexterna.service.ConsultaControlService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/consulta/control")
@RequiredArgsConstructor
public class ConsultaControlController {

    private final ConsultaControlService service;

    @PostMapping("/admision/{admisionId}/iniciar")
    public ResponseEntity<ApiResponse<Long>> iniciar(@PathVariable Long admisionId) {
        return ResponseEntity.ok(ApiResponse.ok(service.iniciarConsultaControl(admisionId)));
    }

    @GetMapping("/admision/{admisionId}/lista")
    public ResponseEntity<ApiResponse<List<AtencionResponse>>> lista(@PathVariable Long admisionId) {
        return ResponseEntity.ok(ApiResponse.ok(service.listarConsultasCS(admisionId)));
    }

    @GetMapping("/{atencionId}/resumen")
    public ResponseEntity<ApiResponse<ConsultaControlResumen>> resumen(@PathVariable Long atencionId) {
        return ResponseEntity.ok(ApiResponse.ok(service.obtenerResumen(atencionId)));
    }

    @PutMapping("/{atencionId}/soap-subjetivo")
    public ResponseEntity<ApiResponse<Void>> guardarSubjetivo(
            @PathVariable Long atencionId,
            @Valid @RequestBody SoapSubjetivoDto request) {
        service.guardarSoapSubjetivo(atencionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/{atencionId}/soap-objetivo")
    public ResponseEntity<ApiResponse<Void>> guardarObjetivo(
            @PathVariable Long atencionId,
            @Valid @RequestBody SoapObjetivoDto request) {
        service.guardarSoapObjetivo(atencionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/{atencionId}/soap-analisis")
    public ResponseEntity<ApiResponse<Void>> guardarAnalisis(
            @PathVariable Long atencionId,
            @Valid @RequestBody SoapAnalisisDto request) {
        service.guardarSoapAnalisis(atencionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/{atencionId}/soap-plan")
    public ResponseEntity<ApiResponse<Void>> guardarPlan(
            @PathVariable Long atencionId,
            @Valid @RequestBody SoapPlanDto request) {
        service.guardarSoapPlan(atencionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/{atencionId}/lista-problemas")
    public ResponseEntity<ApiResponse<Void>> guardarListaProblemas(
            @PathVariable Long atencionId,
            @Valid @RequestBody List<@Valid ListaProblemaDto> request) {
        service.guardarListaProblemas(atencionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/{atencionId}/diagnosticos")
    public ResponseEntity<ApiResponse<Void>> guardarDiagnosticos(
            @PathVariable Long atencionId,
            @Valid @RequestBody List<@Valid DiagnosticoDto> request) {
        service.guardarDiagnosticos(atencionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/{atencionId}/plan-control")
    public ResponseEntity<ApiResponse<Void>> guardarPlanControl(
            @PathVariable Long atencionId,
            @Valid @RequestBody PlanControlDto request) {
        service.guardarPlanControl(atencionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/{atencionId}/decision-control")
    public ResponseEntity<ApiResponse<Void>> guardarDecisionControl(
            @PathVariable Long atencionId,
            @Valid @RequestBody DecisionControlDto request) {
        service.guardarDecisionControl(atencionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
