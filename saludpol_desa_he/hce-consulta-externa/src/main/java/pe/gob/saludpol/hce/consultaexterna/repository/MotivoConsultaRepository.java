package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.MotivoConsulta;

import java.util.Optional;

public interface MotivoConsultaRepository extends JpaRepository<MotivoConsulta, Long> {
    Optional<MotivoConsulta> findByAtencionId(Long atencionId);
}
