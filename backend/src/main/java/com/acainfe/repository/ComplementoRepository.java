package com.acainfe.repository;

import com.acainfe.enums.TipoComplemento;
import com.acainfe.model.Complemento;
import com.acainfe.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplementoRepository extends JpaRepository<Complemento, Long> {

    /** Todos os subprodutos, ordenados por categoria → produto → tipo → ordem → nome */
    List<Complemento> findAllByOrderByProdutoCategoriaOrdemAscProdutoOrdemAscTipoAscOrdemAscNomeAsc();

    /** Subprodutos ativos de todos os produtos */
    List<Complemento> findByAtivoTrueOrderByProdutoCategoriaOrdemAscProdutoOrdemAscTipoAscOrdemAscNomeAsc();

    /** Subprodutos de um produto específico */
    List<Complemento> findByProdutoOrderByTipoAscOrdemAscNomeAsc(Produto produto);

    /** Subprodutos ativos de um produto específico */
    List<Complemento> findByProdutoAndAtivoTrueOrderByTipoAscOrdemAscNomeAsc(Produto produto);

    /** Subprodutos por produto e tipo */
    List<Complemento> findByProdutoAndTipoAndAtivoTrueOrderByOrdemAscNomeAsc(Produto produto, TipoComplemento tipo);
}
