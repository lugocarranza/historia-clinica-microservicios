package pe.gob.saludpol.hce.ordenmedica.dto;

public record CoberturaDto(
        String tipoSeguro,
        String planSalud,
        String tipoCobertura,
        String tipoBeneficio
) {}
