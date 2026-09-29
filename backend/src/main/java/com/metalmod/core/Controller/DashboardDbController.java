package com.metalmod.core.Controller;

import com.metalmod.core.Dto.DashboardStatsResponseDto;
import com.metalmod.core.Dto.MantenimientoDashboardRecordDto;
import com.metalmod.core.Service.DashboardDbService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardDbController {

    private final DashboardDbService dashboardDbService;

    public DashboardDbController(DashboardDbService dashboardDbService) {
        this.dashboardDbService = dashboardDbService;
    }

    // Para el panel "02 - Lecturas" (Registros, Maquinas, Refaccion mas pedida, etc.)
    @GetMapping("/estadisticas")
    public ResponseEntity<DashboardStatsResponseDto> obtenerEstadisticas() {
        return ResponseEntity.ok(dashboardDbService.obtenerEstadisticas());
    }

    // Para MetricsChart.jsx: reemplaza directamente al arreglo que hoy viene del Excel
    @GetMapping("/registros")
    public ResponseEntity<List<MantenimientoDashboardRecordDto>> obtenerRegistros() {
        return ResponseEntity.ok(dashboardDbService.obtenerRegistrosPlano());
    }
}