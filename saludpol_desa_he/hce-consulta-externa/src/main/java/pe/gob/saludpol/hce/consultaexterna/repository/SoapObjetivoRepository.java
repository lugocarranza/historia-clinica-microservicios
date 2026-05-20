package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.SoapObjetivo;

import java.util.Optional;

public interface SoapObjetivoRepository extends JpaRepository<SoapObjetivo, Long> {
    Optional<SoapObjetivo> findByAtencionId(Long atencionId);
}
