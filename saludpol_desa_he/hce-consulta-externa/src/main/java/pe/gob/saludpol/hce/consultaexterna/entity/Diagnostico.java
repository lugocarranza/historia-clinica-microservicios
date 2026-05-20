package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_DIAGNOSTICO", schema = "SCH_HCE_CONSULTA")
public class Diagnostico {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_diag")
    @SequenceGenerator(name = "seq_diag", sequenceName = "SEQ_DIAGNOSTICO", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ATENCION_ID", nullable = false)
    private Atencion atencion;

    @Column(name = "V_CODIGO_CIE10", length = 10)
    private String codigoCie10;

    @Column(name = "V_DESCRIPCION", nullable = false, length = 500)
    private String descripcion;

    @Column(name = "V_TIPO", length = 20)
    private String tipo = "Presuntivo";

    @Column(name = "V_CASO", length = 15)
    private String caso = "Nuevo";

    @Column(name = "I_NRO_PROBLEMA_ASOC")
    private Integer nroProblemAsoc;
}
