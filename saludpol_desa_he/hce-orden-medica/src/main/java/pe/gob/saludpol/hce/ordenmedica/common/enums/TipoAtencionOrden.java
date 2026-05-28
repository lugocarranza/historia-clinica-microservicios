package pe.gob.saludpol.hce.ordenmedica.common.enums;

import java.util.Arrays;

public enum TipoAtencionOrden {
    CE("Consulta Externa"),
    CS("Consulta de Seguimiento"),
    EM("Emergencia"),
    HO("Hospitalizacion");

    private final String nombre;

    TipoAtencionOrden(String nombre) {
        this.nombre = nombre;
    }

    public String getNombre() {
        return nombre;
    }

    public static TipoAtencionOrden fromCodigo(String codigo) {
        return Arrays.stream(values())
                .filter(tipo -> tipo.name().equals(codigo))
                .findFirst()
                .orElse(null);
    }
}
