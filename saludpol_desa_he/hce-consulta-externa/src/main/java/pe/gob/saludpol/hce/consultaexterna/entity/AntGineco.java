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
@Table(name = "TBL_ANT_GINECO", schema = "SCH_HCE_CONSULTA",
        uniqueConstraints = @UniqueConstraint(columnNames = "I_ANT_PERSONAL_ID"))
public class AntGineco {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_gineco")
    @SequenceGenerator(name = "seq_gineco", sequenceName = "SEQ_ANT_GINECO", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ANT_PERSONAL_ID", nullable = false)
    private AntPersonal antPersonal;

    @Column(name = "I_MENARQUIA")
    private Integer menarquia;

    @Column(name = "I_GESTACIONES")
    private Integer gestaciones;

    @Column(name = "I_PARTOS")
    private Integer partos;

    @Column(name = "I_CESAREAS")
    private Integer cesareas;

    @Column(name = "I_ABORTOS")
    private Integer abortos;

    @Column(name = "T_FUR")
    private LocalDate fur;

    @Column(name = "V_MENOPAUSIA", length = 1)
    private String menopausia = "N";

    @Column(name = "I_MENOPAUSIA_ANO")
    private Integer menopausiaAno;

    @Column(name = "V_COMP_OBSTETRICAS", length = 1000)
    private String compObstetricas;
}
