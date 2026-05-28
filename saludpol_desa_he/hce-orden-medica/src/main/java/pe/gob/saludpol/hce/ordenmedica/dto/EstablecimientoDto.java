package pe.gob.saludpol.hce.ordenmedica.dto;

public record EstablecimientoDto(
        String ipressCui,
        String ipress,
        String sede,
        String region,
        String categoria,
        String plan,
        String errorMaestros
) {}
