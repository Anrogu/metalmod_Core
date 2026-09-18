package com.metalmod.core.Mapper;

import com.metalmod.core.Dto.PiezaRequestDto;
import com.metalmod.core.Dto.PiezaResponseDto;
import com.metalmod.core.Entity.Pieza;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PiezaMapper {

    // 1. DTO de Entrada (Request) -> Entidad (Para Creación)
    // Aplica "pza" si el DTO no trae la unidad de medida
    @Mapping(target = "unidadMedida", source = "unidadMedida", defaultValue = "pza")
    @Mapping(target = "id", ignore = true)
    Pieza toEntity(PiezaRequestDto dto);

    // 2. Entidad -> DTO de Salida (Response)
    PiezaResponseDto toResponse(Pieza pieza);

    // 3. Método para Actualizaciones (Reemplaza a tu 'aplicarDatos')
    // Mantiene la regla del valor por defecto en la actualización
    @Mapping(target = "unidadMedida", source = "unidadMedida", defaultValue = "pza")
    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(PiezaRequestDto dto, @MappingTarget Pieza pieza);
}