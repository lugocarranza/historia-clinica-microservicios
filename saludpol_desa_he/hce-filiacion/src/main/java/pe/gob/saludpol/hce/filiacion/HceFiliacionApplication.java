package pe.gob.saludpol.hce.filiacion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class HceFiliacionApplication {

    public static void main(String[] args) {
        SpringApplication.run(HceFiliacionApplication.class, args);
    }

}
