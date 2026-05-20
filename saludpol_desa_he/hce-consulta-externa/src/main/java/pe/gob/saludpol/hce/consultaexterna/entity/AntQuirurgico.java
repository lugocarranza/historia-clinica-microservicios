package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_ANT_QUIRURGICO", schema = "SCH_HCE_CONSULTA")
public class AntQuirurgico {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_ant_quir")
    @SequenceGenerator(name = "seq_ant_quir", sequenceName = "SEQ_ANT_QUIRURGICO", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ANT_PERSONAL_ID", nullable = false)
    private AntPersonal antPersonal;

    @Column(name = "V_PROCEDIMIENTO", nullable = false, length = 4000)
    private String procedimiento;

    @Column(name = "I_ANO")
    private Integer ano;

    @Column(name = "V_COMPLICACIONES", length = 500)
    private String complicaciones;
}
