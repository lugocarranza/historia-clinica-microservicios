package pe.gob.saludpol.hce.filiacion.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.util.List;

@Getter
public class EntityGenericClientException extends RuntimeException {

    private final HttpStatus httpStatus;
    private final transient List<SubError> subErrors;

    public EntityGenericClientException(String message, HttpStatus httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
        this.subErrors = null;
    }

    public EntityGenericClientException(String message, HttpStatus httpStatus, List<SubError> subErrors) {
        super(message);
        this.httpStatus = httpStatus;
        this.subErrors = subErrors;
    }
}
