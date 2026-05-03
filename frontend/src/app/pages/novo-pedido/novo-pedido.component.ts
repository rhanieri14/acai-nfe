import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

import { Produto, ProdutoGroup } from '../../models/produto.model';
import { GrupoComplemento, ItemComplemento } from '../../models/grupo-complemento.model';
import { FormaPagamento, ItemComplementoSelecionado, ItemPedidoLocal } from '../../models/pedido.model';
import { ProdutoService } from '../../services/produto.service';
import { CategoriaService } from '../../services/categoria.service';
import { GrupoComplementoService } from '../../services/grupo-complemento.service';
import { PedidoService } from '../../services/pedido.service';
import { Categoria } from '../../models/categoria.model';

@Component({
  selector: 'app-novo-pedido',
  templateUrl: './novo-pedido.component.html',
  styleUrls: ['./novo-pedido.component.scss']
})
export class NovoPedidoComponent implements OnInit {

  // ── Catálogo ────────────────────────────────────────────────────────────────

  categorias: Categoria[] = [];
  grupos: ProdutoGroup[] = [];
  categoriaSelecionada: number | null = null;
  loadingProdutos = false;

  // ── Modal de complementos ────────────────────────────────────────────────────

  showModalComplementos = false;
  produtoAtual: Produto | null = null;
  gruposAtual: GrupoComplemento[] = [];
  loadingGrupos = false;

  /** grupoId para id do item selecionado (grupos com limiteMax=1, radio) */
  selecaoUnica: { [grupoId: number]: number | null } = {};

  /** grupoId para lista de ids selecionados (grupos com limiteMax>1, checkbox) */
  selecaoMultipla: { [grupoId: number]: number[] } = {};

  // ── Pedido em aberto ─────────────────────────────────────────────────────────

  itensPedido: ItemPedidoLocal[] = [];

  // ── Modal de pagamento ───────────────────────────────────────────────────────

  showModalPagamento = false;
  formaPagamento: FormaPagamento = 'DINHEIRO';
  valorPago = 0;
  salvando = false;

  // ── Último pedido finalizado ─────────────────────────────────────────────────

  showModalSucesso = false;
  ultimoPedidoId: number | null = null;
  ultimoTroco = 0;

  readonly formasPagamento: FormaPagamento[] = ['DINHEIRO', 'DEBITO', 'CREDITO', 'PIX'];

  constructor(
    private produtoService: ProdutoService,
    private categoriaService: CategoriaService,
    private grupoService: GrupoComplementoService,
    private pedidoService: PedidoService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.carregarCatalogo();
  }

  // ── Catálogo ─────────────────────────────────────────────────────────────────

  carregarCatalogo(): void {
    this.loadingProdutos = true;
    forkJoin({
      categorias: this.categoriaService.listarAtivas(),
      produtos: this.produtoService.listarAtivos()
    }).subscribe({
      next: ({ categorias, produtos }) => {
        this.categorias = categorias;
        this.grupos = this.agruparPorCategoria(produtos);
        this.loadingProdutos = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Nao foi possivel carregar o cardapio.' });
        this.loadingProdutos = false;
      }
    });
  }

  private agruparPorCategoria(produtos: Produto[]): ProdutoGroup[] {
    const mapa = new Map<number, ProdutoGroup>();
    for (const p of produtos) {
      const catId = p.categoria!.id!;
      if (!mapa.has(catId)) {
        mapa.set(catId, { categoria: p.categoria!, produtos: [] });
      }
      mapa.get(catId)!.produtos.push(p);
    }
    return Array.from(mapa.values()).sort((a, b) => a.categoria.nome.localeCompare(b.categoria.nome));
  }

  get gruposFiltrados(): ProdutoGroup[] {
    if (this.categoriaSelecionada === null) return this.grupos;
    return this.grupos.filter(g => g.categoria.id === this.categoriaSelecionada);
  }

  filtrarCategoria(categoriaId: number | null): void {
    this.categoriaSelecionada = categoriaId;
  }

  // ── Seleção de produto e complementos ────────────────────────────────────────

  selecionarProduto(produto: Produto): void {
    this.produtoAtual = produto;
    this.gruposAtual = [];
    this.selecaoUnica = {};
    this.selecaoMultipla = {};
    this.loadingGrupos = true;
    this.showModalComplementos = true;

    this.grupoService.listarGruposDoProduto(produto.id!).subscribe({
      next: (grupos) => {
        this.gruposAtual = grupos.filter(g => g.ativo && g.itens.some(i => i.ativo));
        if (this.gruposAtual.length === 0) {
          this.showModalComplementos = false;
          this.adicionarAoPedido();
        }
        this.loadingGrupos = false;
      },
      error: () => {
        this.loadingGrupos = false;
        this.showModalComplementos = false;
        this.adicionarAoPedido();
      }
    });
  }

  isRadio(grupo: GrupoComplemento): boolean {
    return grupo.limiteMax === 1;
  }

  isItemSelecionado(grupo: GrupoComplemento, item: ItemComplemento): boolean {
    if (this.isRadio(grupo)) {
      return this.selecaoUnica[grupo.id!] === item.id;
    }
    return (this.selecaoMultipla[grupo.id!] || []).includes(item.id!);
  }

  toggleItem(grupo: GrupoComplemento, item: ItemComplemento): void {
    if (this.isRadio(grupo)) {
      this.selecaoUnica[grupo.id!] = this.selecaoUnica[grupo.id!] === item.id ? null : item.id!;
    } else {
      const sel = this.selecaoMultipla[grupo.id!] || [];
      const idx = sel.indexOf(item.id!);
      if (idx >= 0) {
        this.selecaoMultipla[grupo.id!] = sel.filter(id => id !== item.id);
      } else if (sel.length < grupo.limiteMax) {
        this.selecaoMultipla[grupo.id!] = [...sel, item.id!];
      }
    }
  }

