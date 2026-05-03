package com.acainfe.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Grupo de complementos compartilhado entre produtos.
 * Ex: "ACOMPANHAMENTOS" (min=1, max=3), "CALDAS" (min=0, max=1), "ESPECIAIS" (min=0, max=5).
 *
 * Um produto pode ter vários grupos; um grupo pode pertencer a vários produtos (ManyToMany).
 * Atenção: editar nome/limites de um grupo afeta TODOS os produtos que o utilizam.
 */
@Entity
@Table(name = "grupos_complemento")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrupoComplemento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String nome;

    /** Mínimo de itens que o cliente deve selecionar deste grupo */
    @Column(nullable = false)
    @Builder.Default
    private int limiteMin = 0;

    /** Máximo de itens que o cliente pode selecionar deste grupo */
    @Column(nullable = false)
    @Builder.Default
    private int limiteMax = 3;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;

    @Column(nullable = false)
    @Builder.Default
    private int ordem = 0;

    /** Itens deste grupo (ex: GRANULADO, LEITE EM PÓ, MANGA...) */
    @OneToMany(mappedBy = "grupo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("ordem ASC, nome ASC")
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ItemComplemento> itens = new ArrayList<>();

    /** Produtos que utilizam este grupo — lado inverso da relação */
    @ManyToMany(mappedBy = "grupos", fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Produto> produtos = new ArrayList<>();
}
