package com.metalmod.core.Service;

import com.metalmod.core.Dto.TecnicoRequestDto;
import com.metalmod.core.Dto.TecnicoResponseDto;
import com.metalmod.core.Entity.Tecnico;
import com.metalmod.core.Repository.TecnicoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TecnicoService {

    private final TecnicoRepository tecnicoRepository;

    public TecnicoService(TecnicoRepository tecnicoRepository) {
        this.tecnicoRepository = tecnicoRepository;
    }

    public List<TecnicoResponseDto> listar() {
        return tecnicoRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public TecnicoResponseDto crear(TecnicoRequestDto request) {
        Tecnico tecnico = new Tecnico();
        tecnico.setNombre(request.nombre()); // Obtiene el nombre del Request DTO
        return toResponse(tecnicoRepository.save(tecnico));
    }

    private TecnicoResponseDto toResponse(Tecnico tecnico) {
        // Mapea la entidad Tecnico al Response DTO
        return new TecnicoResponseDto(tecnico.getId(), tecnico.getNombre());
    }
}