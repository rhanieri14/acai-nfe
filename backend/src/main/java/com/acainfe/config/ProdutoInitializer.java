package com.acainfe.config;

import com.acainfe.model.Categoria;
import com.acainfe.model.Produto;
import com.acainfe.repository.CategoriaRepository;
import com.acainfe.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class ProdutoInitializer implements ApplicationRunner {

    private final CategoriaRepository categoriaRepository;
    private final ProdutoRepository   produtoRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (categoriaRepository.count() == 0) seedCategorias();
        if (produtoRepository.count()   == 0) seedProdutos();
    }

    // ── Categorias ────────────────────────────────────────────────────────────

    private void seedCategorias() {
        log.info("Inicializando categorias UN Refresco...");
        List<Categoria> cats = List.of(
            cat("Açaí Tradicional", "pi pi-heart-fill", "#6B2D5C",  1),
            cat("Açaí Zero",        "pi pi-star-fill",  "#0D9488",  2),
            cat("Casadinho",        "pi pi-inbox",      "#D97706",  3),
            cat("Barca",            "pi pi-table",      "#2563EB",  4),
            cat("Pizza",            "pi pi-circle",     "#7C3AED",  5),
            cat("Milk-Shake",       "pi pi-bolt",       "#0891B2",  6),
            cat("Doces",            "pi pi-tag",        "#B45309",  7),
            cat("Bebidas",          "pi pi-cloud",      "#2563EB", 10)
        );
        categoriaRepository.saveAll(cats);
        log.info("{} categorias criadas.", cats.size());
    }

    // ── Produtos ──────────────────────────────────────────────────────────────

    private void seedProdutos() {
        log.info("Inicializando produtos UN Refresco...");

        Map<String, Categoria> cats = categoriaRepository.findAll()
                .stream().collect(Collectors.toMap(Categoria::getNome, Function.identity()));

        Categoria acaiTrad  = cats.get("Açaí Tradicional");
        Categoria acaiZero  = cats.get("Açaí Zero");
        Categoria casadinho = cats.get("Casadinho");
        Categoria barca     = cats.get("Barca");
        Categoria pizza     = cats.get("Pizza");
        Categoria milkshake = cats.get("Milk-Shake");
        Categoria doces     = cats.get("Doces");
        Categoria bebidas   = cats.get("Bebidas");

        List<Produto> produtos = List.of(

            // ── Açaí Tradicional ──────────────────────────────────────────────
            p("Açaí", "Açaí puro batido", acaiTrad, "200ml", "10.00", 1),
            p("Açaí", "Açaí puro batido", acaiTrad, "300ml", "15.00", 2),
            p("Açaí", "Açaí puro batido", acaiTrad, "500ml", "20.00", 3),
            p("Açaí", "Açaí puro batido", acaiTrad, "700ml", "25.00", 4),
            p("Açaí", "Açaí puro batido", acaiTrad, "1L",    "36.00", 5),

            // ── Açaí Zero ─────────────────────────────────────────────────────
            p("Açaí", "Açaí puro batido", acaiZero, "200ml", "15.00", 1),
            p("Açaí", "Açaí puro batido", acaiZero, "300ml", "19.00", 2),
            p("Açaí", "Açaí puro batido", acaiZero, "500ml", "25.00", 3),
            p("Açaí", "Açaí puro batido", acaiZero, "700ml", "28.00", 4),
            p("Açaí", "Açaí puro batido", acaiZero, "1L",    "46.00", 5),

            // ── Casadinho ─────────────────────────────────────────────────────
            p("Açaí", "Açaí puro batido", casadinho, "200ml", "12.00", 1),
            p("Açaí", "Açaí puro batido", casadinho, "300ml", "16.00", 2),
            p("Açaí", "Açaí puro batido", casadinho, "500ml", "22.00", 3),
            p("Açaí", "Açaí puro batido", casadinho, "700ml", "26.00", 4),
            p("Açaí", "Açaí puro batido", casadinho, "1L",    "40.00", 5),

            // ── Barca ─────────────────────────────────────────────────────────
            p("BARCA 1P", null, barca, "1 PESSOA",  "30.00",  1),
            p("BARCA 3P", null, barca, "3 PESSOAS", "45.00",  2),
            p("BARCA 4P", null, barca, "4 PESSOAS", "55.00",  3),
            p("BARCA 6P", null, barca, "6 PESSOAS", "70.00",  4),
            p("BARCA 8P", null, barca, "8 PESSOAS", "110.00", 5),

            // ── Pizza ─────────────────────────────────────────────────────────
            p("Pizza Açaí", null, pizza, "7 pessoas", "80.00", 1),

            // ── Milk-Shake ────────────────────────────────────────────────────
            p("Milk-Shake", null, milkshake, "300ml", "16.00", 1),
            p("Milk-Shake", null, milkshake, "500ml", "20.00", 2),

            // ── Doces ─────────────────────────────────────────────────────────
            p("Bala Fini",      null, doces, null, "0.00", 1),
            p("Sonho de Valsa", null, doces, null, "0.00", 2),

            // ── Bebidas ───────────────────────────────────────────────────────
            p("Água",              "Mineral",    bebidas, "500ml", "0.00", 1),
            p("Água com Gás",      "Gaseificada",bebidas, "500ml", "0.00", 2),
            p("Refrigerante Lata", "350ml",      bebidas, "350ml", "0.00", 3),
            p("Energético",        "473ml",      bebidas, "473ml", "0.00", 4)
        );

        produtoRepository.saveAll(produtos);
        log.info("{} produtos inicializados!", produtos.size());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Categoria cat(String nome, String icone, String cor, int ordem) {
        return Categoria.builder().nome(nome).icone(icone).cor(cor).ordem(ordem).ativo(true).build();
    }

    private Produto p(String nome, String descricao, Categoria cat,
                      String tamanho, String preco, int ordem) {
        return Produto.builder()
                .nome(nome).descricao(descricao).categoria(cat)
                .tamanho(tamanho).preco(new BigDecimal(preco))
                .ativo(true).ordem(ordem)
                .build();
    }
}
