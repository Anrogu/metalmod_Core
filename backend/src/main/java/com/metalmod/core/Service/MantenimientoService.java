package com.metalmod.core.Service;

import com.metalmod.core.Dto.MantenimientoRequestDto;
import com.metalmod.core.Dto.MantenimientoResponseDto;
import com.metalmod.core.Entity.*;
import com.metalmod.core.Mapper.MantenimientoMapper;
import com.metalmod.core.Repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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

    // Sin filtros: todos. Los filtros se pueden combinar (maquina + rango
    // abierto/cerrado de fechas); antes, si venian maquina y fechas juntas, las
    // fechas se ignoraban.
    public List<MantenimientoResponseDto> listar(Long idMaquina, LocalDate desde, LocalDate hasta) {
        if (desde != null && hasta != null && desde.isAfter(hasta)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha 'desde' no puede ser posterior a 'hasta'.");
        }

        List<Mantenimiento> registros;

        if (idMaquina != null) {
            if (desde != null && hasta != null) {
                registros = mantenimientoRepository
                        .findByIdMaquina_IdAndFechaBetweenOrderByFechaDescIdDesc(idMaquina, desde, hasta);
            } else if (desde != null) {
                registros = mantenimientoRepository
                        .findByIdMaquina_IdAndFechaGreaterThanEqualOrderByFechaDescIdDesc(idMaquina, desde);
            } else if (hasta != null) {
                registros = mantenimientoRepository
                        .findByIdMaquina_IdAndFechaLessThanEqualOrderByFechaDescIdDesc(idMaquina, hasta);
            } else {
                registros = mantenimientoRepository
                        .findByIdMaquina_IdOrderByFechaDescIdDesc(idMaquina);
            }
        } else if (desde != null && hasta != null) {
            registros = mantenimientoRepository
                    .findByFechaBetweenOrderByFechaDescIdDesc(desde, hasta);
        } else if (desde != null) {
            registros = mantenimientoRepository
                    .findByFechaGreaterThanEqualOrderByFechaDescIdDesc(desde);
        } else if (hasta != null) {
            registros = mantenimientoRepository
                    .findByFechaLessThanEqualOrderByFechaDescIdDesc(hasta);
        } else {
            registros = mantenimientoRepository.findAllByOrderByFechaDescIdDesc();
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