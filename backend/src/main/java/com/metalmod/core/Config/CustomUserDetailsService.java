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
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    // @Transactional: usuario.getIdRol() es LAZY. El login ocurre en un filtro de
    // seguridad (antes del MVC), donde no hay sesion de Hibernate abierta.
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        GrantedAuthority authority = new SimpleGrantedAuthority(
                "ROLE_" + usuario.getIdRol().getNombre().trim().toUpperCase(Locale.ROOT));

        return User.withUsername(usuario.getUsername())
                .password(usuario.getPasswordHash()) // hash BCrypt guardado en la BD
                .authorities(authority)
                .disabled(!Boolean.TRUE.equals(usuario.getActivo())) // usuarios con activo=false no entran
                .build();
    }
}
