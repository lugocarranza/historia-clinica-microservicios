package pe.gob.saludpol.hce.consultaexterna.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import pe.gob.saludpol.hce.consultaexterna.client.dto.AdmisionClientResponse;

@FeignClient(name = "hce-filiacion")
public interface FiliacionClient {

    @GetMapping("/api/v1/hce/admision/{id}")
    AdmisionClientResponse obtenerAdmision(@PathVariable Long id);
}
