package com.acainfe.dto;

import jakarta.validation.constraints.NotNull;

public record CopiarProdutosDTO(
        @NotNull(message = "Categoria origem é obrigatória")
        Long categoriaOrigemId,

        @NotNull(message = "Categoria destino é obrigatória")
        Long categoriaDestinoId
) {}
