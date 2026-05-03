package com.acainfe.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Item individual dentro de um GrupoComplemento.
 * Ex: GRANULADO (R$0,00), LEITE EM PÓ (R$0,00), NUTELLA (R$5,00).
 */
@Entity
@Table(name = "itens_complemento")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemComplemento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String nome;

    /**
     * Preço deste item quando selecionado.
     * R$0,00 = grátis (dentro do limite do grupo).
     * Valor > 0 = sempre cobrado (usado para itens especiais ou itens fora do limite).
     */
    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal preco = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "grupo_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private GrupoComplemento grupo;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;

    @Column(nullable = false)
    @Builder.Default
    private int ordem = 0;
}
