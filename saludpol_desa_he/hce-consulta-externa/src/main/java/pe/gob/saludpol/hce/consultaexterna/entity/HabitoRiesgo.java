package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_HABITO_RIESGO", schema = "SCH_HCE_CONSULTA",
        uniqueConstraints = @UniqueConstraint(columnNames = "I_ANT_PERSONAL_ID"))
public class HabitoRiesgo {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_habito")
    @SequenceGenerator(name = "seq_habito", sequenceName = "SEQ_HABITO_RIESGO", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ANT_PERSONAL_ID", nullable = false)
    private AntPersonal antPersonal;

    @Column(name = "V_TABACO", length = 15)
    private String tabaco = "No";

    @Column(name = "N_TABACO_PAQUETES_ANO", precision = 5, scale = 1)
    private BigDecimal tabacoPaquetesAno;

    @Column(name = "V_ALCOHOL", length = 15)
    private String alcohol = "No";

    @Column(name = "V_DROGAS", length = 5)
    private String drogas = "No";

    @Column(name = "V_DROGAS_TIPO", length = 200)
    private String drogasTipo;

    @Column(name = "V_SEDENTARISMO", length = 1)
    private String sedentarismo = "N";

    @Column(name = "V_OTROS_FACTORES", length = 500)
    private String otrosFactores;
}