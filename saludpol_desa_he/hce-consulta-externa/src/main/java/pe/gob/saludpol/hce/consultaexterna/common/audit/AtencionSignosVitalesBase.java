package pe.gob.saludpol.hce.consultaexterna.common.audit;

import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import pe.gob.saludpol.hce.consultaexterna.entity.Atencion;

import java.math.BigDecimal;

@Getter
@Setter
@MappedSuperclass
public abstract class AtencionSignosVitalesBase extends AuditableEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "I_ATENCION_ID", nullable = false)
    private Atencion atencion;

    @Column(name = "I_PA_SISTOLICA")
    private Integer paSistolica;

    @Column(name = "I_PA_DIASTOLICA")
    private Integer paDiastolica;

    @Column(name = "I_FC")
    private Integer fc;

    @Column(name = "I_FR")
    private Integer fr;

    @Column(name = "N_TEMPERATURA", precision = 4, scale = 1)
    private BigDecimal temperatura;

    @Column(name = "N_SAT_O2", precision = 5, scale = 2)
    private BigDecimal satO2;

    @Column(name = "N_PESO", precision = 6, scale = 2)
    private BigDecimal peso;

    @Column(name = "N_TALLA", precision = 5, scale = 1)
    private BigDecimal talla;

    @Column(name = "N_IMC", precision = 5, scale = 2)
    private BigDecimal imc;
}
