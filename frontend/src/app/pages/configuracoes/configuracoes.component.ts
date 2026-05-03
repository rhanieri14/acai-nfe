import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { EmpresaService } from '../../services/empresa.service';
import { Empresa } from '../../models/empresa.model';

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.scss']
})
export class ConfiguracoesComponent implements OnInit {

  formulario!: FormGroup;
  carregando = false;
  buscandoCep = false;

  regimeTributarioOptions = [
    { label: 'Simples Nacional', value: 'SIMPLES_NACIONAL' },
    { label: 'Lucro Presumido', value: 'LUCRO_PRESUMIDO' },
    { label: 'Lucro Real', value: 'LUCRO_REAL' }
  ];

  ambienteOptions = [
    { label: 'Homologação', value: 'HOMOLOGACAO' },
    { label: 'Produção', value: 'PRODUCAO' }
  ];

  versaoQrCodeOptions = [
    { label: 'Versão 2.0', value: '2.0' }
  ];

  csosnIcmsOptions = [
    { label: '101 - Tributada pelo Simples Nacional com permissão de crédito', value: '101' },
    { label: '102 - Tributada pelo Simples Nacional sem permissão de crédito', value: '102' },
    { label: '103 - Isenção do ICMS no Simples Nacional', value: '103' },
    { label: '201 - Tributada com permissão de crédito e substituição tributária', value: '201' },
    { label: '202 - Tributada sem permissão de crédito e substituição tributária', value: '202' },
    { label: '203 - Isenção do ICMS com substituição tributária', value: '203' },
    { label: '300 - Imunidade do ICMS', value: '300' },
    { label: '400 - Não incidência do ICMS', value: '400' },
    { label: '500 - ICMS cobrado anteriormente por substituição tributária', value: '500' },
    { label: '900 - Outras operações', value: '900' }
  ];

  cstPisCofinsOptions = [
    { label: '01 - Operação Tributável (Alíquota Normal)', value: '01' },
    { label: '02 - Operação Tributável (Alíquota Diferenciada)', value: '02' },
    { label: '03 - Operação Tributável (Qtd x Alíquota por Unidade)', value: '03' },
    { label: '04 - Operação Tributável Monofásica (Alíquota Zero)', value: '04' },
    { label: '05 - Operação Tributável (Substituição Tributária)', value: '05' },
    { label: '06 - Operação Tributável (Alíquota Zero)', value: '06' },
    { label: '07 - Operação Isenta da Contribuição', value: '07' },
    { label: '08 - Operação sem Incidência da Contribuição', value: '08' },
    { label: '09 - Operação com Suspensão da Contribuição', value: '09' },
    { label: '49 - Outras Operações de Saída', value: '49' },
    { label: '50 - Operação com Direito a Crédito', value: '50' },
    { label: '99 - Outras Operações', value: '99' }
  ];

  constructor(
    private fb: FormBuilder,
    private empresaService: EmpresaService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.criarFormulario();
    this.carregarDados();
  }

  private criarFormulario(): void {
    this.formulario = this.fb.group({
      razaoSocial: ['', Validators.required],
      nomeFantasia: ['', Validators.required],
      cnpj: [''],
      inscricaoEstadual: [''],
      telefone: [''],
      email: [''],
      cep: [''],
      logradouro: [''],
      numero: [''],
      complemento: [''],
      bairro: [''],
      municipio: [''],
      uf: [''],
      codigoIbge: [''],
      habilitarEmissao: [false],
      certificadoDigital: [''],
      senhaCertificado: [''],
      versaoQrCode: ['2.0'],
      idCsc: [''],
      csc: [''],
      serieNfce: [1],
      ultimoNumeroNfce: [0],
      serieNfe: [1],
      ultimoNumeroNfe: [0],
      regimeTributario: ['SIMPLES_NACIONAL'],
      ambiente: ['HOMOLOGACAO'],
      csosnIcms: ['500'],
      reducaoBaseCalculo: [0],
      aliquotaIcmsEfetiva: [0],
      cstPisCofins: ['99']
    });
  }

  private carregarDados(): void {
    this.carregando = true;
    this.empresaService.buscar().subscribe({
      next: (empresa: Empresa) => {
        this.formulario.patchValue(empresa);
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      }
    });
  }

  buscarCep(): void {
    const cep = this.formulario.get('cep')?.value?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) return;

    this.buscandoCep = true;
    this.empresaService.buscarCep(cep).subscribe({
      next: (response) => {
        if (response.erro) {
          this.messageService.add({ severity: 'warn', summary: 'CEP não encontrado', detail: 'Verifique o CEP informado.' });
        } else {
          this.formulario.patchValue({
            logradouro: response.logradouro,
            bairro: response.bairro,
            municipio: response.localidade,
            uf: response.uf,
            codigoIbge: response.ibge
          });
        }
        this.buscandoCep = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao buscar CEP.' });
        this.buscandoCep = false;
      }
    });
  }

  salvar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha os campos obrigatórios.' });
      return;
    }

    this.carregando = true;
    this.empresaService.salvar(this.formulario.value).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Configurações salvas com sucesso!' });
        this.carregando = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar configurações.' });
        this.carregando = false;
      }
    });
  }

  get ambienteProducao(): boolean {
    return this.formulario.get('ambiente')?.value === 'PRODUCAO';
  }
}
