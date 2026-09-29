package com.metalmod.core.Controller;

import com.metalmod.core.Dto.ClienteRequestDto;
import com.metalmod.core.Dto.ClienteResponseDto;
import com.metalmod.core.Service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @PostMapping
    public ResponseEntity<ClienteResponseDto> crear(@Valid @RequestBody ClienteRequestDto request) {
        return new ResponseEntity<>(clienteService.crear(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponseDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<ClienteResponseDto>> listar(
            @RequestParam(required = false) String nombre) {
        return ResponseEntity.ok(clienteService.listar(nombre));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponseDto> actualizar(
            @PathVariable Long id, @Valid @RequestBody ClienteRequestDto request) {
        return ResponseEntity.ok(clienteService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        clienteService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}