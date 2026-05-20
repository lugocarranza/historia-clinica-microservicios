package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.SoapPlan;

import java.util.Optional;

public interface SoapPlanRepository extends JpaRepository<SoapPlan, Long> {
    Optional<SoapPlan> findByAtencionId(Long atencionId);
}
