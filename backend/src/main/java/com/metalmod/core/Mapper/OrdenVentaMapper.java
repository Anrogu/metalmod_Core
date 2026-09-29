package com.metalmod.core.Mapper;

import com.metalmod.core.Dto.OrdenVentaRequestDto;
import com.metalmod.core.Dto.OrdenVentaResponseDto;
import com.metalmod.core.Entity.OrdenVenta;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

// El parámetro 'uses' le dice a MapStruct que utilice otros mappers
// para convertir las listas anidadas (ej. List<DetalleOrdenVenta>).
@Mapper(componentModel = "spring", uses = {DetalleOrdenVentaMapper.class})
public interface OrdenVentaMapper {

    // 1. Entidad -> DTO de Salida (Response)
    @Mapping(source = "idCliente.nombre", target = "nombreCliente") // Cambia "nombre" si tu Cliente usa "razonSocial"
    @Mapping(source = "idUsuarioCreo.username", target = "usernameCreo") // Asumiendo relación private Usuario usuarioCreo;
    @Mapping(source = "idEstado.nombre", target = "estadoActual") // Cambia "descripcion" si el estado usa "nombre" o "codigo"
    OrdenVentaResponseDto toResponse(OrdenVenta ordenVenta);


// 2. DTO de Entrada (Request) -> Entidad
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "idCliente", ignore = true)
    @Mapping(target = "idUsuarioCreo", ignore = true)
    @Mapping(target = "idEstado", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "detalles", ignore = true) // <-- EL CAMBIO CLAVE ESTÁ AQUÍ
    OrdenVenta toEntity(OrdenVentaRequestDto request);
}