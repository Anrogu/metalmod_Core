package com.metalmod.core.Repository;

import com.metalmod.core.Entity.Mantenimiento;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MantenimientoRepository extends JpaRepository<Mantenimiento, Long> {

    List<Mantenimiento> findByIdMaquina_Id(Long idMaquina);

    List<Mantenimiento> findByFechaBetween(LocalDate desde, LocalDate hasta);

    // Trae maquina y refaccion ya resueltas en una sola query (evita N+1 al mapear al dashboard)
    @Query("""
           SELECT m FROM Mantenimiento m
           JOIN FETCH m.idMaquina
           LEFT JOIN FETCH m.idRefaccion
           """)
    List<Mantenimiento> findAllConRelaciones();

    @Query("SELECT COUNT(DISTINCT m.idMaquina.id) FROM Mantenimiento m")
    long contarMaquinasConRegistro();

    // Top refacciones mas usadas en reparaciones (excluye tickets sin refaccion asociada)
    @Query("""
           SELECT r.nombre AS nombre, COUNT(m) AS conteo
           FROM Mantenimiento m JOIN m.idRefaccion r
           GROUP BY r.nombre
           ORDER BY COUNT(m) DESC
           """)
    List<ConteoPorNombre> topRefacciones(Pageable pageable);

    // Maquinas ordenadas por cantidad de fallas registradas
    @Query("""
           SELECT mq.nombre AS nombre, COUNT(m) AS conteo
           FROM Mantenimiento m JOIN m.idMaquina mq
           GROUP BY mq.nombre
           ORDER BY COUNT(m) DESC
           """)
    List<ConteoPorNombre> maquinasPorFallas(Pageable pageable);

    interface ConteoPorNombre {
        String getNombre();
        Long getConteo();
    }
}