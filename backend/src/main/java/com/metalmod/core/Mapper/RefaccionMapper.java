package com.metalmod.core.Mapper;

import com.metalmod.core.Dto.RefaccionRequestDto;
import com.metalmod.core.Dto.RefaccionResponseDto;
import com.metalmod.core.Entity.Refaccion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RefaccionMapper {

    // 1. Entidad -> DTO de Salida (Response)
    // El cálculo del booleano (cantidad <= minimo) se delega a un método default de Java
    @Mapping(target = "stockBajo", expression = "java(calcularAlertaStock(refaccion))")
    RefaccionResponseDto toResponse(Refaccion refaccion);

    // 2. DTO de Entrada (Request) -> Entidad (Creación)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "cantidadStock", defaultValue = "0") // defaultValue maneja los nulos automáticamente
    @Mapping(target = "stockMinimo", defaultValue = "0")
    Refaccion toEntity(RefaccionRequestDto request);

    // 3. DTO de Entrada -> Entidad Existente (Actualización)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "cantidadStock", defaultValue = "0")
    @Mapping(target = "stockMinimo", defaultValue = "0")
    void aplicarDatos(@MappingTarget Refaccion refaccion, RefaccionRequestDto dto);

    // Método auxiliar para mantener tu lógica de alerta de stock
    default boolean calcularAlertaStock(Refaccion refaccion) {
        if (refaccion == null) return false;
        int cantidad = refaccion.getCantidadStock() != null ? refaccion.getCantidadStock() : 0;
        int minimo = refaccion.getStockMinimo() != null ? refaccion.getStockMinimo() : 0;
        return cantidad <= minimo;
    }
}