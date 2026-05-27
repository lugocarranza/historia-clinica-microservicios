package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record DecisionClinicaRequest(
        @NotBlank(message = "La decision de alta es obligatoria")
        @Size(max = 40, message = "La decision de alta no debe superar 40 caracteres")
        @Pattern(regexp = "^(Alta con cita|Alta sin cita|Hospitalización|Referencia|Contra-referencia|Emergencia)$",
                 message = "La decisión de alta no es válida", flags = Pattern.Flag.CANON_EQ)
        String decisionAlta,

        @FutureOrPresent(message = "La fecha de proxima cita no puede ser una fecha pasada")
        LocalDate fechaProximaCita,

        @NotBlank(message = "La especialidad de referencia es obligatoria")
        @Size(max = 100, message = "La especialidad de referencia no debe superar 100 caracteres")
        @Pattern(regexp = "^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\\s()]+$", message = "La especialidad de referencia solo puede contener letras, espacios y paréntesis")
        String especialidadRef,

        @NotBlank(message = "El plan de manejo es obligatorio")
        @Size(max = 2000, message = "El plan de manejo no debe superar 2000 caracteres")
        String planManejo,

        @NotBlank(message = "El pronostico es obligatorio")
        @Size(max = 1000, message = "El pronostico no debe superar 1000 caracteres")
        String pronostico,

        @NotBlank(message = "Las observaciones son obligatorias")
        @Size(max = 1000, message = "Las observaciones no deben superar 1000 caracteres")
        String observaciones,

        @NotBlank(message = "El medico responsable es obligatorio")
        @Size(max = 70, message = "El nombre del medico no debe superar 70 caracteres")
        @Pattern(regexp = "^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\\s]+$", message = "El nombre del médico solo puede contener letras y espacios")
        String medicoNombre,

        @NotBlank(message = "El CMP del medico es obligatorio")
        @Pattern(regexp = "\\d*", message = "El CMP del medico debe contener solo numeros")
        @Size(max = 6, message = "El CMP del medico no debe superar 6 caracteres")
        String medicoCmp,

        @Size(max = 20)
        @Pattern(regexp = "^\\d*$", message = "El codigo CUI de la IPRESS solo debe contener numeros")
        String ipressCui
) {}
