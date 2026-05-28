package pe.gob.saludpol.hce.ordenmedica.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AdmisionClientDto(
        Long id,
        Long historiaClinicaId,
        String nroHc,
        String dniPaciente,
        String apellidosPaciente,
        String nombresPaciente,
        LocalDate fechaNac,
        String sexo,
        String cuiIpress,
        String ipressRazonSocial,
        String ipressSede,
        String ipressRegion,
        String ipressCategoria
) {}
