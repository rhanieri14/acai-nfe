package com.acainfe.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoRespostaDTO(
        Long id,
        LocalDateTime dataHora,
        String status,
        String formaPagamento,
        BigDecimal valorTotal,
        BigDecimal valorPago,
        BigDecimal troco,
        List<ItemPedidoRespostaDTO> itens
) {
    public record ItemPedidoRespostaDTO(
            Long id,
            String nomeProduto,
            int quantidade,
            BigDecimal precoUnitario,
            BigDecimal subtotal,
            List<ComplementoRespostaDTO> complementos
    ) {}

    public record ComplementoRespostaDTO(
            String nomeComplemento,
            String nomeGrupo,
            BigDecimal preco
    ) {}
}
