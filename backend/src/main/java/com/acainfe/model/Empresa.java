package com.acainfe.model;

import com.acainfe.enums.Ambiente;
import com.acainfe.enums.RegimeTributario;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "empresa")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Dados básicos
    private String razaoSocial;
    private String nomeFantasia;
    private String cnpj;
    private String inscricaoEstadual;
    private String telefone;
    private String email;

    // Endereço
    private String cep;
    private String logradouro;
    private String numero;
    private String complemento;
    private String bairro;
    private String municipio;
    private String uf;
    private String codigoIbge;

    // Nota Fiscal
    @Builder.Default
    private Boolean habilitarEmissao = false;

    private String certificadoDigital;
    private String senhaCertificado;

    @Builder.Default
    private String versaoQrCode = "2.0";

    private String idCsc;
    private String csc;

    @Builder.Default
    private Integer serieNfce = 1;

    @Builder.Default
    private Integer ultimoNumeroNfce = 0;

    @Builder.Default
    private Integer serieNfe = 1;

    @Builder.Default
    private Integer ultimoNumeroNfe = 0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RegimeTributario regimeTributario = RegimeTributario.SIMPLES_NACIONAL;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Ambiente ambiente = Ambiente.HOMOLOGACAO;

    // Configuração Fiscal Padrão
    @Builder.Default
    private String csosnIcms = "500";

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal reducaoBaseCalculo = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal aliquotaIcmsEfetiva = BigDecimal.ZERO;

    @Builder.Default
    private String cstPisCofins = "99";
}
