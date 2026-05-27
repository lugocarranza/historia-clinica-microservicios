package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record IniciarCSRequest(
        @Size(max = 20)
        @Pattern(regexp = "^\\d*$", message = "El codigo CUI de la IPRESS solo debe contener numeros")
        String ipressCui
) {}
