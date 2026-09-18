package com.metalmod.core.Controller;

import com.metalmod.core.Dto.ModeloRequestDto;
import com.metalmod.core.Dto.ModeloResponseDto;
import com.metalmod.core.Service.ModeloService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/modelos")
public class ModeloController {

    private final ModeloService modeloService;

    public ModeloController(ModeloService modeloService) {
        this.modeloService = modeloService;
    }

    @GetMapping
    public ResponseEntity<List<ModeloResponseDto>> listar() {
        return ResponseEntity.ok(modeloService.listar());
    }

    @PostMapping
    public ResponseEntity<ModeloResponseDto> crear(@Valid @RequestBody ModeloRequestDto request) {
        return new ResponseEntity<>(modeloService.crear(request), HttpStatus.CREATED);
    }
}