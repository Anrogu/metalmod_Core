package com.metalmod.core.Controller;

import com.metalmod.core.Dto.PlanProduccionRequestDto;
import com.metalmod.core.Dto.PlanProduccionResponseDto;
import com.metalmod.core.Service.PlanProduccionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/planes-produccion")
public class PlanProduccionController {

    private final PlanProduccionService planProduccionService;

    public PlanProduccionController(PlanProduccionService planProduccionService) {
        this.planProduccionService = planProduccionService;
    }

    @PostMapping
    public ResponseEntity<PlanProduccionResponseDto> programarProduccion(@Valid @RequestBody PlanProduccionRequestDto request) {
        PlanProduccionResponseDto response = planProduccionService.programarProduccion(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}