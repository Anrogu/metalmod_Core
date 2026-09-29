package com.metalmod.core.Dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PiezaRequestDto(

        @NotBlank
        @Size(max = 150)
        String nombre,

        @Size(max = 255)
        String descripcion,

        @Size(max = 20)
        String unidadMedida, // si viene nulo/vacio, el service asume "pza"

        @Min(0)
        Integer tiempoCicloBaseSeg
) {
}