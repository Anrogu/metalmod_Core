package com.metalmod.core.Repository;

import com.metalmod.core.Entity.Refaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefaccionRepository extends JpaRepository<Refaccion, Long> {

    List<Refaccion> findByNombreContainingIgnoreCase(String nombre);

    // Descuenta una unidad solo si hay existencias. Devuelve 1 si se desconto y
    // 0 si no habia stock, evitando condiciones de carrera entre peticiones.
    @Modifying
    @Query("update Refaccion r set r.cantidadStock = r.cantidadStock - 1 " +
            "where r.id = :id and r.cantidadStock > 0")
    int descontarUnaUnidad(@Param("id") Long id);

    // Devuelve una unidad al inventario (al eliminar un ticket que la desconto).
    @Modifying
    @Query("update Refaccion r set r.cantidadStock = r.cantidadStock + 1 where r.id = :id")
    int devolverUnaUnidad(@Param("id") Long id);
}
