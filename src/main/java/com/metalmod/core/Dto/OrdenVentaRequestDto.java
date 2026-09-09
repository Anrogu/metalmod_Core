package com.metalmod.core.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record OrdenVentaRequestDto(
        @NotBlank(message = "El folio es obligatorio")
        @Size(max = 30)
        String folio,

        @NotNull(message = "El cliente es obligatorio")
        Long idCliente,

        LocalDate fechaEntregaCompromiso,

        @NotNull(message = "El estado inicial es obligatorio")
        Long idEstado
) {}