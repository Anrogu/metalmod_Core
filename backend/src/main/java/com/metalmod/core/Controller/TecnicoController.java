package com.metalmod.core.Controller;

import com.metalmod.core.Dto.TecnicoRequestDto;
import com.metalmod.core.Dto.TecnicoResponseDto;
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

    /**
     * Por defecto devuelve todos (pantalla de administración). El formulario de
     * mantenimientos y las gráficas piden soloActivos=true.
     */
    @GetMapping
    public ResponseEntity<List<TecnicoResponseDto>> listar(
            @RequestParam(required = false) String nombre,
            @RequestParam(defaultValue = "false") boolean soloActivos) {
        return ResponseEntity.ok(tecnicoService.listar(nombre, soloActivos));
    }

    @PostMapping
    public ResponseEntity<TecnicoResponseDto> crear(@Valid @RequestBody TecnicoRequestDto request) {
        return new ResponseEntity<>(tecnicoService.crear(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TecnicoResponseDto> actualizar(
            @PathVariable Long id, @Valid @RequestBody TecnicoRequestDto request) {
        return ResponseEntity.ok(tecnicoService.actualizar(id, request));
    }

    // DELETE = baja lógica (activo=false), para conservar los mantenimientos
    // históricos que apuntan a este técnico.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        tecnicoService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
