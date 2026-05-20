package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_APP", schema = "SCH_HCE_CONSULTA")
public class App {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_app")
    @SequenceGenerator(name = "seq_app", sequenceName = "SEQ_APP", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ANT_PERSONAL_ID", nullable = false)
    private AntPersonal antPersonal;

    @Column(name = "V_CONDICION", nullable = false, length = 100)
    private String condicion;

    @Column(name = "V_TIENE", length = 1)
    private String tiene = "N";

    @Column(name = "I_ANO_DX")
    private Integer anoDx;

    @Column(name = "V_TRATAMIENTO_ACTUAL", length = 300)
    private String tratamientoActual;

    @Column(name = "V_OBSERVACIONES", length = 500)
    private String observaciones;
}
