package com.metalmod.core.Controller;

import com.metalmod.core.Dto.CambiarEstadoMaquinaRequestDto;
import com.metalmod.core.Dto.MaquinaRequestDto;
import com.metalmod.core.Dto.MaquinaResponseDto;
import com.metalmod.core.Service.MaquinaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/maquinas")
public class MaquinaController {

    private final MaquinaService maquinaService;

    public MaquinaController(MaquinaService maquinaService) {
        this.maquinaService = maquinaService;
    }

    @PostMapping
    public ResponseEntity<MaquinaResponseDto> crear(@Valid @RequestBody MaquinaRequestDto request) {
        return new ResponseEntity<>(maquinaService.crear(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaquinaResponseDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(maquinaService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<MaquinaResponseDto>> listar(
            @RequestParam(required = false) String nombre) {
        return ResponseEntity.ok(maquinaService.listar(nombre));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaquinaResponseDto> actualizar(
            @PathVariable Long id, @Valid @RequestBody MaquinaRequestDto request) {
        return ResponseEntity.ok(maquinaService.actualizar(id, request));
    }

    // Cambiar estado es una accion aparte de editar los datos generales (activa / mantenimiento / baja)
    @PatchMapping("/{id}/estado")
    public ResponseEntity<MaquinaResponseDto> cambiarEstado(
            @PathVariable Long id, @Valid @RequestBody CambiarEstadoMaquinaRequestDto request) {
        return ResponseEntity.ok(maquinaService.cambiarEstado(id, request.codigoEstado()));
    }
}