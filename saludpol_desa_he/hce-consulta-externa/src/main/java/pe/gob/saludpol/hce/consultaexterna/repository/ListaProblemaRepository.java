package pe.gob.saludpol.hce.consultaexterna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.gob.saludpol.hce.consultaexterna.entity.ListaProblema;

import java.util.List;
public interface ListaProblemaRepository extends JpaRepository<ListaProblema, Long> {
    List<ListaProblema> findByAtencionIdOrderByNroProblema(Long atencionId);
    void deleteByAtencionId(Long atencionId);
}
