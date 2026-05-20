package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_REVISION_SISTEMA", schema = "SCH_HCE_CONSULTA")
public class RevisionSistema {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_rev_sist")
    @SequenceGenerator(name = "seq_rev_sist", sequenceName = "SEQ_REVISION_SISTEMA", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ATENCION_ID", nullable = false)
    private Atencion atencion;

    @Column(name = "V_SISTEMA", nullable = false, length = 50)
    private String sistema;

    @Column(name = "V_SINTOMA", nullable = false, length = 100)
    private String sintoma;

    @Column(name = "V_PRESENTE", length = 1)
    private String presente = "N";

    @Column(name = "V_OBSERVACION", length = 300)
    private String observacion;
}
