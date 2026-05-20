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
@Table(name = "TBL_SOAP_SUBJETIVO", schema = "SCH_HCE_CONSULTA",
        uniqueConstraints = @UniqueConstraint(columnNames = "I_ATENCION_ID"))
public class SoapSubjetivo extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_soap_s")
    @SequenceGenerator(name = "seq_soap_s", sequenceName = "SEQ_SOAP_SUBJETIVO", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ATENCION_ID", nullable = false)
    private Atencion atencion;

    @Column(name = "V_EVOLUCION", length = 2000)
    private String evolucion;

    @Column(name = "V_PERSISTENCIA", length = 1000)
    private String persistencia;

    @Column(name = "V_ADHERENCIA", length = 1000)
    private String adherencia;

    @Column(name = "V_EVENTOS_ADVERSOS", length = 1000)
    private String eventosAdversos;
}
