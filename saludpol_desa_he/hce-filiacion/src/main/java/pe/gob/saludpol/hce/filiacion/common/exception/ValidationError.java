package pe.gob.saludpol.hce.filiacion.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ValidationError implements SubError {
    private final String object;
    private final String field;
    private final String rejectedValue;
    private final String message;
}
