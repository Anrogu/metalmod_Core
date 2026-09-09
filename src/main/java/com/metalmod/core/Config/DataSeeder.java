package com.metalmod.core.Config;

import com.metalmod.core.Entity.Rol;
import com.metalmod.core.Entity.Usuario;
import com.metalmod.core.Repository.RolRepository;
import com.metalmod.core.Repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.LocalDateTime;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedAdminUser(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository, // <-- Inyectar RolRepository
            PasswordEncoder passwordEncoder) {

        return args -> {
            if (usuarioRepository.findByUsername("admin").isPresent()) {
                return; // ya existe, no hacer nada
            }

            // 1. Obtener o crear el rol ADMIN para evitar null en idRol
            Rol rolAdmin = rolRepository.findByNombre("Administrador")
                    .orElseGet(() -> {
                        Rol nuevoRol = new Rol();
                        nuevoRol.setNombre("Administrador");
                        return rolRepository.save(nuevoRol);
                    });

            Usuario admin = new Usuario();
            admin.setUsername("admin");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));

            // 2. Asignar los campos obligatorios
            admin.setIdRol(rolAdmin);
            admin.setActivo(true); // Cambiar a 1 si el tipo en tu entidad es Integer/Byte
            admin.setCreatedAt(Instant.now()); // O Instant.from(LocalDateTime.now())// Cambiar a new Date() si usas java.util.Date

            usuarioRepository.save(admin);
            System.out.println("Usuario admin creado con password encriptada.");
        };
    }
}