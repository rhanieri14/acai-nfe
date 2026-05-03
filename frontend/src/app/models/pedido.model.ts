export type FormaPagamento = 'DINHEIRO' | 'DEBITO' | 'CREDITO' | 'PIX';

export interface ItemComplementoSelecionado {
  grupoId: number;
  grupoNome: string;
  itemId: number;
  itemNome: string;
  preco: number;
}

/** Item no pedido local (apenas no front, antes de finalizar) */
export interface ItemPedidoLocal {
  uid: string;
  produtoId: number;
  nomeProduto: string;
  precoBase: number;
  quantidade: number;
  complementos: ItemComplementoSelecionado[];
  subtotal: number;
}

// ── DTOs de entrada (enviados para API) ──────────────────────────────────────

export interface ItemPedidoInputDTO {
  produtoId: number;
  quantidade: number;
  complementoIds: number[];
}

export interface CriarPedidoDTO {
  formaPagamento: FormaPagamento;
  valorPago: number | null;
  itens: ItemPedidoInputDTO[];
}

// ── DTOs de resposta (recebidos da API) ──────────────────────────────────────

export interface ComplementoRespostaDTO {
  nomeComplemento: string;
  nomeGrupo: string;
  preco: number;
}

export interface ItemPedidoRespostaDTO {
  id: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  complementos: ComplementoRespostaDTO[];
}

export interface PedidoRespostaDTO {
  id: number;
  dataHora: string;
  status: string;
  formaPagamento: string;
  valorTotal: number;
  valorPago: number;
  troco: number;
  itens: ItemPedidoRespostaDTO[];
}
