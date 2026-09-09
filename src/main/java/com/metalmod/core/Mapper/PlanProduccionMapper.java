package com.metalmod.core.Mapper;

import com.metalmod.core.Dto.PlanProduccionRequestDto;
import com.metalmod.core.Dto.PlanProduccionResponseDto;
import com.metalmod.core.Entity.PlanProduccion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PlanProduccionMapper {

    // 1. Entidad -> DTO de Salida (Response)
    // Extraemos los datos de contexto desde el Detalle de la Orden
    @Mapping(source = "idDetalleOrdenVenta.id", target = "idDetalleOrdenVenta")
    @Mapping(source = "idDetalleOrdenVenta.cantidad", target = "cantidadRequeridaOrden")
    @Mapping(source = "idDetalleOrdenVenta.fechaEntregaLinea", target = "fechaEntregaLinea")

    // Extraemos el nombre de la máquina (que funciona como número económico)
    @Mapping(source = "idMaquina.nombre", target = "numeroEconomicoMaquina")

    // Extraemos los metadatos y estados (Ajusta "descripcion" si tu estado usa "nombre")
    @Mapping(source = "idEstado.nombre", target = "estadoPlan")
    @Mapping(source = "idUsuarioPlaneo.username", target = "usernamePlaneador")
    PlanProduccionResponseDto toResponse(PlanProduccion planProduccion);

    // 2. DTO de Entrada (Request) -> Entidad
    // Ignoramos todo lo que el Service buscará en la base de datos o generará automáticamente
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "idDetalleOrdenVenta", ignore = true)
    @Mapping(target = "idMaquina", ignore = true)
    @Mapping(target = "idEstado", ignore = true)
    @Mapping(target = "idUsuarioPlaneo", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    PlanProduccion toEntity(PlanProduccionRequestDto request);
}