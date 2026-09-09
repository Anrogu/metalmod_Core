package com.metalmod.core.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MantenimientoRequestDto(
        @NotNull(message = "La máquina es obligatoria")
        Long idMaquina,

        @NotNull(message = "La fecha es obligatoria")
        LocalDate fecha,

        @NotBlank(message = "La descripción de la falla es obligatoria")
        @Size(max = 255, message = "La falla no puede exceder los 255 caracteres")
        String falla,

        @Size(max = 255, message = "La solución no puede exceder los 255 caracteres")
        String solucion,

        @Size(max = 150, message = "El proveedor no puede exceder los 150 caracteres")
        String proveedor,

        BigDecimal costo,

        // Corregido: eliminado el sufijo redundante "Id"
        Long idRefaccion
) {}