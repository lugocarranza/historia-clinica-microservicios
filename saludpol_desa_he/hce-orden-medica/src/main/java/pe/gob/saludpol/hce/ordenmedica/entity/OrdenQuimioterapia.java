package pe.gob.saludpol.hce.ordenmedica.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_ORDEN_QUIMIOTERAPIA", schema = "SCH_HCE_ORDEN")
public class OrdenQuimioterapia {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_orden_quimioterapia")
    @SequenceGenerator(name = "seq_orden_quimioterapia", sequenceName = "SEQ_ORDEN_QUIMIOTERAPIA", allocationSize = 1, schema = "SCH_HCE_ORDEN")
    @Column(name = "I_ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ORDEN_MEDICA_ID", nullable = false, unique = true)
    private OrdenMedica ordenMedica;

    @Column(name = "V_DIAGNOSTICO_ONCOLOGICO", length = 500)
    private String diagnosticoOncologico;

    @Column(name = "V_ESTADIO", length = 100)
    private String estadio;

    @Column(name = "V_MEDICAMENTOS", length = 500)
    private String medicamentos;

    @Column(name = "V_DOSIS", length = 500)
    private String dosis;

    @Column(name = "V_VIA", length = 100)
    private String via;

    @Column(name = "V_FRECUENCIA", length = 100)
    private String frecuencia;

    @Column(name = "V_PROTOCOLO_TERAPEUTICO", length = 300)
    private String protocoloTerapeutico;

    @Column(name = "V_CICLO", length = 100)
    private String ciclo;

    @Column(name = "I_DURACION_CICLO_DIAS")
    private Integer duracionCicloDias;

    @Column(name = "V_OBSERVACIONES", length = 2000)
    private String observaciones;
}
