package com.acainfe.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ItemPedidoInputDTO(
        @NotNull(message = "Produto é obrigatório")
        Long produtoId,

        @Min(value = 1, message = "Quantidade mínima é 1")
        int quantidade,

        /** IDs dos ItemComplemento selecionados pelo cliente */
        List<Long> complementoIds
) {}
