package com.metalmod.core.Controller;

import com.metalmod.core.Dto.MarcaRequestDto;
import com.metalmod.core.Dto.MarcaResponseDto;
import com.metalmod.core.Service.MarcaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/marcas")
public class MarcaController {

    private final MarcaService marcaService;

    public MarcaController(MarcaService marcaService) {
        this.marcaService = marcaService;
    }

    @GetMapping
    public ResponseEntity<List<MarcaResponseDto>> listar() {
        return ResponseEntity.ok(marcaService.listar());
    }

    @PostMapping
    public ResponseEntity<MarcaResponseDto> crear(@Valid @RequestBody MarcaRequestDto request) {
        return new ResponseEntity<>(marcaService.crear(request), HttpStatus.CREATED);
    }
}