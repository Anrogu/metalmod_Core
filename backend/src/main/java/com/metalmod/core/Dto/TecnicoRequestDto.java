package com.metalmod.core.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * activo es opcional: al crear, si no llega, se asume true. Al actualizar, si
 * no llega, se conserva el estado actual.
 */
public record TecnicoRequestDto(
        @NotBlank
        @Size(max = 150)
        String nombre,

        Boolean activo
) {
}
