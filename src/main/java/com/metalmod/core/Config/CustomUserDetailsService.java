package com.metalmod.core.Config;

import com.metalmod.core.Entity.Usuario;
import com.metalmod.core.Repository.UsuarioRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        // usuario.getIdRol() devuelve el objeto Rol (el campo se llama idRol pero es la relacion completa)
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + usuario.getIdRol().getNombre().toUpperCase());

        return new User(
                usuario.getUsername(),
                usuario.getPasswordHash(), // debe venir ya encriptada con BCrypt en la BD
                List.of(authority)
        );
    }
}