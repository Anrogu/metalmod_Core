package com.metalmod.core.Dto;

public record MaquinaResponseDto(
        Long id,
        String nombre,
        String descripcion,
        Long idMarca,
        String nombreMarca,     // null si no tiene marca asignada
        Long idModelo,
        String nombreModelo,    // null si no tiene modelo asignado
        String codigoEstado,
        String nombreEstado
) {
}