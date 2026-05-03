package com.acainfe.controller;

import com.acainfe.dto.CriarPedidoDTO;
import com.acainfe.dto.PedidoRespostaDTO;
import com.acainfe.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoRespostaDTO criar(@Valid @RequestBody CriarPedidoDTO dto) {
        return pedidoService.criar(dto);
    }

    @GetMapping
    public List<PedidoRespostaDTO> listarHoje() {
        return pedidoService.listarHoje();
    }

    @GetMapping("/{id}")
    public PedidoRespostaDTO buscar(@PathVariable Long id) {
        return pedidoService.buscarPorId(id);
    }
}
