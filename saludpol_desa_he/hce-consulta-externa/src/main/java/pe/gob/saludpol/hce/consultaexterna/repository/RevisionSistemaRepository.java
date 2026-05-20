package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.RevisionSistema;

import java.util.List;
public interface RevisionSistemaRepository extends JpaRepository<RevisionSistema, Long> {
    List<RevisionSistema> findByAtencionId(Long atencionId);
    void deleteByAtencionId(Long atencionId);
}
