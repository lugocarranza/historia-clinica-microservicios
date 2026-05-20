package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.AntFamiliar;

import java.util.List;
public interface AntFamiliarRepository extends JpaRepository<AntFamiliar, Long> {
    List<AntFamiliar> findByAtencionId(Long atencionId);
    void deleteByAtencionId(Long atencionId);
}
