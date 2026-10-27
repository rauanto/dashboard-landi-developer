import { Injectable, signal, inject, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

/**
 * Servicio que maneja la lógica del side navigation
 * @author: rauntodev
 * @version: 1.0.0
 * @license: Fincrece
 * @date: 2026-02-09
 * @description: Servicio que maneja la lógica del side navigation
 */
@Injectable({
    providedIn: 'root'
})
export class SidenavService {
    private _router = inject(Router);
    private _breakpoint = inject(BreakpointObserver);

    /** true = expanded (full width), false = collapsed (icons only) - desktop only */
    readonly isOpen = signal(this.getInitialState());

    /** For mobile overlay mode */
    readonly isMobileOpen = signal(false);

    /** Whether we are on a mobile/tablet viewport */
    readonly isMobile = signal(false);

    /** Whether the sidebar content should show expanded (text + icons).
     *  On desktop: depends on isOpen.
     *  On mobile: always true when the overlay is showing.
     */
    readonly isExpanded = computed(() => {
        if (this.isMobile()) {
            return true; // mobile overlay always shows full content
        }
        return this.isOpen();
    });

    constructor() {
        this._breakpoint.observe([Breakpoints.Handset, Breakpoints.TabletPortrait]).subscribe(result => {
            this.isMobile.set(result.matches);
            if (result.matches) {
                this.isMobileOpen.set(false);
            }
        });

        this._router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            // Cerrar siempre al navegar, tanto en móvil como en desktop
            if (this.isMobile()) {
                this.isMobileOpen.set(false);
            } else {
                this.isOpen.set(false);
                localStorage.setItem('sidenav_open', 'false');
            }
        });
    }

    /**
     * Obtiene el estado inicial del side navigation
     * @returns Estado inicial del side navigation
     */
    private getInitialState(): boolean {
        return false;
    }

    /**
     * Alterna el estado del side navigation
     */
    toggle() {
        this.isOpen.update(v => {
            const newState = !v;
            localStorage.setItem('sidenav_open', String(newState));
            return newState;
        });
    }

    /**
     * Establece el estado del side navigation
     * @param value Estado del side navigation
     */
    set(value: boolean) {
        this.isOpen.set(value);
        localStorage.setItem('sidenav_open', String(value));
    }

    /**
     * Alterna el estado del side navigation móvil
     */
    toggleMobile() {
        this.isMobileOpen.update(v => !v);
    }

    /**
     * Cierra el side navigation móvil
     */
    closeMobile() {
        this.isMobileOpen.set(false);
    }

    
}
