package pe.gob.saludpol.hce.filiacion.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record EstablecimientoDto(
        String codigoIpress,
        String nombreIpress,
        String distritoIpress,
        String direccionIpress,
        String departamentoIpress,
        String categoriaIpress
) {
    public String sede() {
        return distritoIpress != null ? distritoIpress : direccionIpress;
    }
}
