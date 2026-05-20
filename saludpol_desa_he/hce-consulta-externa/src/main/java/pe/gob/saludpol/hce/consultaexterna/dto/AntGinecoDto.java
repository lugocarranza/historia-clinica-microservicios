package pe.gob.saludpol.hce.consultaexterna.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Size;

public record AntGinecoDto(
        Integer menarquia,
        Integer gestaciones,
        Integer partos,
        Integer cesareas,
        Integer abortos,
        LocalDate fur,
        @Size(max = 1, message = "Debe seleccionar S o N")
        String menopausia,
        Integer menopausiaAno,
        @Size(max = 1000, message = "Las complicaciones obstetricas no deben superar 1000 caracteres")
        String compObstetricas
) {}
