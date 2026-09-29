package com.metalmod.core.Controller;

import com.metalmod.core.Dto.PiezaRequestDto;
import com.metalmod.core.Dto.PiezaResponseDto;
import com.metalmod.core.Service.PiezaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/piezas")
public class PiezaController {

    private final PiezaService piezaService;

    public PiezaController(PiezaService piezaService) {
        this.piezaService = piezaService;
    }

    @PostMapping
    public ResponseEntity<PiezaResponseDto> crear(@Valid @RequestBody PiezaRequestDto request) {
        return new ResponseEntity<>(piezaService.crear(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PiezaResponseDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(piezaService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<PiezaResponseDto>> listar(
            @RequestParam(required = false) String nombre) {
        return ResponseEntity.ok(piezaService.listar(nombre));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PiezaResponseDto> actualizar(
            @PathVariable Long id, @Valid @RequestBody PiezaRequestDto request) {
        return ResponseEntity.ok(piezaService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        piezaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}