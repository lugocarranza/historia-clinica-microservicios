package pe.gob.saludpol.hce.consultaexterna.dto;

import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ListaProblemaDto(
        Long id,
        Integer nroProblema,
        @Size(max = 500, message = "La descripcion no debe superar 500 caracteres")
        String descripcion,

        @Size(max = 25, message = "El estado no debe superar 25 caracteres")
        @Pattern(regexp = "^(Activo|Resuelto|En seguimiento|Crónico controlado)$", message = "El estado no es válido", flags = Pattern.Flag.CANON_EQ)
        String estado,

        @PastOrPresent(message = "La fecha de identificacion no puede ser futura")
        LocalDate fechaIdentificacion
) {}
