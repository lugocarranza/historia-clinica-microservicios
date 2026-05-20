package pe.gob.saludpol.hce.filiacion.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AseguradoDto(
        String numeroDocumento,
        String apellidoPaterno,
        String apellidoMaterno,
        String nombres,
        String fechaNacimiento,
        String sexo,
        String estadoAsegurado,
        String tipoPlan,
        String tipoCobertura
) {}
