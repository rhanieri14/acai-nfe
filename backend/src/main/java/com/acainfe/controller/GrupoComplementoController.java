package com.acainfe.controller;

import com.acainfe.dto.AplicarGrupoEmLoteDTO;
import com.acainfe.dto.GrupoComplementoDTO;
import com.acainfe.dto.ItemComplementoDTO;
import com.acainfe.service.GrupoComplementoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/grupos")
@RequiredArgsConstructor
public class GrupoComplementoController {

    private final GrupoComplementoService grupoService;

    // ── Grupos ────────────────────────────────────────────────────────────────

    @GetMapping
    public List<GrupoComplementoDTO> listar() {
        return grupoService.listarTodos();
    }

    @GetMapping("/{id}")
    public GrupoComplementoDTO buscar(@PathVariable Long id) {
        return grupoService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GrupoComplementoDTO criar(@Valid @RequestBody GrupoComplementoDTO dto) {
        return grupoService.criar(dto);
    }

    @PutMapping("/{id}")
    public GrupoComplementoDTO atualizar(@PathVariable Long id,
                                         @Valid @RequestBody GrupoComplementoDTO dto) {
        return grupoService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        grupoService.excluir(id);
    }

    // ── Itens ─────────────────────────────────────────────────────────────────

    @PostMapping("/{id}/itens")
    @ResponseStatus(HttpStatus.CREATED)
    public GrupoComplementoDTO adicionarItem(@PathVariable Long id,
                                              @Valid @RequestBody ItemComplementoDTO dto) {
        return grupoService.adicionarItem(id, dto);
    }

    @PutMapping("/{id}/itens/{itemId}")
    public GrupoComplementoDTO atualizarItem(@PathVariable Long id,
                                              @PathVariable Long itemId,
                                              @Valid @RequestBody ItemComplementoDTO dto) {
        return grupoService.atualizarItem(id, itemId, dto);
    }

    @DeleteMapping("/{id}/itens/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirItem(@PathVariable Long id, @PathVariable Long itemId) {
        grupoService.excluirItem(id, itemId);
    }

    // ── Aplicação em lote ─────────────────────────────────────────────────────

    /** Aplica este grupo a vários produtos de uma vez. Retorna quantos foram de fato adicionados. */
    @PostMapping("/{id}/produtos/lote")
    public Map<String, Object> aplicarEmLote(@PathVariable Long id,
                                              @Valid @RequestBody AplicarGrupoEmLoteDTO dto) {
        int aplicados = grupoService.aplicarEmLote(id, dto.produtoIds());
        int jaExistiam = dto.produtoIds().size() - aplicados;
        return Map.of(
                "aplicados",  aplicados,
                "jaExistiam", jaExistiam,
                "mensagem",   aplicados + " produto(s) atualizado(s)" +
                              (jaExistiam > 0 ? " (" + jaExistiam + " já tinham o grupo)" : "")
        );
    }
}
