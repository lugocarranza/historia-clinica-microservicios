package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AntQuirurgicoDto(
        Long id,
        @Size(max = 4000, message = "El procedimiento no debe superar 4000 caracteres")
        @NotBlank(message = "El procedimiento es requerido")
        String procedimiento,
        Integer ano,
        @Size(max = 500, message = "Las complicaciones no deben superar 500 caracteres")
        String complicaciones
) {}
