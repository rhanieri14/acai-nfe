import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { ProdutoService } from '../../services/produto.service';
import { CategoriaService } from '../../services/categoria.service';
import { Produto, ProdutoGroup } from '../../models/produto.model';
import { Categoria, ICONES_DISPONIVEIS, CORES_PREDEFINIDAS } from '../../models/categoria.model';

@Component({
  selector: 'app-cardapio',
  templateUrl: './cardapio.component.html',
  styleUrls: ['./cardapio.component.scss']
})
export class CardapioComponent implements OnInit {

  grupos: ProdutoGroup[] = [];
  categorias: Categoria[] = [];
  loading = false;

  // ── Dialog Produto ──
  dialogProduto = false;
  editandoProduto = false;
  formProduto!: FormGroup;
  produtoEditId?: number;

  // ── Dialog Copiar Produtos ──
  dialogCopiar = false;
  copiarOrigemId:  number | null = null;
  copiarDestinoId: number | null = null;
  copiando = false;

  // ── Dialog Categoria ──
  dialogCategoria = false;
  editandoCategoria = false;
  formCategoria!: FormGroup;
  categoriaEditId?: number;
  dialogGerenciar = false;

  // ── Filtros ──
  filtroCategoria: number | null = null;
  filtroNome = '';

  // ── Constantes ──
  readonly icones    = ICONES_DISPONIVEIS;
  readonly coresPre  = CORES_PREDEFINIDAS;

  constructor(
    private produtoService:   ProdutoService,
    private categoriaService: CategoriaService,
    private fb:               FormBuilder,
    private messageService:   MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.carregar();
  }

  // ── Inicialização ────────────────────────────────────────────────────────────

  private initForms(): void {
    this.formProduto = this.fb.group({
      nome:       ['', [Validators.required, Validators.maxLength(100)]],
      descricao:  ['', Validators.maxLength(255)],
      categoriaId:[null, Validators.required],
      tamanho:    [''],
      preco:      [0, [Validators.required, Validators.min(0)]],
      ativo:      [true],
      ordem:      [0]
    });

    this.formCategoria = this.fb.group({
      nome:  ['', [Validators.required, Validators.maxLength(60)]],
      icone: ['pi pi-tag', Validators.required],
      cor:   ['#6B2D5C', Validators.required],
      ordem: [0],
      ativo: [true]
    });
  }

  // ── Dados ─────────────────────────────────────────────────────────────────────

  carregar(): void {
    this.loading = true;
    forkJoin({
      categorias: this.categoriaService.listarTodas(),
      produtos:   this.produtoService.listarTodos()
    }).subscribe({
      next: ({ categorias, produtos }) => {
        this.categorias = categorias;
        this.construirGrupos(produtos);
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar cardápio' });
        this.loading = false;
      }
    });
  }

  private construirGrupos(produtos: Produto[]): void {
    const filtrados = produtos.filter(p => {
      const passaCat  = this.filtroCategoria === null || p.categoriaId === this.filtroCategoria;
      const passaNome = !this.filtroNome.trim() ||
                        p.nome.toLowerCase().includes(this.filtroNome.toLowerCase());
      return passaCat && passaNome;
    });

    this.grupos = this.categorias
      .filter(cat => filtrados.some(p => p.categoriaId === cat.id))
      .map(cat => ({
        categoria: cat,
        produtos: filtrados.filter(p => p.categoriaId === cat.id)
      }));
  }

  aplicarFiltro(): void {
    this.produtoService.listarTodos().subscribe(produtos => this.construirGrupos(produtos));
  }

  get totalProdutos(): number { return this.grupos.reduce((s, g) => s + g.produtos.length, 0); }
  get totalAtivos():   number { return this.grupos.reduce((s, g) => s + g.produtos.filter(p => p.ativo).length, 0); }

  trackById(_: number, item: { id?: number }): number { return item.id!; }

  // ── CRUD Produto ─────────────────────────────────────────────────────────────

  abrirNovoProduto(): void {
    this.editandoProduto = false;
    this.produtoEditId   = undefined;
    this.formProduto.reset({ preco: 0, ativo: true, ordem: 0 });
    this.dialogProduto = true;
  }

  abrirEditarProduto(produto: Produto): void {
    this.editandoProduto = true;
    this.produtoEditId   = produto.id;
    this.formProduto.patchValue({
      nome:        produto.nome,
      descricao:   produto.descricao ?? '',
      categoriaId: produto.categoriaId,
      tamanho:     produto.tamanho ?? '',
      preco:       produto.preco,
      ativo:       produto.ativo,
      ordem:       produto.ordem
    });
    this.dialogProduto = true;
  }

