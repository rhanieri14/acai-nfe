package com.acainfe.dto;

import java.math.BigDecimal;

public record EmpresaDTO(
        String razaoSocial,
        String nomeFantasia,
        String cnpj,
        String inscricaoEstadual,
        String telefone,
        String email,
        String cep,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String municipio,
        String uf,
        String codigoIbge,
        Boolean habilitarEmissao,
        String certificadoDigital,
        String senhaCertificado,
        String versaoQrCode,
        String idCsc,
        String csc,
        Integer serieNfce,
        Integer ultimoNumeroNfce,
        Integer serieNfe,
        Integer ultimoNumeroNfe,
        String regimeTributario,
        String ambiente,
        String csosnIcms,
        BigDecimal reducaoBaseCalculo,
        BigDecimal aliquotaIcmsEfetiva,
        String cstPisCofins
) {}
