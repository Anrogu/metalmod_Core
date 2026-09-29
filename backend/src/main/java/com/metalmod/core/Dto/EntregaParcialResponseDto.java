package com.metalmod.core.Dto;

import java.time.LocalDate;

public record EntregaParcialResponseDto(
        Long id,
        Long idDetalleOrdenVenta,
        Integer cantidadEntregada,
        LocalDate fechaEntrega,
        String observaciones
) {}