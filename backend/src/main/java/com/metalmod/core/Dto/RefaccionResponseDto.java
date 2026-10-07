package com.metalmod.core.Dto;

public record RefaccionResponseDto(
        Long id,
        String nombre,
        String descripcion,
        Integer cantidadStock,
        Integer stockMinimo,
        boolean stockBajo,
        String codigo

) {
}