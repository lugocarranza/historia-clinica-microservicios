package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AntAlergicoDto(
        @Size(max = 1, message = "Debe seleccionar S o N")
        @Pattern(regexp = "^[SN]$", message = "Debe seleccionar S o N")
        String alergiaMed,

        @Size(max = 300, message = "La descripcion de alergia a medicamentos no debe superar 300 caracteres")
        String alergiaMedDesc,

        @Size(max = 1, message = "Debe seleccionar S o N")
        @Pattern(regexp = "^[SN]$", message = "Debe seleccionar S o N")
        String alergiaAli,

        @Size(max = 300, message = "La descripcion de alergia a alimentos no debe superar 300 caracteres")
        String alergiaAliDesc,

        @Size(max = 1, message = "Debe seleccionar S o N")
        @Pattern(regexp = "^[SN]$", message = "Debe seleccionar S o N")
        String alergiaOtros,

        @Size(max = 300, message = "La descripcion de otras alergias no debe superar 300 caracteres")
        String alergiaOtrosDesc,

        @Size(max = 30, message = "El tipo de reaccion no debe superar 30 caracteres")
        @Pattern(regexp = "^(Leve|Moderada|Severa / Anafilaxia)?$", message = "El tipo de reacción no es válido")
        String tipoReaccion
) {}
