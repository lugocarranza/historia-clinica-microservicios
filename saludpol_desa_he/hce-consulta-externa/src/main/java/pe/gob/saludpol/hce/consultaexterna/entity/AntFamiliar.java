package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_ANT_FAMILIAR", schema = "SCH_HCE_CONSULTA")
public class AntFamiliar {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_ant_fam")
    @SequenceGenerator(name = "seq_ant_fam", sequenceName = "SEQ_ANT_FAMILIAR", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ATENCION_ID", nullable = false)
    private Atencion atencion;

    @Column(name = "V_ENFERMEDAD", nullable = false, length = 100)
    private String enfermedad;

    @Column(name = "V_PADRE", length = 1)
    private String padre = "N";

    @Column(name = "V_MADRE", length = 1)
    private String madre = "N";

    @Column(name = "V_HERMANOS", length = 1)
    private String hermanos = "N";

    @Column(name = "V_ABUELOS", length = 1)
    private String abuelos = "N";

    @Column(name = "V_OTROS", length = 1)
    private String otros = "N";

    @Column(name = "V_OBSERVACIONES", length = 500)
    private String observaciones;
}
