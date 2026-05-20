package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.PlanControl;

import java.util.Optional;

public interface PlanControlRepository extends JpaRepository<PlanControl, Long> {
    Optional<PlanControl> findByAtencionId(Long atencionId);
}
