package com.metalmod.core.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "maquina_pieza")
public class MaquinaPieza {
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
    @JoinColumn(name = "id_pieza", nullable = false)
    private Pieza idPieza;

    @NotNull
    @Column(name = "tiempo_ciclo_seg", nullable = false)
    private Integer tiempoCicloSeg;


}