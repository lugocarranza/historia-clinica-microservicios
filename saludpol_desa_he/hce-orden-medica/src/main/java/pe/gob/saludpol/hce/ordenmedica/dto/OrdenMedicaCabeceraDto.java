package pe.gob.saludpol.hce.ordenmedica.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record OrdenMedicaCabeceraDto(
        Long id,
        String nroOap,
        String nroHc,
        LocalDate fechaEmision,
        LocalTime horaEmision,
        String nroAps,
        String nroCartaGarantia,
        String estado,
        CodigoNombreDto tipoAtencion,
        CodigoNombreDto tipoOrden,
        Long atencionId,
        Long admisionId,
        Long historiaClinicaId,
        String dniPaciente,
        Integer edad,
        String tipoSeguro,
        String tipoBeneficiario,
        String planSeguro
) {}
