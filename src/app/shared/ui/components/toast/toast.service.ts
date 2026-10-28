import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  computed,
  createComponent,
  inject,
  signal,
} from '@angular/core';
import { Observable, firstValueFrom, isObservable } from 'rxjs';
import {
  TOAST_CONFIG,
  ToastCloseReason,
  ToastConfig,
  ToastGroup,
  ToastItem,
  ToastOptions,
  ToastPosition,
  ToastPromiseMessages,
  ToastRef,
  ToastShowOptions,
  ToastType,
  ToastUpdate,
} from './toast.types';

const POSITIONS: ToastPosition[] = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
const LEAVE_MS = 200;

interface Internal {
  timer?: ReturnType<typeof setTimeout>;
  start: number;
  remaining: number;
  closed: Promise<ToastCloseReason>;
  resolve: (r: ToastCloseReason) => void;
  stopEvent?: () => void;
  onDismiss?: (r: ToastCloseReason) => void;
}

/**
 * Sistema de toasts (se monta solo en <body>, no hay que agregar nada a tu template).
 *
 *   toast.success('Guardado');
 *   toast.error('No se pudo guardar', { description: 'Detalle largo…', action: { label: 'Reintentar', onClick: () => … } });
 *   const t = toast.loading('Guardando…'); … t.success('Listo');
 *   toast.promise(http$, { loading: 'Enviando…', success: 'Enviado', error: 'Falló' });
 *   toast.info('Importante', { duration: 0 });                  // permanente
 *   toast.warning('Sesión por expirar', { blocking: true });    // bloquea a los demás hasta cerrarse
 *   toast.info('Procesando', { closeOn: this.terminado$ });     // se cierra por evento
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private base = inject(TOAST_CONFIG);

  readonly config = signal<ToastConfig>({ ...this.base });
  readonly items = signal<ToastItem[]>([]);
  private expandedPositions = signal<Set<ToastPosition>>(new Set());

  private internals = new Map<string, Internal>();
  private host?: Promise<ComponentRef<unknown>>;
  private seq = 0;
  private visibilityBound = false;

  /** Agrupación por posición lista para pintar. */
  readonly groups = computed<ToastGroup[]>(() => {
    const { maxVisible } = this.config();
    const expandedSet = this.expandedPositions();
    const visible = this.items().filter((i) => i.status !== 'queued');
    const groups: ToastGroup[] = [];

    for (const position of POSITIONS) {
      const list = visible.filter((i) => i.position === position);
      if (!list.length) continue;
      const expanded = expandedSet.has(position);
      const hidden = expanded ? 0 : Math.max(0, list.length - maxVisible);
      let shown = hidden ? list.slice(hidden) : list; // los más viejos se colapsan
      const isTop = position.startsWith('top');
      if (isTop) shown = [...shown].reverse(); // el más nuevo junto al borde
      groups.push({ position, items: shown, hidden, total: list.length, expanded, isTop });
    }
    return groups;
  });

  /** Cantidad total esperando en cola (por un toast bloqueante). */
  readonly queuedCount = computed(() => this.items().filter((i) => i.status === 'queued').length);

  // ===================== API pública =====================

  configure(patch: Partial<ToastConfig>): void {
    this.config.update((c) => ({ ...c, ...patch, durations: { ...c.durations, ...patch.durations } }));
  }

  show(opts: ToastShowOptions): ToastRef {
    void this.ensureHost();
    const cfg = this.config();
    const type = opts.type ?? 'neutral';
    const description = opts.description ?? null;

    // id explícito existente -> actualiza
    if (opts.id && this.items().some((i) => i.id === opts.id && i.status !== 'leaving')) {
      this.update(opts.id, { ...opts, message: opts.message, type });
      return this.makeRef(opts.id);
    }

    // idénticos -> contador
    if (!opts.id && (opts.dedupe ?? cfg.dedupe) && type !== 'loading') {
      const twin = this.items().find(
        (i) =>
          i.status !== 'leaving' &&
          i.type === type &&
          i.message === opts.message &&
          i.description === description &&
          i.position === (opts.position ?? cfg.position)
      );
      if (twin) {
        this.patch(twin.id, { count: twin.count + 1, runId: twin.runId + 1 });
        if (twin.status === 'visible') this.restartTimer(twin.id);
        return this.makeRef(twin.id);
      }
    }

    const id = opts.id ?? `toast-${++this.seq}`;
    const blocking = opts.blocking ?? false;
    const duration = opts.duration ?? (blocking ? 0 : this.defaultDuration(type, opts.message, description));
    const blockedNow = this.hasVisibleBlocking();

    const item: ToastItem = {
      id,
      message: opts.message,
      description,
      type,
      duration,
      position: opts.position ?? cfg.position,
      dismissible: opts.dismissible ?? cfg.dismissible,
      blocking,
      progress: (opts.progress ?? cfg.progress) && duration > 0,
      pauseOnHover: opts.pauseOnHover ?? cfg.pauseOnHover,
      icon: opts.icon === undefined ? this.iconFor(type) : opts.icon,
      action: opts.action ?? null,
      count: 1,
      status: blockedNow ? 'queued' : 'visible',
      paused: false,
      runId: 0,
    };

    let resolve!: (r: ToastCloseReason) => void;
    const closed = new Promise<ToastCloseReason>((r) => (resolve = r));
    this.internals.set(id, { start: 0, remaining: duration, closed, resolve, onDismiss: opts.onDismiss });

    this.items.update((l) => [...l, item]);
    if (item.status === 'visible') this.startTimer(id);
    this.bindEvent(id, opts.closeOn);
    this.bindVisibility();
    return this.makeRef(id);
  }

  success(message: string, opts?: ToastOptions) { return this.show({ ...opts, message, type: 'success' }); }
  error(message: string, opts?: ToastOptions) { return this.show({ ...opts, message, type: 'error' }); }
  warning(message: string, opts?: ToastOptions) { return this.show({ ...opts, message, type: 'warning' }); }
  info(message: string, opts?: ToastOptions) { return this.show({ ...opts, message, type: 'info' }); }
  neutral(message: string, opts?: ToastOptions) { return this.show({ ...opts, message, type: 'neutral' }); }
  loading(message: string, opts?: ToastOptions) { return this.show({ ...opts, message, type: 'loading' }); }

  /** Toast de carga que se convierte en éxito/error al resolver la Promise/Observable. Devuelve la misma promesa. */
  promise<T>(source: PromiseLike<T> | Observable<T>, msgs: ToastPromiseMessages<T>, opts?: ToastOptions): Promise<T> {
    const ref = this.loading(msgs.loading, opts);
    const promise = isObservable(source) ? firstValueFrom(source) : Promise.resolve(source);
    promise.then(
      (v) => ref.success(typeof msgs.success === 'function' ? msgs.success(v) : msgs.success),
      (e) => ref.error(typeof msgs.error === 'function' ? msgs.error(e) : msgs.error)
    );
    return promise;
  }

  update(id: string, patch: ToastUpdate): void {
    const item = this.items().find((i) => i.id === id);
    if (!item || item.status === 'leaving') return;

    const type = patch.type ?? item.type;
    const message = patch.message ?? item.message;
    const description = patch.description === undefined ? item.description : patch.description;
    const leavingLoading = item.type === 'loading' && type !== 'loading';
    const blocking = patch.blocking ?? (leavingLoading ? false : item.blocking);
    const duration =
      patch.duration ??
      (patch.type || patch.message !== undefined || patch.description !== undefined
        ? blocking ? 0 : this.defaultDuration(type, message, description)
        : item.duration);

    this.patch(id, {
      type,
      message,
      description,
      blocking,
      duration,
      icon: patch.icon === undefined ? (patch.type ? this.iconFor(type) : item.icon) : patch.icon,
      action: patch.action === undefined ? item.action : patch.action,
      dismissible: patch.dismissible ?? item.dismissible,
      progress: (patch.progress ?? this.config().progress) && duration > 0,
      paused: false,
      runId: item.runId + 1,
    });
    const internal = this.internals.get(id);
    if (internal) internal.remaining = duration;
    if (item.status === 'visible') this.restartTimer(id);
    if (leavingLoading || patch.blocking === false) this.processQueue();
  }

  dismiss(id: string, reason: ToastCloseReason = 'api'): void {
    const item = this.items().find((i) => i.id === id);
    const internal = this.internals.get(id);
    if (!item || !internal || item.status === 'leaving') return;

    clearTimeout(internal.timer);
    internal.stopEvent?.();

    if (item.status === 'queued') {
      this.remove(id, reason);
      return;
    }
    this.patch(id, { status: 'leaving', paused: false });
    setTimeout(() => this.remove(id, reason), LEAVE_MS);
    // un toast bloqueante libera la cola en cuanto empieza a salir
    if (item.blocking) this.processQueue(id);
  }

  dismissAll(position?: ToastPosition): void {
    for (const i of this.items()) {
      if (!position || i.position === position) this.dismiss(i.id, 'clear');
    }
  }

  // ===================== usado por el toaster =====================

  pause(id: string): void {
    const item = this.items().find((i) => i.id === id);
    const internal = this.internals.get(id);
    if (!item || !internal || item.status !== 'visible' || item.paused || item.duration <= 0) return;
    clearTimeout(internal.timer);
    internal.remaining = Math.max(0, internal.remaining - (Date.now() - internal.start));
    this.patch(id, { paused: true });
  }

  resume(id: string): void {
    const item = this.items().find((i) => i.id === id);
    const internal = this.internals.get(id);
    if (!item || !internal || item.status !== 'visible' || !item.paused) return;
    this.patch(id, { paused: false });
    this.arm(id, internal.remaining);
  }

  runAction(id: string): void {
    const item = this.items().find((i) => i.id === id);
    if (!item?.action) return;
    item.action.onClick?.();
    if (item.action.dismiss !== false) this.dismiss(id, 'action');
  }

  toggleExpanded(position: ToastPosition): void {
    this.expandedPositions.update((s) => {
      const next = new Set(s);
      next.has(position) ? next.delete(position) : next.add(position);
      return next;
    });
  }

  // ===================== internos =====================

  private defaultDuration(type: ToastType, message: string, description: string | null): number {
    const cfg = this.config();
    const base = cfg.durations[type];
    if (base <= 0) return 0;
    const chars = message.length + (description?.length ?? 0);
    const extra = Math.max(0, chars - 60) * cfg.msPerChar;
    return Math.min(cfg.maxDuration, base + extra);
  }

  private iconFor(type: ToastType): string | null {
    return { success: 'check_circle', error: 'error', warning: 'warning', info: 'info', loading: null, neutral: null }[type];
  }

  private hasVisibleBlocking(): boolean {
    return this.items().some((i) => i.blocking && i.status === 'visible');
  }

  private patch(id: string, partial: Partial<ToastItem>): void {
    this.items.update((l) => l.map((i) => (i.id === id ? { ...i, ...partial } : i)));
  }

  private startTimer(id: string): void {
    const item = this.items().find((i) => i.id === id);
    const internal = this.internals.get(id);
    if (!item || !internal || item.duration <= 0) return;
    internal.remaining = item.duration;
    this.arm(id, item.duration);
  }

  private restartTimer(id: string): void {
    const internal = this.internals.get(id);
    if (!internal) return;
    clearTimeout(internal.timer);
    this.startTimer(id);
  }

  private arm(id: string, ms: number): void {
    const internal = this.internals.get(id);
    if (!internal) return;
    clearTimeout(internal.timer);
    internal.start = Date.now();
    internal.timer = setTimeout(() => this.dismiss(id, 'timeout'), ms);
  }

  private remove(id: string, reason: ToastCloseReason): void {
    const internal = this.internals.get(id);
    this.items.update((l) => l.filter((i) => i.id !== id));
    this.internals.delete(id);
    if (internal) {
      internal.resolve(reason);
      internal.onDismiss?.(reason);
    }
    // si el grupo quedó chico, se des-expande
    for (const pos of POSITIONS) {
      if (this.expandedPositions().has(pos) && this.items().filter((i) => i.position === pos).length <= this.config().maxVisible) {
        this.toggleExpanded(pos);
      }
    }
    this.processQueue();
  }

  /** Promueve toasts en cola mientras no haya un bloqueante visible. */
  private processQueue(ignoreId?: string): void {
    let blocked = this.items().some((i) => i.blocking && i.status === 'visible' && i.id !== ignoreId);
    for (const queued of this.items().filter((i) => i.status === 'queued')) {
      if (blocked) break;
      this.patch(queued.id, { status: 'visible' });
      this.startTimer(queued.id);
      if (queued.blocking) blocked = true;
    }
  }

  private bindEvent(id: string, closeOn?: Observable<unknown> | PromiseLike<unknown>): void {
    const internal = this.internals.get(id);
    if (!closeOn || !internal) return;
    if (isObservable(closeOn)) {
      const sub = closeOn.subscribe({ next: () => this.dismiss(id, 'event'), complete: () => undefined });
      internal.stopEvent = () => sub.unsubscribe();
    } else {
      let cancelled = false;
      closeOn.then(() => !cancelled && this.dismiss(id, 'event'), () => !cancelled && this.dismiss(id, 'event'));
      internal.stopEvent = () => (cancelled = true);
    }
  }

  /** Pausa todo cuando la pestaña no está visible, para que no se pierdan mensajes. */
  private bindVisibility(): void {
    if (this.visibilityBound || typeof document === 'undefined') return;
    this.visibilityBound = true;
    document.addEventListener('visibilitychange', () => {
      for (const i of this.items()) document.hidden ? this.pause(i.id) : this.resume(i.id);
    });
  }

  private makeRef(id: string): ToastRef {
    const closed = this.internals.get(id)?.closed ?? Promise.resolve<ToastCloseReason>('api');
    const as = (type: ToastType) => (message: string, o?: ToastUpdate) => this.update(id, { ...o, message, type });
    return {
      id,
      closed,
      update: (p) => this.update(id, p),
      success: as('success'),
      error: as('error'),
      warning: as('warning'),
      info: as('info'),
      loading: as('loading'),
      dismiss: () => this.dismiss(id, 'api'),
    };
  }

  /** Monta <app-toaster> una sola vez en <body> (carga diferida). */
  private ensureHost(): Promise<ComponentRef<unknown>> | undefined {
    if (typeof document === 'undefined') return undefined;
    this.host ??= import('./toaster.component').then(({ AppToasterComponent }) => {
      const ref = createComponent(AppToasterComponent, { environmentInjector: this.injector });
      this.appRef.attachView(ref.hostView);
      document.body.appendChild(ref.location.nativeElement);
      return ref as ComponentRef<unknown>;
    });
    return this.host;
  }
}
