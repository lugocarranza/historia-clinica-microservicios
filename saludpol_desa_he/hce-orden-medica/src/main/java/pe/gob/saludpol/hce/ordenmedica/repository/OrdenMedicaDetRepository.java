package pe.gob.saludpol.hce.ordenmedica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.gob.saludpol.hce.ordenmedica.entity.OrdenMedicaDet;

import java.util.List;

public interface OrdenMedicaDetRepository extends JpaRepository<OrdenMedicaDet, Long> {

    List<OrdenMedicaDet> findByOrdenMedica_IdOrderByIdAsc(Long ordenMedicaId);
}
