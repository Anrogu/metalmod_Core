package com.metalmod.core.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record RefaccionRequestDto(

        @NotBlank
        @Size(max = 150)
        String nombre,

        @Size(max = 255)
        String descripcion,

        @PositiveOrZero
        Integer cantidadStock, // si viene nulo, el service asume 0

        @PositiveOrZero
        Integer stockMinimo,    // si viene nulo, el service asume 0
        @Size(max = 30)
        String codigo
) {
}