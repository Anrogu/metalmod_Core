package com.metalmod.core.Service;

import com.metalmod.core.Dto.MantenimientoRequestDto;
import com.metalmod.core.Dto.MantenimientoResponseDto;
import com.metalmod.core.Entity.*;
import com.metalmod.core.Mapper.MantenimientoMapper;
import com.metalmod.core.Repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MantenimientoService {

    private final MantenimientoRepository mantenimientoRepository;
    private final MaquinaRepository maquinaRepository;
    private final RefaccionRepository refaccionRepository;
    private final MantenimientoMapper mantenimientoMapper;
    private final TecnicoRepository tecnicoRepository;
    private final TipoMantenimientoRepository tipoMantenimientoRepository;

    public MantenimientoService(MantenimientoRepository mantenimientoRepository,
                                MaquinaRepository maquinaRepository,
                                RefaccionRepository refaccionRepository,
                                MantenimientoMapper mantenimientoMapper,
                                TecnicoRepository tecnicoRepository,
    TipoMantenimientoRepository tipoMantenimientoRepository) {
        this.mantenimientoRepository = mantenimientoRepository;
        this.maquinaRepository = maquinaRepository;
        this.refaccionRepository = refaccionRepository;
        this.tecnicoRepository = tecnicoRepository;
        this.mantenimientoMapper = mantenimientoMapper;
        this.tipoMantenimientoRepository = tipoMantenimientoRepository;
    }

    @Transactional
    public MantenimientoResponseDto registrar(MantenimientoRequestDto request) {
        Maquina maquina = maquinaRepository.findById(request.idMaquina())
                .orElseThrow(() -> new EntityNotFoundException(
                        "La maquina con id " + request.idMaquina() + " no existe."));

        Refaccion refaccion = null;
        if (request.idRefaccion() != null) {
            refaccion = refaccionRepository.findById(request.idRefaccion())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "La refaccion con id " + request.idRefaccion() + " no existe."));
        }
        Tecnico tecnico = null;
        if (request.idTecnico() != null) {
            tecnico = (Tecnico) tecnicoRepository.findById(request.idTecnico())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "El Tecnico con id " + request.idTecnico() + " no existe."));
        }
        TipoMantenimiento tipoMantenimiento = null;
        if (request.tipoMantenimiento() != null) {
            tipoMantenimiento = (TipoMantenimiento) tipoMantenimientoRepository.findById(request.tipoMantenimiento())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "El Tipo de mantenimientp con id " + request.tipoMantenimiento() + " no existe."));
        }
        Mantenimiento mantenimiento = mantenimientoMapper.toEntity(request, maquina, refaccion, tecnico, tipoMantenimiento);
        return mantenimientoMapper.toResponse(mantenimientoRepository.save(mantenimiento));
    }

    public MantenimientoResponseDto obtenerPorId(Long id) {
        return mantenimientoMapper.toResponse(buscarOLanzar(id));
    }

    // Sin filtros: todos. Con idMaquina: historial de esa maquina. Con rango de fechas: ese periodo.
    public List<MantenimientoResponseDto> listar(Long idMaquina, LocalDate desde, LocalDate hasta) {
        List<Mantenimiento> registros;

        if (idMaquina != null) {
            registros = mantenimientoRepository.findByIdMaquina_Id(idMaquina);
        } else if (desde != null && hasta != null) {
            registros = mantenimientoRepository.findByFechaBetween(desde, hasta);
        } else {
            registros = mantenimientoRepository.findAll();
        }

        return registros.stream().map(mantenimientoMapper::toResponse).toList();
    }

    @Transactional
    public void eliminar(Long id) {
        mantenimientoRepository.delete(buscarOLanzar(id));
    }

    private Mantenimiento buscarOLanzar(Long id) {
        return mantenimientoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("El ticket de mantenimiento con id " + id + " no existe."));
    }
}