package com.acainfe.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Categoria {
    ACAI("Açaí"),
    BARCA("Barca"),
    PIZZA("Pizza Doce"),
    MILKSHAKE("Milk-Shake"),
    BEBIDA("Bebidas");

    private final String descricao;
}
