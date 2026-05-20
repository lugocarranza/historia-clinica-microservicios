package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ExamenRegionDto(
        @Size(max = 60, message = "La region no debe superar 60 caracteres")
        @Pattern(regexp = "^(Aspecto General|Cabeza y Cuello|Tórax y Pulmones|Cardiovascular|Abdomen|Extremidades|Neurológico|Piel y Faneras)$",
                 message = "La región no es válida", flags = Pattern.Flag.CANON_EQ)
        String region,

        @Size(max = 1000, message = "Los hallazgos no deben superar 1000 caracteres")
        String hallazgos
) {}
