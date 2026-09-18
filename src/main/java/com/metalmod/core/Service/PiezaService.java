package com.metalmod.core.Service;

import com.metalmod.core.Dto.PiezaRequestDto;
import com.metalmod.core.Dto.PiezaResponseDto;
import com.metalmod.core.Entity.Pieza;
import com.metalmod.core.Mapper.PiezaMapper;
import com.metalmod.core.Repository.PiezaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PiezaService {

    private final PiezaRepository piezaRepository;
    private final PiezaMapper piezaMapper;

    public PiezaService(PiezaRepository piezaRepository, PiezaMapper piezaMapper) {
        this.piezaRepository = piezaRepository;
        this.piezaMapper = piezaMapper;
    }

    @Transactional
    public PiezaResponseDto crear(PiezaRequestDto request) {
        Pieza pieza = piezaMapper.toEntity(request);
        return piezaMapper.toResponse(piezaRepository.save(pieza));
    }

    public PiezaResponseDto obtenerPorId(Long id) {
        return piezaMapper.toResponse(buscarOLanzar(id));
    }

    public List<PiezaResponseDto> listar(String nombre) {
        List<Pieza> piezas = (nombre != null && !nombre.isBlank())
                ? piezaRepository.findByNombreContainingIgnoreCase(nombre)
                : piezaRepository.findAll();

        return piezas.stream().map(piezaMapper::toResponse).toList();
    }

    @Transactional
    public PiezaResponseDto actualizar(Long id, PiezaRequestDto request) {
        Pieza pieza = buscarOLanzar(id);
        piezaMapper.updateEntityFromDto(request, pieza);
        return piezaMapper.toResponse(piezaRepository.save(pieza));
    }

    // Pieza no tiene columna "activo": si esta referenciada por ordenes/maquinas/clientes,
    // el borrado fisico va a fallar por FK. Eso es intencional (ver nota en la respuesta).
    @Transactional
    public void eliminar(Long id) {
        Pieza pieza = buscarOLanzar(id);
        piezaRepository.delete(pieza);
    }

    private Pieza buscarOLanzar(Long id) {
        return piezaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("La pieza con id " + id + " no existe."));
    }
}