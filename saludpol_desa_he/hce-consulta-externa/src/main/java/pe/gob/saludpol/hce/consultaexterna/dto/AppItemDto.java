package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AppItemDto(
        @Size(max = 100, message = "La condicion no debe superar 100 caracteres")
        String condicion,
        @Size(max = 1, message = "Debe seleccionar S o N")
        @Pattern(regexp = "^[SN]$", message = "Debe seleccionar S o N")
        String tiene,
        Integer anoDx,
        @Size(max = 300, message = "El tratamiento actual no debe superar 300 caracteres")
        String tratamientoActual,
        @Size(max = 500, message = "Las observaciones no deben superar 500 caracteres")
        String observaciones
) {
    @AssertTrue(message = "Año de diagnostico, tratamiento u observaciones son requeridos si la condicion esta presente y el año no debe ser mayor al actual")
    public boolean isCamposRequeridosValidos() {
        if ("S".equals(tiene)) {
            if (anoDx == null && (tratamientoActual == null || tratamientoActual.isBlank()) && (observaciones == null || observaciones.isBlank())) {
                return false;
            }
            if (anoDx != null && anoDx > java.time.Year.now().getValue()) {
                return false;
            }
        }
        return true;
    }
}
