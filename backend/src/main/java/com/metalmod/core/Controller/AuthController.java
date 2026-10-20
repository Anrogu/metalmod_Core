package com.metalmod.core.Controller;

import com.metalmod.core.Dto.SesionResponseDto;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Login y logout los resuelve Spring Security (ver SecurityConfig):
 *   POST /api/v1/auth/login   (username, password)
 *   POST /api/v1/auth/logout
 * Este endpoint le dice al frontend si hay sesion activa y con que rol.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @GetMapping("/me")
    public SesionResponseDto me(Authentication authentication) {
        String rol = authentication.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replaceFirst("^ROLE_", ""))
                .orElse("");
        return new SesionResponseDto(authentication.getName(), rol);
    }
}
