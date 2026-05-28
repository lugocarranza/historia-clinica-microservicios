package pe.gob.saludpol.hce.ordenmedica.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record OrdenMedicaDetRequest(
        Long id,

        @NotBlank(message = "El tipo es requerido")
        @Pattern(regexp = "^(LAB|IMG|PDI|PTE|TES|OTR)$",
                message = "El tipo de prestacion no es valido")
        String tipo,

        @Size(max = 10, message = "El codigo CIE10 no debe superar 10 caracteres")
        String codigoCie10,

        @Size(max = 30, message = "El codigo CPMS no debe superar 30 caracteres")
        String codigoCpms,

        @Size(max = 30, message = "El codigo SEGUS no debe superar 30 caracteres")
        String codigoSegus,

        @NotBlank(message = "La descripcion es requerida")
        @Size(max = 500, message = "La descripcion no debe superar 500 caracteres")
        String descripcion,

        @DecimalMin(value = "0.01", message = "La cantidad debe ser mayor a cero")
        BigDecimal cantidad,

        @Size(max = 20, message = "La prioridad no debe superar 20 caracteres")
        @Pattern(regexp = "^(Normal|Urgente|Emergencia|Preferente|Programado)$",
                message = "La prioridad no es valida")
        String prioridad,

        @Size(max = 1000, message = "Las observaciones no deben superar 1000 caracteres")
        String observaciones,

        @Size(max = 20, message = "El estado no debe superar 20 caracteres")
        String estado
) {}
