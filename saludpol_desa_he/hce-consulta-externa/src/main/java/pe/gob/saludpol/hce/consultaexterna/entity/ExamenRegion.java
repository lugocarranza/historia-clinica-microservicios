package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_EXAMEN_REGION", schema = "SCH_HCE_CONSULTA")
public class ExamenRegion {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_ex_reg")
    @SequenceGenerator(name = "seq_ex_reg", sequenceName = "SEQ_EXAMEN_REGION", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_EXAMEN_FISICO_ID", nullable = false)
    private ExamenFisico examenFisico;

    @Column(name = "V_REGION", nullable = false, length = 60)
    private String region;

    @Column(name = "V_HALLAZGOS", length = 1000)
    private String hallazgos;
}
