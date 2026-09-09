package com.metalmod.core.Dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record PlanProduccionRequestDto(
        @NotNull(message = "El detalle de la orden es obligatorio")
        Long idDetalleOrdenVenta,

        @NotNull(message = "La máquina es obligatoria")
        Long idMaquina,

        @NotNull(message = "La cantidad programada es obligatoria")
        Integer cantidadProgramada,

        @NotNull(message = "La fecha de inicio estimada es obligatoria")
        Instant fechaInicioProgramada,

        @NotNull(message = "La fecha de fin estimada es obligatoria")
        Instant fechaFinProgramada

        // NOTA: idEstado inicial, idUsuarioPlaneo, createdAt y updatedAt
        // no se piden aquí. El backend los asignará en el Service.
) {}