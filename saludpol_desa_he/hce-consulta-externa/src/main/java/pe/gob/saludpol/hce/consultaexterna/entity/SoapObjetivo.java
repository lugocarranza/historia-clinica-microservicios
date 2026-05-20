package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.gob.saludpol.hce.consultaexterna.common.audit.AtencionSignosVitalesBase;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_SOAP_OBJETIVO", schema = "SCH_HCE_CONSULTA",
        uniqueConstraints = @UniqueConstraint(columnNames = "I_ATENCION_ID"))
public class SoapObjetivo extends AtencionSignosVitalesBase {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_soap_o")
    @SequenceGenerator(name = "seq_soap_o", sequenceName = "SEQ_SOAP_OBJETIVO", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @Column(name = "V_HALLAZGOS_FISICOS", length = 2000)
    private String hallazgosFisicos;

    @Column(name = "V_RESULT_ESTUDIOS", length = 2000)
    private String resultEstudios;

    @Column(name = "V_COMPARACION_PREVIA", length = 1000)
    private String comparacionPrevia;
}
