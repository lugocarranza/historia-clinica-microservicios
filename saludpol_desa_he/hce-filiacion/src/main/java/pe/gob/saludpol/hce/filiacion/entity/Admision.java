package pe.gob.saludpol.hce.filiacion.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.gob.saludpol.hce.filiacion.common.audit.AuditableEntity;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "TBL_ADMISION",
    schema = "SCH_HCE_FILIACION"
)
public class Admision extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_admision")
    @SequenceGenerator(name = "seq_admision", sequenceName = "SEQ_ADMISION", allocationSize = 1, schema = "SCH_HCE_FILIACION")
    @Column(name = "I_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_HISTORIA_CLINICA_ID", nullable = false)
    private HistoriaClinica historiaClinica;

    @Column(name = "V_SITUACION", length = 30)
    private String situacion;

    @Column(name = "V_CONDICION", length = 30)
    private String condicion;

    @Column(name = "V_PARENTESCO", length = 50)
    private String parentesco;

    @Column(name = "V_CARTA_GARANTIA_NRO", length = 30)
    private String cartaGaratiaNro;

    @Column(name = "V_TIPO_SEGURO", length = 30)
    private String tipoSeguro;

    @Column(name = "V_PLAN_SALUD", length = 30)
    private String planSalud;

    @Column(name = "V_TIPO_COBERTURA", length = 20)
    private String tipoCobertura;

    @Column(name = "V_TIPO_BENEFICIO", length = 60)
    private String tipoBeneficio;

    @Column(name = "V_TIPO_ATENCION", length = 40)
    private String tipoAtencion;

    @Column(name = "V_ACTIVIDAD", length = 200)
    private String actividad;

    @Column(name = "V_SUB_ACTIVIDAD", length = 200)
    private String subActividad;

    @Column(name = "V_CONSULTA_MEDICA", length = 100)
    private String consultaMedica;

    @Column(name = "V_SERVICIO", length = 100)
    private String servicio;

    @Column(name = "T_FECHA_ATENCION")
    private LocalDateTime fechaAtencion;

    @Column(name = "V_CUI_IPRESS", length = 20)
    private String cuiIpress;

    @Column(name = "V_IPRESS_RAZON_SOCIAL", length = 255)
    private String ipressRazonSocial;

    @Column(name = "V_IPRESS_SEDE", length = 255)
    private String ipressSede;

    @Column(name = "V_IPRESS_REGION", length = 100)
    private String ipressRegion;

    @Column(name = "V_IPRESS_CATEGORIA", length = 20)
    private String ipressCategoria;

    @Column(name = "V_PROFESIONAL_NOMBRE", length = 70)
    private String profesionalNombre;

    @Column(name = "V_PROFESIONAL_PROFESION", length = 50)
    private String profesionalProfesion;

    @Column(name = "V_PROFESIONAL_COLEGIATURA", length = 30)
    private String profesionalColegiatura;

    @Column(name = "V_ESTADO", nullable = false, length = 20)
    private String estado = "ACTIVA";
}
