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
@Table(name = "TBL_ATENCION", schema = "SCH_HCE_CONSULTA")
public class Atencion extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_atencion")
    @SequenceGenerator(name = "seq_atencion", sequenceName = "SEQ_ATENCION", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @Column(name = "I_ADMISION_ID", nullable = false)
    private Long admisionId;

    @Column(name = "V_TIPO_ATENCION", nullable = false, length = 30)
    private String tipoAtencion;

    @Column(name = "T_FECHA_ATENCION", nullable = false)
    private LocalDateTime fechaAtencion;

    @Column(name = "V_ESTADO", nullable = false, length = 20)
    private String estado = "ABIERTA";

    @Column(name = "V_SERVICIO", length = 100)
    private String servicio;

    @Column(name = "V_DNI_PACIENTE", length = 12)
    private String dniPaciente;

    @Column(name = "I_CE_ATENCION_ID")
    private Long ceAtencionId;

    @Column(name = "V_IPRESS_CUI", length = 20)
    private String ipressCui;
}
