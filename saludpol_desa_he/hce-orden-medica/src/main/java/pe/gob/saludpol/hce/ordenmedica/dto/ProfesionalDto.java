package pe.gob.saludpol.hce.ordenmedica.dto;

public record ProfesionalDto(
        String nombre,
        String profesion,
        String documentoIdentidad,
        String colegiatura,
        String regEspecialista
) {}
