/**
 * Servicio de tema modo oscuro y claro.
 * @module ThemeService
 * @description
 * Servicio que se encarga de la gestion de temas.
 * @version 1.0.0
 * @author rauantodev
 * 
 */


import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private _document = inject(DOCUMENT);
    darkMode = signal<boolean>(false);

    /**
     * Constructor del servicio.
     * @constructor
     * @description
     * Inicializa el servicio y carga el tema guardado en localStorage.
     */
    constructor() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.darkMode.set(savedTheme === 'dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.darkMode.set(prefersDark);
        }

        effect(() => {
            if (this.darkMode()) {
                this._document.documentElement.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                this._document.documentElement.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    /**
     * Alterna el tema entre oscuro y claro.
     * @method
     * @description
     * Alterna el tema entre oscuro y claro.
     */
    toggleTheme() {
        this.darkMode.update(isDark => !isDark);
    }
}
