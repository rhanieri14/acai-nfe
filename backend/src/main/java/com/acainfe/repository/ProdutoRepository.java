package com.acainfe.repository;

import com.acainfe.model.Categoria;
import com.acainfe.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    List<Produto> findAllByOrderByCategoriaOrdemAscOrdemAscNomeAsc();

    List<Produto> findByAtivoTrueOrderByCategoriaOrdemAscOrdemAscNomeAsc();

    List<Produto> findByCategoriaOrderByOrdemAscNomeAsc(Categoria categoria);
}
