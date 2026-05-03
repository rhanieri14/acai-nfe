export interface Categoria {
  id?: number;
  nome: string;
  icone: string;
  cor: string;
  ordem: number;
  ativo: boolean;
}

export const ICONES_DISPONIVEIS = [
  { label: 'Coração',     value: 'pi pi-heart-fill' },
  { label: 'Caixa',       value: 'pi pi-inbox' },
  { label: 'Círculo',     value: 'pi pi-circle' },
  { label: 'Estrela',     value: 'pi pi-star-fill' },
  { label: 'Nuvem',       value: 'pi pi-cloud' },
  { label: 'Etiqueta',    value: 'pi pi-tag' },
  { label: 'Copo/Drink',  value: 'pi pi-glass-martini' },
  { label: 'Talheres',    value: 'pi pi-table' },
  { label: 'Cupcake',     value: 'pi pi-gift' },
  { label: 'Carrinho',    value: 'pi pi-shopping-cart' },
  { label: 'Folha',       value: 'pi pi-leaf' },
  { label: 'Chama',       value: 'pi pi-bolt' },
  { label: 'Diamante',    value: 'pi pi-diamond' },
  { label: 'Sino',        value: 'pi pi-bell' },
];

export const CORES_PREDEFINIDAS = [
  '#6B2D5C', '#0D9488', '#D97706', '#DB2777', '#2563EB',
  '#7C3AED', '#DC2626', '#059669', '#D97706', '#0891B2',
  '#374151', '#9333EA', '#B45309', '#0369A1',
];
