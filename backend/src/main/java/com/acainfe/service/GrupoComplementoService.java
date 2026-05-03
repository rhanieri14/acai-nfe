package com.acainfe.service;

import com.acainfe.dto.GrupoComplementoDTO;
import com.acainfe.dto.ItemComplementoDTO;
import com.acainfe.model.GrupoComplemento;
import com.acainfe.model.ItemComplemento;
import com.acainfe.model.Produto;
import com.acainfe.repository.GrupoComplementoRepository;
import com.acainfe.repository.ItemComplementoRepository;
import com.acainfe.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class GrupoComplementoService {

    private final GrupoComplementoRepository grupoRepository;
    private final ItemComplementoRepository  itemRepository;
    private final ProdutoRepository          produtoRepository;

    // ── Grupos ────────────────────────────────────────────────────────────────

    public List<GrupoComplementoDTO> listarTodos() {
        return grupoRepository.findAllByOrderByOrdemAscNomeAsc()
                .stream().map(this::toDTO).toList();
    }

    public GrupoComplementoDTO buscarPorId(Long id) {
        return toDTO(buscarGrupoEntidade(id));
    }

    @Transactional
    public GrupoComplementoDTO criar(GrupoComplementoDTO dto) {
        GrupoComplemento grupo = GrupoComplemento.builder()
                .nome(dto.nome())
                .limiteMin(dto.limiteMin())
                .limiteMax(dto.limiteMax())
                .ativo(dto.ativo())
                .ordem(dto.ordem())
                .build();
        return toDTO(grupoRepository.save(grupo));
    }

    @Transactional
    public GrupoComplementoDTO atualizar(Long id, GrupoComplementoDTO dto) {
        GrupoComplemento grupo = buscarGrupoEntidade(id);
        grupo.setNome(dto.nome());
        grupo.setLimiteMin(dto.limiteMin());
        grupo.setLimiteMax(dto.limiteMax());
        grupo.setAtivo(dto.ativo());
        grupo.setOrdem(dto.ordem());
        return toDTO(grupoRepository.save(grupo));
    }

    @Transactional
    public void excluir(Long id) {
        GrupoComplemento grupo = buscarGrupoEntidade(id);
        // Remove a associação em todos os produtos antes de excluir
        for (Produto p : grupo.getProdutos()) {
            p.getGrupos().remove(grupo);
            produtoRepository.save(p);
        }
        grupoRepository.delete(grupo);
    }

    // ── Itens ─────────────────────────────────────────────────────────────────

    @Transactional
    public GrupoComplementoDTO adicionarItem(Long grupoId, ItemComplementoDTO dto) {
        GrupoComplemento grupo = buscarGrupoEntidade(grupoId);
        ItemComplemento item = ItemComplemento.builder()
                .nome(dto.nome())
                .preco(dto.preco())
                .ativo(dto.ativo())
                .ordem(dto.ordem())
                .grupo(grupo)
                .build();
        grupo.getItens().add(item);
        return toDTO(grupoRepository.save(grupo));
    }

    @Transactional
    public GrupoComplementoDTO atualizarItem(Long grupoId, Long itemId, ItemComplementoDTO dto) {
        buscarGrupoEntidade(grupoId); // valida que o grupo existe
        ItemComplemento item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("Item não encontrado: " + itemId));
        item.setNome(dto.nome());
        item.setPreco(dto.preco());
        item.setAtivo(dto.ativo());
        item.setOrdem(dto.ordem());
        itemRepository.save(item);
        return toDTO(buscarGrupoEntidade(grupoId));
    }

    @Transactional
    public void excluirItem(Long grupoId, Long itemId) {
        GrupoComplemento grupo = buscarGrupoEntidade(grupoId);
        ItemComplemento item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("Item não encontrado: " + itemId));
        grupo.getItens().remove(item);
        grupoRepository.save(grupo);
    }

    // ── Associação Produto ↔ Grupo ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<GrupoComplementoDTO> listarGruposDoProduto(Long produtoId) {
        Produto produto = buscarProdutoEntidade(produtoId);
        return produto.getGrupos().stream().map(this::toDTO).toList();
    }

    @Transactional
    public void adicionarGrupoAoProduto(Long produtoId, Long grupoId) {
        Produto produto = buscarProdutoEntidade(produtoId);
        GrupoComplemento grupo = buscarGrupoEntidade(grupoId);
        if (!produto.getGrupos().contains(grupo)) {
            produto.getGrupos().add(grupo);
            produtoRepository.save(produto);
        }
    }

    @Transactional
    public void removerGrupoDoProduto(Long produtoId, Long grupoId) {
        Produto produto = buscarProdutoEntidade(produtoId);
        GrupoComplemento grupo = buscarGrupoEntidade(grupoId);
        produto.getGrupos().remove(grupo);
        produtoRepository.save(produto);
    }

    /** Adiciona o grupo a vários produtos de uma vez. Ignora produtos que já possuem o grupo. */
    @Transactional
    public int aplicarEmLote(Long grupoId, List<Long> produtoIds) {
        GrupoComplemento grupo = buscarGrupoEntidade(grupoId);
        int aplicados = 0;
        for (Long produtoId : produtoIds) {
            Produto produto = buscarProdutoEntidade(produtoId);
            if (!produto.getGrupos().contains(grupo)) {
                produto.getGrupos().add(grupo);
                produtoRepository.save(produto);
                aplicados++;
            }
        }
        return aplicados;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public GrupoComplemento buscarGrupoEntidade(Long id) {
        return grupoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Grupo não encontrado: " + id));
    }

    private Produto buscarProdutoEntidade(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Produto não encontrado: " + id));
    }

    // ── Mapeamento ────────────────────────────────────────────────────────────

    public GrupoComplementoDTO toDTO(GrupoComplemento g) {
        List<ItemComplementoDTO> itens = g.getItens().stream()
                .map(this::itemToDTO).toList();
        return new GrupoComplementoDTO(
                g.getId(), g.getNome(),
                g.getLimiteMin(), g.getLimiteMax(),
                g.isAtivo(), g.getOrdem(),
                itens
        );
    }

    public ItemComplementoDTO itemToDTO(ItemComplemento i) {
        return new ItemComplementoDTO(
                i.getId(), i.getNome(), i.getPreco(), i.isAtivo(), i.getOrdem()
        );
    }
}
