package pe.gob.saludpol.hce.ordenmedica.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_ORDEN_HEMODIALISIS", schema = "SCH_HCE_ORDEN")
public class OrdenHemodialisis {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_orden_hemodialisis")
    @SequenceGenerator(name = "seq_orden_hemodialisis", sequenceName = "SEQ_ORDEN_HEMODIALISIS", allocationSize = 1, schema = "SCH_HCE_ORDEN")
    @Column(name = "I_ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ORDEN_MEDICA_ID", nullable = false, unique = true)
    private OrdenMedica ordenMedica;

    @Column(name = "V_TIPO_DIALISIS", length = 100)
    private String tipoDialisis;

    @Column(name = "V_FRECUENCIA", length = 100)
    private String frecuencia;

    @Column(name = "I_DURACION_SESION_MIN")
    private Integer duracionSesionMin;

    @Column(name = "I_NUMERO_SESIONES")
    private Integer numeroSesiones;

    @Column(name = "V_ACCESO_VASCULAR", length = 200)
    private String accesoVascular;

    @Column(name = "V_ANTICOAGULACION", length = 200)
    private String anticoagulacion;

    @Column(name = "V_OBSERVACIONES", length = 2000)
    private String observaciones;
}
