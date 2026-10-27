import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { SidenavService } from '@shared/services/sidenav.service';
import { RouteLoadingService } from '@core/services/route-loading.service';

@Component({
    selector: 'app-dashboard-layout',
    standalone: true,
    imports: [
        CommonModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatRippleModule
    ],
    templateUrl: './dashboard-layout.component.html',
    styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent {
    sidenavService = inject(SidenavService);
    routeLoading = inject(RouteLoadingService);
    /** Controls the logo ↔ expand-icon crossfade in collapsed state */
    protected brandHovered = signal(false);
}
