import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Produto } from '../../../models/produto.model';

@Component({
  selector: 'app-produto-card',
  templateUrl: './produto-card.component.html',
  styleUrls: ['./produto-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProdutoCardComponent {

  @Input({ required: true }) produto!: Produto;
  @Input() accentColor = '#6B2D5C';

  @Output() editar           = new EventEmitter<Produto>();
  @Output() excluir          = new EventEmitter<Produto>();
  @Output() toggleAtivo      = new EventEmitter<Produto>();
  @Output() gerenciarGrupos  = new EventEmitter<Produto>();

  @Input() totalGrupos = 0;

  get precoFormatado(): string {
    if (!this.produto.preco || this.produto.preco === 0) return 'A definir';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
      .format(this.produto.preco);
  }

  get isPrecoDefinido(): boolean {
    return this.produto.preco > 0;
  }
}
