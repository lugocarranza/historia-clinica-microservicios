package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.gob.saludpol.hce.consultaexterna.common.audit.AuditableEntity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_ANT_PERSONAL", schema = "SCH_HCE_CONSULTA",
        uniqueConstraints = @UniqueConstraint(columnNames = "I_ATENCION_ID"))
public class AntPersonal extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_ant_pers")
    @SequenceGenerator(name = "seq_ant_pers", sequenceName = "SEQ_ANT_PERSONAL", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ATENCION_ID", nullable = false)
    private Atencion atencion;

    @Column(name = "V_TIPO_PARTO", length = 10)
    private String tipoParto;

    @Column(name = "I_EDAD_GESTACIONAL")
    private Integer edadGestacional;

    @Column(name = "N_PESO_NACER", precision = 5, scale = 2)
    private BigDecimal pesoNacer;

    @Column(name = "N_TALLA_NACER", precision = 5, scale = 1)
    private BigDecimal tallaNacer;

    @Column(name = "V_APGAR", length = 20)
    private String apgar;

    @Column(name = "V_COMP_NEONATAL", length = 1)
    private String compNeonatal = "N";

    @Column(name = "V_COMP_NEONATAL_DESC", length = 500)
    private String compNeonatalDesc;

    @OneToMany(mappedBy = "antPersonal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<App> appList = new ArrayList<>();

    @OneToMany(mappedBy = "antPersonal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AntQuirurgico> quirurgicos = new ArrayList<>();

    @OneToOne(mappedBy = "antPersonal", cascade = CascadeType.ALL, orphanRemoval = true)
    private AntAlergico alergico;

    @OneToMany(mappedBy = "antPersonal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedicacionCronica> medicacionCronica = new ArrayList<>();

    @OneToOne(mappedBy = "antPersonal", cascade = CascadeType.ALL, orphanRemoval = true)
    private HabitoRiesgo habitoRiesgo;

    @OneToOne(mappedBy = "antPersonal", cascade = CascadeType.ALL, orphanRemoval = true)
    private AntGineco gineco;
}