package com.metalmod.core.Service;

import com.metalmod.core.Dto.PlanProduccionRequestDto;
import com.metalmod.core.Dto.PlanProduccionResponseDto;
import com.metalmod.core.Entity.DetalleOrdenVenta;
import com.metalmod.core.Entity.EstadoPlanProduccion;
import com.metalmod.core.Entity.Maquina;
import com.metalmod.core.Entity.PlanProduccion;
import com.metalmod.core.Entity.Usuario;
import com.metalmod.core.Mapper.PlanProduccionMapper;
import com.metalmod.core.Repository.DetalleOrdenVentaRepository;
import com.metalmod.core.Repository.EstadoPlanProduccionRepository;
import com.metalmod.core.Repository.MaquinaRepository;
import com.metalmod.core.Repository.PlanProduccionRepository;
import com.metalmod.core.Repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class PlanProduccionService {

    private final PlanProduccionRepository planProduccionRepository;
    private final DetalleOrdenVentaRepository detalleOrdenVentaRepository;
    private final MaquinaRepository maquinaRepository;
    private final EstadoPlanProduccionRepository estadoPlanRepository;
    private final UsuarioRepository usuarioRepository;
    private final PlanProduccionMapper planProduccionMapper;

    public PlanProduccionService(PlanProduccionRepository planProduccionRepository,
                                 DetalleOrdenVentaRepository detalleOrdenVentaRepository,
                                 MaquinaRepository maquinaRepository,
                                 EstadoPlanProduccionRepository estadoPlanRepository,
                                 UsuarioRepository usuarioRepository,
                                 PlanProduccionMapper planProduccionMapper) {
        this.planProduccionRepository = planProduccionRepository;
        this.detalleOrdenVentaRepository = detalleOrdenVentaRepository;
        this.maquinaRepository = maquinaRepository;
        this.estadoPlanRepository = estadoPlanRepository;
        this.usuarioRepository = usuarioRepository;
        this.planProduccionMapper = planProduccionMapper;
    }

    @Transactional
    public PlanProduccionResponseDto programarProduccion(PlanProduccionRequestDto request) {
        DetalleOrdenVenta detalle = detalleOrdenVentaRepository.findById(request.idDetalleOrdenVenta())
                .orElseThrow(() -> new IllegalArgumentException("El detalle de orden de venta no existe."));
        Maquina maquina = maquinaRepository.findById(request.idMaquina())
                .orElseThrow();
        if (maquina.getIdEstado().getId() == 3L) {
            throw new IllegalStateException("No se puede programar en una máquina que se encuentra en Mantenimiento.");
        }
        EstadoPlanProduccion estadoInicial = estadoPlanRepository.findById(1L)
                .orElseThrow(() -> new IllegalStateException("Estado de plan de producción inicial no configurado."));
        Usuario usuarioPlaneo = usuarioRepository.findById(1L)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado."));
        PlanProduccion plan = planProduccionMapper.toEntity(request);
        plan.setIdDetalleOrdenVenta(detalle);
        plan.setIdMaquina(maquina);
        plan.setIdEstado(estadoInicial);
        plan.setIdUsuarioPlaneo(usuarioPlaneo);
        Instant ahora = Instant.now();
        plan.setCreatedAt(ahora);
        plan.setUpdatedAt(ahora);

        PlanProduccion guardado = planProduccionRepository.save(plan);
        return planProduccionMapper.toResponse(guardado);
    }
}