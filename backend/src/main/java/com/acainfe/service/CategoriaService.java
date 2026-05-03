package com.acainfe.service;

import com.acainfe.dto.CategoriaDTO;
import com.acainfe.model.Categoria;
import com.acainfe.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public List<CategoriaDTO> listarTodas() {
        return categoriaRepository.findAllByOrderByOrdemAscNomeAsc()
                .stream().map(this::toDTO).toList();
    }

    public List<CategoriaDTO> listarAtivas() {
        return categoriaRepository.findByAtivoTrueOrderByOrdemAscNomeAsc()
                .stream().map(this::toDTO).toList();
    }

    public CategoriaDTO buscarPorId(Long id) {
        return categoriaRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new NoSuchElementException("Categoria não encontrada: " + id));
    }

    public Categoria buscarEntidade(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Categoria não encontrada: " + id));
    }

    @Transactional
    public CategoriaDTO salvar(CategoriaDTO dto) {
        Categoria c = toEntity(dto);
        return toDTO(categoriaRepository.save(c));
    }

    @Transactional
    public CategoriaDTO atualizar(Long id, CategoriaDTO dto) {
        Categoria c = categoriaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Categoria não encontrada: " + id));
        c.setNome(dto.nome());
        c.setIcone(dto.icone());
        c.setCor(dto.cor());
        c.setOrdem(dto.ordem());
        c.setAtivo(dto.ativo());
        return toDTO(categoriaRepository.save(c));
    }

    @Transactional
    public void excluir(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new NoSuchElementException("Categoria não encontrada: " + id);
        }
        categoriaRepository.deleteById(id);
    }

    public CategoriaDTO toDTO(Categoria c) {
        return new CategoriaDTO(c.getId(), c.getNome(), c.getIcone(), c.getCor(), c.getOrdem(), c.isAtivo());
    }

    private Categoria toEntity(CategoriaDTO dto) {
        return Categoria.builder()
                .id(dto.id())
                .nome(dto.nome())
                .icone(dto.icone() != null ? dto.icone() : "pi pi-tag")
                .cor(dto.cor() != null ? dto.cor() : "#6B2D5C")
                .ordem(dto.ordem())
                .ativo(dto.ativo())
                .build();
    }
}
