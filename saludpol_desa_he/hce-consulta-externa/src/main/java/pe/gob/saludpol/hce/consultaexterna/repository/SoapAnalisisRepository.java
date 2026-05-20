package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.SoapAnalisis;

import java.util.Optional;

public interface SoapAnalisisRepository extends JpaRepository<SoapAnalisis, Long> {
    Optional<SoapAnalisis> findByAtencionId(Long atencionId);
}
