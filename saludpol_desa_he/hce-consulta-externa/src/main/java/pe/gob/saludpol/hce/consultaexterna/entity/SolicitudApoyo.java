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
@Table(name = "TBL_SOLICITUD_APOYO", schema = "SCH_HCE_CONSULTA")
public class SolicitudApoyo extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_sol_apoyo")
    @SequenceGenerator(name = "seq_sol_apoyo", sequenceName = "SEQ_SOLICITUD_APOYO", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ATENCION_ID", nullable = false)
    private Atencion atencion;

    @Column(name = "V_TIPO", nullable = false, length = 100)
    private String tipo;

    @Column(name = "V_DESCRIPCION", nullable = false, length = 300)
    private String descripcion;

    @Column(name = "V_PRIORIDAD", length = 15)
    private String prioridad = "Normal";

    @Column(name = "V_OBSERVACIONES", length = 500)
    private String observaciones;

    @Column(name = "V_ESTADO", nullable = false, length = 20)
    private String estado = "PENDIENTE";

    @Column(name = "V_ID_SUBTIPO_PARENT", length = 20)
    private String idSubTipoParent;

    @Column(name = "V_ID_SUBTIPO_ULTIMO", length = 20)
    private String idSubTipoUltimo;

    @Column(name = "V_CODIGO_CPMS", length = 30)
    private String codigoCpms;

    @Column(name = "V_CODIGO_SEGUS", length = 30)
    private String codigoSegus;
}
