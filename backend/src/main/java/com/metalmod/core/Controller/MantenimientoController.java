package com.metalmod.core.Controller;

import com.metalmod.core.Dto.MantenimientoRequestDto;
import com.metalmod.core.Dto.MantenimientoResponseDto;
import com.metalmod.core.Service.MantenimientoService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/mantenimientos")
public class MantenimientoController {

    private final MantenimientoService mantenimientoService;

    public MantenimientoController(MantenimientoService mantenimientoService) {
        this.mantenimientoService = mantenimientoService;
    }

    @PostMapping
    public ResponseEntity<MantenimientoResponseDto> registrar(@Valid @RequestBody MantenimientoRequestDto request) {
        return new ResponseEntity<>(mantenimientoService.registrar(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MantenimientoResponseDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(mantenimientoService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<MantenimientoResponseDto>> listar(
            @RequestParam(required = false) Long idMaquina,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(mantenimientoService.listar(idMaquina, desde, hasta));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        mantenimientoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}