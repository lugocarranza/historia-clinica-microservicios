package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.AntPersonal;

import java.util.Optional;
public interface AntPersonalRepository extends JpaRepository<AntPersonal, Long> {
    Optional<AntPersonal> findByAtencionId(Long atencionId);
}
