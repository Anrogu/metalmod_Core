package com.metalmod.core.Service;

import com.metalmod.core.Dto.MarcaRequestDto;
import com.metalmod.core.Dto.MarcaResponseDto;
import com.metalmod.core.Entity.Marca;
import com.metalmod.core.Repository.MarcaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MarcaService {

    private final MarcaRepository marcaRepository;

    public MarcaService(MarcaRepository marcaRepository) {
        this.marcaRepository = marcaRepository;
    }

    public List<MarcaResponseDto> listar() {
        return marcaRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public MarcaResponseDto crear(MarcaRequestDto request) {
        Marca marca = new Marca();
        marca.setNombre(request.nombre());
        return toResponse(marcaRepository.save(marca));
    }

    private MarcaResponseDto toResponse(Marca marca) {
        return new MarcaResponseDto(marca.getId(), marca.getNombre());
    }
}