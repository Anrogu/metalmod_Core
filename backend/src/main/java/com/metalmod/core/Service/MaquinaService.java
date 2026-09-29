package com.metalmod.core.Service;

import com.metalmod.core.Dto.MaquinaRequestDto;
import com.metalmod.core.Dto.MaquinaResponseDto;
import com.metalmod.core.Entity.EstadoMaquina;
import com.metalmod.core.Entity.Maquina;
import com.metalmod.core.Entity.Marca;
import com.metalmod.core.Entity.Modelo;
import com.metalmod.core.Mapper.MaquinaMapper;
import com.metalmod.core.Repository.EstadoMaquinaRepository;
import com.metalmod.core.Repository.MaquinaRepository;
import com.metalmod.core.Repository.MarcaRepository;
import com.metalmod.core.Repository.ModeloRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MaquinaService {

    private static final String CODIGO_ESTADO_INICIAL = "activa";

    private final MaquinaRepository maquinaRepository;
    private final MarcaRepository marcaRepository;
    private final ModeloRepository modeloRepository;
    private final EstadoMaquinaRepository estadoMaquinaRepository;
    private final MaquinaMapper maquinaMapper;

    public MaquinaService(MaquinaRepository maquinaRepository,
                          MarcaRepository marcaRepository,
                          ModeloRepository modeloRepository,
                          EstadoMaquinaRepository estadoMaquinaRepository,
                          MaquinaMapper maquinaMapper) {
        this.maquinaRepository = maquinaRepository;
        this.marcaRepository = marcaRepository;
        this.modeloRepository = modeloRepository;
        this.estadoMaquinaRepository = estadoMaquinaRepository;
        this.maquinaMapper = maquinaMapper;
    }

    @Transactional
    public MaquinaResponseDto crear(MaquinaRequestDto request) {
        Maquina maquina = maquinaMapper.toEntity(request);
        maquina.setIdMarca(resolverMarca(request.idMarca()));
        maquina.setIdModelo(resolverModelo(request.idModelo()));
        maquina.setIdEstado(estadoPorCodigo(CODIGO_ESTADO_INICIAL));

        return maquinaMapper.toResponse(maquinaRepository.save(maquina));
    }

    public MaquinaResponseDto obtenerPorId(Long id) {
        return maquinaMapper.toResponse(buscarOLanzar(id));
    }

    public List<MaquinaResponseDto> listar(String nombre) {
        List<Maquina> maquinas = (nombre != null && !nombre.isBlank())
                ? maquinaRepository.findByNombreContainingIgnoreCase(nombre)
                : maquinaRepository.findAll();

        return maquinas.stream().map(maquinaMapper::toResponse).toList();
    }

    @Transactional
    public MaquinaResponseDto actualizar(Long id, MaquinaRequestDto request) {
        Maquina maquina = buscarOLanzar(id);
        maquinaMapper.aplicarDatos(maquina, request);
        maquina.setIdMarca(resolverMarca(request.idMarca()));
        maquina.setIdModelo(resolverModelo(request.idModelo()));

        return maquinaMapper.toResponse(maquinaRepository.save(maquina));
    }

    @Transactional
    public MaquinaResponseDto cambiarEstado(Long id, String codigoEstado) {
        Maquina maquina = buscarOLanzar(id);
        maquina.setIdEstado(estadoPorCodigo(codigoEstado));
        return maquinaMapper.toResponse(maquinaRepository.save(maquina));
    }

    private Marca resolverMarca(Long idMarca) {
        if (idMarca == null) return null;
        return marcaRepository.findById(idMarca)
                .orElseThrow(() -> new EntityNotFoundException("La marca con id " + idMarca + " no existe."));
    }

    private Modelo resolverModelo(Long idModelo) {
        if (idModelo == null) return null;
        return modeloRepository.findById(idModelo)
                .orElseThrow(() -> new EntityNotFoundException("El modelo con id " + idModelo + " no existe."));
    }

    private EstadoMaquina estadoPorCodigo(String codigo) {
        return estadoMaquinaRepository.findByCodigo(codigo)
                .orElseThrow(() -> new IllegalArgumentException("Estado de maquina invalido: " + codigo));
    }

    private Maquina buscarOLanzar(Long id) {
        return maquinaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("La maquina con id " + id + " no existe."));
    }
}   