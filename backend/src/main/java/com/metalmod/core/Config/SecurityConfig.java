package com.metalmod.core.Config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Los nombres salen de la tabla "rol" (Administrador, Tecnico) en mayusculas.
    private static final String ADMIN = "ADMINISTRADOR";
    private static final String TECNICO = "TECNICO";

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Reconoce los hashes $2a$ ya guardados en la tabla usuario.
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())

                // CSRF: el token viaja en la cookie XSRF-TOKEN y el frontend lo
                // devuelve en el header X-XSRF-TOKEN en cada POST/PUT/PATCH/DELETE.
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler()))
                .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)

                // ---- REGLAS DE ACCESO (el primer match gana; el orden importa) ----
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()

                        // Solo el administrador puede borrar cualquier cosa.
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/**").hasRole(ADMIN)

                        // Lo que el tecnico SI puede escribir en su trabajo diario:
                        .requestMatchers(HttpMethod.POST, "/api/v1/mantenimientos").hasAnyRole(ADMIN, TECNICO)
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/maquinas/*/estado").hasAnyRole(ADMIN, TECNICO)
                        .requestMatchers(HttpMethod.POST, "/api/v1/refacciones").hasAnyRole(ADMIN, TECNICO)
                        .requestMatchers(HttpMethod.PUT, "/api/v1/refacciones/*").hasAnyRole(ADMIN, TECNICO)

                        // Cualquier usuario con sesion puede consultar.
                        .requestMatchers(HttpMethod.GET, "/api/v1/**").authenticated()

                        // Cualquier otra escritura (maquinas, marcas, modelos, tecnicos, etc.): solo admin.
                        .requestMatchers("/api/v1/**").hasRole(ADMIN)

                        .anyRequest().authenticated()
                )

                // Login por formulario (application/x-www-form-urlencoded) pero con respuestas
                // para una SPA: nada de redirecciones ni paginas HTML.
                .formLogin(form -> form
                        .loginPage("/api/v1/auth/login") // evita la pagina de login generada por defecto
                        .loginProcessingUrl("/api/v1/auth/login")
                        .successHandler((req, res, auth) -> res.setStatus(HttpServletResponse.SC_NO_CONTENT))
                        .failureHandler((req, res, ex) ->
                                escribirError(res, HttpServletResponse.SC_UNAUTHORIZED,
                                        "Usuario o contraseña incorrectos"))
                )
                .logout(logout -> logout
                        .logoutUrl("/api/v1/auth/logout")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(HttpServletResponse.SC_NO_CONTENT))
                        .deleteCookies("JSESSIONID")
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) ->
                                escribirError(res, HttpServletResponse.SC_UNAUTHORIZED,
                                        "Sesión no iniciada o expirada"))
                        .accessDeniedHandler((req, res, e) ->
                                escribirError(res, HttpServletResponse.SC_FORBIDDEN,
                                        "No tienes permiso para esta acción. Si crees que es un error, recarga la página e inicia sesión de nuevo."))
                );

        return http.build();
    }

    // Mismo formato { "mensaje": ... } que usa GlobalExceptionHandler, para que
    // el frontend lo muestre sin cambios. Los textos son constantes (sin comillas).
    private static void escribirError(HttpServletResponse res, int status, String mensaje) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        res.getWriter().write("{\"mensaje\":\"" + mensaje + "\"}");
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://192.168.1.52:5173",
                "http://localhost:5173",
                "http://192.168.1.52:8081",
                "http://localhost:8081",
                "http://192.168.1.52",
                "http://localhost:5174"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
