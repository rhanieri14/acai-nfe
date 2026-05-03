package com.acainfe.enums;

public enum Ambiente {
    HOMOLOGACAO("Homologação", 2),
    PRODUCAO("Produção", 1);

    private final String descricao;
    private final Integer codigo;

    Ambiente(String descricao, Integer codigo) {
        this.descricao = descricao;
        this.codigo = codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    public Integer getCodigo() {
        return codigo;
    }
}
