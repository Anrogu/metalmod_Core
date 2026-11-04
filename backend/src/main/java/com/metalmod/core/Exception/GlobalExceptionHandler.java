package com.metalmod.core.Exception;

import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Errores de validacion de @Valid en los DTO (ej. @NotNull, @Size)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errores = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "invalido",
                        (a, b) -> a
                ));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(cuerpoError(
                HttpStatus.BAD_REQUEST, "Error de validacion", errores));
    }

    // Cuando un servicio busca una entidad por id y no existe
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(cuerpoError(
                HttpStatus.NOT_FOUND, ex.getMessage(), null));
    }

    // Reglas de negocio invalidas (ej. cantidad programada mayor a la disponible)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleReglaNegocio(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(cuerpoError(
                HttpStatus.CONFLICT, ex.getMessage(), null));
    }

    // Estado invalido para realizar la operacion (ej. maquina en mantenimiento)
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleEstadoInvalido(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(cuerpoError(
                HttpStatus.CONFLICT, ex.getMessage(), null));
    }

    // Errores lanzados con ResponseStatusException (409 de duplicados, 400 de
    // peticiones invalidas, etc.). Sin este handler, el catch-all de abajo los
    // convertiria en un 500 generico y se perderia el mensaje real.
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        String mensaje = ex.getReason() != null ? ex.getReason() : status.getReasonPhrase();
        return ResponseEntity.status(status).body(cuerpoError(status, mensaje, null));
    }

    // Violaciones de integridad: indices unicos y llaves foraneas.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleIntegridad(DataIntegrityViolationException ex) {
        String detalle = ex.getMostSpecificCause() != null
                ? String.valueOf(ex.getMostSpecificCause().getMessage())
                : "";

        String mensaje;
        if (detalle.contains("ux_maquina_nombre_lower")) {
            mensaje = "Ya existe una maquina con ese nombre.";
        } else if (detalle.contains("ux_refaccion_codigo_lower")) {
            mensaje = "Ya existe una refaccion con ese codigo.";
        } else if (detalle.contains("ux_tecnico_nombre_lower")) {
            mensaje = "Ya existe un tecnico con ese nombre.";
        } else if (detalle.contains("foreign key")) {
            mensaje = "No se puede completar la operacion: el registro esta en uso por otros datos.";
        } else if (detalle.contains("duplicate key")) {
            mensaje = "Ya existe un registro con esos datos.";
        } else {
            mensaje = "No se pudo completar la operacion por una restriccion de la base de datos.";
        }

        log.warn("Violacion de integridad en la base de datos: {}", detalle);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(cuerpoError(
                HttpStatus.CONFLICT, mensaje, null));
    }

    // JSON mal formado o tipos incorrectos en el cuerpo de la peticion.
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleNoLeible(HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(cuerpoError(
                HttpStatus.BAD_REQUEST, "El cuerpo de la peticion no es valido.", null));
    }

    // Cualquier otro error no contemplado explicitamente
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        log.error("Error no controlado", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(cuerpoError(
                HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor", null));
    }

    private Map<String, Object> cuerpoError(HttpStatus status, String mensaje, Object detalle) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("mensaje", mensaje);
        if (detalle != null) {
            body.put("detalle", detalle);
        }
        return body;
    }
}