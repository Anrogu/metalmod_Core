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
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class PlanProduccionService {

    private static final String CODIGO_MAQUINA_MANTENIMIENTO = "mantenimiento";
    private static final String CODIGO_ESTADO_PLAN_INICIAL = "programado";

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
                .orElseThrow(() -> new EntityNotFoundException(
                        "El detalle de orden de venta con id " + request.idDetalleOrdenVenta() + " no existe."));

        Maquina maquina = maquinaRepository.findById(request.idMaquina())
                .orElseThrow(() -> new EntityNotFoundException(
                        "La maquina con id " + request.idMaquina() + " no existe."));

        // Comparamos por codigo del catalogo, no por id numerico (el id puede variar entre ambientes)
        if (CODIGO_MAQUINA_MANTENIMIENTO.equalsIgnoreCase(maquina.getIdEstado().getCodigo())) {
            throw new IllegalStateException(
                    "No se puede programar en la maquina '" + maquina.getNombre() + "' porque esta en mantenimiento.");
        }

        EstadoPlanProduccion estadoInicial = estadoPlanRepository.findByCodigo(CODIGO_ESTADO_PLAN_INICIAL)
                .orElseThrow(() -> new IllegalStateException(
                        "El estado inicial de plan de produccion ('" + CODIGO_ESTADO_PLAN_INICIAL + "') no esta configurado."));

        Usuario usuarioPlaneo = usuarioAutenticado();

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

    private Usuario usuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Usuario autenticado no encontrado: " + username));
    }
}