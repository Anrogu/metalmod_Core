package com.metalmod.core.Service;

import com.metalmod.core.Dto.ModeloRequestDto;
import com.metalmod.core.Dto.ModeloResponseDto;
import com.metalmod.core.Entity.Modelo;
import com.metalmod.core.Repository.ModeloRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ModeloService {

    private final ModeloRepository modeloRepository;

    public ModeloService(ModeloRepository modeloRepository) {
        this.modeloRepository = modeloRepository;
    }

    public List<ModeloResponseDto> listar() {
        return modeloRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public ModeloResponseDto crear(ModeloRequestDto request) {
        Modelo modelo = new Modelo();
        modelo.setNombre(request.nombre());
        return toResponse(modeloRepository.save(modelo));
    }

    private ModeloResponseDto toResponse(Modelo modelo) {
        return new ModeloResponseDto(modelo.getId(), modelo.getNombre());
    }
}