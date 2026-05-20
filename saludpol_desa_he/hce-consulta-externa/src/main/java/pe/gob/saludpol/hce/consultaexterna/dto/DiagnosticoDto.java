package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DiagnosticoDto(
        Long id,
        @Size(max = 7, message = "El codigo CIE-10 no debe superar 7 caracteres")
        @Pattern(regexp = "^[0-9A-Za-z\\.]*$", message = "El codigo CIE-10 contiene caracteres no permitidos")
        String codigoCie10,
        @Size(max = 500, message = "La descripcion no debe superar 500 caracteres")
        String descripcion,

        @Size(max = 20, message = "El tipo no debe superar 20 caracteres")
        @Pattern(regexp = "^(Presuntivo|Definitivo|Repetitivo)$", message = "El tipo de diagnóstico no es válido")
        String tipo,

        @Size(max = 15, message = "El caso no debe superar 15 caracteres")
        @Pattern(regexp = "^(Nuevo|Repetido)$", message = "El caso no es válido")
        String caso,

        Integer nroProblemAsoc
) {}
