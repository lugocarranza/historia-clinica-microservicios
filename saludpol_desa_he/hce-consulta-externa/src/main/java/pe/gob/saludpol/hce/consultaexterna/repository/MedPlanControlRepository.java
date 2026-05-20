package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.MedPlanControl;

import java.util.List;

public interface MedPlanControlRepository extends JpaRepository<MedPlanControl, Long> {
    List<MedPlanControl> findByAtencionId(Long atencionId);
    void deleteByAtencionId(Long atencionId);
}
