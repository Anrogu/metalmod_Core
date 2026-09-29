package com.metalmod.core.Service;

import com.metalmod.core.Dto.TecnicoRequestDto;
import com.metalmod.core.Dto.TecnicoResponseDto;
import com.metalmod.core.Dto.TipoMantenimientoRequestDto;
import com.metalmod.core.Dto.TipoMantenimientoResponseDto;
import com.metalmod.core.Entity.Tecnico;
import com.metalmod.core.Entity.TipoMantenimiento;
import com.metalmod.core.Repository.TipoMantenimientoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TipoMantenimientoService {

    private final TipoMantenimientoRepository tipoMantenimientoRepository;

    public TipoMantenimientoService(TipoMantenimientoRepository tipoMantenimientoRepository) {
        this.tipoMantenimientoRepository = tipoMantenimientoRepository;
    }

    public List<TipoMantenimientoResponseDto> listar() {
        return tipoMantenimientoRepository.findAll().stream().map(this::toResponse).toList();
    }


    private TipoMantenimientoResponseDto toResponse(TipoMantenimiento tipoMantenimiento) {

        return new TipoMantenimientoResponseDto(tipoMantenimiento.getId(), tipoMantenimiento.getCodigo(), tipoMantenimiento.getNombre());
    }
}