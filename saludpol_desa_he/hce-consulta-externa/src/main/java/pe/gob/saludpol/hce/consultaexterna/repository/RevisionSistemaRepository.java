package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.RevisionSistema;

import java.util.List;
import java.util.Optional;

public interface RevisionSistemaRepository extends JpaRepository<RevisionSistema, Long> {
    List<RevisionSistema> findByAtencionId(Long atencionId);
    Optional<RevisionSistema> findTopByAtencionIdAndSistemaAndSintomaOrderByIdDesc(Long atencionId, String sistema, String sintoma);
}
