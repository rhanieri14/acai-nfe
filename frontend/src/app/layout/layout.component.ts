import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  sidebarVisible = true;
  pageTitle = 'Dashboard';

  private readonly pageTitles: Record<string, string> = {
    'dashboard':      'Dashboard',
    'novo-pedido':    'Novo Pedido',
    'pedidos-do-dia': 'Pedidos do Dia',
    'cardapio':       'Cardápio',
    'historico':      'Histórico',
    'configuracoes':  'Configurações'
  };

  readonly menuAtendimento: MenuItem[] = [
    { label: 'Dashboard',      icon: 'pi pi-home',          route: '/dashboard' },
    { label: 'Novo Pedido',    icon: 'pi pi-shopping-cart', route: '/novo-pedido' },
    { label: 'Pedidos do Dia', icon: 'pi pi-clipboard',     route: '/pedidos-do-dia' },
  ];

  readonly menuGestao: MenuItem[] = [
    { label: 'Cardápio',  icon: 'pi pi-book',    route: '/cardapio' },
    { label: 'Histórico', icon: 'pi pi-history', route: '/historico' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const segment = e.url.split('/').pop() ?? '';
        this.pageTitle = this.pageTitles[segment] ?? 'Dashboard';
      });

    const initial = this.router.url.split('/').pop() ?? 'dashboard';
    this.pageTitle = this.pageTitles[initial] ?? 'Dashboard';
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }
}
