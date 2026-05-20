package pe.gob.saludpol.hce.filiacion.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.gob.saludpol.hce.filiacion.common.audit.AuditableEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TBL_HISTORIA_CLINICA", schema = "SCH_HCE_FILIACION",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "V_NRO_HC"),
                @UniqueConstraint(columnNames = "V_DNI_PACIENTE")
        })
public class HistoriaClinica extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_hc")
    @SequenceGenerator(name = "seq_hc", sequenceName = "SEQ_HISTORIA_CLINICA", allocationSize = 1, schema = "SCH_HCE_FILIACION")
    @Column(name = "I_ID")
    private Long id;

    @Column(name = "V_NRO_HC", nullable = false, length = 20)
    private String nroHc;

    @Column(name = "V_DNI_PACIENTE", nullable = false, length = 12)
    private String dniPaciente;

    @Column(name = "V_APELLIDOS_PACIENTE", length = 255)
    private String apellidosPaciente;

    @Column(name = "V_NOMBRES_PACIENTE", length = 255)
    private String nombresPaciente;

    @Column(name = "T_FECHA_NAC")
    private LocalDate fechaNac;

    @Column(name = "V_SEXO", length = 1)
    private String sexo;

    @Column(name = "V_ESTADO", nullable = false, length = 20)
    private String estado = "ACTIVA";

    @Column(name = "T_FECHA_APERTURA", nullable = false)
    private LocalDateTime fechaApertura = LocalDateTime.now();
}
