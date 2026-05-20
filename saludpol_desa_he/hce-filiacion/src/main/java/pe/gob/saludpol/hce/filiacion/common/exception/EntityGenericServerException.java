package pe.gob.saludpol.hce.filiacion.common.exception;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EntityGenericServerException extends RuntimeException {

    private final String code;

    public EntityGenericServerException(String message) {
        super(message);
        this.code = null;
    }

    public EntityGenericServerException(String message, String code) {
        super(message);
        this.code = code;
    }

    public EntityGenericServerException(String message, Throwable cause) {
        super(message, cause);
        this.code = null;
    }
}
