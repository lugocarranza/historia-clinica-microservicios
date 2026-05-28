package pe.gob.saludpol.hce.ordenmedica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.gob.saludpol.hce.ordenmedica.entity.OrdenHemodialisis;

import java.util.Optional;

public interface OrdenHemodialisisRepository extends JpaRepository<OrdenHemodialisis, Long> {

    Optional<OrdenHemodialisis> findByOrdenMedica_Id(Long ordenMedicaId);
}
