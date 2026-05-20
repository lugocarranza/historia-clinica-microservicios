package pe.gob.saludpol.hce.consultaexterna.client.dto;

import java.time.LocalDateTime;

public record AdmisionClientDto(
        Long id,
        Long historiaClinicaId,
        LocalDateTime fechaAtencion
) {}
