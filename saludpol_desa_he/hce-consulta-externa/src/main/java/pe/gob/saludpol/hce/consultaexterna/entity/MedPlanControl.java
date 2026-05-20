package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.gob.saludpol.hce.consultaexterna.common.audit.AtencionMedicacionBase;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_MED_PLAN_CONTROL", schema = "SCH_HCE_CONSULTA")
public class MedPlanControl extends AtencionMedicacionBase {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_med_plan")
    @SequenceGenerator(name = "seq_med_plan", sequenceName = "SEQ_MED_PLAN_CONTROL", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @Column(name = "V_FARMACO", nullable = false, length = 200)
    private String farmaco;

    @Column(name = "V_CONDUCTA", length = 15)
    private String conducta;
}
