package com.metalmod.core.Dto;

import jakarta.validation.constraints.NotBlank;

public record CambiarEstadoMaquinaRequestDto(

        @NotBlank
        String codigoEstado // "activa", "mantenimiento" o "baja"
) {
}