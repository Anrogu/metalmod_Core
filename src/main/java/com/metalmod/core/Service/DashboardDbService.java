package com.metalmod.core.Service;

import com.metalmod.core.Dto.DashboardStatsResponseDto;
import com.metalmod.core.Dto.DashboardStatsResponseDto.ConteoDto;
import com.metalmod.core.Dto.MantenimientoDashboardRecordDto;
import com.metalmod.core.Entity.Mantenimiento;
import com.metalmod.core.Entity.Refaccion;
import com.metalmod.core.Repository.MantenimientoRepository;
import com.metalmod.core.Repository.MantenimientoRepository.ConteoPorNombre;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardDbService {

    private final MantenimientoRepository mantenimientoRepository;

    public DashboardDbService(MantenimientoRepository mantenimientoRepository) {
        this.mantenimientoRepository = mantenimientoRepository;
    }

    public DashboardStatsResponseDto obtenerEstadisticas() {
        List<ConteoDto> topRefacciones = aConteoDto(
                mantenimientoRepository.topRefacciones(PageRequest.of(0, 10)));

        List<ConteoDto> fallasPorMaquina = aConteoDto(
                mantenimientoRepository.maquinasPorFallas(PageRequest.of(0, 10)));

        ConteoDto refaccionMasPedida = topRefacciones.isEmpty() ? null : topRefacciones.get(0);
        ConteoDto maquinaConMasFallas = fallasPorMaquina.isEmpty() ? null : fallasPorMaquina.get(0);

        return new DashboardStatsResponseDto(
                mantenimientoRepository.count(),
                mantenimientoRepository.contarMaquinasConRegistro(),
                refaccionMasPedida,
                maquinaConMasFallas,
                topRefacciones,
                fallasPorMaquina
        );
    }

    // Lista plana para MetricsChart.jsx: un objeto {ma, refaccion, trimestre} por cada ticket
    public List<MantenimientoDashboardRecordDto> obtenerRegistrosPlano() {
        return mantenimientoRepository.findAllConRelaciones().stream()
                .map(this::aRegistroDashboard)
                .toList();
    }

    private MantenimientoDashboardRecordDto aRegistroDashboard(Mantenimiento m) {
        Refaccion refaccion = m.getIdRefaccion();
        return new MantenimientoDashboardRecordDto(
                m.getIdMaquina().getNombre(),
                refaccion != null ? refaccion.getNombre() : null,
                calcularTrimestre(m.getFecha())
        );
    }

    private String calcularTrimestre(LocalDate fecha) {
        if (fecha == null) {
            return "Desconocido";
        }
        int mes = fecha.getMonthValue();
        if (mes <= 3) return "Q1";
        if (mes <= 6) return "Q2";
        if (mes <= 9) return "Q3";
        return "Q4";
    }

    private List<ConteoDto> aConteoDto(List<ConteoPorNombre> proyecciones) {
        return proyecciones.stream()
                .map(p -> new ConteoDto(p.getNombre(), p.getConteo()))
                .toList();
    }
}