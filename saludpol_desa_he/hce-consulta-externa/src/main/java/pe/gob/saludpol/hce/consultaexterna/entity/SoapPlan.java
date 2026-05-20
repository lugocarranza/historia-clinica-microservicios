package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.gob.saludpol.hce.consultaexterna.common.audit.AuditableEntity;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_SOAP_PLAN", schema = "SCH_HCE_CONSULTA",
        uniqueConstraints = @UniqueConstraint(columnNames = "I_ATENCION_ID"))
public class SoapPlan extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_soap_p")
    @SequenceGenerator(name = "seq_soap_p", sequenceName = "SEQ_SOAP_PLAN", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ATENCION_ID", nullable = false)
    private Atencion atencion;

    @Column(name = "V_MANTENER_TRAT", length = 1)
    private String mantenerTrat = "N";

    @Column(name = "V_AJUSTAR_DOSIS", length = 1)
    private String ajustarDosis = "N";

    @Column(name = "V_CAMBIAR_ESQUEMA", length = 1)
    private String cambiarEsquema = "N";

    @Column(name = "V_SUSPENDER_TRAT", length = 1)
    private String suspenderTrat = "N";

    @Column(name = "V_NUEVOS_ESTUDIOS", length = 1)
    private String nuevosEstudios = "N";

    @Column(name = "V_INTERCONSULTA", length = 1)
    private String interconsulta = "N";

    @Column(name = "V_ALTA_PROBLEMA", length = 1)
    private String altaProblema = "N";

    @Column(name = "V_DETALLES_PLAN", length = 2000)
    private String detallesPlan;
}
