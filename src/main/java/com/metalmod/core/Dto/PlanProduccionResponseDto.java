package com.metalmod.core.Dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record PlanProduccionResponseDto(
        Long id,

        // Datos del Detalle de Orden (para contexto)
        Long idDetalleOrdenVenta,
        Integer cantidadRequeridaOrden,
        LocalDate fechaEntregaLinea,

        // Datos de la Máquina
        String numeroEconomicoMaquina, // Extraído de la entidad Maquina

        // Datos del Plan
        Integer cantidadProgramada,
        Instant fechaInicioProgramada,
        Instant fechaFinProgramada,

        // Metadatos y Estados
        String estadoPlan,         // Extraído de la entidad EstadoPlanProduccion
        String usernamePlaneador,  // Extraído de Usuario (NUNCA el password)

        Instant createdAt,
        Instant updatedAt
) {}