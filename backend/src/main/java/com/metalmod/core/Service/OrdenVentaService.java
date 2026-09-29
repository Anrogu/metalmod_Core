package com.metalmod.core.Service;

import com.metalmod.core.Dto.OrdenVentaRequestDto;
import com.metalmod.core.Dto.OrdenVentaResponseDto;
import com.metalmod.core.Entity.*;
import com.metalmod.core.Mapper.DetalleOrdenVentaMapper;
import com.metalmod.core.Mapper.OrdenVentaMapper;
import com.metalmod.core.Repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrdenVentaService {

    private final OrdenVentaRepository ordenVentaRepository;
    private final DetalleOrdenVentaRepository detalleRepository;
    private final ClienteRepository clienteRepository;
    private final PiezaRepository piezaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstadoOrdenVentaRepository estadoOrdenRepository;
    private final EstadoDetalleOrdenVentaRepository estadoDetalleRepository;

    private final OrdenVentaMapper ordenMapper;
    private final DetalleOrdenVentaMapper detalleMapper;

    public OrdenVentaService(OrdenVentaRepository ordenVentaRepository,
                             DetalleOrdenVentaRepository detalleRepository,
                             ClienteRepository clienteRepository,
                             PiezaRepository piezaRepository,
                             UsuarioRepository usuarioRepository,
                             EstadoOrdenVentaRepository estadoOrdenRepository,
                             EstadoDetalleOrdenVentaRepository estadoDetalleRepository,
                             OrdenVentaMapper ordenMapper,
                             DetalleOrdenVentaMapper detalleMapper) {
        this.ordenVentaRepository = ordenVentaRepository;
        this.detalleRepository = detalleRepository;
        this.clienteRepository = clienteRepository;
        this.piezaRepository = piezaRepository;
        this.usuarioRepository = usuarioRepository;
        this.estadoOrdenRepository = estadoOrdenRepository;
        this.estadoDetalleRepository = estadoDetalleRepository;
        this.ordenMapper = ordenMapper;
        this.detalleMapper = detalleMapper;
    }

    @Transactional
    public OrdenVentaResponseDto crearOrden(OrdenVentaRequestDto request) {
        // 1. Validar Cliente y Configuración Base
        Cliente cliente = clienteRepository.findById(request.idCliente())
                .orElseThrow(() -> new EntityNotFoundException("El cliente no existe."));

        // TODO: Extraer de SecurityContextHolder cuando JWT esté listo
        Usuario usuarioCreo = usuarioRepository.findById(1L)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado."));

        EstadoOrdenVenta estadoOrden = estadoOrdenRepository.findById(1L) // 1 = NUEVA
                .orElseThrow(() -> new IllegalStateException("Estado inicial de orden no configurado."));

        // 2. Mapear y Guardar la Cabecera (Orden)
        OrdenVenta orden = ordenMapper.toEntity(request);
        orden.setIdCliente(cliente);
        orden.setIdUsuarioCreo(usuarioCreo);
        orden.setIdEstado(estadoOrden);
        orden.setFechaCreacion(Instant.now());

        OrdenVenta ordenGuardada = ordenVentaRepository.save(orden);

        // 3. Procesar y Guardar los Detalles
        EstadoDetalleOrdenVenta estadoDetalle = estadoDetalleRepository.findById(1L) // 1 = PENDIENTE
                .orElseThrow(() -> new IllegalStateException("Estado inicial de detalle no configurado."));

        List<DetalleOrdenVenta> detallesGuardados = new ArrayList<>();

        request.detalles().forEach(detRequest -> {
            Pieza pieza = piezaRepository.findById(detRequest.idPieza())
                    .orElseThrow(() -> new EntityNotFoundException("La pieza ID " + detRequest.idPieza() + " no existe."));

            DetalleOrdenVenta detalle = detalleMapper.toEntity(detRequest);

            // Asignación manual utilizando los setters con el prefijo "id"
            detalle.setIdOrdenVenta(ordenGuardada);
            detalle.setIdPieza(pieza);
            detalle.setIdEstado(estadoDetalle);

            detallesGuardados.add(detalleRepository.save(detalle));
        });
        // 4. Adjuntar los detalles a la orden y retornar la respuesta
        ordenGuardada.setDetalles(detallesGuardados);
        return ordenMapper.toResponse(ordenGuardada);
    }
    // Método para obtener una orden por su ID
    public OrdenVentaResponseDto obtenerPorId(Long id) {
        OrdenVenta orden = ordenVentaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("La orden de venta con ID " + id + " no existe."));

        return ordenMapper.toResponse(orden);
    }
}