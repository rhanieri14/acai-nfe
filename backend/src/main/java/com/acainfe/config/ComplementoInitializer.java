package com.acainfe.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Subprodutos são gerenciados pelo usuário através da interface.
 * Não há seed automático — a hierarquia Produto→Subproduto é definida manualmente.
 */
@Slf4j
@Component
@Order(3)
public class ComplementoInitializer implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) {
        log.info("Subprodutos gerenciados via UI — nenhum seed automático.");
    }
}
