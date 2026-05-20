package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.IndicacionNoFarm;

import java.util.Optional;

public interface IndicacionNoFarmRepository extends JpaRepository<IndicacionNoFarm, Long> {
    Optional<IndicacionNoFarm> findByAtencionId(Long atencionId);
}
