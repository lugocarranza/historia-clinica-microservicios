package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.gob.saludpol.hce.consultaexterna.common.audit.AuditableEntity;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_DECISION_CONTROL", schema = "SCH_HCE_CONSULTA",
        uniqueConstraints = @UniqueConstraint(columnNames = "I_ATENCION_ID"))
public class DecisionControl extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_dec_ctrl")
    @SequenceGenerator(name = "seq_dec_ctrl", sequenceName = "SEQ_DECISION_CONTROL", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ATENCION_ID", nullable = false)
    private Atencion atencion;

    @Column(name = "V_DECISION", length = 60)
    private String decision;

    @Column(name = "V_REF_PNP_IPRESS", length = 255)
    private String refPnpIpress;

    @Column(name = "V_REF_PNP_MOTIVO", length = 500)
    private String refPnpMotivo;

    @Column(name = "V_REF_NOPNP_IPRESS", length = 255)
    private String refNopnpIpress;

    @Column(name = "V_REF_NOPNP_MOTIVO", length = 500)
    private String refNopnpMotivo;

    @Column(name = "V_PROF_NOMBRES", length = 255)
    private String profNombres;

    @Column(name = "V_PROF_DOC_IDENT", length = 12)
    private String profDocIdent;

    @Column(name = "V_PROF_COLEGIATURA", length = 30)
    private String profColegiatura;

    @Column(name = "V_PROF_REG_ESPECIALIDAD", length = 30)
    private String profRegEspecialidad;

    @Column(name = "V_PROF_FIRMA_DIGITAL", length = 100)
    private String profFirmaDigital;

    @Column(name = "T_FECHA_CIERRE")
    private LocalDateTime fechaCierre;

    @Column(name = "V_LOG_USUARIO", length = 50)
    private String logUsuario;

    @Column(name = "V_IPRESS_CUI", length = 20)
    private String ipressCui;

    @Column(name = "V_LOG_ACCION", length = 100)
    private String logAccion = "REGISTRO_CONSULTA_CONTROL";

    @Column(name = "T_LOG_FECHA")
    private LocalDateTime logFecha = LocalDateTime.now();
}
