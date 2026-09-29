package com.metalmod.core.Controller;

import com.metalmod.core.Dto.TecnicoRequestDto;
import com.metalmod.core.Dto.TecnicoResponseDto;
import com.metalmod.core.Dto.TipoMantenimientoResponseDto;
import com.metalmod.core.Service.TecnicoService;
import com.metalmod.core.Service.TipoMantenimientoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tipo")
public class TipoMantenimientoController {

    private final TipoMantenimientoService tipoMantenimientoService;

    public TipoMantenimientoController(TipoMantenimientoService tipoMantenimientoService) {
        this.tipoMantenimientoService = tipoMantenimientoService;
    }

    @GetMapping
    public ResponseEntity<List<TipoMantenimientoResponseDto>> listar() {
        return ResponseEntity.ok(tipoMantenimientoService.listar());
    }
}