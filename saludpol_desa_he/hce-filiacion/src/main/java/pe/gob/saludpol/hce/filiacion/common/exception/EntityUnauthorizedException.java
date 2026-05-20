package pe.gob.saludpol.hce.filiacion.common.exception;

public class EntityUnauthorizedException extends RuntimeException {

    public EntityUnauthorizedException(String message) {
        super(message);
    }
}
