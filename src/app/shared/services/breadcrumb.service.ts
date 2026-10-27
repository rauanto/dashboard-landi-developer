import { Injectable, signal } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, Data } from '@angular/router';
import { filter } from 'rxjs/operators';


/**
 * @description Interface para representar un breadcrumb
 * @author: rauntodev
 * @description: Interface para representar un breadcrumb
 */
export interface Breadcrumb {
    label: string;
    url: string;
}

/**
 * Servicio que maneja la lógica de los diálogos de documentos
 * @author: rauntodev
 * @version: 1.0.0
 * @license: Fincrece
 * @date: 2026-02-09
 * @description: Servicio que maneja la lógica de los diálogos de documentos
 */
@Injectable({
    providedIn: 'root'
})
export class BreadcrumbService {
    /**
     * @description Señal para almacenar los breadcrumbs
     * @type {Signal<Breadcrumb[]>}
     * @default signal<Breadcrumb[]>([])
     */
    breadcrumbs = signal<Breadcrumb[]>([]);

    /**
     * @description Constructor del servicio
     * @param router Router
     * @param activatedRoute ActivatedRoute
     */
    constructor(private router: Router, private activatedRoute: ActivatedRoute) {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                const root = this.activatedRoute.root;
                this.breadcrumbs.set(this.createBreadcrumbs(root));
            });
    }

    /**
     * Crea los breadcrumbs
     * @param route Ruta
     * @param url URL
     * @param breadcrumbs Breadcrumbs
     * @returns Breadcrumbs
     */
    private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
        const children: ActivatedRoute[] = route.children;

        if (children.length === 0) {
            return breadcrumbs;
        }

        for (const child of children) {
            const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
            if (routeURL !== '') {
                url += `/${routeURL}`;
            }

            const label = child.snapshot.data['breadcrumb'];
            if (label) {
                const last = breadcrumbs[breadcrumbs.length - 1];
                if (!last || last.label !== label) {
                    breadcrumbs.push({ label, url });
                }
            }

            return this.createBreadcrumbs(child, url, breadcrumbs);
        }

        return breadcrumbs;
    }

    /**
     * Navega al breadcrumb anterior
     * @param currentBreadcrumbs Breadcrumbs
     * @returns void
     */
    navigateBack() {
        const currentBreadcrumbs = this.breadcrumbs();
        if (currentBreadcrumbs.length > 1) {
            // Go to parent
            const parentUrl = currentBreadcrumbs[currentBreadcrumbs.length - 2].url;
            this.router.navigate([parentUrl]);
        } else {
            // Fallback if no parent, maybe home?
            this.router.navigate(['/']);
        }
    }
}
