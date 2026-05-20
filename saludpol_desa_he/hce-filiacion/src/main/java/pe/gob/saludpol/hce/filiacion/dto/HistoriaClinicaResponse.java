package pe.gob.saludpol.hce.filiacion.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record HistoriaClinicaResponse(
        Long id,
        String nroHc,
        String dniPaciente,
        String apellidosPaciente,
        String nombresPaciente,
        LocalDate fechaNac,
        String sexo,
        String estado,
        LocalDateTime fechaApertura
) {}
