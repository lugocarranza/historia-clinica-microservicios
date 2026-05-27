package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record IniciarCERequest(
        @NotBlank(message = "El servicio/especialidad es requerido")
        @Size(max = 100)
        String servicio,

        @NotBlank(message = "El DNI del paciente es requerido")
        @Size(max = 12)
        String dniPaciente,

        @Size(max = 20)
        @Pattern(regexp = "^\\d*$", message = "El codigo CUI de la IPRESS solo debe contener numeros")
        String ipressCui
) {}
