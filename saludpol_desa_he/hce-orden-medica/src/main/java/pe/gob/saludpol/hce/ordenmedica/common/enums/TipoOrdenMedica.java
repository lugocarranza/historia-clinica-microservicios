package pe.gob.saludpol.hce.ordenmedica.common.enums;

import java.util.Arrays;

public enum TipoOrdenMedica {
    LAB("Laboratorio", true),
    IMG("Imagen", true),
    PDI("Procedimiento diagnostico", true),
    PTE("Procedimiento terapeutico programado", true),
    TES("Terapia especializada", true),
    OTR("Otros", true),
    HEM("Hemodialisis", false),
    QUI("Quimioterapia", false);

    private final String nombre;
    private final boolean usaDetallesGenerales;

    TipoOrdenMedica(String nombre, boolean usaDetallesGenerales) {
        this.nombre = nombre;
        this.usaDetallesGenerales = usaDetallesGenerales;
    }

    public String getNombre() {
        return nombre;
    }

    public boolean usaDetallesGenerales() {
        return usaDetallesGenerales;
    }

    public boolean coincideConDetalle(String detalle) {
        return usaDetallesGenerales && name().equals(detalle);
    }

    public static TipoOrdenMedica fromCodigo(String codigo) {
        return Arrays.stream(values())
                .filter(tipo -> tipo.name().equals(codigo))
                .findFirst()
                .orElse(null);
    }
}
