package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.SolicitudApoyo;

import java.util.List;
public interface SolicitudApoyoRepository extends JpaRepository<SolicitudApoyo, Long> {
    List<SolicitudApoyo> findByAtencionId(Long atencionId);
    void deleteByAtencionId(Long atencionId);
}
