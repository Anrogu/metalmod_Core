package com.metalmod.core.Dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DetalleOrdenVentaResponseDto(
        Long id,
        String numeroPieza,
        String descripcionPieza,
        Integer cantidad,
        BigDecimal precioUnitario,
        LocalDate fechaEntregaLinea,
        String estadoActual
) {}