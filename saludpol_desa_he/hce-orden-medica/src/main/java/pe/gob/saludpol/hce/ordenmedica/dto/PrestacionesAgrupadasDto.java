package pe.gob.saludpol.hce.ordenmedica.dto;

import java.util.List;

public record PrestacionesAgrupadasDto(
        List<OrdenMedicaDetDto> laboratorio,
        List<OrdenMedicaDetDto> imagen,
        List<OrdenMedicaDetDto> procedimientoDiagnostico,
        List<OrdenMedicaDetDto> procedimientoTerapeutico,
        List<OrdenMedicaDetDto> terapiaEspecializada,
        List<OrdenMedicaDetDto> otros
) {}
