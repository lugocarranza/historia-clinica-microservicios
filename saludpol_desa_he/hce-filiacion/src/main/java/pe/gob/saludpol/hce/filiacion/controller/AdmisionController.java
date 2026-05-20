package pe.gob.saludpol.hce.filiacion.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import pe.gob.saludpol.hce.filiacion.common.dto.ApiResponse;
import pe.gob.saludpol.hce.filiacion.dto.AdmisionRequest;
import pe.gob.saludpol.hce.filiacion.dto.AdmisionResponse;
import pe.gob.saludpol.hce.filiacion.dto.HistoriaClinicaResponse;
import pe.gob.saludpol.hce.filiacion.service.AdmisionService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/admision")
@RequiredArgsConstructor
public class AdmisionController {

    private final AdmisionService admisionService;

    @PostMapping
    public ResponseEntity<ApiResponse<AdmisionResponse>> registrar(
            @Valid @RequestBody AdmisionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(admisionService.registrar(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdmisionResponse>> obtener(@PathVariable Long id) {
        var admision = admisionService.obtener(id);
        return ResponseEntity.ok(ApiResponse.ok(admision));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdmisionResponse>>> buscar(
            @RequestParam(defaultValue = "") @Pattern(regexp = "^\\d{0,12}$", message = "El DNI solo debe contener digitos") String dni,
            @RequestParam(defaultValue = "") @Pattern(regexp = "^[0-9A-Za-z\\-]{0,20}$", message = "El N° de HC solo debe contener numeros, letras y guiones") String nroHc,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaAtencion"));
        return ResponseEntity.ok(ApiResponse.ok(admisionService.buscar(dni, nroHc, pageable)));
    }

    @GetMapping("/historia-clinica/dni/{dni}")
    public ResponseEntity<ApiResponse<HistoriaClinicaResponse>> obtenerHcPorDni(
            @PathVariable String dni) {
        return ResponseEntity.ok(ApiResponse.ok(admisionService.obtenerHistoriaClinicaPorDni(dni)));
    }

    @GetMapping("/historia-clinica/{historiaClinicaId}")
    public ResponseEntity<ApiResponse<List<AdmisionResponse>>> listarPorHistoria(
            @PathVariable Long historiaClinicaId) {
        return ResponseEntity.ok(
                ApiResponse.ok(admisionService.listarPorHistoriaClinica(historiaClinicaId)));
    }
}
