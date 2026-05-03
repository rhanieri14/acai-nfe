export interface ItemComplemento {
  id?: number;
  nome: string;
  preco: number;
  ativo: boolean;
  ordem: number;
}

export interface GrupoComplemento {
  id?: number;
  nome: string;
  limiteMin: number;
  limiteMax: number;
  ativo: boolean;
  ordem: number;
  itens: ItemComplemento[];
}
