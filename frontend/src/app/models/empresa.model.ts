export interface Empresa {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  telefone: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  codigoIbge: string;
  habilitarEmissao: boolean;
  certificadoDigital: string;
  senhaCertificado: string;
  versaoQrCode: string;
  idCsc: string;
  csc: string;
  serieNfce: number;
  ultimoNumeroNfce: number;
  serieNfe: number;
  ultimoNumeroNfe: number;
  regimeTributario: string;
  ambiente: string;
  csosnIcms: string;
  reducaoBaseCalculo: number;
  aliquotaIcmsEfetiva: number;
  cstPisCofins: string;
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  erro?: boolean;
}
