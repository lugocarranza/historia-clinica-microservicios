package pe.gob.saludpol.hce.ordenmedica.common.exception;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

import java.util.Date;
import java.util.List;

@Getter
@Setter
public class ErrorDTO {

    private String status;
    private HttpStatus httpStatus;
    private Date timestamp;
    private String message;
    private String debugMessage;
    private List<SubError> subErrors;

    public ErrorDTO() {
        this.timestamp = new Date();
    }

    public ErrorDTO(HttpStatus httpStatus, String status) {
        this();
        this.httpStatus = httpStatus;
        this.status = status;
    }

    public ErrorDTO(HttpStatus httpStatus, String status, Throwable ex) {
        this();
        this.httpStatus = httpStatus;
        this.status = status;
        this.message = "Error inesperado";
        this.debugMessage = ex.getLocalizedMessage();
    }

    public ErrorDTO(HttpStatus httpStatus, String status, String message, Throwable ex) {
        this();
        this.httpStatus = httpStatus;
        this.status = status;
        this.message = message;
        this.debugMessage = ex.getLocalizedMessage();
    }
}
