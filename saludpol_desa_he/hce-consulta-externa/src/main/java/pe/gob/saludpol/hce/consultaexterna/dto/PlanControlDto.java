package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record PlanControlDto(
        @Valid List<@Valid MedPlanControlDto> medicacion,
        @Valid List<@Valid SolicitudApoyoDto> solicitudesApoyo,
        @NotNull(message = "La proxima cita es requerida")
        @FutureOrPresent(message = "La proxima cita no puede ser una fecha pasada")
        LocalDate proximaCita,
        @Size(max = 2000, message = "Las indicaciones no deben superar 2000 caracteres")
        String indicaciones,
        @Size(max = 2000, message = "Los criterios de alarma no deben superar 2000 caracteres")
        String criteriosAlarma
) {}
