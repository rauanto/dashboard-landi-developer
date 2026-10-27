import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';

import { DashboardLayoutComponent } from '@shared/layout/dashboard-layout/dashboard-layout.component';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { ProfileCardComponent } from '@shared/components/profile-card/profile-card.component';
import { NavMenuComponent, NavSection } from '@shared/components/nav-menu/nav-menu.component';

import { ThemeService } from '@core/services/theme.service';
import { AuthService } from '@core/services/auth.service';
import { SidenavService } from '@shared/services/sidenav.service';
import { AnalistaSidenavService } from '@shared/services/analista-sidenav.service';
import { GlobalSidenavService } from '@shared/services/global-sidenav.service';
import { PortalModule } from '@angular/cdk/portal';

import {DarkBtn} from '@shared/components/dark-btn/dark-btn'

@Component({
  selector: 'app-feature-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    DashboardLayoutComponent,
    FooterComponent,
    ProfileCardComponent,
    NavMenuComponent,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSidenavModule,
    PortalModule,
    DarkBtn
  ],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout {
  public themeService = inject(ThemeService);
  public authService = inject(AuthService);
  public sidenavService = inject(SidenavService);
  public analistaSidenavService = inject(AnalistaSidenavService);
  public globalSidenav = inject(GlobalSidenavService);
  
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  user: any; // Ideally fetched from authService or user state
  public pageTitle = 'Dashboard';

  public navSections: NavSection[] = [
    {
      title: 'Cuadernos',
      items: [
        { path: '/analista/nuevo', icon: 'add', label: 'Nuevo cuaderno' },
        { path: '/analista/flutter', icon: 'book', label: 'Flutter y dart Lenguaje de program...' },
        { path: '/analista/rust', icon: 'book', label: 'Rust lenguaje de programacion' },
        { path: '/analista/todos', icon: 'more_horiz', label: 'Todos los cuadernos' }
      ]
    },
    {
      title: 'Herramientas',
      collapsible: true,
      expanded: false,
      items: [
        { path: '/dashboard/view-tables', icon: 'table_view', label: 'Tablas' },
      ]
    },
    {
      title: 'Administración',
      collapsible: true,
      expanded: false,
      items: [
        { path: '/dashboard/roles', icon: 'manage_accounts', label: 'Roles' },
        { path: '/dashboard/permissions', icon: 'security', label: 'Permisos' },
      ]
    }
  ];

  ngOnInit() {
    this.updateTitle();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateTitle();
    });
  }

  private updateTitle() {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    route.data.subscribe((data) => {
      this.pageTitle = data['breadcrumb'] || 'FinCrece Analista';
    });
  }
}
