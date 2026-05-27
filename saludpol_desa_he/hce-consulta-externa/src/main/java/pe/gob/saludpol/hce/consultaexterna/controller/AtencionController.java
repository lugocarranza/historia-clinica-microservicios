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

    @GetMapping("/dni/{dniPaciente}")
    public ResponseEntity<ApiResponse<List<AtencionResponse>>> listarPorDni(
            @PathVariable String dniPaciente) {
        List<AtencionResponse> result = atencionRepository
                .findByDniPacienteOrderByFechaAtencionDesc(dniPaciente)
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    private AtencionResponse toResponse(Atencion a) {
        return new AtencionResponse(
                a.getId(),
                a.getAdmisionId(),
                a.getTipoAtencion(),
                a.getFechaAtencion(),
                a.getServicio(),
                a.getDniPaciente(),
                a.getCeAtencionId(),
                a.getEstado(),
                a.getCreatedAt());
    }
}
