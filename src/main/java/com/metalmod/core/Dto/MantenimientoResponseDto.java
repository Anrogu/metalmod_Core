package com.metalmod.core.Dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MantenimientoResponseDto(
        Long id,
        Long idMaquina,
        String nombreMaquina,
        LocalDate fecha,
        String falla,
        String solucion,
        String proveedor,
        BigDecimal costo,
        Long idRefaccion,
        String nombreRefaccion, // null si no se asocio refaccion
        String tecnico,
        Integer tiempoInvertidoMinutos
) {
}