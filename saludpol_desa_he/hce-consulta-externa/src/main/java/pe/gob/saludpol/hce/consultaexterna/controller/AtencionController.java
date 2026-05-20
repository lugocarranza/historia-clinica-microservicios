package pe.gob.saludpol.hce.consultaexterna.controller;

import lombok.RequiredArgsConstructor;
import pe.gob.saludpol.hce.consultaexterna.common.dto.ApiResponse;
import pe.gob.saludpol.hce.consultaexterna.dto.AtencionResponse;
import pe.gob.saludpol.hce.consultaexterna.entity.Atencion;
import pe.gob.saludpol.hce.consultaexterna.repository.AtencionRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/consulta/atenciones")
@RequiredArgsConstructor
public class AtencionController {

    private final AtencionRepository atencionRepository;

    @GetMapping("/historia-clinica/{historiaClinicaId}")
    public ResponseEntity<ApiResponse<List<AtencionResponse>>> listarPorHistoria(
            @PathVariable Long historiaClinicaId) {
        List<AtencionResponse> result = atencionRepository
                .findByHistoriaClinicaIdOrderByFechaAtencionDesc(historiaClinicaId)
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    private AtencionResponse toResponse(Atencion a) {
        return new AtencionResponse(
                a.getId(),
                a.getAdmisionId(),
                a.getHistoriaClinicaId(),
                a.getTipoAtencion(),
                a.getFechaAtencion(),
                null,
                null,
                a.getEstado(),
                a.getCreatedAt());
    }
}
