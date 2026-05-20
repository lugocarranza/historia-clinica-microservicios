package pe.gob.saludpol.hce.consultaexterna.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

public record AntPersonalRequest(
        @Size(max = 10, message = "El tipo de parto no debe superar 10 caracteres")
        String tipoParto,
        Integer edadGestacional,
        BigDecimal pesoNacer,
        BigDecimal tallaNacer,
        @Size(max = 20, message = "El APGAR no debe superar 20 caracteres")
        String apgar,
        @Size(max = 1, message = "Debe seleccionar S o N")
        String compNeonatal,
        @Size(max = 500, message = "La descripcion de complicacion neonatal no debe superar 500 caracteres")
        String compNeonatalDesc,
        List<@Valid AppItemDto> appList,
        List<@Valid AntQuirurgicoDto> quirurgicos,
        @Valid AntAlergicoDto alergico,
        List<@Valid MedicacionCronicaDto> medicacionCronica,
        @Valid HabitoRiesgoDto habitoRiesgo,
        @Valid AntGinecoDto gineco
) {}