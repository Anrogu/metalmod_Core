package com.metalmod.core.Controller;

import com.metalmod.core.Dto.RefaccionRequestDto;
import com.metalmod.core.Dto.RefaccionResponseDto;
import com.metalmod.core.Service.RefaccionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/refacciones")
public class RefaccionController {

    private final RefaccionService refaccionService;

    public RefaccionController(RefaccionService refaccionService) {
        this.refaccionService = refaccionService;
    }

    @PostMapping
    public ResponseEntity<RefaccionResponseDto> crear(@Valid @RequestBody RefaccionRequestDto request) {
        return new ResponseEntity<>(refaccionService.crear(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RefaccionResponseDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(refaccionService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<RefaccionResponseDto>> listar(
            @RequestParam(required = false) String nombre) {
        return ResponseEntity.ok(refaccionService.listar(nombre));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RefaccionResponseDto> actualizar(
            @PathVariable Long id, @Valid @RequestBody RefaccionRequestDto request) {
        return ResponseEntity.ok(refaccionService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        refaccionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}