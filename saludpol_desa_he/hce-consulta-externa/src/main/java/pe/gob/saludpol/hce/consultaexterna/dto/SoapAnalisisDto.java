package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SoapAnalisisDto(
        @NotBlank(message = "La evolucion del cuadro es requerida")
        @Size(max = 20, message = "La evolucion del cuadro no debe superar 20 caracteres")
        @Pattern(regexp = "^(Mejoría|Igual|Peor|Resuelto)$", message = "La evolución del cuadro no es válida", flags = Pattern.Flag.CANON_EQ)
        String evolucionEstado,
        @Size(max = 500, message = "El diagnostico actualizado no debe superar 500 caracteres")
        String diagActualizado,
        @Size(max = 500, message = "Los cambios de severidad no deben superar 500 caracteres")
        String cambiosSeveridad,
        @Size(max = 500, message = "La evaluacion terapeutica no debe superar 500 caracteres")
        String evalTerapeutica
) {}
