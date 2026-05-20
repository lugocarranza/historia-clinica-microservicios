package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AntFamiliarDto(
        Long id,
        @Size(max = 100, message = "La enfermedad no debe superar 100 caracteres")
        String enfermedad,
        @Size(max = 1, message = "Debe seleccionar S o N")
        @Pattern(regexp = "^[SN]$", message = "Debe seleccionar S o N")
        String padre,
        @Size(max = 1, message = "Debe seleccionar S o N")
        @Pattern(regexp = "^[SN]$", message = "Debe seleccionar S o N")
        String madre,
        @Size(max = 1, message = "Debe seleccionar S o N")
        @Pattern(regexp = "^[SN]$", message = "Debe seleccionar S o N")
        String hermanos,
        @Size(max = 1, message = "Debe seleccionar S o N")
        @Pattern(regexp = "^[SN]$", message = "Debe seleccionar S o N")
        String abuelos,
        @Size(max = 1, message = "Debe seleccionar S o N")
        @Pattern(regexp = "^[SN]$", message = "Debe seleccionar S o N")
        String otros,
        @Size(max = 500, message = "Las observaciones no deben superar 500 caracteres")
        String observaciones
) {}
