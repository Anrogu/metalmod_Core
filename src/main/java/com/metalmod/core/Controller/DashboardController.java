package com.metalmod.core.Controller;

import com.metalmod.core.Dto.RefaccionDto;
import com.metalmod.core.Service.DashboardExcelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardExcelService dashboardExcelService;

    public DashboardController(DashboardExcelService dashboardExcelService) {
        this.dashboardExcelService = dashboardExcelService;
    }

    // Lee el excel desde OneDrive/SharePoint (nube)
    @GetMapping("/metricas-excel")
    public ResponseEntity<List<RefaccionDto>> obtenerMetricas() {
        List<RefaccionDto> refacciones = dashboardExcelService.obtenerDatosDesdeNube();
        return ResponseEntity.ok(refacciones);
    }

    // Lee el excel desde un archivo subido manualmente (multipart/form-data)
    @PostMapping(value = "/metricas-upload", consumes = "multipart/form-data")
    public ResponseEntity<List<RefaccionDto>> obtenerMetricasDesdeArchivo(
            @RequestParam("file") MultipartFile file) {
        List<RefaccionDto> refacciones = dashboardExcelService.obtenerDatosDesdeArchivoLocal(file);
        return ResponseEntity.ok(refacciones);
    }
}