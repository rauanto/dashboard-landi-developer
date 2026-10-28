import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'neutral';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** Por qué se cerró un toast. */
export type ToastCloseReason = 'timeout' | 'manual' | 'action' | 'event' | 'api' | 'swipe' | 'clear';

export interface ToastAction {
  label: string;
  onClick?: () => void;
  /** Cierra el toast al hacer click (default true). */
  dismiss?: boolean;
}

export interface ToastOptions {
  /** Clave estable: si ya existe un toast con este id, se actualiza en lugar de duplicarse. */
  id?: string;
  /** Texto secundario, puede ser largo (se recorta con "Ver más"). */
  description?: string;
  /**
   * Milisegundos visible. `0` = permanente (solo se cierra manual, por evento o por API).
   * Si se omite se calcula según el tipo y el largo del texto.
   */
  duration?: number;
  position?: ToastPosition;
  /** Muestra el botón de cerrar y permite deslizar para descartar (default true). */
  dismissible?: boolean;
  /**
   * Toast bloqueante: mientras esté visible, los demás toasts esperan en cola
   * y aparecen cuando éste se cierre. Implica `duration: 0` si no se define.
   */
  blocking?: boolean;
  /** Barra de tiempo restante (default true en toasts con duración). */
  progress?: boolean;
  pauseOnHover?: boolean;
  /** Nombre de mat-icon, o null para ocultar el ícono. */
  icon?: string | null;
  action?: ToastAction;
  /** Se cierra cuando el Observable emite o la Promise se resuelve. */
  closeOn?: Observable<unknown> | PromiseLike<unknown>;
  /** Agrupa mensajes idénticos con un contador ×N (default true). */
  dedupe?: boolean;
  onDismiss?: (reason: ToastCloseReason) => void;
}

export interface ToastShowOptions extends ToastOptions {
  message: string;
  type?: ToastType;
}

export type ToastUpdate = Partial<
  Pick<ToastShowOptions, 'message' | 'description' | 'type' | 'duration' | 'icon' | 'action' | 'dismissible' | 'blocking' | 'progress'>
>;

export interface ToastRef {
  readonly id: string;
  /** Se resuelve cuando el toast desaparece. */
  readonly closed: Promise<ToastCloseReason>;
  update(patch: ToastUpdate): void;
  success(message: string, opts?: ToastUpdate): void;
  error(message: string, opts?: ToastUpdate): void;
  warning(message: string, opts?: ToastUpdate): void;
  info(message: string, opts?: ToastUpdate): void;
  loading(message: string, opts?: ToastUpdate): void;
  dismiss(): void;
}

export interface ToastPromiseMessages<T> {
  loading: string;
  success: string | ((value: T) => string);
  error: string | ((error: unknown) => string);
}

export interface ToastConfig {
  position: ToastPosition;
  /** Máximo de toasts visibles por posición; el resto se agrupa en "+N más". */
  maxVisible: number;
  dedupe: boolean;
  dismissible: boolean;
  pauseOnHover: boolean;
  progress: boolean;
  /** Duración base por tipo (ms). 0 = permanente. */
  durations: Record<ToastType, number>;
  /** Ms extra por carácter cuando el texto es largo (tiempo de lectura). */
  msPerChar: number;
  maxDuration: number;
  /** z-index del contenedor. */
  zIndex: number;
}

export const DEFAULT_TOAST_CONFIG: ToastConfig = {
  position: 'top-right',
  maxVisible: 3,
  dedupe: true,
  dismissible: true,
  pauseOnHover: true,
  progress: true,
  durations: { success: 3500, info: 4000, neutral: 4000, warning: 6000, error: 8000, loading: 0 },
  msPerChar: 45,
  maxDuration: 15000,
  zIndex: 10000,
};

export const TOAST_CONFIG = new InjectionToken<ToastConfig>('TOAST_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_TOAST_CONFIG,
});

/** Estado interno de un toast (lo que pinta el toaster). */
export interface ToastItem {
  id: string;
  message: string;
  description: string | null;
  type: ToastType;
  duration: number;
  position: ToastPosition;
  dismissible: boolean;
  blocking: boolean;
  progress: boolean;
  pauseOnHover: boolean;
  icon: string | null;
  action: ToastAction | null;
  count: number;
  status: 'queued' | 'visible' | 'leaving';
  paused: boolean;
  /** Cambia cuando el timer se reinicia (reinicia la barra de progreso). */
  runId: number;
}

export interface ToastGroup {
  position: ToastPosition;
  items: ToastItem[];
  /** Cantidad colapsada detrás de "+N más". */
  hidden: number;
  total: number;
  expanded: boolean;
  isTop: boolean;
}
