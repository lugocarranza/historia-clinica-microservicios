package pe.gob.saludpol.hce.ordenmedica.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrdenMedicaLineaAtencionDto(
        Long ordenId,
        Long lineaId,
        String nroOap,
        String estadoOrden,
        LocalDateTime fechaEmision,
        CodigoNombreDto tipoAtencion,
        Long atencionId,
        CodigoNombreDto tipoOrden,
        String tipoLinea,
        String codigoCie10,
        String codigoCpms,
        String codigoSegus,
        String descripcion,
        BigDecimal cantidad,
        String prioridad,
        String observaciones
) {}
