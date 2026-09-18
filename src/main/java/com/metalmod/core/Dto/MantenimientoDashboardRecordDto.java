package com.metalmod.core.Dto;

// Forma identica a la que ya consume MetricsChart.jsx: r.ma, r.refaccion, r.trimestre
public record MantenimientoDashboardRecordDto(
        String ma,
        String refaccion, // null si el ticket no tiene refaccion asociada (MetricsChart ya lo maneja)
        String trimestre
) {
}