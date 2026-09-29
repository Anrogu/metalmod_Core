package com.metalmod.core.Dto;

public record PiezaResponseDto(
        Long id,
        String nombre,
        String descripcion,
        String unidadMedida,
        Integer tiempoCicloBaseSeg
) {
}