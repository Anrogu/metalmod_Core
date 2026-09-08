package com.metalmod.core.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "maquina_refaccion")
public class MaquinaRefaccion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_maquina", nullable = false)
    private Maquina idMaquina;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_refaccion", nullable = false)
    private Refaccion idRefaccion;

    @Column(name = "fecha_ultimo_cambio")
    private LocalDate fechaUltimoCambio;

    @Column(name = "vida_util_horas")
    private Integer vidaUtilHoras;

    @Column(name = "proximo_mantenimiento")
    private LocalDate proximoMantenimiento;


}