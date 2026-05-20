package pe.gob.saludpol.hce.filiacion.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdmisionResponse(
        Long id,
        Long historiaClinicaId,
        String nroHc,
        String dniPaciente,
        String apellidosPaciente,
        String nombresPaciente,
        LocalDate fechaNac,
        String sexo,
        String situacion,
        String condicion,
        String parentesco,
        // String oapOrigenNro,
        // String oapDestinoNro,
        // String apsNro,
        String cartaGaratiaNro,
        String tipoSeguro,
        String planSalud,
        String tipoCobertura,
        String tipoBeneficio,
        String tipoAtencion,
        String actividad,
        String subActividad,
        String consultaMedica,
        String servicio,
        LocalDateTime fechaAtencion,
        String cuiIpress,
        String ipressRazonSocial,
        String ipressSede,
        String ipressRegion,
        String ipressCategoria,
        Long profesionalId,
        String profesionalNombre,
        String profesionalProfesion,
        String profesionalColegiatura,
        String estado,
        LocalDateTime createdAt,
        String createdBy
) {}
