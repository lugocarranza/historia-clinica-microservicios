package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MedPlanControlDto(
        Long id,
        @Size(max = 30, message = "El codigo no debe superar 30 caracteres")
        String codigo,
        @NotBlank(message = "El farmaco es requerido")
        @Size(max = 200, message = "El farmaco no debe superar 200 caracteres")
        String farmaco,
        @NotBlank(message = "La dosis es requerida")
        @Size(max = 10, message = "La dosis no debe superar 10 caracteres")
        @Pattern(regexp = "^[0-9A-Za-z\\.\\-/\\+ ]+$", message = "La dosis contiene caracteres no permitidos")
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
        @Size(max = 15, message = "La conducta no debe superar 15 caracteres")
        @Pattern(regexp = "^(Mantener|Ajustar|Cambiar|Suspender)$", message = "La conducta no es válida")
        String conducta
) {}
