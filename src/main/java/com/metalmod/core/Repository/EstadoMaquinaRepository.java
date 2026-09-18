package com.metalmod.core.Repository;

import com.metalmod.core.Entity.EstadoMaquina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstadoMaquinaRepository extends JpaRepository<EstadoMaquina, Short> {

    Optional<EstadoMaquina> findByCodigo(String codigo);
}