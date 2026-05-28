package pe.gob.saludpol.hce.ordenmedica.dto;

import java.math.BigDecimal;

public record OrdenMedicaDetDto(
        Long id,
        String tipo,
        String codigoCie10,
        String codigoCpms,
        String codigoSegus,
        String descripcion,
        BigDecimal cantidad,
        String prioridad,
        String observaciones,
        String estado
) {}
