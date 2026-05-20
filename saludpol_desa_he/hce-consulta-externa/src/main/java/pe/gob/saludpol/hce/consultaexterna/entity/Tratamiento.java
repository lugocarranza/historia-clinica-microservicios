package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.gob.saludpol.hce.consultaexterna.common.audit.AtencionMedicacionBase;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_TRATAMIENTO", schema = "SCH_HCE_CONSULTA")
public class Tratamiento extends AtencionMedicacionBase {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_trat")
    @SequenceGenerator(name = "seq_trat", sequenceName = "SEQ_TRATAMIENTO", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @Column(name = "V_MEDICAMENTO", nullable = false, length = 200)
    private String medicamento;

    @Column(name = "V_INDICACIONES", length = 500)
    private String indicaciones;
}
