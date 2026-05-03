import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NovoPedidoComponent } from './pages/novo-pedido/novo-pedido.component';
import { PedidosDoDiaComponent } from './pages/pedidos-do-dia/pedidos-do-dia.component';
import { CardapioComponent } from './pages/cardapio/cardapio.component';
import { ProdutoCardComponent } from './pages/cardapio/produto-card/produto-card.component';
import { HistoricoComponent } from './pages/historico/historico.component';
import { ConfiguracoesComponent } from './pages/configuracoes/configuracoes.component';
import { ComplementosComponent } from './pages/complementos/complementos.component';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { SelectButtonModule } from 'primeng/selectbutton';

import { MessageService, ConfirmationService } from 'primeng/api';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    DashboardComponent,
    NovoPedidoComponent,
    PedidosDoDiaComponent,
    CardapioComponent,
    ProdutoCardComponent,
    HistoricoComponent,
    ConfiguracoesComponent,
    ComplementosComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    AppRoutingModule,
    CardModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    InputMaskModule,
    InputNumberModule,
    InputSwitchModule,
    DropdownModule,
    TabViewModule,
    ToastModule,
    ProgressSpinnerModule,
    TableModule,
    DialogModule,
    TagModule,
    ToolbarModule,
    ConfirmDialogModule,
    TooltipModule,
    SelectButtonModule
  ],
  providers: [MessageService, ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
