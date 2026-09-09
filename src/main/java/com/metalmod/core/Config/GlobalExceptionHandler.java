package com.metalmod.core.Config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleBusinessRules(IllegalStateException ex) {
        // Convierte un error de tu Service en un HTTP 400 limpio para el frontend
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}