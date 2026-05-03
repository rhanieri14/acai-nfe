package com.acainfe.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record AplicarGrupoEmLoteDTO(
        @NotEmpty(message = "Selecione ao menos um produto")
        List<Long> produtoIds
) {}
