package com.acainfe.service;

import com.acainfe.dto.ComplementoDTO;
import com.acainfe.enums.TipoComplemento;
import com.acainfe.model.Complemento;
import com.acainfe.model.Produto;
import com.acainfe.repository.ComplementoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ComplementoService {

    private final ComplementoRepository complementoRepository;
    private final ProdutoService        produtoService;

    public List<ComplementoDTO> listarTodos() {
        return complementoRepository
                .findAllByOrderByProdutoCategoriaOrdemAscProdutoOrdemAscTipoAscOrdemAscNomeAsc()
                .stream().map(this::toDTO).toList();
    }

    public List<ComplementoDTO> listarAtivos() {
        return complementoRepository
                .findByAtivoTrueOrderByProdutoCategoriaOrdemAscProdutoOrdemAscTipoAscOrdemAscNomeAsc()
                .stream().map(this::toDTO).toList();
    }

    public List<ComplementoDTO> listarPorProduto(Long produtoId) {
        Produto produto = produtoService.buscarEntidade(produtoId);
        return complementoRepository.findByProdutoOrderByTipoAscOrdemAscNomeAsc(produto)
                .stream().map(this::toDTO).toList();
    }

    public List<ComplementoDTO> listarAtivosPorProduto(Long produtoId) {
        Produto produto = produtoService.buscarEntidade(produtoId);
        return complementoRepository.findByProdutoAndAtivoTrueOrderByTipoAscOrdemAscNomeAsc(produto)
                .stream().map(this::toDTO).toList();
    }

    public List<ComplementoDTO> listarAtivosPorProdutoETipo(Long produtoId, TipoComplemento tipo) {
        Produto produto = produtoService.buscarEntidade(produtoId);
        return complementoRepository.findByProdutoAndTipoAndAtivoTrueOrderByOrdemAscNomeAsc(produto, tipo)
                .stream().map(this::toDTO).toList();
    }

    public ComplementoDTO buscarPorId(Long id) {
        return complementoRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new NoSuchElementException("Complemento não encontrado: " + id));
    }

    @Transactional
    public ComplementoDTO salvar(ComplementoDTO dto) {
        return toDTO(complementoRepository.save(toEntity(dto)));
    }

    @Transactional
    public ComplementoDTO atualizar(Long id, ComplementoDTO dto) {
        Complemento c = complementoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Complemento não encontrado: " + id));

        c.setNome(dto.nome());
        c.setTipo(dto.tipo());
        c.setProduto(produtoService.buscarEntidade(dto.produtoId()));
        c.setPrecoExtra(dto.precoExtra());
        c.setAtivo(dto.ativo());
        c.setOrdem(dto.ordem());

        return toDTO(complementoRepository.save(c));
    }

    @Transactional
    public void alternarAtivo(Long id) {
        Complemento c = complementoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Complemento não encontrado: " + id));
        c.setAtivo(!c.isAtivo());
        complementoRepository.save(c);
    }

    @Transactional
    public void excluir(Long id) {
        if (!complementoRepository.existsById(id)) {
            throw new NoSuchElementException("Complemento não encontrado: " + id);
        }
        complementoRepository.deleteById(id);
    }

    // ── Mapeamento ────────────────────────────────────────────────────────────

    public ComplementoDTO toDTO(Complemento c) {
        return new ComplementoDTO(
                c.getId(), c.getNome(), c.getTipo(),
                c.getProduto().getId(),
                produtoService.toDTO(c.getProduto()),
                c.getPrecoExtra(),
                c.isAtivo(), c.getOrdem()
        );
    }

    private Complemento toEntity(ComplementoDTO dto) {
        return Complemento.builder()
                .id(dto.id())
                .nome(dto.nome())
                .tipo(dto.tipo())
                .produto(produtoService.buscarEntidade(dto.produtoId()))
                .precoExtra(dto.precoExtra())
                .ativo(dto.ativo())
                .ordem(dto.ordem())
                .build();
    }
}
