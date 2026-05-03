import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { ComplementoService } from '../../services/complemento.service';
import { CategoriaService } from '../../services/categoria.service';
import { ProdutoService } from '../../services/produto.service';
import {
  Complemento,
  ProdutoSubprodutos,
  TipoComplemento,
  TIPO_CONFIG
} from '../../models/complemento.model';
import { Categoria } from '../../models/categoria.model';
import { Produto } from '../../models/produto.model';

interface CategoriaSubprodutos {
  categoria: Categoria;
  produtoGroups: ProdutoSubprodutos[];
}

@Component({
  selector: 'app-complementos',
  templateUrl: './complementos.component.html',
  styleUrls: ['./complementos.component.scss']
})
export class ComplementosComponent implements OnInit {

  grupos: CategoriaSubprodutos[] = [];
  categorias: Categoria[] = [];
  produtos: Produto[] = [];
  loading = false;

  // ── Dialog ──
  dialogComplemento = false;
  editando = false;
  form!: FormGroup;
  editId?: number;

  // ── Constantes ──
  readonly tipoConfig = TIPO_CONFIG;
  readonly tipoOpcoes: { label: string; value: TipoComplemento }[] = [
    { label: 'Acompanhamento', value: 'ACOMPANHAMENTO' },
    { label: 'Calda',          value: 'CALDA' },
    { label: 'Especial',       value: 'ESPECIAL' }
  ];

  constructor(
    private complementoService: ComplementoService,
    private categoriaService:   CategoriaService,
    private produtoService:     ProdutoService,
    private fb:                 FormBuilder,
    private messageService:     MessageService,
    private confirmationService:ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.carregar();
  }

  // ── Inicialização ─────────────────────────────────────────────────────────

  private initForm(): void {
    this.form = this.fb.group({
      nome:             ['', [Validators.required, Validators.maxLength(80)]],
      tipo:             ['ACOMPANHAMENTO', Validators.required],
      categoriaFiltroId:[null],          // só filtra a lista de produtos — não vai para API
      produtoId:        [null, Validators.required],
      precoExtra:       [3.00, [Validators.required, Validators.min(0)]],
      ativo:            [true],
      ordem:            [0]
    });

    // Ao trocar de categoria, reseta o produto selecionado
    this.form.get('categoriaFiltroId')!.valueChanges.subscribe(() => {
      this.form.get('produtoId')!.setValue(null);
    });
  }

  // ── Dados ─────────────────────────────────────────────────────────────────

  carregar(): void {
    this.loading = true;
    forkJoin({
      complementos: this.complementoService.listarTodos(),
      categorias:   this.categoriaService.listarTodas(),
      produtos:     this.produtoService.listarTodos()
    }).subscribe({
      next: ({ complementos, categorias, produtos }) => {
        this.categorias = categorias;
        this.produtos   = produtos;
        this.construirGrupos(complementos);
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar subprodutos' });
        this.loading = false;
      }
    });
  }

  private construirGrupos(complementos: Complemento[]): void {
    const catMap = new Map<number, CategoriaSubprodutos>();

    complementos.forEach(c => {
      const cat  = c.produto?.categoria!;
      const prod = c.produto!;
      if (!cat || !prod) return;

      if (!catMap.has(cat.id!)) {
        catMap.set(cat.id!, { categoria: cat, produtoGroups: [] });
      }

      const catGroup = catMap.get(cat.id!)!;
      let prodGroup  = catGroup.produtoGroups.find(pg => pg.produto.id === prod.id);
      if (!prodGroup) {
        prodGroup = { produto: prod, complementos: [] };
        catGroup.produtoGroups.push(prodGroup);
      }
      prodGroup.complementos.push(c);
    });

    // Ordena por categoria.ordem
    this.grupos = Array.from(catMap.values())
      .sort((a, b) => a.categoria.ordem - b.categoria.ordem);
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  get totalComplementos(): number {
    return this.grupos.reduce((s, g) =>
      s + g.produtoGroups.reduce((ps, pg) => ps + pg.complementos.length, 0), 0);
  }

  get totalAtivos(): number {
    return this.grupos.reduce((s, g) =>
      s + g.produtoGroups.reduce((ps, pg) =>
        ps + pg.complementos.filter(c => c.ativo).length, 0), 0);
  }

  get produtosFiltrados(): Produto[] {
    const catId = this.form.get('categoriaFiltroId')!.value;
    return catId ? this.produtos.filter(p => p.categoriaId === catId) : this.produtos;
  }

  get produtosParaDropdown(): { label: string; value: number }[] {
    return this.produtosFiltrados.map(p => ({
      label: p.tamanho ? `${p.nome} ${p.tamanho}` : p.nome,
      value: p.id!
    }));
  }

  get tipoAtual(): TipoComplemento {
    return this.form.get('tipo')!.value || 'ACOMPANHAMENTO';
  }

  trackByCat(_: number, g: CategoriaSubprodutos): number { return g.categoria.id!; }
  trackByProd(_: number, pg: ProdutoSubprodutos): number { return pg.produto.id!; }
  trackById(_: number, c: { id?: number }): number { return c.id!; }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  abrirNovo(produto?: Produto, tipoInicial?: TipoComplemento): void {
    this.editando = false;
    this.editId   = undefined;
    this.form.reset({
      nome: '', tipo: tipoInicial ?? 'ACOMPANHAMENTO',
      categoriaFiltroId: produto?.categoriaId ?? null,
      produtoId: produto?.id ?? null,
      precoExtra: 3.00, ativo: true, ordem: 0
    });
    this.dialogComplemento = true;
  }

  abrirEditar(c: Complemento): void {
    this.editando = true;
    this.editId   = c.id;
    this.form.patchValue({
      nome:             c.nome,
      tipo:             c.tipo,
      categoriaFiltroId: c.produto?.categoriaId ?? null,
      produtoId:        c.produtoId,
      precoExtra:       c.precoExtra,
      ativo:            c.ativo,
      ordem:            c.ordem
    });
    this.dialogComplemento = true;
  }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const { nome, tipo, produtoId, precoExtra, ativo, ordem } = this.form.value;
    const data: Complemento = { nome, tipo, produtoId, precoExtra, ativo, ordem };

    const op = this.editando && this.editId
      ? this.complementoService.atualizar(this.editId, data)
      : this.complementoService.criar(data);

    op.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Salvo', detail: `Subproduto ${this.editando ? 'atualizado' : 'adicionado'}!` });
        this.dialogComplemento = false;
        this.carregar();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar' })
    });
  }

  onToggleAtivo(c: Complemento): void {
    this.complementoService.alternarAtivo(c.id!).subscribe({
      next: () => {
        c.ativo = !c.ativo;
        this.messageService.add({ severity: 'info', summary: 'Atualizado', detail: `"${c.nome}" ${c.ativo ? 'ativado' : 'desativado'}` });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao alterar status' })
    });
  }

  confirmarExclusao(c: Complemento): void {
    this.confirmationService.confirm({
      message: `Deseja excluir "${c.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-trash',
      acceptLabel: 'Excluir', rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.complementoService.excluir(c.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Excluído', detail: `"${c.nome}" removido` });
            this.carregar();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir' })
        });
      }
    });
  }

  isInvalid(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c?.touched);
  }
}
