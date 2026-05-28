package pe.gob.saludpol.hce.ordenmedica.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record EstablecimientoClientDto(
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
