package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.DecisionClinica;

import java.util.Optional;
public interface DecisionClinicaRepository extends JpaRepository<DecisionClinica, Long> {
    Optional<DecisionClinica> findByAtencionId(Long atencionId);
}