  salvarProduto(): void {
    if (this.formProduto.invalid) { this.formProduto.markAllAsTouched(); return; }

    const data: Produto = this.formProduto.value;
    const op = this.editandoProduto && this.produtoEditId
      ? this.produtoService.atualizar(this.produtoEditId, data)
      : this.produtoService.criar(data);

    op.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Salvo', detail: `Produto ${this.editandoProduto ? 'atualizado' : 'adicionado'}!` });
        this.dialogProduto = false;
        this.carregar();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar produto' })
    });
  }

  onToggleAtivo(produto: Produto): void {
    this.produtoService.alternarAtivo(produto.id!).subscribe({
      next: () => {
        produto.ativo = !produto.ativo;
        this.messageService.add({ severity: 'info', summary: 'Atualizado', detail: `"${produto.nome}" ${produto.ativo ? 'ativado' : 'desativado'}` });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao alterar status' })
    });
  }

  confirmarExclusaoProduto(produto: Produto): void {
    this.confirmationService.confirm({
      message: `Deseja excluir "${produto.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-trash',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.produtoService.excluir(produto.id!).subscribe({
          next: () => { this.messageService.add({ severity: 'success', summary: 'Excluído', detail: `"${produto.nome}" removido` }); this.carregar(); },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir produto' })
        });
      }
    });
  }

  // ── CRUD Categoria ───────────────────────────────────────────────────────────

  abrirGerenciarCategorias(): void { this.dialogGerenciar = true; }

  abrirNovaCategoria(): void {
    this.editandoCategoria = false;
    this.categoriaEditId   = undefined;
    this.formCategoria.reset({ icone: 'pi pi-tag', cor: '#6B2D5C', ordem: 0, ativo: true });
    this.dialogCategoria = true;
  }

  abrirEditarCategoria(cat: Categoria): void {
    this.editandoCategoria = true;
    this.categoriaEditId   = cat.id;
    this.formCategoria.patchValue({ nome: cat.nome, icone: cat.icone, cor: cat.cor, ordem: cat.ordem, ativo: cat.ativo });
    this.dialogCategoria = true;
  }

  salvarCategoria(): void {
    if (this.formCategoria.invalid) { this.formCategoria.markAllAsTouched(); return; }

    const data: Categoria = this.formCategoria.value;
    const op = this.editandoCategoria && this.categoriaEditId
      ? this.categoriaService.atualizar(this.categoriaEditId, data)
      : this.categoriaService.criar(data);

    op.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Salvo', detail: `Categoria ${this.editandoCategoria ? 'atualizada' : 'criada'}!` });
        this.dialogCategoria = false;
        this.carregar();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar categoria' })
    });
  }

  confirmarExclusaoCategoria(cat: Categoria): void {
    this.confirmationService.confirm({
      message: `Deseja excluir a categoria "${cat.nome}"? Os produtos vinculados perderão a categoria.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-trash',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.categoriaService.excluir(cat.id!).subscribe({
          next: () => { this.messageService.add({ severity: 'success', summary: 'Excluída', detail: `"${cat.nome}" removida` }); this.carregar(); },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir categoria' })
        });
      }
    });
  }

  // ── Copiar Produtos ──────────────────────────────────────────────────────────

  abrirCopiarProdutos(categoriaOrigemId?: number): void {
    this.copiarOrigemId  = categoriaOrigemId ?? null;
    this.copiarDestinoId = null;
    this.dialogCopiar    = true;
  }

  executarCopia(): void {
    if (!this.copiarOrigemId || !this.copiarDestinoId) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione a origem e o destino.' });
      return;
    }
    if (this.copiarOrigemId === this.copiarDestinoId) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Origem e destino não podem ser iguais.' });
      return;
    }

    this.copiando = true;
    this.produtoService.copiar(this.copiarOrigemId, this.copiarDestinoId).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Copiado!', detail: res.mensagem });
        this.dialogCopiar = false;
        this.copiando     = false;
        this.carregar();
      },
      error: (err) => {
        const detail = err?.error?.message ?? 'Falha ao copiar produtos.';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail });
        this.copiando = false;
      }
    });
  }

  get categoriasDestinoDisponiveis(): Categoria[] {
    return this.categorias.filter(c => c.id !== this.copiarOrigemId);
  }

  isInvalidP(campo: string): boolean { const c = this.formProduto.get(campo); return !!(c?.invalid && c?.touched); }
  isInvalidC(campo: string): boolean { const c = this.formCategoria.get(campo); return !!(c?.invalid && c?.touched); }
}
