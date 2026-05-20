package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.gob.saludpol.hce.consultaexterna.common.audit.AuditableEntity;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_DECISION_CLINICA", schema = "SCH_HCE_CONSULTA",
        uniqueConstraints = @UniqueConstraint(columnNames = "I_ATENCION_ID"))
public class DecisionClinica extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_dec_clin")
    @SequenceGenerator(name = "seq_dec_clin", sequenceName = "SEQ_DECISION_CLINICA", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ATENCION_ID", nullable = false)
    private Atencion atencion;

    @Column(name = "V_DECISION_ALTA", length = 40)
    private String decisionAlta;

    @Column(name = "T_FECHA_PROXIMA_CITA")
    private LocalDate fechaProximaCita;

    @Column(name = "V_ESPECIALIDAD_REF", length = 100)
    private String especialidadRef;

    @Column(name = "V_PLAN_MANEJO", length = 2000)
    private String planManejo;

    @Column(name = "V_PRONOSTICO", length = 1000)
    private String pronostico;

    @Column(name = "V_OBSERVACIONES", length = 1000)
    private String observaciones;

    @Column(name = "V_MEDICO_NOMBRE", length = 255)
    private String medicoNombre;

    @Column(name = "V_MEDICO_CMP", length = 30)
    private String medicoCmp;

    @Column(name = "V_FIRMA_DIGITAL", length = 100)
    private String firmaDigital;
}
