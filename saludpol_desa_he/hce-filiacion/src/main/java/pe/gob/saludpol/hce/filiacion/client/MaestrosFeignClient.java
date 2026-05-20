package pe.gob.saludpol.hce.filiacion.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import pe.gob.saludpol.hce.filiacion.client.dto.ApiResponseDto;
import pe.gob.saludpol.hce.filiacion.client.dto.EstablecimientoDto;

@FeignClient(name = "service-maestros", url = "${services.gateway.url:}")
public interface MaestrosFeignClient {

    @GetMapping("/api/v1/maestros/establecimientos/{codigo}")
    ApiResponseDto<EstablecimientoDto> buscarEstablecimiento(@PathVariable("codigo") String codigo);
}
