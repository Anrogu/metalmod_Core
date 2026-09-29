package com.metalmod.core.Dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DetalleOrdenVentaRequestDto(
        @NotNull(message = "La pieza es obligatoria")
        Long idPieza,

        @NotNull(message = "La cantidad es obligatoria")
        Integer cantidad,

        @NotNull(message = "El precio unitario es obligatorio")
        BigDecimal precioUnitario,

        LocalDate fechaEntregaLinea,

        @NotNull(message = "El estado inicial es obligatorio")
        Long idEstado
)        {
}