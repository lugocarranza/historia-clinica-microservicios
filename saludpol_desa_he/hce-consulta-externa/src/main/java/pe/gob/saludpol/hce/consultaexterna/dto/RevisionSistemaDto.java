package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RevisionSistemaDto(
        Long id,
        @Size(max = 50, message = "El sistema no debe superar 50 caracteres")
        @Pattern(regexp = "^(Cardiovascular|Respiratorio|Digestivo|Genitourinario|Musculoesquelético|Neurológico)$",
                 message = "El sistema no es válido", flags = Pattern.Flag.CANON_EQ)
        String sistema,

        @Size(max = 100, message = "El sintoma no debe superar 100 caracteres")
        @Pattern(regexp = "^[^<>'\";\\\\/]*$", message = "El síntoma contiene caracteres no permitidos")
        String sintoma,

        @Size(max = 1, message = "Debe seleccionar S o N")
        @Pattern(regexp = "^[SN]$", message = "Debe seleccionar S o N")
        String presente,

        @Size(max = 300, message = "La observacion no debe superar 300 caracteres")
        String observacion
) {}
