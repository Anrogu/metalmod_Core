package com.metalmod.core.Repository;

import com.metalmod.core.Entity.Rol; // Asegúrate de importar Rol, no Cliente
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {

    Optional<Rol> findByNombre(String nombre);

}