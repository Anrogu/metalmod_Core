package com.metalmod.core.Service;

import com.metalmod.core.Dto.ClienteRequestDto;
import com.metalmod.core.Dto.ClienteResponseDto;
import com.metalmod.core.Entity.Cliente;
import com.metalmod.core.Mapper.ClienteMapper;
import com.metalmod.core.Repository.ClienteRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final ClienteMapper clienteMapper;

    public ClienteService(ClienteRepository clienteRepository, ClienteMapper clienteMapper) {
        this.clienteRepository = clienteRepository;
        this.clienteMapper = clienteMapper;
    }

    @Transactional
    public ClienteResponseDto crear(ClienteRequestDto request) {
        Cliente cliente = clienteMapper.toEntity(request);
        cliente.setActivo(true);
        return clienteMapper.toResponse(clienteRepository.save(cliente));
    }

    public ClienteResponseDto obtenerPorId(Long id) {
        return clienteMapper.toResponse(buscarOLanzar(id));
    }

    // Si viene "nombre" filtra por coincidencia parcial; si no, regresa solo los activos
    public List<ClienteResponseDto> listar(String nombre) {
        List<Cliente> clientes = (nombre != null && !nombre.isBlank())
                ? clienteRepository.findByNombreContainingIgnoreCase(nombre)
                : clienteRepository.findByActivoTrue();

        return clientes.stream().map(clienteMapper::toResponse).toList();
    }

    @Transactional
    public ClienteResponseDto actualizar(Long id, ClienteRequestDto request) {
        Cliente cliente = buscarOLanzar(id);

        // EL CAMBIO ESTÁ AQUÍ: Usamos el método de MapStruct con @MappingTarget
        clienteMapper.updateEntityFromDto(request, cliente);

        return clienteMapper.toResponse(clienteRepository.save(cliente));
    }

    // Soft delete: el cliente puede estar referenciado por ordenes/piezas, no se borra fisicamente
    @Transactional
    public void desactivar(Long id) {
        Cliente cliente = buscarOLanzar(id);
        cliente.setActivo(false);
        clienteRepository.save(cliente);
    }

    private Cliente buscarOLanzar(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("El cliente con id " + id + " no existe."));
    }
}