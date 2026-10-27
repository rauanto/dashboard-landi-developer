import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class RouteLoadingService {
    private _router = inject(Router);

    readonly isNavigating = signal(false);
    readonly isLoginTransition = signal(false);

    constructor() {
        this._router.events.pipe(
            filter(event =>
                event instanceof NavigationStart ||
                event instanceof NavigationEnd ||
                event instanceof NavigationCancel ||
                event instanceof NavigationError
            )
        ).subscribe(event => {
            if (event instanceof NavigationStart) {
                this.isNavigating.set(true);
                // Si la URL actual incluía 'login', marca la transición como transición de login.
                // En un inicio limpio puede ser '/' también que vaya al home luego de validación, pero asumimos el /login.
                if (this._router.url.includes('login') || this._router.url === '/') {
                    this.isLoginTransition.set(true);
                }
            } else {
                this.isNavigating.set(false);
                this.isLoginTransition.set(false);
            }
        });
    }
}
