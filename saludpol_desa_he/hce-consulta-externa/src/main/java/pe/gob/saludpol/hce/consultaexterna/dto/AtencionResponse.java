package pe.gob.saludpol.hce.consultaexterna.dto;

import java.time.LocalDateTime;

public record AtencionResponse(
        Long id,
        Long admisionId,
        String tipoAtencion,
        LocalDateTime fechaAtencion,
        String servicio,
        String dniPaciente,
        Long ceAtencionId,
        String estado,
        LocalDateTime createdAt
) {}
