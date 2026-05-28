package pe.gob.saludpol.hce.ordenmedica.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public record OrdenMedicaRequest(
        @NotBlank(message = "El numero OAP es requerido")
        @Size(max = 30, message = "El numero OAP no debe superar 30 caracteres")
        String nroOap,

        Long admisionId,

        @NotNull(message = "La historia clinica es requerida")
        Long historiaClinicaId,

        @NotBlank(message = "El DNI del paciente es requerido")
        @Size(max = 12, message = "El DNI del paciente no debe superar 12 caracteres")
        String dniPaciente,

        @NotNull(message = "La atencion es requerida")
        Long atencionId,

        @NotNull(message = "El tipo de atencion es requerido")
        @Pattern(regexp = "^(CE|CS|EM|HO)$", message = "El tipo de atencion no es valido")
        String tipoAtencion,

        @NotNull(message = "El tipo de orden es requerido")
        @Pattern(regexp = "^(LAB|IMG|PDI|PTE|TES|OTR|HEM|QUI)$",
                message = "El tipo de orden no es valido")
        String tipoOrden,

        @Size(max = 30, message = "El numero APS no debe superar 30 caracteres")
        String nroAps,

        @Size(max = 30, message = "El numero de carta de garantia no debe superar 30 caracteres")
        String nroCartaGarantia,

        Integer edad,

        @Size(max = 100, message = "El tipo de seguro no debe superar 100 caracteres")
        String tipoSeguro,

        @Size(max = 100, message = "El tipo de beneficiario no debe superar 100 caracteres")
        String tipoBeneficiario,

        @Size(max = 100, message = "El plan de seguro no debe superar 100 caracteres")
        String planSeguro,

        @Size(max = 100, message = "El tipo de cobertura no debe superar 100 caracteres")
        String tipoCobertura,

        @Size(max = 100, message = "El tipo de beneficio no debe superar 100 caracteres")
        String tipoBeneficio,

        @Size(max = 100, message = "La condicion no debe superar 100 caracteres")
        String condicion,

        @Size(max = 100, message = "El parentesco no debe superar 100 caracteres")
        String parentesco,

        @Size(max = 100, message = "La actividad no debe superar 100 caracteres")
        String actividad,

        @Size(max = 100, message = "La sub actividad no debe superar 100 caracteres")
        String subActividad,

        @Size(max = 100, message = "El servicio no debe superar 100 caracteres")
        String servicio,

        LocalDateTime fechaAtencion,

        @NotBlank(message = "El CUI IPRESS es requerido")
        @Size(max = 20, message = "El CUI IPRESS no debe superar 20 caracteres")
        String ipressCui,

        @Size(max = 255, message = "El nombre del profesional no debe superar 255 caracteres")
        String profNombre,

        @Size(max = 100, message = "La profesion del profesional no debe superar 100 caracteres")
        String profProfesion,

        @Size(max = 12, message = "El documento del profesional no debe superar 12 caracteres")
        String profDocumento,

        @Size(max = 30, message = "La colegiatura no debe superar 30 caracteres")
        String profColegiatura,

        @Size(max = 30, message = "El RNE no debe superar 30 caracteres")
        String profRne,

        @Valid
        List<@Valid OrdenMedicaDetRequest> detalles,

        @Valid
        OrdenHemodialisisRequest hemodialisis,

        @Valid
        OrdenQuimioterapiaRequest quimioterapia
) {}
