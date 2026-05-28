package pe.gob.saludpol.hce.ordenmedica;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class HceOrdenMedicaApplication {

    public static void main(String[] args) {
        SpringApplication.run(HceOrdenMedicaApplication.class, args);
    }

}
