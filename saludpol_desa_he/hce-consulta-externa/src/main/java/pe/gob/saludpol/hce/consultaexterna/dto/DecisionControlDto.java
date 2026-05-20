package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record DecisionControlDto(
        @NotBlank(message = "La decision clinica es requerida")
        @Size(max = 60, message = "La decision clinica no debe superar 60 caracteres")
        @Pattern(regexp = "^(Alta|Continúa seguimiento de control ambulatorio|Referencia|Hospitalización)$", message = "La decisión clínica no es válida", flags = Pattern.Flag.CANON_EQ)
        String decision,
        @Size(max = 255, message = "La IPRESS PNP destino no debe superar 255 caracteres")
        String refPnpIpress,
        @Size(max = 500, message = "El motivo de referencia PNP no debe superar 500 caracteres")
        String refPnpMotivo,
        @Size(max = 255, message = "La IPRESS No PNP destino no debe superar 255 caracteres")
        String refNopnpIpress,
        @Size(max = 500, message = "El motivo de referencia No PNP no debe superar 500 caracteres")
        String refNopnpMotivo,
        @NotBlank(message = "El nombre del profesional es requerido")
        @Size(max = 70, message = "El nombre del profesional no debe superar 70 caracteres")
        @Pattern(regexp = "^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\\s]+$", message = "El nombre del profesional solo puede contener letras y espacios")
        String profNombres,
        @NotBlank(message = "El documento del profesional es requerido")
        @Pattern(regexp = "^\\d*$", message = "El documento del profesional debe contener solo numeros")
        @Size(max = 8, message = "El documento del profesional no debe superar 8 caracteres")
        String profDocIdent,
        @NotBlank(message = "La colegiatura del profesional es requerida")
        @Pattern(regexp = "^\\d*$", message = "La colegiatura del profesional debe contener solo numeros")
        @Size(max = 6, message = "La colegiatura del profesional no debe superar 6 caracteres")
        String profColegiatura,
        @NotBlank(message = "El registro de especialidad es requerido")
        @Pattern(regexp = "^\\d*$", message = "El registro de especialidad debe contener solo numeros")
        @Size(max = 5, message = "El registro de especialidad no debe superar 5 caracteres")
        String profRegEspecialidad,
        LocalDateTime fechaCierre
) {}
