package pe.gob.saludpol.hce.ordenmedica.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.gob.saludpol.hce.ordenmedica.common.dto.ApiResponse;
import pe.gob.saludpol.hce.ordenmedica.dto.OrdenMedicaDetalleResponse;
import pe.gob.saludpol.hce.ordenmedica.dto.OrdenMedicaLineaAtencionDto;
import pe.gob.saludpol.hce.ordenmedica.dto.OrdenMedicaRequest;
import pe.gob.saludpol.hce.ordenmedica.dto.OrdenMedicaResumenDto;
import pe.gob.saludpol.hce.ordenmedica.service.OrdenMedicaService;

import java.util.List;

@RestController
@RequestMapping("/orden-medica")
@RequiredArgsConstructor
public class OrdenMedicaController {

    private final OrdenMedicaService ordenMedicaService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrdenMedicaDetalleResponse>> crear(
            @Valid @RequestBody OrdenMedicaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(ordenMedicaService.crear(request)));
    }

    @PostMapping("/crear-consolidado")
    public ResponseEntity<ApiResponse<List<OrdenMedicaDetalleResponse>>> crearConsolidado(
            @Valid @RequestBody OrdenMedicaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(ordenMedicaService.crearConsolidado(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OrdenMedicaDetalleResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody OrdenMedicaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(ordenMedicaService.actualizar(id, request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrdenMedicaDetalleResponse>> obtenerDetalle(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(ordenMedicaService.obtenerDetalle(id)));
    }

    @GetMapping("/paciente/{dniPaciente}")
    public ResponseEntity<ApiResponse<List<OrdenMedicaResumenDto>>> listarPorDni(
            @PathVariable String dniPaciente) {
        return ResponseEntity.ok(ApiResponse.ok(ordenMedicaService.listarPorDni(dniPaciente)));
    }

    @GetMapping("/atencion/{tipoAtencion}/{atencionId}")
    public ResponseEntity<ApiResponse<List<OrdenMedicaResumenDto>>> listarPorAtencion(
            @PathVariable String tipoAtencion,
            @PathVariable Long atencionId) {
        return ResponseEntity.ok(ApiResponse.ok(ordenMedicaService.listarPorAtencion(tipoAtencion, atencionId)));
    }

    @GetMapping("/atencion/{tipoAtencion}/{atencionId}/lineas")
    public ResponseEntity<ApiResponse<List<OrdenMedicaLineaAtencionDto>>> listarLineasPorAtencion(
            @PathVariable String tipoAtencion,
            @PathVariable Long atencionId) {
        return ResponseEntity.ok(ApiResponse.ok(ordenMedicaService.listarLineasPorAtencion(tipoAtencion, atencionId)));
    }
}
