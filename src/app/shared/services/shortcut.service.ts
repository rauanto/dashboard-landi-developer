import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Observable, fromEvent } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root' // Patrón Singleton: Una sola instancia para toda la app
})
export class ShortcutService {
  // Inyectamos DOCUMENT de forma segura para SSR
  private document = inject(DOCUMENT);

  /**
   * Escucha un atajo de teclado específico.
   * @param key La tecla a escuchar (ej. 'q', 's', 'Enter')
   * @param requiresCtrl Si necesita que se presione Control o Command
   * @returns Un Observable que emite el evento cuando se detecta el atajo
   */
  onShortcut(key: string, requiresCtrl: boolean = true): Observable<KeyboardEvent> {
    // Creamos un flujo reactivo desde los eventos del teclado
    return fromEvent<KeyboardEvent>(this.document, 'keydown').pipe(
      filter(event => {
        // Soporte para Windows (Ctrl) y Mac (Cmd)
        const isCtrlOrCmd = event.ctrlKey || event.metaKey;
        
        // Verificamos si coincide el estado de la tecla Ctrl/Cmd
        const matchModifiers = requiresCtrl ? isCtrlOrCmd : !isCtrlOrCmd;
        
        // Verificamos si la tecla presionada es la correcta
        return matchModifiers && event.key.toLowerCase() === key.toLowerCase();
      }),
      // Interceptamos el evento justo antes de emitirlo para prevenir la acción por defecto
      tap(event => event.preventDefault())
    );
  }
}