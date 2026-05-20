package pe.gob.saludpol.hce.consultaexterna.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

public record TratamientoListRequest(
        List<@Valid TratamientoDto> tratamientos,
        @Size(max = 2000, message = "Las indicaciones no farmaceuticas no deben superar 2000 caracteres")
        String indicacionesNoFarm
) {}
