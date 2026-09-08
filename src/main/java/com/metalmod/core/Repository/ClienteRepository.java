package com.metalmod.core.Repository;

import com.metalmod.core.Entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    // Spring Data genera la query automaticamente a partir del nombre del metodo
    List<Cliente> findByNombreContainingIgnoreCase(String nombre);

    List<Cliente> findByActivoTrue();
}