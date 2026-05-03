package com.acainfe.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "itens_pedido_complementos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemPedidoComplemento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_pedido_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ItemPedido itemPedido;

    /** Snapshot do nome do complemento */
    @Column(nullable = false, length = 100)
    private String nomeComplemento;

    /** Snapshot do nome do grupo ao qual o complemento pertence */
    @Column(length = 80)
    private String nomeGrupo;

    /** Referência ao ItemComplemento original */
    @Column
    private Long itemComplementoId;

    /** Preço cobrado no momento da venda */
    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal preco = BigDecimal.ZERO;
}
