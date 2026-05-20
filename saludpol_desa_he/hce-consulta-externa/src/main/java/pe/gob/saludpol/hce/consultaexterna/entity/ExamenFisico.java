package pe.gob.saludpol.hce.consultaexterna.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.gob.saludpol.hce.consultaexterna.common.audit.AtencionSignosVitalesBase;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_EXAMEN_FISICO", schema = "SCH_HCE_CONSULTA",
        uniqueConstraints = @UniqueConstraint(columnNames = "I_ATENCION_ID"))
public class ExamenFisico extends AtencionSignosVitalesBase {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_ex_fis")
    @SequenceGenerator(name = "seq_ex_fis", sequenceName = "SEQ_EXAMEN_FISICO", allocationSize = 1, schema = "SCH_HCE_CONSULTA")
    @Column(name = "I_ID")
    private Long id;

    @OneToMany(mappedBy = "examenFisico", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExamenRegion> regiones = new ArrayList<>();
}
