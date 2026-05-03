package com.acainfe.repository;

import com.acainfe.model.GrupoComplemento;
import com.acainfe.model.ItemComplemento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemComplementoRepository extends JpaRepository<ItemComplemento, Long> {

    List<ItemComplemento> findByGrupoOrderByOrdemAscNomeAsc(GrupoComplemento grupo);
}
