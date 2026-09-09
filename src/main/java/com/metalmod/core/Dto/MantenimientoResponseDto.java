package com.metalmod.core.Dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MantenimientoResponseDto(
        Long id,

        // Datos de la Máquina
        Long idMaquina,
        String numeroEconomicoMaquina, // Extraído de la entidad Maquina

        // Detalles del Evento
        LocalDate fecha,
        String falla,
        String solucion,
        String proveedor,
        BigDecimal costo,

        // Datos de la Refacción
        Long idRefaccion,
        String nombreRefaccion // Extraído de la entidad Refaccion (si aplica)
) {}