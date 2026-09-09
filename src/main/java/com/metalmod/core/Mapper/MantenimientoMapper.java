package com.metalmod.core.Mapper;

import com.metalmod.core.Dto.MantenimientoRequestDto;
import com.metalmod.core.Dto.MantenimientoResponseDto;
import com.metalmod.core.Entity.Mantenimiento;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MantenimientoMapper {

    // 1. Entidad -> DTO de Salida (Response)
    // Extraemos datos de las entidades relacionadas (Maquina y Refaccion)
    @Mapping(source = "idMaquina.id", target = "idMaquina")
    @Mapping(source = "idMaquina.nombre", target = "numeroEconomicoMaquina")
    @Mapping(source = "idRefaccion.id", target = "idRefaccion")
    @Mapping(source = "idRefaccion.nombre", target = "nombreRefaccion")
    MantenimientoResponseDto toResponse(Mantenimiento mantenimiento);

    // 2. DTO de Entrada (Request) -> Entidad
    // Ignoramos el ID (se genera solo) y las entidades complejas (las buscamos en el Service)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "idMaquina", ignore = true)
    @Mapping(target = "idRefaccion", ignore = true)
    Mantenimiento toEntity(MantenimientoRequestDto request);
}