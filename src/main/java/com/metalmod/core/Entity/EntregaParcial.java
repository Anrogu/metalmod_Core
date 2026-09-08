package com.metalmod.core.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "entrega_parcial")
public class EntregaParcial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "id_detalle_orden_venta", nullable = false)
    private DetalleOrdenVenta idDetalleOrdenVenta;

    @NotNull
    @Column(name = "cantidad_entregada", nullable = false)
    private Integer cantidadEntregada;

    @NotNull
    @Column(name = "fecha_entrega", nullable = false)
    private LocalDate fechaEntrega;

    @Size(max = 255)
    @Column(name = "observaciones")
    private String observaciones;


}