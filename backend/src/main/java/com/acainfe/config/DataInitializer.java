package com.acainfe.config;

import com.acainfe.enums.Ambiente;
import com.acainfe.enums.RegimeTributario;
import com.acainfe.model.Empresa;
import com.acainfe.repository.EmpresaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final EmpresaRepository empresaRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (empresaRepository.count() == 0) {
            log.info("Iniciando carga de dados da empresa...");

            Empresa empresa = Empresa.builder()
                    // Dados básicos
                    .razaoSocial("MARIA MAGALHAES COMERCIO DE ALIMENTOS LTDA")
                    .nomeFantasia("UN REFRESCO")
                    .cnpj("43.500.127/0001-82")
                    .inscricaoEstadual("0808365400161")
                    .telefone("")
                    .email("")
                    // Endereço
                    .cep("71715-520")
                    .logradouro("Avenida Dom Bosco Bloco 790")
                    .numero("02")
                    .complemento("LOJA 02")
                    .bairro("Núcleo Bandeirante")
                    .municipio("Brasília")
                    .uf("DF")
                    .codigoIbge("5300108")
                    // Nota Fiscal
                    .habilitarEmissao(false)
                    .certificadoDigital("")
                    .senhaCertificado("")
                    .versaoQrCode("2.0")
                    .idCsc("2")
                    .csc("BFCD39B4D0C4DF69F1867C631ED0FD1")
                    .serieNfce(0)
                    .ultimoNumeroNfce(381)
                    .serieNfe(0)
                    .ultimoNumeroNfe(0)
                    .regimeTributario(RegimeTributario.SIMPLES_NACIONAL)
                    .ambiente(Ambiente.HOMOLOGACAO)
                    // Configuração Fiscal Padrão
                    .csosnIcms("500")
                    .reducaoBaseCalculo(BigDecimal.ZERO)
                    .aliquotaIcmsEfetiva(BigDecimal.ZERO)
                    .cstPisCofins("99")
                    .build();

            empresaRepository.save(empresa);
            log.info("Dados da empresa inicializados com sucesso!");
        }
    }
}
