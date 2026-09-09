package com.metalmod.core.Repository;

import com.metalmod.core.Entity.Cliente;
import com.metalmod.core.Entity.PlanProduccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanProduccionRepository extends JpaRepository<PlanProduccion, Long> {


}