import { Produto } from './produto.model';

export type TipoComplemento = 'ACOMPANHAMENTO' | 'CALDA' | 'ESPECIAL';

export interface Complemento {
  id?: number;
  nome: string;
  tipo: TipoComplemento;
  produtoId: number;
  produto?: Produto;      // preenchido nas respostas
  precoExtra: number;
  ativo: boolean;
  ordem: number;
}

// ── Estrutura de agrupamento para exibição ────────────────────────────────────

export interface ProdutoSubprodutos {
  produto: Produto;
  complementos: Complemento[];
}

// ── Config visual por tipo ─────────────────────────────────────────────────────

export const TIPO_CONFIG: Record<string, { label: string; icone: string; cor: string; descricao: string }> = {
  ACOMPANHAMENTO: {
    label: 'Acompanhamento',
    icone: 'pi pi-list',
    cor: '#6B2D5C',
    descricao: 'Grátis até o limite; +R$3 cada extra'
  },
  CALDA: {
    label: 'Calda',
    icone: 'pi pi-tint',
    cor: '#0891B2',
    descricao: 'Grátis 1 calda; +R$3 cada extra'
  },
  ESPECIAL: {
    label: 'Especial',
    icone: 'pi pi-star-fill',
    cor: '#D97706',
    descricao: 'Sempre cobrado'
  }
};
