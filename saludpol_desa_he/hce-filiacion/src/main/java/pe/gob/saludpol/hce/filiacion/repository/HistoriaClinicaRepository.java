package pe.gob.saludpol.hce.filiacion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.filiacion.entity.HistoriaClinica;

import java.util.Optional;

public interface HistoriaClinicaRepository extends JpaRepository<HistoriaClinica, Long> {

    Optional<HistoriaClinica> findByDniPaciente(String dniPaciente);

    boolean existsByDniPaciente(String dniPaciente);

    boolean existsByNroHc(String nroHc);
}
