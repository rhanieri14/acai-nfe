package com.acainfe.service;

import com.acainfe.dto.EmpresaDTO;
import com.acainfe.enums.Ambiente;
import com.acainfe.enums.RegimeTributario;
import com.acainfe.model.Empresa;
import com.acainfe.repository.EmpresaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmpresaService {

    private final EmpresaRepository empresaRepository;

    public Optional<Empresa> buscar() {
        return empresaRepository.findAll().stream().findFirst();
    }

    public Empresa salvar(EmpresaDTO dto) {
        Empresa empresa = buscar().orElse(new Empresa());

        empresa.setRazaoSocial(dto.razaoSocial());
        empresa.setNomeFantasia(dto.nomeFantasia());
        empresa.setCnpj(dto.cnpj());
        empresa.setInscricaoEstadual(dto.inscricaoEstadual());
        empresa.setTelefone(dto.telefone());
        empresa.setEmail(dto.email());

        empresa.setCep(dto.cep());
        empresa.setLogradouro(dto.logradouro());
        empresa.setNumero(dto.numero());
        empresa.setComplemento(dto.complemento());
        empresa.setBairro(dto.bairro());
        empresa.setMunicipio(dto.municipio());
        empresa.setUf(dto.uf());
        empresa.setCodigoIbge(dto.codigoIbge());

        empresa.setHabilitarEmissao(dto.habilitarEmissao() != null ? dto.habilitarEmissao() : false);
        empresa.setCertificadoDigital(dto.certificadoDigital());
        empresa.setSenhaCertificado(dto.senhaCertificado());
        empresa.setVersaoQrCode(dto.versaoQrCode());
        empresa.setIdCsc(dto.idCsc());
        empresa.setCsc(dto.csc());
        empresa.setSerieNfce(dto.serieNfce());
        empresa.setUltimoNumeroNfce(dto.ultimoNumeroNfce());
        empresa.setSerieNfe(dto.serieNfe());
        empresa.setUltimoNumeroNfe(dto.ultimoNumeroNfe());

        if (dto.regimeTributario() != null) {
            empresa.setRegimeTributario(RegimeTributario.valueOf(dto.regimeTributario()));
        }
        if (dto.ambiente() != null) {
            empresa.setAmbiente(Ambiente.valueOf(dto.ambiente()));
        }

        empresa.setCsosnIcms(dto.csosnIcms());
        empresa.setReducaoBaseCalculo(dto.reducaoBaseCalculo());
        empresa.setAliquotaIcmsEfetiva(dto.aliquotaIcmsEfetiva());
        empresa.setCstPisCofins(dto.cstPisCofins());

        return empresaRepository.save(empresa);
    }
}
