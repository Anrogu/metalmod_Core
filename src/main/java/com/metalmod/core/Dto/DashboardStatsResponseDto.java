package com.metalmod.core.Dto;

import java.util.List;

public record DashboardStatsResponseDto(
        long registros,
        long maquinas,
        ConteoDto refaccionMasPedida,
        ConteoDto maquinaConMasFallas,
        List<ConteoDto> topRefacciones,
        List<ConteoDto> fallasPorMaquina
) {
    public record ConteoDto(String nombre, long conteo) {
    }
}