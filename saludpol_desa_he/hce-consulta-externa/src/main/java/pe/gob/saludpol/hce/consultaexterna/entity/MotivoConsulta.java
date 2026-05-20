package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.gob.saludpol.hce.consultaexterna.common.audit.AuditableEntity;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_MOTIVO_CONSULTA", schema = "SCH_HCE_CONSULTA",
        uniqueConstraints = @UniqueConstraint(columnNames = "I_ATENCION_ID"))
public class MotivoConsulta extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_motivo")
    @SequenceGenerator(name = "seq_motivo", sequenceName = "SEQ_MOTIVO_CONSULTA", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ATENCION_ID", nullable = false)
    private Atencion atencion;

    @Column(name = "V_MOTIVO", nullable = false, length = 500)
    private String motivo;

    @Column(name = "V_TIEMPO_ENFERMEDAD", length = 50)
    private String tiempoEnfermedad;

    @Column(name = "V_FORMA_INICIO", length = 20)
    private String formaInicio;

    @Column(name = "V_CURSO", length = 20)
    private String curso;

    @Column(name = "V_ENFERMEDAD_ACTUAL", length = 2000)
    private String enfermedadActual;

    @Column(name = "V_SINTOMAS_SIGNOS", length = 2000)
    private String sintomasSignos;

    @Column(name = "V_RELATO_CRONOLOGICO", length = 2000)
    private String relatoCronologico;

    @Column(name = "V_FACTORES_MOD", length = 1000)
    private String factoresMod;

    @Column(name = "V_TRATAMIENTOS_PREVIOS", length = 1000)
    private String tratamientosPrevios;
}
