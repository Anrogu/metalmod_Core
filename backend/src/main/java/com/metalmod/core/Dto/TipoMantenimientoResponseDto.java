package com.metalmod.core.Dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TipoMantenimientoResponseDto(Short id, String codigo, String nombre) {
}
