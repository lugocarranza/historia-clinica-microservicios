package pe.gob.saludpol.hce.filiacion.mapper;

import org.springframework.stereotype.Component;

import pe.gob.saludpol.hce.filiacion.dto.AdmisionResponse;
import pe.gob.saludpol.hce.filiacion.dto.HistoriaClinicaResponse;
import pe.gob.saludpol.hce.filiacion.entity.Admision;
import pe.gob.saludpol.hce.filiacion.entity.HistoriaClinica;

@Component
public class AdmisionMapper {

    public HistoriaClinicaResponse toHistoriaClinicaResponse(HistoriaClinica hc) {
        return new HistoriaClinicaResponse(
                hc.getId(),
                hc.getNroHc(),
                hc.getDniPaciente(),
                hc.getApellidosPaciente(),
                hc.getNombresPaciente(),
                hc.getFechaNac(),
                hc.getSexo(),
                hc.getEstado(),
                hc.getFechaApertura()
        );
    }

    public AdmisionResponse toAdmisionResponse(Admision a) {
        HistoriaClinica hc = a.getHistoriaClinica();
        return new AdmisionResponse(
                a.getId(),
                hc.getId(),
                hc.getNroHc(),
                hc.getDniPaciente(),
                hc.getApellidosPaciente(),
                hc.getNombresPaciente(),
                hc.getFechaNac(),
                hc.getSexo(),
                a.getSituacion(),
                a.getCondicion(),
                a.getParentesco(),
                a.getCartaGaratiaNro(),
                a.getTipoSeguro(),
                a.getPlanSalud(),
                a.getTipoCobertura(),
                a.getTipoBeneficio(),
                a.getTipoAtencion(),
                a.getActividad(),
                a.getSubActividad(),
                a.getConsultaMedica(),
                a.getServicio(),
                a.getFechaAtencion(),
                a.getCuiIpress(),
                a.getIpressRazonSocial(),
                a.getIpressSede(),
                a.getIpressRegion(),
                a.getIpressCategoria(),
                null,
                a.getProfesionalNombre(),
                a.getProfesionalProfesion(),
                a.getProfesionalColegiatura(),
                a.getEstado(),
                a.getCreatedAt(),
                a.getCreatedBy()
        );
    }
}
