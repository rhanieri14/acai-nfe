package com.acainfe.repository;

import com.acainfe.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @Query("SELECT p FROM Pedido p WHERE p.dataHora >= :inicio AND p.dataHora < :fim ORDER BY p.dataHora DESC")
    List<Pedido> findByDia(LocalDateTime inicio, LocalDateTime fim);
}
