package pe.gob.saludpol.hce.ordenmedica.dto;

public record FirmaProfesionalDto(
        String profesionalTratante,
        String documentoIdentidad,
        String colegiatura,
        String regEspecialista,
        String firmaDigitalHash
) {}
