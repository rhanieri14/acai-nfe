import { Categoria } from './categoria.model';

export interface Produto {
  id?: number;
  nome: string;
  descricao?: string;
  categoriaId: number;
  categoria?: Categoria;
  tamanho?: string;
  preco: number;
  ativo: boolean;
  ordem: number;
}

export interface ProdutoGroup {
  categoria: Categoria;
  produtos: Produto[];
}
