package com.acainfe.model;

import com.acainfe.enums.TipoComplemento;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Subproduto de um Produto específico.
 * Hierarquia: Categoria → Produto → Complemento (Subproduto).
 */
@Entity
@Table(name = "complementos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Complemento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoComplemento tipo;

    /** Produto ao qual este subproduto pertence */
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    /**
     * Para ESPECIAL: preço sempre cobrado.
     * Para ACOMPANHAMENTO/CALDA: preço cobrado quando ultrapassa o limite gratuito.
     */
    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal precoExtra = new BigDecimal("3.00");

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;

    @Column(nullable = false)
    @Builder.Default
    private int ordem = 0;
}
