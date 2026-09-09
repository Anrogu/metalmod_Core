package com.metalmod.core.Mapper;

import com.metalmod.core.Dto.EntregaParcialRequestDto;
import com.metalmod.core.Dto.EntregaParcialResponseDto;
import com.metalmod.core.Entity.EntregaParcial;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EntregaParcialMapper {

    // 1. Entidad -> DTO de Salida (Response)
    // Asumimos que en EntregaParcial la relación es `private DetalleOrdenVenta detalleOrdenVenta;`
    @Mapping(source = "idDetalleOrdenVenta.id", target = "idDetalleOrdenVenta")
    EntregaParcialResponseDto toResponse(EntregaParcial entregaParcial);

    // 2. DTO de Entrada (Request) -> Entidad
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "idDetalleOrdenVenta", ignore = true) // El Service buscará el DetalleOrdenVenta por el ID
    EntregaParcial toEntity(EntregaParcialRequestDto request);
}