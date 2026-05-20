package pe.gob.saludpol.hce.filiacion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record AdmisionRequest(
        @NotBlank(message = "El DNI del paciente es requerido")
        @Size(min = 8, max = 12, message = "El DNI del paciente debe tener entre 8 y 12 caracteres")
        @Pattern(regexp = "^\\d{8,12}$", message = "El DNI del paciente solo debe contener digitos")
        String dniPaciente,

        @Size(max = 30, message = "La carta de garantia no debe superar 30 caracteres")
        @Pattern(regexp = "^[0-9A-Za-z\\-]*$", message = "La carta de garantia solo debe contener numeros, letras y guiones")
        String cartaGaratiaNro,

        @Size(max = 30, message = "El tipo de seguro no debe superar 30 caracteres")
        @Pattern(regexp = "^(SALUDPOL|EPS|SIS)$", message = "El tipo de seguro no es válido")
        String tipoSeguro,

        @Size(max = 30, message = "El plan de salud no debe superar 30 caracteres")
        @Pattern(regexp = "^(Específico|Regular|Especial)$", message = "El plan de salud no es válido", flags = Pattern.Flag.CANON_EQ)
        String planSalud,

        @Size(max = 20, message = "El tipo de cobertura no debe superar 20 caracteres")
        @Pattern(regexp = "^(Regular|Total)$", message = "El tipo de cobertura no es válido")
        String tipoCobertura,

        @Size(max = 60, message = "El tipo de beneficio no debe superar 60 caracteres")
        @Pattern(regexp = "^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\\s]+$", message = "El tipo de beneficio solo puede contener letras y espacios")
        String tipoBeneficio,

        @NotBlank(message = "El tipo de atencion es requerido")
        @Size(max = 40, message = "El tipo de atencion no debe superar 40 caracteres")
        @Pattern(regexp = "^(Consulta Externa|Emergencia|Hospitalización Total)$", message = "El tipo de atención no es válido", flags = Pattern.Flag.CANON_EQ)
        String tipoAtencion,

        @Size(max = 200, message = "La actividad no debe superar 200 caracteres")
        @Pattern(regexp = "^[^<>'\";\\\\/]*$", message = "La actividad contiene caracteres no permitidos")
        String actividad,

        @Size(max = 200, message = "La sub actividad no debe superar 200 caracteres")
        @Pattern(regexp = "^[^<>'\";\\\\/]*$", message = "La sub actividad contiene caracteres no permitidos")
        String subActividad,

        @Size(max = 100, message = "La consulta medica no debe superar 100 caracteres")
        @Pattern(regexp = "^[^<>'\";\\\\/]*$", message = "La consulta medica contiene caracteres no permitidos")
        String consultaMedica,

        @NotBlank(message = "El servicio es requerido")
        @Size(max = 30, message = "El servicio no debe superar 30 caracteres")
        @Pattern(regexp = "^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\\s]+$", message = "El servicio solo puede contener letras y espacios")
        String servicio,

        @NotNull(message = "La fecha de atencion es requerida")
        @PastOrPresent(message = "La fecha y hora de atencion no puede ser futura")
        LocalDateTime fechaAtencion,

        @Size(max = 20, message = "El codigo CUI de la IPRESS no debe superar 20 caracteres")
        @Pattern(regexp = "^\\d*$", message = "El codigo CUI de la IPRESS solo debe contener numeros")
        String cuiIpress,

        @NotBlank(message = "El profesional responsable es requerido")
        @Size(max = 255, message = "El profesional responsable no debe superar 255 caracteres")
        @Pattern(regexp = "^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\\s]+$", message = "El profesional responsable solo puede contener letras y espacios")
        String profesionalNombre,

        @Size(max = 50, message = "La profesion del profesional no debe superar 50 caracteres")
        @Pattern(regexp = "^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\\s()]*$", message = "La profesion solo puede contener letras, espacios y paréntesis")
        String profesionalProfesion,

        @Size(max = 6, message = "La colegiatura no debe superar 6 caracteres")
        @Pattern(regexp = "^\\d*$", message = "La colegiatura solo debe contener numeros")
        String profesionalColegiatura
) {}
