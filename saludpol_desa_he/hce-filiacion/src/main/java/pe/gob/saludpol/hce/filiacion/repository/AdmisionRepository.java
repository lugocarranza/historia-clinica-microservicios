package pe.gob.saludpol.hce.filiacion.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import pe.gob.saludpol.hce.filiacion.entity.Admision;

import java.util.List;
import java.util.Optional;

public interface AdmisionRepository extends JpaRepository<Admision, Long> {

    Optional<Admision> findFirstByHistoriaClinicaIdOrderByCreatedAtDesc(Long historiaClinicaId);

    List<Admision> findByHistoriaClinicaIdOrderByFechaAtencionDesc(Long historiaClinicaId);

    @Query("SELECT a FROM Admision a WHERE " +
           "(:dni IS NULL OR :dni = '' OR UPPER(a.historiaClinica.dniPaciente) LIKE UPPER(CONCAT('%', :dni, '%'))) AND " +
           "(:nroHc IS NULL OR :nroHc = '' OR UPPER(a.historiaClinica.nroHc) LIKE UPPER(CONCAT('%', :nroHc, '%')))")
    Page<Admision> buscar(@Param("dni") String dni, @Param("nroHc") String nroHc, Pageable pageable);
}
