package com.metalmod.core.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MaquinaRequestDto(

        @NotBlank
        @Size(max = 150)
        String nombre,

        @Size(max = 255)
        String descripcion,

        Long idMarca,  // opcional

        Long idModelo  // opcional
) {
}