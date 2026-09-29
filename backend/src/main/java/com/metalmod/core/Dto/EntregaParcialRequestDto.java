package com.metalmod.core.Dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record EntregaParcialRequestDto(
        @NotNull(message = "El detalle de la orden es obligatorio")
        Long idDetalleOrdenVenta,

        @NotNull(message = "La cantidad entregada es obligatoria")
        Integer cantidadEntregada,

        @NotNull(message = "La fecha de entrega es obligatoria")
        LocalDate fechaEntrega,

        @Size(max = 255, message = "Las observaciones no pueden exceder los 255 caracteres")
        String observaciones
) {}