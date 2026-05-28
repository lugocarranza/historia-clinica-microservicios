package pe.gob.saludpol.hce.ordenmedica.dto;

import java.time.LocalDateTime;

public record ActoMedicoDto(
        String tipoAtencion,
        String actividad,
        String subActividad,
        String servicio,
        LocalDateTime fechaAtencion
) {}
