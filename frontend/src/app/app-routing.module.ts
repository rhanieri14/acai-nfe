import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NovoPedidoComponent } from './pages/novo-pedido/novo-pedido.component';
import { PedidosDoDiaComponent } from './pages/pedidos-do-dia/pedidos-do-dia.component';
import { CardapioComponent } from './pages/cardapio/cardapio.component';
import { HistoricoComponent } from './pages/historico/historico.component';
import { ConfiguracoesComponent } from './pages/configuracoes/configuracoes.component';
import { ComplementosComponent } from './pages/complementos/complementos.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'novo-pedido', component: NovoPedidoComponent },
      { path: 'pedidos-do-dia', component: PedidosDoDiaComponent },
      { path: 'cardapio', component: CardapioComponent },
      { path: 'complementos', component: ComplementosComponent },
      { path: 'historico', component: HistoricoComponent },
      { path: 'configuracoes', component: ConfiguracoesComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
