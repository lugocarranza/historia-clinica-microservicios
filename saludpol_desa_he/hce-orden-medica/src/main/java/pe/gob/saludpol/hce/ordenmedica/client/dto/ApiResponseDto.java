package pe.gob.saludpol.hce.ordenmedica.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ApiResponseDto<T>(
        String message,
        T data
) {}
