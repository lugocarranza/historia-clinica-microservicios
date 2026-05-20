package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.Tratamiento;

import java.util.List;
public interface TratamientoRepository extends JpaRepository<Tratamiento, Long> {
    List<Tratamiento> findByAtencionId(Long atencionId);
    void deleteByAtencionId(Long atencionId);
}
