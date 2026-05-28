package pe.gob.saludpol.hce.ordenmedica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.gob.saludpol.hce.ordenmedica.entity.OrdenMedica;

import java.util.List;
public interface OrdenMedicaRepository extends JpaRepository<OrdenMedica, Long> {

    List<OrdenMedica> findByDniPacienteOrderByFechaEmisionDesc(String dniPaciente);

    List<OrdenMedica> findByTipoAtencionAndAtencionIdOrderByFechaEmisionDescTipoOrdenAsc(String tipoAtencion, Long atencionId);
}
