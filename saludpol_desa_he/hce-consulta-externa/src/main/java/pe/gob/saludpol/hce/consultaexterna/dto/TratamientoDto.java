package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TratamientoDto(
        Long id,
        @NotBlank(message = "El codigo del medicamento es requerido")
        @Size(max = 30, message = "El codigo no debe superar 30 caracteres")
        String codigo,

        @NotBlank(message = "El medicamento es requerido")
        @Size(max = 200, message = "El medicamento no debe superar 200 caracteres")
        String medicamento,

        @NotBlank(message = "La dosis es requerida")
        @Size(max = 10, message = "La dosis no debe superar 10 caracteres")
        String dosis,

        @NotBlank(message = "La via de administracion es requerida")
        @Size(max = 20, message = "La via no debe superar 20 caracteres")
        @Pattern(regexp = "^(Oral|EV|IM|Tópico|Inhalado)$", message = "La vía de administración no es válida", flags = Pattern.Flag.CANON_EQ)
        String via,

        @NotBlank(message = "La frecuencia es requerida")
        @Pattern(regexp = "^\\d{1,3}$", message = "La frecuencia debe ser un numero entero de hasta 3 digitos")
        String frecuencia,

        @NotBlank(message = "La duracion es requerida")
        @Pattern(regexp = "^\\d{1,8}$", message = "La duracion debe ser un numero entero de hasta 8 digitos")
        String duracion,

        @NotBlank(message = "Las indicaciones son requeridas")
        @Size(max = 500, message = "Las indicaciones no deben superar 500 caracteres")
        String indicaciones
) {}
