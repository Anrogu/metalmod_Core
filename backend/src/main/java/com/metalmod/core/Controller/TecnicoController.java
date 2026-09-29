package com.metalmod.core.Controller;

import com.metalmod.core.Dto.MarcaRequestDto;
import com.metalmod.core.Dto.MarcaResponseDto;
import com.metalmod.core.Dto.TecnicoRequestDto;
import com.metalmod.core.Dto.TecnicoResponseDto;
import com.metalmod.core.Service.MarcaService;
import com.metalmod.core.Service.TecnicoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tecnicos")
public class TecnicoController {

    private final TecnicoService tecnicoService;

    public TecnicoController(TecnicoService tecnicoService) {
        this.tecnicoService = tecnicoService;
    }

    @GetMapping
    public ResponseEntity<List<TecnicoResponseDto>> listar() {
        return ResponseEntity.ok(tecnicoService.listar());
    }

    @PostMapping
    public ResponseEntity<TecnicoResponseDto> crear(@Valid @RequestBody TecnicoRequestDto request) {
        return new ResponseEntity<>(tecnicoService.crear(request), HttpStatus.CREATED);
    }
}