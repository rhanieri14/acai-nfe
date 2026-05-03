package com.acainfe.dto;

import com.acainfe.enums.FormaPagamento;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record CriarPedidoDTO(
        @NotNull(message = "Forma de pagamento é obrigatória")
        FormaPagamento formaPagamento,

        /** Valor entregue pelo cliente — obrigatório para DINHEIRO */
        BigDecimal valorPago,

        @NotEmpty(message = "O pedido deve ter pelo menos um item")
        @Valid
        List<ItemPedidoInputDTO> itens
) {}
