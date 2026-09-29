package com.metalmod.core.Repository;

import com.metalmod.core.Entity.TipoMantenimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoMantenimientoRepository extends JpaRepository<TipoMantenimiento, Long> {
}