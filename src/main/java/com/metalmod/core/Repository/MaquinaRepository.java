package com.metalmod.core.Repository;

import com.metalmod.core.Entity.Maquina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaquinaRepository extends JpaRepository<Maquina, Long> {

    List<Maquina> findByNombreContainingIgnoreCase(String nombre);
}