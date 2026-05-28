package pe.gob.saludpol.hce.ordenmedica.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import pe.gob.saludpol.hce.ordenmedica.client.dto.AdmisionClientDto;
import pe.gob.saludpol.hce.ordenmedica.client.dto.ApiResponseDto;

@FeignClient(name = "hce-filiacion")
public interface FiliacionClient {

    @GetMapping("/api/v1/hce/admision/{id}")
    ApiResponseDto<AdmisionClientDto> obtenerAdmision(@PathVariable("id") Long id);
}
