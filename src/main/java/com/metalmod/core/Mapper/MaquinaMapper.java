package com.metalmod.core.Mapper;

import com.metalmod.core.Dto.MaquinaRequestDto;
import com.metalmod.core.Dto.MaquinaResponseDto;
import com.metalmod.core.Entity.Maquina;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MaquinaMapper {

    // 1. Entidad -> DTO de Salida (Response)
    // MapStruct maneja automáticamente los valores nulos (ej. marca != null ? marca.getId() : null)
    @Mapping(source = "idMarca.id", target = "idMarca")
    @Mapping(source = "idMarca.nombre", target = "nombreMarca")
    @Mapping(source = "idModelo.id", target = "idModelo")
    @Mapping(source = "idModelo.nombre", target = "nombreModelo")
    @Mapping(source = "idEstado.codigo", target = "codigoEstado")
    @Mapping(source = "idEstado.nombre", target = "nombreEstado")
    MaquinaResponseDto toResponse(Maquina maquina);

    // 2. DTO de Entrada (Request) -> Entidad (Creación)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "idMarca", ignore = true) // Ignorados si no vienen en el request o se manejan en el Service
    @Mapping(target = "idModelo", ignore = true)
    @Mapping(target = "idEstado", ignore = true)
    Maquina toEntity(MaquinaRequestDto request);

    // 3. DTO de Entrada -> Entidad Existente (Equivalente a tu método aplicarDatos)
    // El @MappingTarget le dice a MapStruct que actualice el objeto pasado por parámetro en lugar de crear uno nuevo.
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "idMarca", ignore = true)
    @Mapping(target = "idModelo", ignore = true)
    @Mapping(target = "idEstado", ignore = true)
    void aplicarDatos(@MappingTarget Maquina maquina, MaquinaRequestDto dto);
}