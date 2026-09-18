package com.metalmod.core.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClienteRequestDto(

        @NotBlank
        @Size(max = 150)
        String nombre,

        @Size(max = 150)
        String contacto,

        @Size(max = 30)
        String telefono,

        @Email
        @Size(max = 150)
        String email
) {
}