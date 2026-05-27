package pe.gob.saludpol.hce.consultaexterna.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import pe.gob.saludpol.hce.consultaexterna.common.dto.ApiResponse;
import pe.gob.saludpol.hce.consultaexterna.dto.*;
import pe.gob.saludpol.hce.consultaexterna.service.ConsultaExternaService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ConsultaExternaController {

    private final ConsultaExternaService service;

    // ── Admision-scoped: create / list ──────────────────────────────────────

    @PostMapping("/consulta/externa/admision/{admisionId}/iniciar")
    public ResponseEntity<ApiResponse<AtencionResponse>> iniciar(
            @PathVariable Long admisionId,
            @Valid @RequestBody IniciarCERequest request) {
        return ResponseEntity.ok(ApiResponse.ok(service.iniciarConsultaExterna(admisionId, request)));
    }

    @GetMapping("/consulta/externa/admision/{admisionId}/lista")
    public ResponseEntity<ApiResponse<List<AtencionResponse>>> lista(@PathVariable Long admisionId) {
        return ResponseEntity.ok(ApiResponse.ok(service.listarConsultasCE(admisionId)));
    }

    // ── Atencion-scoped: read / update ──────────────────────────────────────

    @GetMapping("/consulta/externa/{atencionId}/resumen")
    public ResponseEntity<ApiResponse<ConsultaExternaResumen>> resumen(@PathVariable Long atencionId) {
        return ResponseEntity.ok(ApiResponse.ok(service.obtenerResumen(atencionId)));
    }

    @PutMapping("/consulta/externa/{atencionId}/motivo")
    public ResponseEntity<ApiResponse<MotivoConsultaResponse>> guardarMotivo(
            @PathVariable Long atencionId,
            @Valid @RequestBody MotivoConsultaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(service.guardarMotivo(atencionId, request)));
    }

    @GetMapping("/consulta/externa/{atencionId}/motivo")
    public ResponseEntity<ApiResponse<MotivoConsultaResponse>> obtenerMotivo(@PathVariable Long atencionId) {
        return ResponseEntity.ok(ApiResponse.ok(service.obtenerMotivo(atencionId)));
    }

    @PutMapping("/consulta/externa/{atencionId}/antecedentes-personales")
    public ResponseEntity<ApiResponse<Void>> guardarAntPersonal(
            @PathVariable Long atencionId,
            @Valid @RequestBody AntPersonalRequest request) {
        service.guardarAntPersonal(atencionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/consulta/externa/{atencionId}/antecedentes-familiares")
    public ResponseEntity<ApiResponse<Void>> guardarAntFamiliares(
            @PathVariable Long atencionId,
            @Valid @RequestBody List<@Valid AntFamiliarDto> request) {
        service.guardarAntFamiliares(atencionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/consulta/externa/{atencionId}/revision-sistemas")
    public ResponseEntity<ApiResponse<Void>> guardarRevisionSistemas(
            @PathVariable Long atencionId,
            @Valid @RequestBody List<@Valid RevisionSistemaDto> request) {
        service.guardarRevisionSistemas(atencionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/consulta/externa/{atencionId}/examen-fisico")
    public ResponseEntity<ApiResponse<ExamenFisicoResponse>> guardarExamenFisico(
            @PathVariable Long atencionId,
            @Valid @RequestBody ExamenFisicoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(service.guardarExamenFisico(atencionId, request)));
    }

    @PutMapping("/consulta/externa/{atencionId}/lista-problemas")
    public ResponseEntity<ApiResponse<Void>> guardarListaProblemas(
            @PathVariable Long atencionId,
            @Valid @RequestBody List<@Valid ListaProblemaDto> request) {
        service.guardarListaProblemas(atencionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/consulta/externa/{atencionId}/diagnosticos")
    public ResponseEntity<ApiResponse<Void>> guardarDiagnosticos(
            @PathVariable Long atencionId,
            @Valid @RequestBody List<@Valid DiagnosticoDto> request) {
        service.guardarDiagnosticos(atencionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/consulta/externa/{atencionId}/tratamientos")
    public ResponseEntity<ApiResponse<Void>> guardarTratamientos(
            @PathVariable Long atencionId,
            @Valid @RequestBody TratamientoListRequest request) {
        service.guardarTratamientos(atencionId, request.tratamientos(), request.indicacionesNoFarm());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/consulta/externa/{atencionId}/solicitudes-apoyo")
    public ResponseEntity<ApiResponse<Void>> guardarSolicitudesApoyo(
            @PathVariable Long atencionId,
            @Valid @RequestBody List<@Valid SolicitudApoyoDto> request) {
        service.guardarSolicitudesApoyo(atencionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/consulta/externa/{atencionId}/decision-clinica")
    public ResponseEntity<ApiResponse<Void>> guardarDecisionClinica(
            @PathVariable Long atencionId,
            @Valid @RequestBody DecisionClinicaRequest request) {
        service.guardarDecisionClinica(atencionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
