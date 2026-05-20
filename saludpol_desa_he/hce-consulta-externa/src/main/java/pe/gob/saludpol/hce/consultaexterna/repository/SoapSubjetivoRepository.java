package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.SoapSubjetivo;

import java.util.Optional;

public interface SoapSubjetivoRepository extends JpaRepository<SoapSubjetivo, Long> {
    Optional<SoapSubjetivo> findByAtencionId(Long atencionId);
}
