package com.metalmod.core.Dto;

public record ClienteResponseDto(
        Long id,
        String nombre,
        String contacto,
        String telefono,
        String email,
        Boolean activo
) {
}