package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_PLAN_CONTROL", schema = "SCH_HCE_CONSULTA",
        uniqueConstraints = @UniqueConstraint(columnNames = "I_ATENCION_ID"))
public class PlanControl {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_plan_ctrl")
    @SequenceGenerator(name = "seq_plan_ctrl", sequenceName = "SEQ_PLAN_CONTROL", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ATENCION_ID", nullable = false)
    private Atencion atencion;

    @Column(name = "T_PROXIMA_CITA")
    private LocalDate proximaCita;

    @Column(name = "V_INDICACIONES", length = 2000)
    private String indicaciones;

    @Column(name = "V_CRITERIOS_ALARMA", length = 2000)
    private String criteriosAlarma;
}
