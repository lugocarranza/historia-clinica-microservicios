package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_INDICACION_NO_FARM", schema = "SCH_HCE_CONSULTA",
        uniqueConstraints = @UniqueConstraint(columnNames = "I_ATENCION_ID"))
public class IndicacionNoFarm {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_ind_no_farm")
    @SequenceGenerator(name = "seq_ind_no_farm", sequenceName = "SEQ_INDICACION_NO_FARM", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ATENCION_ID", nullable = false)
    private Atencion atencion;

    @Column(name = "V_INDICACIONES", length = 2000)
    private String indicaciones;
}
