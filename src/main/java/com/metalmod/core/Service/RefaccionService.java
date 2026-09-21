package com.metalmod.core.Service;

import com.metalmod.core.Dto.RefaccionRequestDto;
import com.metalmod.core.Dto.RefaccionResponseDto;
import com.metalmod.core.Entity.Refaccion;
import com.metalmod.core.Mapper.RefaccionMapper;
import com.metalmod.core.Repository.RefaccionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RefaccionService {

    private final RefaccionRepository refaccionRepository;
    private final RefaccionMapper refaccionMapper;

    public RefaccionService(RefaccionRepository refaccionRepository, RefaccionMapper refaccionMapper) {
        this.refaccionRepository = refaccionRepository;
        this.refaccionMapper = refaccionMapper;
    }

    @Transactional
    public RefaccionResponseDto crear(RefaccionRequestDto request) {
        Refaccion refaccion = refaccionMapper.toEntity(request);
        return refaccionMapper.toResponse(refaccionRepository.save(refaccion));
    }

    public RefaccionResponseDto obtenerPorId(Long id) {
        return refaccionMapper.toResponse(buscarOLanzar(id));
    }

    public List<RefaccionResponseDto> listar(String nombre) {
        List<Refaccion> refacciones = (nombre != null && !nombre.isBlank())
                ? refaccionRepository.findByNombreContainingIgnoreCase(nombre)
                : refaccionRepository.findAll();

        return refacciones.stream().map(refaccionMapper::toResponse).toList();
    }

    @Transactional
    public RefaccionResponseDto actualizar(Long id, RefaccionRequestDto request) {
        Refaccion refaccion = buscarOLanzar(id);
        refaccionMapper.aplicarDatos(refaccion, request);
        return refaccionMapper.toResponse(refaccionRepository.save(refaccion));
    }

    // Sin columna "activo": si esta referenciada por mantenimiento/maquina_refaccion,
    // el borrado fisico falla por FK. Es intencional, igual que Pieza.
    @Transactional
    public void eliminar(Long id) {
        refaccionRepository.delete(buscarOLanzar(id));
    }

    private Refaccion buscarOLanzar(Long id) {
        return refaccionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("La refaccion con id " + id + " no existe."));
    }
}