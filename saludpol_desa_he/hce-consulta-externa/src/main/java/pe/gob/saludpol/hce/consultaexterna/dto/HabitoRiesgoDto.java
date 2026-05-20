package pe.gob.saludpol.hce.consultaexterna.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record HabitoRiesgoDto(
        @Size(max = 15, message = "El tabaco no debe superar 15 caracteres")
        @Pattern(regexp = "^(No|Exfumador|Activo)$", message = "El valor de tabaco no es válido")
        String tabaco,

        BigDecimal tabacoPaquetesAno,

        @Size(max = 15, message = "El alcohol no debe superar 15 caracteres")
        @Pattern(regexp = "^(No|Social|Frecuente)$", message = "El valor de alcohol no es válido")
        String alcohol,

        @Size(max = 5, message = "Las drogas no deben superar 5 caracteres")
        @Pattern(regexp = "^(No|Sí)$", message = "El valor de drogas no es válido", flags = Pattern.Flag.CANON_EQ)
        String drogas,

        @Size(max = 200, message = "El tipo de drogas no debe superar 200 caracteres")
        @Pattern(regexp = "^[^<>'\";\\\\/]*$", message = "El tipo de drogas contiene caracteres no permitidos")
        String drogasTipo,

        @Size(max = 1, message = "Debe seleccionar S o N")
        @Pattern(regexp = "^[SN]$", message = "Debe seleccionar S o N")
        String sedentarismo,

        @Size(max = 500, message = "Los otros factores no deben superar 500 caracteres")
        String otrosFactores
) {}
