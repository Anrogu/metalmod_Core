package com.metalmod.core.Mapper;

import com.metalmod.core.Dto.MantenimientoRequestDto;
import com.metalmod.core.Dto.MantenimientoResponseDto;
import com.metalmod.core.Entity.Mantenimiento;
import com.metalmod.core.Entity.Maquina;
import com.metalmod.core.Entity.Refaccion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MantenimientoMapper {

    // La resolución de Maquina/Refaccion (buscar por id) se hace en el Service,
    // este mapper solo arma la entidad con lo que ya viene resuelto.
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "idMaquina", source = "maquina")
    @Mapping(target = "idRefaccion", source = "refaccion")
    @Mapping(target = "fecha", source = "dto.fecha")
    @Mapping(target = "falla", source = "dto.falla")
    @Mapping(target = "solucion", source = "dto.solucion")
    @Mapping(target = "proveedor", source = "dto.proveedor")
    @Mapping(target = "costo", source = "dto.costo")
    @Mapping(target = "tecnico", source = "dto.tecnico")
    @Mapping(target = "tiempoInvertidoMinutos", source = "dto.tiempoInvertidoMinutos")
    Mantenimiento toEntity(MantenimientoRequestDto dto, Maquina maquina, Refaccion refaccion);

    // MapStruct maneja los nulos anidados: si idRefaccion es null,
    // idRefaccion y nombreRefaccion quedan en null sin lanzar NPE.
    @Mapping(target = "idMaquina", source = "idMaquina.id")
    @Mapping(target = "nombreMaquina", source = "idMaquina.nombre")
    @Mapping(target = "idRefaccion", source = "idRefaccion.id")
    @Mapping(target = "nombreRefaccion", source = "idRefaccion.nombre")
    MantenimientoResponseDto toResponse(Mantenimiento mantenimiento);
}