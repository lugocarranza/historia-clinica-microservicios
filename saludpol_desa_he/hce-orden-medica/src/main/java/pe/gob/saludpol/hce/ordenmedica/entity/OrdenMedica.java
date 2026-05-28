package pe.gob.saludpol.hce.ordenmedica.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.gob.saludpol.hce.ordenmedica.common.audit.AuditableEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_ORDEN_MEDICA", schema = "SCH_HCE_ORDEN")
public class OrdenMedica extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_orden_medica")
    @SequenceGenerator(name = "seq_orden_medica", sequenceName = "SEQ_ORDEN_MEDICA", allocationSize = 1, schema = "SCH_HCE_ORDEN")
    @Column(name = "I_ID")
    private Long id;

    @Column(name = "V_NRO_OAP", nullable = false, length = 30)
    private String nroOap;

    @Column(name = "I_ATENCION_ID", nullable = false)
    private Long atencionId;

    @Column(name = "V_TIPO_ATENCION", nullable = false, length = 2)
    private String tipoAtencion = "CE";

    @Column(name = "I_ADMISION_ID")
    private Long admisionId;

    @Column(name = "I_HISTORIA_CLINICA_ID", nullable = false)
    private Long historiaClinicaId;

    @Column(name = "V_DNI_PACIENTE", nullable = false, length = 12)
    private String dniPaciente;

    @Column(name = "V_TIPO_ORDEN", nullable = false, length = 30)
    private String tipoOrden;

    @Column(name = "I_EDAD")
    private Integer edad;

    @Column(name = "V_TIPO_SEGURO", length = 100)
    private String tipoSeguro;

    @Column(name = "V_TIPO_BENEFICIARIO", length = 100)
    private String tipoBeneficiario;

    @Column(name = "V_PLAN_SEGURO", length = 100)
    private String planSeguro;

    @Column(name = "V_TIPO_COBERTURA", length = 100)
    private String tipoCobertura;

    @Column(name = "V_TIPO_BENEFICIO", length = 100)
    private String tipoBeneficio;

    @Column(name = "V_CONDICION", length = 100)
    private String condicion;

    @Column(name = "V_PARENTESCO", length = 100)
    private String parentesco;

    @Column(name = "V_ACTIVIDAD", length = 100)
    private String actividad;

    @Column(name = "V_SUB_ACTIVIDAD", length = 100)
    private String subActividad;

    @Column(name = "V_SERVICIO", length = 100)
    private String servicio;

    @Column(name = "T_FECHA_ATENCION")
    private LocalDateTime fechaAtencion;

    @Column(name = "V_IPRESS_CUI", nullable = false, length = 20)
    private String ipressCui;

    @Column(name = "V_PROF_NOMBRE", length = 255)
    private String profNombre;

    @Column(name = "V_PROF_PROFESION", length = 100)
    private String profProfesion;

    @Column(name = "V_PROF_DOCUMENTO", length = 12)
    private String profDocumento;

    @Column(name = "V_PROF_COLEGIATURA", length = 30)
    private String profColegiatura;

    @Column(name = "V_PROF_RNE", length = 30)
    private String profRne;

    @Column(name = "V_NRO_APS", length = 30)
    private String nroAps;

    @Column(name = "V_NRO_CARTA_GARANTIA", length = 30)
    private String nroCartaGarantia;

    @Column(name = "V_ESTADO", nullable = false, length = 20)
    private String estado = "EMITIDA";

    @Column(name = "T_FECHA_EMISION", nullable = false)
    private LocalDateTime fechaEmision;

    @OneToMany(mappedBy = "ordenMedica", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrdenMedicaDet> detalles = new ArrayList<>();

    @OneToOne(mappedBy = "ordenMedica", cascade = CascadeType.ALL, orphanRemoval = true)
    private OrdenHemodialisis hemodialisis;

    @OneToOne(mappedBy = "ordenMedica", cascade = CascadeType.ALL, orphanRemoval = true)
    private OrdenQuimioterapia quimioterapia;
}
