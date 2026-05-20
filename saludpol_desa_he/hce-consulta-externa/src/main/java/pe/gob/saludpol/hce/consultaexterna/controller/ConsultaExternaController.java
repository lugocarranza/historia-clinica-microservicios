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
@RequestMapping("/consulta/externa/admision/{admisionId}")
@RequiredArgsConstructor
public class ConsultaExternaController {

    private final ConsultaExternaService service;

    @GetMapping("/resumen")
    public ResponseEntity<ApiResponse<ConsultaExternaResumen>> resumen(@PathVariable Long admisionId) {
        return ResponseEntity.ok(ApiResponse.ok(service.obtenerResumen(admisionId)));
    }

    @PutMapping("/motivo")
    public ResponseEntity<ApiResponse<MotivoConsultaResponse>> guardarMotivo(
            @PathVariable Long admisionId,
            @Valid @RequestBody MotivoConsultaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(service.guardarMotivo(admisionId, request)));
    }

    @GetMapping("/motivo")
    public ResponseEntity<ApiResponse<MotivoConsultaResponse>> obtenerMotivo(@PathVariable Long admisionId) {
        return ResponseEntity.ok(ApiResponse.ok(service.obtenerMotivo(admisionId)));
    }

    @PutMapping("/antecedentes-personales")
    public ResponseEntity<ApiResponse<Void>> guardarAntPersonal(
            @PathVariable Long admisionId,
            @Valid @RequestBody AntPersonalRequest request) {
        service.guardarAntPersonal(admisionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/antecedentes-familiares")
    public ResponseEntity<ApiResponse<Void>> guardarAntFamiliares(
            @PathVariable Long admisionId,
            @Valid @RequestBody List<@Valid AntFamiliarDto> request) {
        service.guardarAntFamiliares(admisionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/revision-sistemas")
    public ResponseEntity<ApiResponse<Void>> guardarRevisionSistemas(
            @PathVariable Long admisionId,
            @Valid @RequestBody List<@Valid RevisionSistemaDto> request) {
        service.guardarRevisionSistemas(admisionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/examen-fisico")
    public ResponseEntity<ApiResponse<ExamenFisicoResponse>> guardarExamenFisico(
            @PathVariable Long admisionId,
            @Valid @RequestBody ExamenFisicoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(service.guardarExamenFisico(admisionId, request)));
    }

    @PutMapping("/lista-problemas")
    public ResponseEntity<ApiResponse<Void>> guardarListaProblemas(
            @PathVariable Long admisionId,
            @Valid @RequestBody List<@Valid ListaProblemaDto> request) {
        service.guardarListaProblemas(admisionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/diagnosticos")
    public ResponseEntity<ApiResponse<Void>> guardarDiagnosticos(
            @PathVariable Long admisionId,
            @Valid @RequestBody List<@Valid DiagnosticoDto> request) {
        service.guardarDiagnosticos(admisionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/tratamientos")
    public ResponseEntity<ApiResponse<Void>> guardarTratamientos(
            @PathVariable Long admisionId,
            @Valid @RequestBody TratamientoListRequest request) {
        service.guardarTratamientos(admisionId, request.tratamientos(), request.indicacionesNoFarm());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/solicitudes-apoyo")
    public ResponseEntity<ApiResponse<Void>> guardarSolicitudesApoyo(
            @PathVariable Long admisionId,
            @Valid @RequestBody List<@Valid SolicitudApoyoDto> request) {
        service.guardarSolicitudesApoyo(admisionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/decision-clinica")
    public ResponseEntity<ApiResponse<Void>> guardarDecisionClinica(
            @PathVariable Long admisionId,
            @Valid @RequestBody DecisionClinicaRequest request) {
        service.guardarDecisionClinica(admisionId, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
