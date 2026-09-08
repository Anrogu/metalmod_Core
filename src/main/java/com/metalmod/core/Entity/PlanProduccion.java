package com.metalmod.core.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "plan_produccion")
public class PlanProduccion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_detalle_orden_venta", nullable = false)
    private DetalleOrdenVenta idDetalleOrdenVenta;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_maquina", nullable = false)
    private Maquina idMaquina;

    @NotNull
    @Column(name = "cantidad_programada", nullable = false)
    private Integer cantidadProgramada;

    @NotNull
    @Column(name = "fecha_inicio_programada", nullable = false)
    private Instant fechaInicioProgramada;

    @NotNull
    @Column(name = "fecha_fin_programada", nullable = false)
    private Instant fechaFinProgramada;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @ColumnDefault("1")
    @JoinColumn(name = "id_estado", nullable = false)
    private EstadoPlanProduccion idEstado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_planeo")
    private Usuario idUsuarioPlaneo;

    @NotNull
    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @ColumnDefault("now()")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;


}