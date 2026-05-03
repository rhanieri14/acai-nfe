package com.acainfe.controller;

import com.acainfe.dto.CopiarProdutosDTO;
import com.acainfe.dto.GrupoComplementoDTO;
import com.acainfe.dto.ProdutoDTO;
import com.acainfe.service.GrupoComplementoService;
import com.acainfe.service.ProdutoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService          produtoService;
    private final GrupoComplementoService grupoService;

    @GetMapping
    public ResponseEntity<List<ProdutoDTO>> listar(
            @RequestParam(required = false) Boolean apenasAtivos,
            @RequestParam(required = false) Long categoriaId) {

        if (categoriaId != null) {
            return ResponseEntity.ok(produtoService.listarPorCategoria(categoriaId));
        }
        if (Boolean.TRUE.equals(apenasAtivos)) {
            return ResponseEntity.ok(produtoService.listarAtivos());
        }
        return ResponseEntity.ok(produtoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoDTO> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ProdutoDTO> criar(@Valid @RequestBody ProdutoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoService.salvar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoDTO> atualizar(
            @PathVariable Long id, @Valid @RequestBody ProdutoDTO dto) {
        return ResponseEntity.ok(produtoService.atualizar(id, dto));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Void> alternarAtivo(@PathVariable Long id) {
        produtoService.alternarAtivo(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        produtoService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/copiar")
    public ResponseEntity<java.util.Map<String, Object>> copiar(@Valid @RequestBody CopiarProdutosDTO dto) {
        int quantidade = produtoService.copiarProdutos(dto.categoriaOrigemId(), dto.categoriaDestinoId());
        return ResponseEntity.ok(java.util.Map.of(
                "mensagem", quantidade + " produto(s) copiado(s) com sucesso!",
                "quantidade", quantidade
        ));
    }

    // ── Grupos de complementos do produto ─────────────────────────────────────

    @GetMapping("/{id}/grupos")
    public ResponseEntity<List<GrupoComplementoDTO>> listarGrupos(@PathVariable Long id) {
        return ResponseEntity.ok(grupoService.listarGruposDoProduto(id));
    }

    @PostMapping("/{id}/grupos/{grupoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void adicionarGrupo(@PathVariable Long id, @PathVariable Long grupoId) {
        grupoService.adicionarGrupoAoProduto(id, grupoId);
    }

    @DeleteMapping("/{id}/grupos/{grupoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerGrupo(@PathVariable Long id, @PathVariable Long grupoId) {
        grupoService.removerGrupoDoProduto(id, grupoId);
    }
}
