package com.metalmod.core.Dto;

public record UsuarioResponseDto(
        Long id,
        String username,
        String nombreRol, // Extraído de la entidad Rol (ej. "ADMIN")
        Boolean activo
) {}