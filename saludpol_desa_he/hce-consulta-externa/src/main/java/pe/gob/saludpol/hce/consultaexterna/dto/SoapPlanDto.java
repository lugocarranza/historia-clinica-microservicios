package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SoapPlanDto(
        @NotBlank(message = "La conducta mantener tratamiento es requerida")
        @Pattern(regexp = "^[SN]$", message = "La conducta mantener tratamiento debe ser S o N")
        String mantenerTrat,
        @NotBlank(message = "La conducta ajustar dosis es requerida")
        @Pattern(regexp = "^[SN]$", message = "La conducta ajustar dosis debe ser S o N")
        String ajustarDosis,
        @NotBlank(message = "La conducta cambiar esquema es requerida")
        @Pattern(regexp = "^[SN]$", message = "La conducta cambiar esquema debe ser S o N")
        String cambiarEsquema,
        @NotBlank(message = "La conducta suspender tratamiento es requerida")
        @Pattern(regexp = "^[SN]$", message = "La conducta suspender tratamiento debe ser S o N")
        String suspenderTrat,
        @NotBlank(message = "La conducta nuevos estudios es requerida")
        @Pattern(regexp = "^[SN]$", message = "La conducta nuevos estudios debe ser S o N")
        String nuevosEstudios,
        @NotBlank(message = "La conducta interconsulta es requerida")
        @Pattern(regexp = "^[SN]$", message = "La conducta interconsulta debe ser S o N")
        String interconsulta,
        @NotBlank(message = "La conducta alta de problema es requerida")
        @Pattern(regexp = "^[SN]$", message = "La conducta alta de problema debe ser S o N")
        String altaProblema,
        @Size(max = 2000, message = "Los detalles del plan no deben superar 2000 caracteres")
        String detallesPlan
) {}
