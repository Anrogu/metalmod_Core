package com.metalmod.core.Mapper;

import com.metalmod.core.Dto.ClienteRequestDto;
import com.metalmod.core.Dto.ClienteResponseDto;
import com.metalmod.core.Entity.Cliente;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ClienteMapper {

    // 1. DTO de Entrada (Request) -> Entidad (Para Creación)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "activo", ignore = true) // El estado activo debe ser asignado por la lógica de negocio, no por el usuario
    Cliente toEntity(ClienteRequestDto dto);

    // 2. Entidad -> DTO de Salida (Response)
    ClienteResponseDto toResponse(Cliente cliente);

    // 3. Método para Actualizaciones (Equivalente a tu 'aplicarDatos')
    // El @MappingTarget le indica a MapStruct que actualice la entidad existente
    // en lugar de crear una nueva.
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "activo", ignore = true)
    void updateEntityFromDto(ClienteRequestDto dto, @MappingTarget Cliente cliente);
}