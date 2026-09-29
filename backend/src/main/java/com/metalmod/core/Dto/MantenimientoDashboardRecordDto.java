package com.metalmod.core.Dto;

public record MantenimientoDashboardRecordDto(
        String ma,
        String marca,
        String refaccion,
        String nombreTecnico, // <-- NUEVO CAMPO AÑADIDO
        String trimestre
) {
}