package pe.gob.saludpol.hce.ordenmedica.common.exception;

public class EntityUnprocessableException extends RuntimeException {

    public EntityUnprocessableException(String message) {
        super(message);
    }

    public EntityUnprocessableException(String message, Throwable cause) {
        super(message, cause);
    }
}
