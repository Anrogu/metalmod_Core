package com.metalmod.core.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "mantenimiento")
public class Mantenimiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_maquina", nullable = false)
    private Maquina idMaquina;

    @NotNull
    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Size(max = 255)
    @NotNull
    @Column(name = "falla", nullable = false)
    private String falla;

    @Size(max = 255)
    @Column(name = "solucion")
    private String solucion;

    @Size(max = 150)
    @Column(name = "proveedor", length = 150)
    private String proveedor;

    @Column(name = "costo", precision = 12, scale = 2)
    private BigDecimal costo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_refaccion")
    private Refaccion idRefaccion;


}