package pe.gob.saludpol.hce.consultaexterna.dto;

import java.math.BigDecimal;
import java.util.List;

public record ExamenFisicoResponse(
        Long id,
        Long atencionId,
        Integer paSistolica,
        Integer paDiastolica,
        Integer fc,
        Integer fr,
        BigDecimal temperatura,
        BigDecimal satO2,
        BigDecimal peso,
        BigDecimal talla,
        BigDecimal imc,
        List<ExamenRegionDto> regiones
) {}