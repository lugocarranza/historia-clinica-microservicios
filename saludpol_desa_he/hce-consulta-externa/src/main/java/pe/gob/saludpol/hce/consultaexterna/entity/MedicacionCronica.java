package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_MEDICACION_CRONICA", schema = "SCH_HCE_CONSULTA")
public class MedicacionCronica {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_med_cron")
    @SequenceGenerator(name = "seq_med_cron", sequenceName = "SEQ_MEDICACION", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ANT_PERSONAL_ID", nullable = false)
    private AntPersonal antPersonal;

    @Column(name = "V_FARMACO", nullable = false, length = 200)
    private String farmaco;

    @Column(name = "V_DOSIS", length = 50)
    private String dosis;

    @Column(name = "V_FRECUENCIA", length = 50)
    private String frecuencia;

    @Column(name = "V_INDICACION", length = 300)
    private String indicacion;
}
