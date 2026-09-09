package com.metalmod.core.Dto;

import java.time.Instant;
import java.time.LocalDate;

public record OrdenVentaResponseDto(
        Long id,
        String folio,
        String nombreCliente,
        String usernameCreo,
        Instant fechaCreacion,
        LocalDate fechaEntregaCompromiso,
        String estadoActual
) {}