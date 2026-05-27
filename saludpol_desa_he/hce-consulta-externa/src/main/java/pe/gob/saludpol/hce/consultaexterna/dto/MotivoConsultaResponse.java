package pe.gob.saludpol.hce.consultaexterna.dto;

public record MotivoConsultaResponse(
        Long id,
        Long atencionId,
        String oapEpisodio,
        String motivo,
        String tiempoEnfermedad,
        String formaInicio,
        String curso,
        String enfermedadActual,
        String sintomasSignos,
        String relatoCronologico,
        String factoresMod,
        String tratamientosPrevios
) {}
