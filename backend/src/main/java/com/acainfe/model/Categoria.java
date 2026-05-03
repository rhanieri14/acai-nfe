package com.acainfe.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categorias")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String nome;

    /** Classe do ícone PrimeNG, ex: "pi pi-heart-fill" */
    @Column(length = 60)
    @Builder.Default
    private String icone = "pi pi-tag";

    /** Cor hex, ex: "#6B2D5C" */
    @Column(length = 20)
    @Builder.Default
    private String cor = "#6B2D5C";

    @Column(nullable = false)
    @Builder.Default
    private int ordem = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;
}
