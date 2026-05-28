package pe.gob.saludpol.hce.ordenmedica.dto;

public record OrdenMedicaDetalleResponse(
        OrdenMedicaCabeceraDto cabecera,
        AseguradoDto asegurado,
        EstablecimientoDto establecimiento,
        CoberturaDto cobertura,
        ActoMedicoDto actoMedico,
        ProfesionalDto profesional,
        PrestacionesAgrupadasDto prestaciones,
        OrdenHemodialisisDto hemodialisis,
        OrdenQuimioterapiaDto quimioterapia,
        FirmaProfesionalDto firma
) {}
