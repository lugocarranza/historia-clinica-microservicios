package pe.gob.saludpol.hce.consultaexterna.dto;

import java.time.LocalDateTime;

public record AtencionResponse(
        Long id,
        Long admisionId,
        Long historiaClinicaId,
        String tipoAtencion,
        LocalDateTime fechaAtencion,
        String servicio,
        Long profesionalId,
        String estado,
        LocalDateTime createdAt
) {}
