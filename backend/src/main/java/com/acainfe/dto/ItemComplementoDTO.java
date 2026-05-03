package com.acainfe.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ItemComplementoDTO(
        Long id,

        @NotBlank(message = "Nome do item é obrigatório")
        @Size(max = 80)
        String nome,

        @NotNull(message = "Preço é obrigatório")
        @DecimalMin(value = "0.00", message = "Preço não pode ser negativo")
        BigDecimal preco,

        boolean ativo,
        int ordem
) {}
