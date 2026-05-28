package pe.gob.saludpol.hce.ordenmedica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.gob.saludpol.hce.ordenmedica.entity.OrdenQuimioterapia;

import java.util.Optional;

public interface OrdenQuimioterapiaRepository extends JpaRepository<OrdenQuimioterapia, Long> {

    Optional<OrdenQuimioterapia> findByOrdenMedica_Id(Long ordenMedicaId);
}
