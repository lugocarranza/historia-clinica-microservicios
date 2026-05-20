package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_ANT_ALERGICO", schema = "SCH_HCE_CONSULTA",
        uniqueConstraints = @UniqueConstraint(columnNames = "I_ANT_PERSONAL_ID"))
public class AntAlergico {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_ant_alerg")
    @SequenceGenerator(name = "seq_ant_alerg", sequenceName = "SEQ_ANT_ALERGICO", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ANT_PERSONAL_ID", nullable = false)
    private AntPersonal antPersonal;

    @Column(name = "V_ALERGIA_MED", length = 1)
    private String alergiaMed = "N";

    @Column(name = "V_ALERGIA_MED_DESC", length = 300)
    private String alergiaMedDesc;

    @Column(name = "V_ALERGIA_ALI", length = 1)
    private String alergiaAli = "N";

    @Column(name = "V_ALERGIA_ALI_DESC", length = 300)
    private String alergiaAliDesc;

    @Column(name = "V_ALERGIA_OTROS", length = 1)
    private String alergiaOtros = "N";

    @Column(name = "V_ALERGIA_OTROS_DESC", length = 300)
    private String alergiaOtrosDesc;

    @Column(name = "V_TIPO_REACCION", length = 30)
    private String tipoReaccion;
}
