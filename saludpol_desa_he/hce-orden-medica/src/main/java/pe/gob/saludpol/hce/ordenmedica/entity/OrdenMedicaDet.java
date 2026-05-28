package pe.gob.saludpol.hce.ordenmedica.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_ORDEN_MEDICA_DET", schema = "SCH_HCE_ORDEN")
public class OrdenMedicaDet {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_orden_medica_det")
    @SequenceGenerator(name = "seq_orden_medica_det", sequenceName = "SEQ_ORDEN_MEDICA_DET", allocationSize = 1, schema = "SCH_HCE_ORDEN")
    @Column(name = "I_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ORDEN_MEDICA_ID", nullable = false)
    private OrdenMedica ordenMedica;

    @Column(name = "V_TIPO", nullable = false, length = 3)
    private String tipo;

    @Column(name = "V_CODIGO_CIE10", length = 10)
    private String codigoCie10;

    @Column(name = "V_CODIGO_CPMS", length = 30)
    private String codigoCpms;

    @Column(name = "V_CODIGO_SEGUS", length = 30)
    private String codigoSegus;

    @Column(name = "V_DESCRIPCION", nullable = false, length = 500)
    private String descripcion;

    @Column(name = "N_CANTIDAD")
    private BigDecimal cantidad = BigDecimal.ONE;

    @Column(name = "V_PRIORIDAD", length = 20)
    private String prioridad = "Normal";

    @Column(name = "V_OBSERVACIONES", length = 1000)
    private String observaciones;

    @Column(name = "V_ESTADO", length = 20)
    private String estado = "PENDIENTE";
}
