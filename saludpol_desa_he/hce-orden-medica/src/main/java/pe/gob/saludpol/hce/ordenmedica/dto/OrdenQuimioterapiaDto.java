package pe.gob.saludpol.hce.ordenmedica.dto;

public record OrdenQuimioterapiaDto(
        Long id,
        String diagnosticoOncologico,
        String estadio,
        String medicamentos,
        String dosis,
        String via,
        String frecuencia,
        String protocoloTerapeutico,
        String ciclo,
        Integer duracionCicloDias,
        String observaciones
) {}
