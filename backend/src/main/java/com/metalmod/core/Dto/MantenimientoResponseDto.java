package com.metalmod.core.Dto;

import com.metalmod.core.Entity.TipoMantenimiento;

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
        String nombreRefaccion,
        Long idTecnico,
        String nombreTecnico, // <-- Asegúrate de agregar esta línea
        Integer tiempoInvertidoMinutos,
        Long tipoMantenimiento
) {
}