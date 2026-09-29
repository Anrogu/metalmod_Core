package com.metalmod.core.Dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record OrdenVentaRequestDto(
        @NotNull(message = "El cliente es obligatorio")
        Long idCliente,

        String folio,

        // Esta es la lista que te falta para vincular los detalles
        @NotEmpty(message = "La orden debe contener al menos un detalle")
        List<DetalleOrdenVentaRequestDto> detalles
) {}