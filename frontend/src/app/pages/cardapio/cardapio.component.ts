import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { ProdutoService } from '../../services/produto.service';
import { CategoriaService } from '../../services/categoria.service';
import { GrupoComplementoService } from '../../services/grupo-complemento.service';
import { Produto, ProdutoGroup } from '../../models/produto.model';
import { Categoria, ICONES_DISPONIVEIS, CORES_PREDEFINIDAS } from '../../models/categoria.model';
import { GrupoComplemento, ItemComplemento } from '../../models/grupo-complemento.model';

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

  // ── Dialog Grupos ──
  dialogGrupos        = false;
  produtoAtualGrupos?: Produto;
  gruposDoProduto:    GrupoComplemento[] = [];
  todosOsGrupos:      GrupoComplemento[] = [];
  grupoAtivo?:        GrupoComplemento;
  loadingGrupos       = false;

  // Edição inline do grupo ativo
  grupoEditNome       = '';
  grupoEditMin        = 0;
  grupoEditMax        = 3;

  // Painel adicionar grupo
  painelAddGrupo      = false;
  addGrupoModo:       'novo' | 'existente' = 'novo';
  addGrupoNome        = '';
  addGrupoMin         = 0;
  addGrupoMax         = 3;
  addGrupoExistenteId: number | null = null;
  salvandoGrupo       = false;

  // Item inline (adicionar)
  adicionandoItem     = false;
  novoItemNome        = '';
  novoItemPreco       = 0;

  // Item inline (editar)
  itemEditandoId?:    number;
  itemEditandoNome    = '';
  itemEditandoPreco   = 0;

  // Cache: produtoId → totalGrupos
  gruposCountMap: Record<number, number> = {};

  // ── Dialog Aplicar em Lote ──
  dialogLote          = false;
  loteGrupoId:        number | null = null;
  loteCategoriafiltro: number | null = null;
  loteSelecionados:   Set<number> = new Set();
  aplicandoLote       = false;

  constructor(
    private produtoService:        ProdutoService,
    private categoriaService:      CategoriaService,
    private grupoComplementoService: GrupoComplementoService,
    private fb:                    FormBuilder,
    private messageService:        MessageService,
    private confirmationService:   ConfirmationService
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

  trackById(_: number, item: { id?: number }): number          { return item.id!; }
  trackByProdutoGroup(_: number, g: ProdutoGroup): number       { return g.categoria.id!; }

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

  // ── Grupos de Complementos ───────────────────────────────────────────────────

  abrirGrupos(produto: Produto): void {
    this.produtoAtualGrupos  = produto;
    this.gruposDoProduto     = [];
    this.grupoAtivo          = undefined;
    this.painelAddGrupo      = false;
    this.adicionandoItem     = false;
    this.itemEditandoId      = undefined;
    this.dialogGrupos        = true;
    this.loadingGrupos       = true;

    forkJoin({
      dosProduto: this.grupoComplementoService.listarGruposDoProduto(produto.id!),
      todos:      this.grupoComplementoService.listarTodos()
    }).subscribe({
      next: ({ dosProduto, todos }) => {
        this.gruposDoProduto = dosProduto;
        this.todosOsGrupos   = todos;
        if (dosProduto.length > 0) this.selecionarGrupo(dosProduto[0]);
        this.loadingGrupos = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar grupos' });
        this.loadingGrupos = false;
      }
    });
  }

  selecionarGrupo(grupo: GrupoComplemento): void {
    this.grupoAtivo       = grupo;
    this.grupoEditNome    = grupo.nome;
    this.grupoEditMin     = grupo.limiteMin;
    this.grupoEditMax     = grupo.limiteMax;
    this.adicionandoItem  = false;
    this.itemEditandoId   = undefined;
    this.painelAddGrupo   = false;
  }

  salvarMetadadosGrupo(): void {
    if (!this.grupoAtivo?.id) return;
    const payload = {
      ...this.grupoAtivo,
      nome: this.grupoEditNome,
      limiteMin: this.grupoEditMin,
      limiteMax: this.grupoEditMax
    };
    this.grupoComplementoService.atualizar(this.grupoAtivo.id, payload).subscribe({
      next: (g) => {
        const idx = this.gruposDoProduto.findIndex(x => x.id === g.id);
        if (idx >= 0) this.gruposDoProduto[idx] = g;
        this.grupoAtivo = g;
        this.messageService.add({ severity: 'success', summary: 'Salvo', detail: 'Grupo atualizado!' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar grupo' })
    });
  }

  confirmarRemoverGrupoDoProduto(): void {
    if (!this.grupoAtivo || !this.produtoAtualGrupos) return;
    this.confirmationService.confirm({
      message: `Remover o grupo "${this.grupoAtivo.nome}" do produto "${this.produtoAtualGrupos.nome}"? Os outros produtos que utilizam este grupo não serão afetados.`,
      header: 'Remover Grupo',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Remover', rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => {
        this.grupoComplementoService
          .removerGrupoDoProduto(this.produtoAtualGrupos!.id!, this.grupoAtivo!.id!)
          .subscribe({
            next: () => {
              this.gruposDoProduto = this.gruposDoProduto.filter(g => g.id !== this.grupoAtivo!.id);
              this.grupoAtivo = this.gruposDoProduto[0];
              if (this.grupoAtivo) this.selecionarGrupo(this.grupoAtivo);
              this.atualizarCountGrupos(this.produtoAtualGrupos!.id!, this.gruposDoProduto.length);
              this.messageService.add({ severity: 'info', summary: 'Removido', detail: 'Grupo removido do produto' });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao remover grupo' })
          });
      }
    });
  }

  // ── Painel Adicionar Grupo ────────────────────────────────────────────────────

  abrirPainelAddGrupo(): void {
    this.painelAddGrupo      = true;
    this.addGrupoModo        = 'novo';
    this.addGrupoNome        = '';
    this.addGrupoMin         = 0;
    this.addGrupoMax         = 3;
    this.addGrupoExistenteId = null;
    this.grupoAtivo          = undefined;
  }

  get gruposDisponiveis(): GrupoComplemento[] {
    const idsJaAdicionados = new Set(this.gruposDoProduto.map(g => g.id));
    return this.todosOsGrupos.filter(g => !idsJaAdicionados.has(g.id));
  }

  confirmarAddGrupo(): void {
    if (!this.produtoAtualGrupos) return;
    this.salvandoGrupo = true;

    if (this.addGrupoModo === 'novo') {
      if (!this.addGrupoNome.trim()) {
        this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Digite o nome do grupo' });
        this.salvandoGrupo = false;
        return;
      }
      // Cria o grupo e depois associa ao produto
      this.grupoComplementoService.criar({
        nome: this.addGrupoNome.trim(),
        limiteMin: this.addGrupoMin,
        limiteMax: this.addGrupoMax,
        ativo: true,
        ordem: 0,
        itens: []
      }).subscribe({
        next: (novoGrupo) => {
          this.todosOsGrupos.push(novoGrupo);
          this.grupoComplementoService
            .adicionarGrupoAoProduto(this.produtoAtualGrupos!.id!, novoGrupo.id!)
            .subscribe({
              next: () => {
                this.gruposDoProduto.push(novoGrupo);
                this.selecionarGrupo(novoGrupo);
                this.painelAddGrupo = false;
                this.salvandoGrupo  = false;
                this.atualizarCountGrupos(this.produtoAtualGrupos!.id!, this.gruposDoProduto.length);
                this.messageService.add({ severity: 'success', summary: 'Criado', detail: `Grupo "${novoGrupo.nome}" criado e adicionado!` });
              },
              error: () => { this.salvandoGrupo = false; }
            });
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar grupo' });
          this.salvandoGrupo = false;
        }
      });
    } else {
      if (!this.addGrupoExistenteId) {
        this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione um grupo' });
        this.salvandoGrupo = false;
        return;
      }
      this.grupoComplementoService
        .adicionarGrupoAoProduto(this.produtoAtualGrupos!.id!, this.addGrupoExistenteId)
        .subscribe({
          next: () => {
            const grupo = this.todosOsGrupos.find(g => g.id === this.addGrupoExistenteId)!;
            this.gruposDoProduto.push(grupo);
            this.selecionarGrupo(grupo);
            this.painelAddGrupo = false;
            this.salvandoGrupo  = false;
            this.atualizarCountGrupos(this.produtoAtualGrupos!.id!, this.gruposDoProduto.length);
            this.messageService.add({ severity: 'success', summary: 'Adicionado', detail: `Grupo "${grupo.nome}" adicionado ao produto!` });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao adicionar grupo' });
            this.salvandoGrupo = false;
          }
        });
    }
  }

  // ── Itens ─────────────────────────────────────────────────────────────────────

  iniciarAddItem(): void {
    this.adicionandoItem  = true;
    this.novoItemNome     = '';
    this.novoItemPreco    = 0;
    this.itemEditandoId   = undefined;
  }

  cancelarAddItem(): void {
    this.adicionandoItem = false;
  }

  confirmarAddItem(): void {
    if (!this.grupoAtivo?.id || !this.novoItemNome.trim()) return;
    this.grupoComplementoService.adicionarItem(this.grupoAtivo.id, {
      nome: this.novoItemNome.trim(),
      preco: this.novoItemPreco,
      ativo: true,
      ordem: 0
    }).subscribe({
      next: (grupoAtualizado) => {
        this.grupoAtivo = grupoAtualizado;
        const idx = this.gruposDoProduto.findIndex(g => g.id === grupoAtualizado.id);
        if (idx >= 0) this.gruposDoProduto[idx] = grupoAtualizado;
        this.adicionandoItem = false;
        this.messageService.add({ severity: 'success', summary: 'Adicionado', detail: `"${this.novoItemNome.trim()}" adicionado!` });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao adicionar item' })
    });
  }

  iniciarEditItem(item: ItemComplemento): void {
    this.itemEditandoId    = item.id;
    this.itemEditandoNome  = item.nome;
    this.itemEditandoPreco = item.preco;
    this.adicionandoItem   = false;
  }

  cancelarEditItem(): void {
    this.itemEditandoId = undefined;
  }

  confirmarEditItem(): void {
    if (!this.grupoAtivo?.id || !this.itemEditandoId) return;
    this.grupoComplementoService.atualizarItem(this.grupoAtivo.id, this.itemEditandoId, {
      nome:  this.itemEditandoNome.trim(),
      preco: this.itemEditandoPreco,
      ativo: true,
      ordem: 0
    }).subscribe({
      next: (grupoAtualizado) => {
        this.grupoAtivo = grupoAtualizado;
        const idx = this.gruposDoProduto.findIndex(g => g.id === grupoAtualizado.id);
        if (idx >= 0) this.gruposDoProduto[idx] = grupoAtualizado;
        this.itemEditandoId = undefined;
        this.messageService.add({ severity: 'success', summary: 'Salvo', detail: 'Item atualizado!' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar item' })
    });
  }

  confirmarExcluirItem(item: ItemComplemento): void {
    if (!this.grupoAtivo?.id) return;
    this.confirmationService.confirm({
      message: `Excluir "${item.nome}"?`,
      header: 'Confirmar',
      icon: 'pi pi-trash',
      acceptLabel: 'Excluir', rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.grupoComplementoService.excluirItem(this.grupoAtivo!.id!, item.id!).subscribe({
          next: () => {
            this.grupoAtivo!.itens = this.grupoAtivo!.itens.filter(i => i.id !== item.id);
            this.messageService.add({ severity: 'success', summary: 'Excluído', detail: `"${item.nome}" removido` });
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir item' })
        });
      }
    });
  }

  // ── Utils ────────────────────────────────────────────────────────────────────

  private atualizarCountGrupos(produtoId: number, total: number): void {
    this.gruposCountMap = { ...this.gruposCountMap, [produtoId]: total };
  }

  getGruposCount(produto: Produto): number {
    return this.gruposCountMap[produto.id!] ?? 0;
  }

  trackByGrupo(_: number, g: GrupoComplemento): number { return g.id!; }
  trackByItem(_: number, i: ItemComplemento): number    { return i.id!; }

  // ── Aplicar em Lote ──────────────────────────────────────────────────────────

  abrirLote(): void {
    this.loteGrupoId         = null;
    this.loteCategoriafiltro = null;
    this.loteSelecionados     = new Set();
    this.dialogLote           = true;

    // Garante que todosOsGrupos está carregado
    if (this.todosOsGrupos.length === 0) {
      this.grupoComplementoService.listarTodos().subscribe(g => this.todosOsGrupos = g);
    }
  }

  get produtosParaLote(): Produto[] {
    return this.grupos
      .filter(g => this.loteCategoriafiltro === null || g.categoria.id === this.loteCategoriafiltro)
      .flatMap(g => g.produtos);
  }

  get todosLoteSelecionados(): boolean {
    return this.produtosParaLote.length > 0 &&
           this.produtosParaLote.every(p => this.loteSelecionados.has(p.id!));
  }

  toggleLoteProduto(produtoId: number): void {
    if (this.loteSelecionados.has(produtoId)) {
      this.loteSelecionados.delete(produtoId);
    } else {
      this.loteSelecionados.add(produtoId);
    }
    this.loteSelecionados = new Set(this.loteSelecionados); // trigger change detection
  }

  toggleLoteTodos(): void {
    if (this.todosLoteSelecionados) {
      this.produtosParaLote.forEach(p => this.loteSelecionados.delete(p.id!));
    } else {
      this.produtosParaLote.forEach(p => this.loteSelecionados.add(p.id!));
    }
    this.loteSelecionados = new Set(this.loteSelecionados);
  }

  confirmarLote(): void {
    if (!this.loteGrupoId || this.loteSelecionados.size === 0) return;
    this.aplicandoLote = true;
    this.grupoComplementoService
      .aplicarEmLote(this.loteGrupoId, Array.from(this.loteSelecionados))
      .subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Aplicado!', detail: res.mensagem });
          // Atualiza o cache de contagem para os produtos afetados
          this.loteSelecionados.forEach(id => {
            this.gruposCountMap[id] = (this.gruposCountMap[id] ?? 0) + (res.aplicados > 0 ? 1 : 0);
          });
          this.dialogLote    = false;
          this.aplicandoLote = false;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao aplicar grupo' });
          this.aplicandoLote = false;
        }
      });
  }

  formatarPrecoItem(preco: number): string {
    if (!preco || preco === 0) return 'Grátis';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);
  }
}
