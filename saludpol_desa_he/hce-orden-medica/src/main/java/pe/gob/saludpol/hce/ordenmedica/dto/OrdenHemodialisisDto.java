package pe.gob.saludpol.hce.ordenmedica.dto;

public record OrdenHemodialisisDto(
        Long id,
        String tipoDialisis,
        String frecuencia,
        Integer duracionSesionMin,
        Integer numeroSesiones,
        String accesoVascular,
        String anticoagulacion,
        String observaciones
) {}
