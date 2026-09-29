package com.metalmod.core.Dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record OrdenVentaResponseDto(
        Long id,
        String folio,
        String nombreCliente,
        String usernameCreo,
        Instant fechaCreacion,
        LocalDate fechaEntregaCompromiso,
        String estadoActual,

        // Agregamos la lista de detalles para que el JSON la exponga
        List<DetalleOrdenVentaResponseDto> detalles
) {}