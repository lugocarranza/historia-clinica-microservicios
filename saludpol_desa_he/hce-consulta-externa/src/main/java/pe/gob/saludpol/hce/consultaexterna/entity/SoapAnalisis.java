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
@Table(name = "TBL_SOAP_ANALISIS", schema = "SCH_HCE_CONSULTA",
        uniqueConstraints = @UniqueConstraint(columnNames = "I_ATENCION_ID"))
public class SoapAnalisis extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_soap_a")
    @SequenceGenerator(name = "seq_soap_a", sequenceName = "SEQ_SOAP_ANALISIS", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ATENCION_ID", nullable = false)
    private Atencion atencion;

    @Column(name = "V_EVOLUCION_ESTADO", length = 20)
    private String evolucionEstado;

    @Column(name = "V_DIAG_ACTUALIZADO", length = 500)
    private String diagActualizado;

    @Column(name = "V_CAMBIOS_SEVERIDAD", length = 500)
    private String cambiosSeveridad;

    @Column(name = "V_EVAL_TERAPEUTICA", length = 500)
    private String evalTerapeutica;
}
