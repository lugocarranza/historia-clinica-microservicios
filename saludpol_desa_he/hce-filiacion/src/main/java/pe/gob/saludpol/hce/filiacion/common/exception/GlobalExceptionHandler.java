package pe.gob.saludpol.hce.filiacion.common.exception;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.TypeMismatchException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    protected ResponseEntity<Object> handleEntityNotFound(EntityNotFoundException ex) {
        log.error("Recurso no encontrado - Error: {}", ex.getMessage());
        ErrorDTO error = new ErrorDTO(HttpStatus.NOT_FOUND, GlobalConstant.NOT_FOUND);
        error.setMessage(ex.getMessage());
        return buildResponseEntity(error);
    }

    @ExceptionHandler(EntityUnprocessableException.class)
    protected ResponseEntity<Object> handleUnprocessable(EntityUnprocessableException ex) {
        log.error("Entidad no procesable - Error: {}", ex.getMessage());
        ErrorDTO error = new ErrorDTO(HttpStatus.UNPROCESSABLE_CONTENT,
                GlobalConstant.PREFIX_CLIENT_ERROR + GlobalConstant.UNPROCESSABLE_ENTITY);
        error.setMessage(ex.getMessage());
        return buildResponseEntity(error);
    }

    @ExceptionHandler(EntityGenericClientException.class)
    protected ResponseEntity<Object> handleGenericClientException(EntityGenericClientException ex) {
        log.error("Error de cliente - Status: {} - Mensaje: {}", ex.getHttpStatus().value(), ex.getMessage());
        ErrorDTO error = new ErrorDTO(ex.getHttpStatus(), GlobalConstant.PREFIX_CLIENT_ERROR);
        error.setMessage(ex.getMessage());
        error.setSubErrors(ex.getSubErrors());
        return buildResponseEntity(error);
    }

    @ExceptionHandler(EntityGenericServerException.class)
    protected ResponseEntity<Object> handleGenericServerException(EntityGenericServerException ex) {
        String code = ex.getCode() != null ? ex.getCode()
                : GlobalConstant.PREFIX_SERVER_ERROR + GlobalConstant.INTERNAL_SERVER_ERROR;
        log.error("Error interno del servidor - Código: {} - Mensaje: {}", code, ex.getMessage());
        ErrorDTO error = new ErrorDTO(HttpStatus.INTERNAL_SERVER_ERROR, code);
        error.setMessage(ex.getMessage());
        return buildResponseEntity(error);
    }

    @ExceptionHandler(EntityUnauthorizedException.class)
    protected ResponseEntity<Object> handleEntityUnauthorized(EntityUnauthorizedException ex) {
        log.error("Acceso no autorizado - Mensaje: {}", ex.getMessage());
        ErrorDTO error = new ErrorDTO(HttpStatus.UNAUTHORIZED,
                GlobalConstant.PREFIX_CLIENT_ERROR + GlobalConstant.UNAUTHORIZED);
        error.setMessage(ex.getMessage());
        return buildResponseEntity(error);
    }

    @ExceptionHandler(HttpStatusCodeException.class)
    protected ResponseEntity<Object> handleHttpRestClient(HttpStatusCodeException ex) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value()) != null
                ? HttpStatus.valueOf(ex.getStatusCode().value())
                : HttpStatus.INTERNAL_SERVER_ERROR;
        String errorCode = status.is4xxClientError()
                ? GlobalConstant.PREFIX_CLIENT_ERROR + status.value()
                : GlobalConstant.PREFIX_SERVER_ERROR + status.value();
        ErrorDTO error = new ErrorDTO(status, errorCode, ex.getStatusText(), ex);
        error.setDebugMessage(ex.getResponseBodyAsString());
        log.error("Error en comunicación HTTP - Status: {} - Cuerpo: {}", ex.getStatusCode(),
                ex.getResponseBodyAsString());
        return buildResponseEntity(error);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, // NOSONAR
            HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
        HttpStatus status = resolveStatus(statusCode, HttpStatus.BAD_REQUEST);
        List<FieldError> fieldErrors = ex.getBindingResult().getFieldErrors();
        String errorSummary = fieldErrors.stream()
                .map(e -> String.format("%s: %s", e.getField(), e.getDefaultMessage()))
                .collect(Collectors.joining("; "));
        ErrorDTO error = new ErrorDTO(status, GlobalConstant.PREFIX_CLIENT_ERROR + status.value(),
                "Errores de validación en los datos de entrada", ex);
        error.setSubErrors(fieldErrors.stream()
                .map(fe -> (SubError) new ValidationError(fe.getObjectName(), fe.getField(),
                        fe.getRejectedValue() != null ? fe.getRejectedValue().toString() : "null",
                        fe.getDefaultMessage()))
                .toList());
        error.setMessage(errorSummary);
        error.setDebugMessage(errorSummary);
        log.error("Validación fallida - Errores: {} - URL: {}", errorSummary, request.getDescription(false));
        return buildResponseEntity(error);
    }

    @Override
    protected ResponseEntity<Object> handleTypeMismatch(TypeMismatchException ex, HttpHeaders headers, // NOSONAR
            HttpStatusCode statusCode, WebRequest request) {
        if (!(ex instanceof MethodArgumentTypeMismatchException mismatchEx)) {
            return super.handleTypeMismatch(ex, headers, statusCode, request);
        }
        HttpStatus status = resolveStatus(statusCode, HttpStatus.BAD_REQUEST);
        String requiredType = mismatchEx.getRequiredType() != null
                ? mismatchEx.getRequiredType().getSimpleName()
                : "tipo desconocido";
        String errorMessage = String.format("El parámetro '%s' debe ser de tipo %s",
                mismatchEx.getName(), requiredType);
        ErrorDTO error = new ErrorDTO(status, GlobalConstant.PREFIX_CLIENT_ERROR + status.value(),
                errorMessage, mismatchEx);
        log.error("Error de tipo en parámetro: {} - Valor recibido: {}", mismatchEx.getName(),
                mismatchEx.getValue());
        return buildResponseEntity(error);
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex, // NOSONAR
            HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
        HttpStatus status = resolveStatus(statusCode, HttpStatus.BAD_REQUEST);
        String errorDetail = "Cuerpo de solicitud inválido o mal formado";
        if (ex.getCause() != null && ex.getCause().getCause() instanceof InvalidFormatException ife) {
            errorDetail = String.format("Valor inválido '%s' para el campo '%s'", ife.getValue(),
                    ife.getPath().get(ife.getPath().size() - 1).getFieldName());
        }
        ErrorDTO error = new ErrorDTO(status, GlobalConstant.PREFIX_CLIENT_ERROR + status.value(),
                "Error en formato de solicitud", ex);
        error.setDebugMessage(errorDetail);
        log.error("Error de formato JSON - URL: {} - Detalle: {}", request.getDescription(false), errorDetail);
        return buildResponseEntity(error);
    }

    @Override
    protected ResponseEntity<Object> handleMissingServletRequestParameter( // NOSONAR
            MissingServletRequestParameterException ex, HttpHeaders headers,
            HttpStatusCode statusCode, WebRequest request) {
        HttpStatus status = resolveStatus(statusCode, HttpStatus.BAD_REQUEST);
        String errorMessage = String.format("Parámetro requerido faltante: '%s'", ex.getParameterName());
        ErrorDTO error = new ErrorDTO(status, GlobalConstant.PREFIX_CLIENT_ERROR + status.value(),
                errorMessage, ex);
        error.setDebugMessage(String.format("Tipo esperado: %s", ex.getParameterType()));
        log.warn("Parámetro faltante - Nombre: {} - Tipo: {} - URL: {}", ex.getParameterName(),
                ex.getParameterType(), request.getDescription(false));
        return buildResponseEntity(error);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    protected ResponseEntity<Object> handleConstraintViolation(ConstraintViolationException ex) { // NOSONAR
        HttpStatus status = HttpStatus.BAD_REQUEST;
        String errorSummary = ex.getConstraintViolations().stream()
                .map(v -> {
                    String path = v.getPropertyPath().toString();
                    int dot = path.lastIndexOf('.');
                    return String.format("%s: %s", dot >= 0 ? path.substring(dot + 1) : path, v.getMessage());
                })
                .collect(Collectors.joining("; "));
        ErrorDTO error = new ErrorDTO(status, GlobalConstant.PREFIX_CLIENT_ERROR + status.value(),
                "Errores de validación en los parámetros de entrada", ex);
        error.setDebugMessage(errorSummary);
        log.error("Validación de parámetros fallida - Errores: {}", errorSummary);
        return buildResponseEntity(error);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    protected ResponseEntity<Object> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.error("Violación de integridad de datos", ex);
        ErrorDTO error = new ErrorDTO(HttpStatus.CONFLICT, GlobalConstant.PREFIX_CLIENT_ERROR + "409");
        error.setMessage("Conflicto de datos: la operación viola una restricción de integridad");
        return buildResponseEntity(error);
    }

    @ExceptionHandler(Exception.class)
    protected ResponseEntity<Object> handleAllUncaughtException(Exception ex, WebRequest request) {
        log.error("Error no controlado - URL: {}", request.getDescription(false), ex);
        ErrorDTO error = new ErrorDTO(HttpStatus.INTERNAL_SERVER_ERROR,
                GlobalConstant.PREFIX_SERVER_ERROR + GlobalConstant.INTERNAL_SERVER_ERROR);
        error.setMessage("Error interno del servidor");
        return buildResponseEntity(error);
    }

    private ResponseEntity<Object> buildResponseEntity(ErrorDTO errorDTO) {
        return new ResponseEntity<>(errorDTO, errorDTO.getHttpStatus());
    }

    private HttpStatus resolveStatus(HttpStatusCode statusCode, HttpStatus fallback) {
        HttpStatus resolved = HttpStatus.resolve(statusCode.value());
        return resolved != null ? resolved : fallback;
    }
}
