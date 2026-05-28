package pe.gob.saludpol.hce.ordenmedica.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import pe.gob.saludpol.hce.ordenmedica.client.dto.ApiResponseDto;
import pe.gob.saludpol.hce.ordenmedica.client.dto.EstablecimientoClientDto;

@FeignClient(name = "service-maestros", url = "${services.gateway.url:}")
public interface MaestrosClient {

    @GetMapping("/api/v1/maestros/establecimientos/{codigo}")
    ApiResponseDto<EstablecimientoClientDto> buscarEstablecimiento(@PathVariable("codigo") String codigo);
}
