package com.acainfe.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProdutoDTO(
        Long id,

        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 100)
        String nome,

        @Size(max = 255)
        String descricao,

        @NotNull(message = "Categoria é obrigatória")
        Long categoriaId,

        /** Resumo da categoria — preenchido nas respostas, ignorado nas entradas */
        CategoriaDTO categoria,

        @Size(max = 50)
        String tamanho,

        @NotNull(message = "Preço é obrigatório")
        @DecimalMin(value = "0.00")
        BigDecimal preco,

        boolean ativo,
        int ordem
) {}
