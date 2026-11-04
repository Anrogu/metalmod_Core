package com.metalmod.core.Service;

import com.metalmod.core.Dto.TecnicoRequestDto;
import com.metalmod.core.Dto.TecnicoResponseDto;
import com.metalmod.core.Entity.Tecnico;
import com.metalmod.core.Repository.TecnicoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TecnicoService {

    private final TecnicoRepository tecnicoRepository;

    public TecnicoService(TecnicoRepository tecnicoRepository) {
        this.tecnicoRepository = tecnicoRepository;
    }

    /**
     * @param soloActivos true para el formulario de mantenimientos y las
     *                    gráficas; false para la pantalla de administración,
     *                    que también debe mostrar los dados de baja.
     */
    public List<TecnicoResponseDto> listar(String nombre, boolean soloActivos) {
        String filtro = (nombre == null || nombre.isBlank()) ? null : nombre.trim();

        List<Tecnico> tecnicos;
        if (filtro == null) {
            tecnicos = soloActivos
                    ? tecnicoRepository.findByActivoTrueOrderByNombreAsc()
                    : tecnicoRepository.findAllByOrderByNombreAsc();
        } else {
            tecnicos = soloActivos
                    ? tecnicoRepository.findByActivoTrueAndNombreContainingIgnoreCaseOrderByNombreAsc(filtro)
                    : tecnicoRepository.findByNombreContainingIgnoreCaseOrderByNombreAsc(filtro);
        }

        return tecnicos.stream().map(this::toResponse).toList();
    }

    @Transactional
    public TecnicoResponseDto crear(TecnicoRequestDto request) {
        String nombre = normalizarNombre(request.nombre());
        validarNombreDisponible(nombre, null);

        Tecnico tecnico = new Tecnico();
        tecnico.setNombre(nombre);
        tecnico.setActivo(request.activo() == null || request.activo());

        return toResponse(tecnicoRepository.save(tecnico));
    }

    @Transactional
    public TecnicoResponseDto actualizar(Long id, TecnicoRequestDto request) {
        Tecnico tecnico = buscarOLanzar(id);
        String nombre = normalizarNombre(request.nombre());
        validarNombreDisponible(nombre, id);

        tecnico.setNombre(nombre);
        if (request.activo() != null) {
            tecnico.setActivo(request.activo());
        }

        return toResponse(tecnicoRepository.save(tecnico));
    }

    /**
     * Baja lógica: el técnico deja de aparecer en formularios y gráficas, pero
     * se conserva para no romper el historial de mantenimientos.
     */
    @Transactional
    public void desactivar(Long id) {
        Tecnico tecnico = buscarOLanzar(id);
        tecnico.setActivo(false);
        tecnicoRepository.save(tecnico);
    }

    private void validarNombreDisponible(String nombreLimpio, Long idExistente) {
        boolean duplicado = (idExistente == null)
                ? tecnicoRepository.existsByNombreIgnoreCase(nombreLimpio)
                : tecnicoRepository.existsByNombreIgnoreCaseAndIdNot(nombreLimpio, idExistente);

        if (duplicado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un técnico con el nombre \"" + nombreLimpio + "\".");
        }
    }

    private String normalizarNombre(String nombre) {
        return nombre == null ? "" : nombre.trim();
    }

    private Tecnico buscarOLanzar(Long id) {
        return tecnicoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "El técnico con id " + id + " no existe."));
    }

    private TecnicoResponseDto toResponse(Tecnico tecnico) {
        return new TecnicoResponseDto(tecnico.getId(), tecnico.getNombre(), tecnico.getActivo());
    }
}
