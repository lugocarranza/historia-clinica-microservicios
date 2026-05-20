package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_LISTA_PROBLEMA", schema = "SCH_HCE_CONSULTA")
public class ListaProblema {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_lista_prob")
    @SequenceGenerator(name = "seq_lista_prob", sequenceName = "SEQ_LISTA_PROBLEMA", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ATENCION_ID", nullable = false)
    private Atencion atencion;

    @Column(name = "I_NRO_PROBLEMA", nullable = false)
    private Integer nroProblema;

    @Column(name = "V_DESCRIPCION", nullable = false, length = 500)
    private String descripcion;

    @Column(name = "V_ESTADO", length = 25)
    private String estado = "Activo";

    @Column(name = "T_FECHA_IDENTIFICACION")
    private LocalDate fechaIdentificacion;
}
