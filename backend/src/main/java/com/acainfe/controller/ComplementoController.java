package com.acainfe.controller;

import com.acainfe.dto.ComplementoDTO;
import com.acainfe.enums.TipoComplemento;
import com.acainfe.service.ComplementoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complementos")
@RequiredArgsConstructor
public class ComplementoController {

    private final ComplementoService complementoService;

    /** Lista todos os subprodutos (opcionalmente filtrando por produto e/ou ativos) */
    @GetMapping
    public List<ComplementoDTO> listar(
            @RequestParam(required = false) Long produtoId,
            @RequestParam(defaultValue = "false") boolean apenasAtivos,
            @RequestParam(required = false) TipoComplemento tipo
    ) {
        if (produtoId != null) {
            if (tipo != null && apenasAtivos) return complementoService.listarAtivosPorProdutoETipo(produtoId, tipo);
            if (apenasAtivos)                return complementoService.listarAtivosPorProduto(produtoId);
            return complementoService.listarPorProduto(produtoId);
        }
        return apenasAtivos
                ? complementoService.listarAtivos()
                : complementoService.listarTodos();
    }

    @GetMapping("/{id}")
    public ComplementoDTO buscar(@PathVariable Long id) {
        return complementoService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ComplementoDTO criar(@Valid @RequestBody ComplementoDTO dto) {
        return complementoService.salvar(dto);
    }

    @PutMapping("/{id}")
    public ComplementoDTO atualizar(@PathVariable Long id, @Valid @RequestBody ComplementoDTO dto) {
        return complementoService.atualizar(id, dto);
    }

    @PatchMapping("/{id}/toggle")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void toggleAtivo(@PathVariable Long id) {
        complementoService.alternarAtivo(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        complementoService.excluir(id);
    }
}
