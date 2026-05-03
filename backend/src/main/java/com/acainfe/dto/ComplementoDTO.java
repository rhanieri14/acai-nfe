package com.acainfe.dto;

import com.acainfe.enums.TipoComplemento;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ComplementoDTO(
        Long id,

        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 80)
        String nome,

        @NotNull(message = "Tipo é obrigatório")
        TipoComplemento tipo,

        @NotNull(message = "Produto é obrigatório")
        Long produtoId,

        /** Produto completo — preenchido nas respostas, ignorado nas entradas */
        ProdutoDTO produto,

        @NotNull
        @DecimalMin(value = "0.00")
        BigDecimal precoExtra,

        boolean ativo,
        int ordem
) {}