  contadorSelecionados(grupo: GrupoComplemento): number {
    if (this.isRadio(grupo)) {
      return this.selecaoUnica[grupo.id!] ? 1 : 0;
    }
    return (this.selecaoMultipla[grupo.id!] || []).length;
  }

  selecoesValidas(): boolean {
    for (const grupo of this.gruposAtual) {
      if (grupo.limiteMin > 0 && this.contadorSelecionados(grupo) < grupo.limiteMin) {
        return false;
      }
    }
    return true;
  }

  adicionarAoPedido(): void {
    if (!this.produtoAtual) return;

    const complementos: ItemComplementoSelecionado[] = [];

    for (const grupo of this.gruposAtual) {
      if (this.isRadio(grupo)) {
        const selectedId = this.selecaoUnica[grupo.id!];
        if (selectedId) {
          const item = grupo.itens.find(i => i.id === selectedId);
          if (item) {
            complementos.push({ grupoId: grupo.id!, grupoNome: grupo.nome, itemId: item.id!, itemNome: item.nome, preco: item.preco });
          }
        }
      } else {
        for (const itemId of (this.selecaoMultipla[grupo.id!] || [])) {
          const item = grupo.itens.find(i => i.id === itemId);
          if (item) {
            complementos.push({ grupoId: grupo.id!, grupoNome: grupo.nome, itemId: item.id!, itemNome: item.nome, preco: item.preco });
          }
        }
      }
    }

    const precoComplementos = complementos.reduce((sum, c) => sum + c.preco, 0);
    const precoTotal = this.produtoAtual.preco + precoComplementos;

    const novoItem: ItemPedidoLocal = {
      uid: `${Date.now()}-${Math.random()}`,
      produtoId: this.produtoAtual.id!,
      nomeProduto: this.produtoAtual.nome,
      precoBase: this.produtoAtual.preco,
      quantidade: 1,
      complementos,
      subtotal: precoTotal
    };

    this.itensPedido = [...this.itensPedido, novoItem];
    this.showModalComplementos = false;
  }

  removerItem(uid: string): void {
    this.itensPedido = this.itensPedido.filter(i => i.uid !== uid);
  }

  // ── Cálculos ──────────────────────────────────────────────────────────────────

  get totalPedido(): number {
    return this.itensPedido.reduce((sum, i) => sum + i.subtotal, 0);
  }

  get troco(): number {
    if (this.formaPagamento !== 'DINHEIRO') return 0;
    const t = this.valorPago - this.totalPedido;
    return t > 0 ? t : 0;
  }

  podeFinalizar(): boolean {
    if (this.itensPedido.length === 0) return false;
    if (this.formaPagamento === 'DINHEIRO') {
      return this.valorPago >= this.totalPedido;
    }
    return true;
  }

  // ── Pagamento ────────────────────────────────────────────────────────────────

  abrirPagamento(): void {
    this.formaPagamento = 'DINHEIRO';
    this.valorPago = this.totalPedido;
    this.showModalPagamento = true;
  }

  finalizarPedido(): void {
    if (this.salvando || !this.podeFinalizar()) return;
    this.salvando = true;

    const dto = {
      formaPagamento: this.formaPagamento,
      valorPago: this.formaPagamento === 'DINHEIRO' ? this.valorPago : null,
      itens: this.itensPedido.map(item => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        complementoIds: item.complementos.map(c => c.itemId)
      }))
    };

    this.pedidoService.criar(dto).subscribe({
      next: (pedido) => {
        this.ultimoPedidoId = pedido.id;
        this.ultimoTroco = pedido.troco || 0;
        this.showModalPagamento = false;
        this.showModalSucesso = true;
        this.itensPedido = [];
        this.salvando = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Nao foi possivel finalizar o pedido.' });
        this.salvando = false;
      }
    });
  }

  novoPedido(): void {
    this.showModalSucesso = false;
    this.itensPedido = [];
    this.ultimoPedidoId = null;
    this.ultimoTroco = 0;
  }

  // ── Formatação ───────────────────────────────────────────────────────────────

  formatarComplementos(complementos: ItemComplementoSelecionado[]): string {
    return complementos.map(c => '*' + c.itemNome).join(', ');
  }

  formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  labelFormaPagamento(forma: FormaPagamento): string {
    const labels: Record<FormaPagamento, string> = {
      DINHEIRO: 'Dinheiro',
      DEBITO: 'Debito',
      CREDITO: 'Credito',
      PIX: 'Pix'
    };
    return labels[forma];
  }

  iconFormaPagamento(forma: FormaPagamento): string {
    const icons: Record<FormaPagamento, string> = {
      DINHEIRO: 'pi pi-money-bill',
      DEBITO: 'pi pi-credit-card',
      CREDITO: 'pi pi-credit-card',
      PIX: 'pi pi-qrcode'
    };
    return icons[forma];
  }

  // ── TrackBy ──────────────────────────────────────────────────────────────────

  trackByCategoria(_: number, c: Categoria): number { return c.id!; }
  trackByGrupoFiltrado(_: number, g: ProdutoGroup): number { return g.categoria.id!; }
  trackByProduto(_: number, p: Produto): number { return p.id!; }
  trackByGrupo(_: number, g: GrupoComplemento): number { return g.id!; }
  trackByItem(_: number, i: ItemComplemento): number { return i.id!; }
  trackByItemPedido(_: number, i: ItemPedidoLocal): string { return i.uid; }
}
