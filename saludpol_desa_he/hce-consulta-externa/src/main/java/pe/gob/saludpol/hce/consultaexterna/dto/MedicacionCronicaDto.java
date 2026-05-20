package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.Size;

public record MedicacionCronicaDto(
        Long id,
        @Size(max = 200, message = "El farmaco no debe superar 200 caracteres")
        String farmaco,
        @Size(max = 50, message = "La dosis no debe superar 50 caracteres")
        String dosis,
        @Size(max = 50, message = "La frecuencia no debe superar 50 caracteres")
        String frecuencia,
        @Size(max = 300, message = "La indicacion no debe superar 300 caracteres")
        String indicacion
) {}
