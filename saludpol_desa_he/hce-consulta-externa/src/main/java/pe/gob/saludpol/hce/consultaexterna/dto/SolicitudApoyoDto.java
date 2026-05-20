package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SolicitudApoyoDto(
        Long id,
        @Size(max = 20, message = "El tipo no debe superar 20 caracteres")
        @Pattern(regexp = "^(Laboratorio|Imagen|Interconsulta|Procedimiento)$", message = "El tipo de solicitud no es válido")
        String tipo,

        @Size(max = 300, message = "La descripcion no debe superar 300 caracteres")
        String descripcion,

        @Size(max = 15, message = "La prioridad no debe superar 15 caracteres")
        @Pattern(regexp = "^(Normal|Urgente|Emergencia)$", message = "La prioridad no es válida")
        String prioridad,

        @Size(max = 500, message = "Las observaciones no deben superar 500 caracteres")
        String observaciones
) {}
