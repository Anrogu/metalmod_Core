package com.metalmod.core.Mapper;

import com.metalmod.core.Dto.RefaccionRequestDto;
import com.metalmod.core.Dto.RefaccionResponseDto;
import com.metalmod.core.Entity.Refaccion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface RefaccionMapper {

    // 1. Entidad -> DTO de salida
    @Mapping(target = "stockBajo", expression = "java(calcularAlertaStock(refaccion))")
    @Mapping(target = "codigo", source = "codigo")
    RefaccionResponseDto toResponse(Refaccion refaccion);

    // 2. DTO de entrada -> Entidad (creación)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "cantidadStock", defaultValue = "0")
    @Mapping(target = "stockMinimo", defaultValue = "0")
    @Mapping(target = "codigo", source = "codigo", qualifiedByName = "normalizarCodigo")
    Refaccion toEntity(RefaccionRequestDto request);

    // 3. DTO de entrada -> Entidad existente (actualización)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "cantidadStock", defaultValue = "0")
    @Mapping(target = "stockMinimo", defaultValue = "0")
    @Mapping(target = "codigo", source = "codigo", qualifiedByName = "normalizarCodigo")
    void aplicarDatos(@MappingTarget Refaccion refaccion, RefaccionRequestDto dto);

    default boolean calcularAlertaStock(Refaccion refaccion) {
        if (refaccion == null) return false;
        int cantidad = refaccion.getCantidadStock() != null ? refaccion.getCantidadStock() : 0;
        int minimo = refaccion.getStockMinimo() != null ? refaccion.getStockMinimo() : 0;
        return cantidad <= minimo;
    }

    // Recorta espacios y convierte vacío en null.
    // Lleva @Named para que MapStruct NO lo aplique a los demás String (nombre, descripcion).
    @Named("normalizarCodigo")
    default String normalizarCodigo(String codigo) {
        if (codigo == null) return null;
        String limpio = codigo.trim();
        return limpio.isEmpty() ? null : limpio;
    }
}