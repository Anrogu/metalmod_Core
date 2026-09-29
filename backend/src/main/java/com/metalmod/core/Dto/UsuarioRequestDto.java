package com.metalmod.core.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioRequestDto(
        @NotBlank(message = "El nombre de usuario es obligatorio")
        @Size(max = 50)
        String username,

        @NotBlank(message = "La contraseña es obligatoria")
        String password,

        @NotNull(message = "El rol es obligatorio")
        Long idRol,

        @NotNull(message = "El estado (activo/inactivo) es obligatorio")
        Boolean activo
) {}