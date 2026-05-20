package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.Size;

public record SoapSubjetivoDto(
        @Size(max = 2000, message = "La evolucion no debe superar 2000 caracteres")
        String evolucion,
        @Size(max = 1000, message = "La persistencia no debe superar 1000 caracteres")
        String persistencia,
        @Size(max = 1000, message = "La adherencia no debe superar 1000 caracteres")
        String adherencia,
        @Size(max = 1000, message = "Los eventos adversos no deben superar 1000 caracteres")
        String eventosAdversos
) {}
