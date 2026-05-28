package pe.gob.saludpol.hce.ordenmedica.dto;

import java.time.LocalDateTime;

public record OrdenMedicaResumenDto(
        Long id,
        String nroOap,
        String dniPaciente,
        String paciente,
        Long admisionId,
        Long historiaClinicaId,
        LocalDateTime fechaEmision,
        String estado,
        String nroAps,
        String nroCartaGarantia,
        CodigoNombreDto tipoAtencion,
        CodigoNombreDto tipoOrden,
        int cantidadDetalles
) {}
