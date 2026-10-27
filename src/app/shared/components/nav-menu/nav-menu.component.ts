import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { SidenavService } from '@shared/services/sidenav.service';

export interface NavItem {
  path: string;
  icon: string;
  label: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
  collapsible?: boolean;
  expanded?: boolean;
}

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.css'
})
export class NavMenuComponent {
  public sidenavService = inject(SidenavService);

  sections = input<NavSection[]>([]);

  toggleSection(section: NavSection) {
    if (section.collapsible) {
      section.expanded = !section.expanded;
    }
  }
}
