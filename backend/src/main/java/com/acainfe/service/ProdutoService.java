package com.acainfe.service;

import com.acainfe.dto.ProdutoDTO;
import com.acainfe.model.Categoria;
import com.acainfe.model.Produto;
import com.acainfe.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository  produtoRepository;
    private final CategoriaService   categoriaService;

    public List<ProdutoDTO> listarTodos() {
        return produtoRepository.findAllByOrderByCategoriaOrdemAscOrdemAscNomeAsc()
                .stream().map(this::toDTO).toList();
    }

    public List<ProdutoDTO> listarAtivos() {
        return produtoRepository.findByAtivoTrueOrderByCategoriaOrdemAscOrdemAscNomeAsc()
                .stream().map(this::toDTO).toList();
    }

    public List<ProdutoDTO> listarPorCategoria(Long categoriaId) {
        Categoria cat = categoriaService.buscarEntidade(categoriaId);
        return produtoRepository.findByCategoriaOrderByOrdemAscNomeAsc(cat)
                .stream().map(this::toDTO).toList();
    }

    public ProdutoDTO buscarPorId(Long id) {
        return toDTO(buscarEntidade(id));
    }

    /** Retorna a entidade — uso interno (ex: ComplementoService) */
    public Produto buscarEntidade(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Produto não encontrado: " + id));
    }

    @Transactional
    public ProdutoDTO salvar(ProdutoDTO dto) {
        return toDTO(produtoRepository.save(toEntity(dto)));
    }

    @Transactional
    public ProdutoDTO atualizar(Long id, ProdutoDTO dto) {
        Produto p = buscarEntidade(id);
        p.setNome(dto.nome());
        p.setDescricao(dto.descricao());
        p.setCategoria(categoriaService.buscarEntidade(dto.categoriaId()));
        p.setTamanho(dto.tamanho());
        p.setPreco(dto.preco());
        p.setAtivo(dto.ativo());
        p.setOrdem(dto.ordem());
        return toDTO(produtoRepository.save(p));
    }

    @Transactional
    public void alternarAtivo(Long id) {
        Produto p = buscarEntidade(id);
        p.setAtivo(!p.isAtivo());
        produtoRepository.save(p);
    }

    @Transactional
    public void excluir(Long id) {
        if (!produtoRepository.existsById(id)) {
            throw new NoSuchElementException("Produto não encontrado: " + id);
        }
        produtoRepository.deleteById(id);
    }

    @Transactional
    public int copiarProdutos(Long origemId, Long destinoId) {
        if (origemId.equals(destinoId)) {
            throw new IllegalArgumentException("Origem e destino não podem ser a mesma categoria.");
        }

        Categoria origem  = categoriaService.buscarEntidade(origemId);
        Categoria destino = categoriaService.buscarEntidade(destinoId);

        List<Produto> originais = produtoRepository.findByCategoriaOrderByOrdemAscNomeAsc(origem);
        if (originais.isEmpty()) {
            throw new IllegalStateException("A categoria de origem não possui produtos para copiar.");
        }

        List<Produto> copias = originais.stream()
                .map(p -> Produto.builder()
                        .nome(p.getNome())
                        .descricao(p.getDescricao())
                        .categoria(destino)
                        .tamanho(p.getTamanho())
                        .preco(p.getPreco())
                        .ativo(p.isAtivo())
                        .ordem(p.getOrdem())
                        .build())
                .toList();

        produtoRepository.saveAll(copias);
        return copias.size();
    }

    // ── Mapeamento ────────────────────────────────────────────────────────────

    public ProdutoDTO toDTO(Produto p) {
        return new ProdutoDTO(
                p.getId(),
                p.getNome(),
                p.getDescricao(),
                p.getCategoria().getId(),
                categoriaService.toDTO(p.getCategoria()),
                p.getTamanho(),
                p.getPreco(),
                p.isAtivo(),
                p.getOrdem()
        );
    }

    private Produto toEntity(ProdutoDTO dto) {
        return Produto.builder()
                .id(dto.id())
                .nome(dto.nome())
                .descricao(dto.descricao())
                .categoria(categoriaService.buscarEntidade(dto.categoriaId()))
                .tamanho(dto.tamanho())
                .preco(dto.preco())
                .ativo(dto.ativo())
                .ordem(dto.ordem())
                .build();
    }
}
