package com.metalmod.core.Mapper;

import com.metalmod.core.Dto.MantenimientoRequestDto;
import com.metalmod.core.Dto.MantenimientoResponseDto;
import com.metalmod.core.Entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MantenimientoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "idMaquina", source = "maquina")
    @Mapping(target = "idRefaccion", source = "refaccion")
    @Mapping(target = "fecha", source = "dto.fecha")
    @Mapping(target = "falla", source = "dto.falla")
    @Mapping(target = "solucion", source = "dto.solucion")
    @Mapping(target = "proveedor", source = "dto.proveedor")
    @Mapping(target = "costo", source = "dto.costo")
    @Mapping(target = "tecnico", source = "tecnico")
    @Mapping(target = "tipoMantenimiento", source = "tipoMantenimiento")
    @Mapping(target = "tiempoInvertidoMinutos", source = "dto.tiempoInvertidoMinutos")
    Mantenimiento toEntity(MantenimientoRequestDto dto, Maquina maquina, Refaccion refaccion, Tecnico tecnico, TipoMantenimiento tipoMantenimiento);

    @Mapping(target = "idMaquina", source = "idMaquina.id")
    @Mapping(target = "nombreMaquina", source = "idMaquina.nombre")
    @Mapping(target = "idRefaccion", source = "idRefaccion.id")
    @Mapping(target = "nombreRefaccion", source = "idRefaccion.nombre")
    @Mapping(target = "idTecnico", source = "tecnico.id")
    @Mapping(target = "nombreTecnico", source = "tecnico.nombre")
    @Mapping(target = "tipoMantenimiento", source = "tipoMantenimiento.id")
    @Mapping(target = "nombreTipoMantenimiento", source = "tipoMantenimiento.nombre") // <-- Agregado aquí para pasarlo al DTO de respuesta
    MantenimientoResponseDto toResponse(Mantenimiento mantenimiento);
}