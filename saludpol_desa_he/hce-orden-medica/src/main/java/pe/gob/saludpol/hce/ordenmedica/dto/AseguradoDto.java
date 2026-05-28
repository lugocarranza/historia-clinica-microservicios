package pe.gob.saludpol.hce.ordenmedica.dto;

import java.time.LocalDate;

public record AseguradoDto(
        String apellidosNombres,
        Integer edad,
        String edadTexto,
        String sexo,
        LocalDate fechaNacimiento,
        String documentoIdentidad,
        String tipoBeneficiario,
        String condicion,
        String parentesco
) {}
