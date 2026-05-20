package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.ExamenFisico;

import java.util.Optional;
public interface ExamenFisicoRepository extends JpaRepository<ExamenFisico, Long> {
    Optional<ExamenFisico> findByAtencionId(Long atencionId);
}
