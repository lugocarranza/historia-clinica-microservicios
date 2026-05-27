package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SolicitudApoyoDto(
        Long id,
        @Size(max = 100, message = "El tipo no debe superar 100 caracteres")
        String tipo,

        @Size(max = 300, message = "La descripcion no debe superar 300 caracteres")
        String descripcion,

        @Size(max = 15, message = "La prioridad no debe superar 15 caracteres")
        @Pattern(regexp = "^(Normal|Urgente|Emergencia)$", message = "La prioridad no es válida")
        String prioridad,

        @Size(max = 500, message = "Las observaciones no deben superar 500 caracteres")
        String observaciones,

        @Size(max = 20, message = "El id de sub-tipo padre no debe superar 20 caracteres")
        String idSubTipoParent,

        @Size(max = 20, message = "El id de sub-tipo ultimo no debe superar 20 caracteres")
        String idSubTipoUltimo,

        @Size(max = 30, message = "El codigo CPMS no debe superar 30 caracteres")
        String codigoCpms,

        @Size(max = 30, message = "El codigo SEGUS no debe superar 30 caracteres")
        String codigoSegus
) {}
