package com.acainfe.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record GrupoComplementoDTO(
        Long id,

        @NotBlank(message = "Nome do grupo é obrigatório")
        @Size(max = 80)
        String nome,

        @Min(value = 0, message = "Limite mínimo não pode ser negativo")
        int limiteMin,

        @Min(value = 0, message = "Limite máximo não pode ser negativo")
        int limiteMax,

        boolean ativo,
        int ordem,

        /** Itens do grupo — preenchido nas respostas, ignorado nas criações */
        List<ItemComplementoDTO> itens
) {}
