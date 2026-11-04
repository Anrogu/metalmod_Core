package com.metalmod.core.Repository;

import com.metalmod.core.Entity.Tecnico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TecnicoRepository extends JpaRepository<Tecnico, Long> {

    List<Tecnico> findAllByOrderByNombreAsc();

    List<Tecnico> findByActivoTrueOrderByNombreAsc();

    List<Tecnico> findByNombreContainingIgnoreCaseOrderByNombreAsc(String nombre);

    List<Tecnico> findByActivoTrueAndNombreContainingIgnoreCaseOrderByNombreAsc(String nombre);

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}
