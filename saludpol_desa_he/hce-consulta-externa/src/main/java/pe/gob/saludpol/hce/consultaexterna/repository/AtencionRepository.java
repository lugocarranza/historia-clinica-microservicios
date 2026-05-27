package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.Atencion;

import java.util.List;
import java.util.Optional;

public interface AtencionRepository extends JpaRepository<Atencion, Long> {

    Optional<Atencion> findFirstByAdmisionIdOrderByFechaAtencionDesc(Long admisionId);

    Optional<Atencion> findByAdmisionIdAndTipoAtencion(Long admisionId, String tipoAtencion);

    List<Atencion> findByAdmisionIdAndTipoAtencionOrderByFechaAtencionDesc(Long admisionId, String tipoAtencion);

    boolean existsByAdmisionIdAndTipoAtencionAndEstado(Long admisionId, String tipoAtencion, String estado);

    List<Atencion> findByDniPacienteOrderByFechaAtencionDesc(String dniPaciente);

    List<Atencion> findByCeAtencionIdAndTipoAtencionOrderByFechaAtencionDesc(Long ceAtencionId, String tipoAtencion);

    boolean existsByCeAtencionIdAndTipoAtencionAndEstado(Long ceAtencionId, String tipoAtencion, String estado);
}
