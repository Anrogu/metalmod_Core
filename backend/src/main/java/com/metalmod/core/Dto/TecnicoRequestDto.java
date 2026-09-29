package com.metalmod.core.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TecnicoRequestDto(@NotBlank
                                @Size(max = 100)
                                String nombre) {
}
