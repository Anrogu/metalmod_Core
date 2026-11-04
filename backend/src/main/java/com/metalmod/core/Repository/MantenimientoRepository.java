package com.metalmod.core.Repository;

import com.metalmod.core.Entity.Mantenimiento;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MantenimientoRepository extends JpaRepository<Mantenimiento, Long> {

    // --- MÉTODOS PARA EL CRUD (Listado en tabla, mas reciente primero) ---
    List<Mantenimiento> findByIdMaquina_IdOrderByFechaDescIdDesc(Long idMaquina);

    List<Mantenimiento> findByIdMaquina_IdAndFechaBetweenOrderByFechaDescIdDesc(
            Long idMaquina, LocalDate desde, LocalDate hasta);

    List<Mantenimiento> findByIdMaquina_IdAndFechaGreaterThanEqualOrderByFechaDescIdDesc(
            Long idMaquina, LocalDate desde);

    List<Mantenimiento> findByIdMaquina_IdAndFechaLessThanEqualOrderByFechaDescIdDesc(
            Long idMaquina, LocalDate hasta);

    List<Mantenimiento> findByFechaBetweenOrderByFechaDescIdDesc(LocalDate desde, LocalDate hasta);

    List<Mantenimiento> findByFechaGreaterThanEqualOrderByFechaDescIdDesc(LocalDate desde);

    List<Mantenimiento> findByFechaLessThanEqualOrderByFechaDescIdDesc(LocalDate hasta);

    List<Mantenimiento> findAllByOrderByFechaDescIdDesc();
    // ---------------------------------------------------------------------

    // Trae maquina, marca, refaccion, tecnico y tipo ya resueltos en una sola
    // query (evita N+1 al mapear al dashboard).
    @Query("""
            SELECT m FROM Mantenimiento m
            JOIN FETCH m.idMaquina mq
            LEFT JOIN FETCH mq.idMarca
            LEFT JOIN FETCH m.idRefaccion
            LEFT JOIN FETCH m.tecnico
            LEFT JOIN FETCH m.tipoMantenimiento
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