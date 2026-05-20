package pe.gob.saludpol.hce.filiacion.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import pe.gob.saludpol.hce.filiacion.client.dto.ApiResponseDto;
import pe.gob.saludpol.hce.filiacion.client.dto.AseguradoDto;

@FeignClient(name = "service-asegurados", url = "${services.gateway.url:}")
public interface PadronFeignClient {

    @GetMapping("/api/v1/asegurados/afiliacion/{dni}")
    ApiResponseDto<AseguradoDto> buscarAsegurado(@PathVariable("dni") String dni);
}
