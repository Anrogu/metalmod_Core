package com.metalmod.core.Mapper;

import ch.qos.logback.core.model.ComponentModel;
import com.metalmod.core.Dto.DetalleOrdenVentaRequestDto;
import com.metalmod.core.Dto.DetalleOrdenVentaResponseDto;
import com.metalmod.core.Entity.DetalleOrdenVenta;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface    DetalleOrdenVentaMapper {
    @Mapping(source = "idPieza.nombre", target = "numeroPieza") // Extrae el nombre de la Pieza
    @Mapping(source = "idPieza.descripcion", target = "descripcionPieza") // Extrae la descripción
    @Mapping(source = "idEstado.nombre", target = "estadoActual") // Extrae el nombre del estado (ej. "Pendiente")
        // Eliminamos el mapeo erróneo del ID. Al no poner nada, MapStruct mapeará
        // el campo 'id' de DetalleOrdenVenta al campo 'id' del DTO automáticamente.
    DetalleOrdenVentaResponseDto toResponse(DetalleOrdenVenta detalle);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "idPieza", ignore = true)
    @Mapping(target = "idOrdenVenta", ignore = true) // La orden se asigna en el servicio al procesar la lista de detalles
    @Mapping(target = "idEstado", ignore = true)
    DetalleOrdenVenta toEntity(DetalleOrdenVentaRequestDto request);
}
