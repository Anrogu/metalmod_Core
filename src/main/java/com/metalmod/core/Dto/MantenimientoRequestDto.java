package com.metalmod.core.Dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MantenimientoRequestDto(

        @NotNull
        Long idMaquina,

        @NotNull
        LocalDate fecha,

        @NotBlank
        @Size(max = 255)
        String falla,

        @Size(max = 255)
        String solucion,

        @Size(max = 150)
        String proveedor,

        @PositiveOrZero
        BigDecimal costo,

        Long idRefaccion, // opcional: solo si la reparacion uso una refaccion catalogada

        @Size(max = 150)
        String tecnico,

        @PositiveOrZero
        Integer tiempoInvertidoMinutos
) {
}