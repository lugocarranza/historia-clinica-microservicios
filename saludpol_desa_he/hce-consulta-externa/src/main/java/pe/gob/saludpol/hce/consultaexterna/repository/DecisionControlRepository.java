package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.DecisionControl;

import java.util.Optional;

public interface DecisionControlRepository extends JpaRepository<DecisionControl, Long> {
    Optional<DecisionControl> findByAtencionId(Long atencionId);
}
