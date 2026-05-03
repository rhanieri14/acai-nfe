package com.acainfe.enums;

public enum TipoComplemento {
    /** Acompanhamentos sólidos: granola, paçoca, leite ninho etc.
     *  Grátis até limiteAcompanhamentos do produto; +R$3 cada extra. */
    ACOMPANHAMENTO,

    /** Caldas líquidas: mel, chocolate, morango etc.
     *  Grátis até limiteCaldas do produto (padrão 1); +R$3 cada extra. */
    CALDA,

    /** Complementos especiais sempre cobrados (sorvete, nutella…).
     *  Não disponíveis em barca. Preço definido em precoExtra. */
    ESPECIAL
}
