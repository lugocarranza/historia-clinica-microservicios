package pe.gob.saludpol.hce.ordenmedica.dto;

import jakarta.validation.constraints.Size;

public record OrdenQuimioterapiaRequest(
        @Size(max = 500, message = "El diagnostico oncologico no debe superar 500 caracteres")
        String diagnosticoOncologico,

        @Size(max = 100, message = "El estadio no debe superar 100 caracteres")
        String estadio,

        @Size(max = 500, message = "Los medicamentos no deben superar 500 caracteres")
        String medicamentos,

        @Size(max = 500, message = "La dosis no debe superar 500 caracteres")
        String dosis,

        @Size(max = 100, message = "La via no debe superar 100 caracteres")
        String via,

        @Size(max = 100, message = "La frecuencia no debe superar 100 caracteres")
        String frecuencia,

        @Size(max = 300, message = "El protocolo terapeutico no debe superar 300 caracteres")
        String protocoloTerapeutico,

        @Size(max = 100, message = "El ciclo no debe superar 100 caracteres")
        String ciclo,

        Integer duracionCicloDias,

        @Size(max = 2000, message = "Las observaciones no deben superar 2000 caracteres")
        String observaciones
) {}
