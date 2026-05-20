package pe.gob.saludpol.hce.consultaexterna.common.audit;

import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import pe.gob.saludpol.hce.consultaexterna.entity.Atencion;

@Getter
@Setter
@MappedSuperclass
public abstract class AtencionMedicacionBase {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ATENCION_ID", nullable = false)
    private Atencion atencion;

    @Column(name = "V_CODIGO", length = 30)
    private String codigo;

    @Column(name = "V_DOSIS", length = 10)
    private String dosis;

    @Column(name = "V_VIA", length = 20)
    private String via;

    @Column(name = "V_FRECUENCIA", length = 3)
    private String frecuencia;

    @Column(name = "V_DURACION", length = 8)
    private String duracion;
}
