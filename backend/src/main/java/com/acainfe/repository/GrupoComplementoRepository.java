package com.acainfe.repository;

import com.acainfe.model.GrupoComplemento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GrupoComplementoRepository extends JpaRepository<GrupoComplemento, Long> {

    List<GrupoComplemento> findAllByOrderByOrdemAscNomeAsc();
}
