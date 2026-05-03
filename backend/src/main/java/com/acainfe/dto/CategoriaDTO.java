package com.acainfe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaDTO(
        Long id,

        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 60)
        String nome,

        @Size(max = 60)
        String icone,

        @Size(max = 20)
        String cor,

        int ordem,
        boolean ativo
) {}
