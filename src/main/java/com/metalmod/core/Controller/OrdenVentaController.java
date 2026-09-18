package com.metalmod.core.Controller;

import com.metalmod.core.Dto.OrdenVentaRequestDto;
import com.metalmod.core.Dto.OrdenVentaResponseDto;
import com.metalmod.core.Service.OrdenVentaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ordenes-venta")
public class OrdenVentaController {

    private final OrdenVentaService ordenVentaService;

    public OrdenVentaController(OrdenVentaService ordenVentaService) {
        this.ordenVentaService = ordenVentaService;
    }

    @PostMapping
    public ResponseEntity<OrdenVentaResponseDto> crearOrden(@Valid @RequestBody OrdenVentaRequestDto request) {
        OrdenVentaResponseDto response = ordenVentaService.crearOrden(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // NUEVO ENDPOINT: Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<OrdenVentaResponseDto> obtenerOrdenPorId(@PathVariable Long id) {
        OrdenVentaResponseDto response = ordenVentaService.obtenerPorId(id);
        return ResponseEntity.ok(response);
    }
}