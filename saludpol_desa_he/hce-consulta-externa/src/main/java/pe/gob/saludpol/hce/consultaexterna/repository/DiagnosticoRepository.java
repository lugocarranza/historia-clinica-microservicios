package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.Diagnostico;

import java.util.List;
public interface DiagnosticoRepository extends JpaRepository<Diagnostico, Long> {
    List<Diagnostico> findByAtencionId(Long atencionId);
    void deleteByAtencionId(Long atencionId);
}
