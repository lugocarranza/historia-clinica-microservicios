package pe.gob.saludpol.hce.consultaexterna;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class HceConsultaExternaApplication {

    public static void main(String[] args) {
        SpringApplication.run(HceConsultaExternaApplication.class, args);
    }

}
