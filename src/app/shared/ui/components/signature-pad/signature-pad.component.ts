import {
  Component, ChangeDetectionStrategy, ElementRef, afterNextRender, computed, forwardRef, input, signal, viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

/**
 * Captura de firma manuscrita (mouse, touch o stylus). El valor es un data URL PNG (string) o null.
 *
 * <app-signature-pad formControlName="firma" label="Firma del cliente" [required]="true" />
 */
@Component({
  selector: 'app-signature-pad',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppSignaturePadComponent), multi: true }],
  host: { class: 'app-sign-host', '[class.app-sign--error]': 'hasError()', '[class.app-sign--disabled]': 'effectiveDisabled()' },
  template: `
    @if (label(); as l) {
      <span class="app-sign__label">{{ l }}{{ required() ? ' *' : '' }}</span>
    }

    <div class="app-sign__box" [style.height.px]="height()">
      <canvas
        #canvas
        class="app-sign__canvas"
        (pointerdown)="start($event)"
        (pointermove)="move($event)"
        (pointerup)="end($event)"
        (pointercancel)="end($event)"
        (pointerleave)="end($event)"
      ></canvas>

      @if (!hasValue()) {
        <span class="app-sign__placeholder">{{ placeholder() }}</span>
      }
      <span class="app-sign__line"></span>

      @if (hasValue() && !effectiveDisabled()) {
        <button type="button" class="app-sign__clear" aria-label="Borrar firma" (click)="clear()">
          <mat-icon>ink_eraser</mat-icon>
        </button>
      }
    </div>

    @if (effectiveError(); as err) {
      <span class="app-sign__helper app-sign__helper--error" role="alert">{{ err }}</span>
    } @else if (hint(); as h) {
      <span class="app-sign__helper">{{ h }}</span>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 0.375rem; width: 100%; font-family: inherit; }
    .app-sign__label { padding: 0 1rem; font-size: 0.8125rem; font-weight: 500; color: var(--mat-sys-on-surface-variant); }
    .app-sign__box {
      position: relative; width: 100%; border-radius: 1.25rem; overflow: hidden;
      border: 1.5px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-lowest, transparent);
    }
    :host(.app-sign--error) .app-sign__box { border-color: var(--app-error); }
    :host(.app-sign--error) .app-sign__label { color: var(--app-error); }
    :host(.app-sign--disabled) { opacity: 0.45; pointer-events: none; }
    .app-sign__canvas { display: block; width: 100%; height: 100%; touch-action: none; cursor: crosshair; }
    .app-sign__line {
      position: absolute; left: 1.5rem; right: 1.5rem; bottom: 2rem; height: 1px; pointer-events: none;
      background: var(--mat-sys-outline-variant);
    }
    .app-sign__placeholder {
      position: absolute; left: 0; right: 0; bottom: 0.625rem; text-align: center; pointer-events: none;
      font-size: 0.75rem; color: var(--mat-sys-on-surface-variant); opacity: 0.8;
    }
    .app-sign__clear {
      position: absolute; top: 0.5rem; right: 0.5rem; display: inline-flex; padding: 0.375rem; border: none;
      border-radius: 50%; cursor: pointer; background: var(--mat-sys-surface-container-high); color: var(--mat-sys-on-surface-variant);
      &:hover { background: var(--mat-sys-surface-container-highest); }
    }
    .app-sign__helper { padding: 0 1rem; font-size: 0.75rem; color: var(--mat-sys-on-surface-variant);
      &--error { color: var(--app-error); } }
  `,
})
export class AppSignaturePadComponent implements ControlValueAccessor {
  private canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  label = input<string | null>(null);
  placeholder = input('Firma aquí');
  hint = input<string | null>(null);
  errorMessage = input<string | null>(null);
  height = input(180);
  strokeWidth = input(2.5);
  required = input(false);
  requiredErrorMessage = input('La firma es requerida');
  disabled = input(false);

  value = signal<string | null>(null);
  touched = signal(false);
  private cvaDisabled = signal(false);

  private ctx: CanvasRenderingContext2D | null = null;
  private drawing = false;
  private last: { x: number; y: number } | null = null;

  private onChange: (v: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());
  hasValue = computed(() => !!this.value());
  requiredError = computed(() =>
    this.required() && this.touched() && !this.hasValue() ? this.requiredErrorMessage() : null
  );
  effectiveError = computed(() => this.errorMessage() || this.requiredError());
  hasError = computed(() => !!this.effectiveError());

  constructor() {
    afterNextRender(() => {
      this.setupCanvas();
      if (this.value()) this.paint(this.value()!);
      new ResizeObserver(() => this.setupCanvas(true)).observe(this.canvasRef().nativeElement);
    });
  }

  private setupCanvas(keep = false): void {
    const canvas = this.canvasRef().nativeElement;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width === w && canvas.height === h && this.ctx) return;
    const snapshot = keep ? this.value() : null;
    canvas.width = w;
    canvas.height = h;
    this.ctx = canvas.getContext('2d');
    this.ctx?.scale(dpr, dpr);
    if (snapshot) this.paint(snapshot);
  }

  private paint(dataUrl: string): void {
    const canvas = this.canvasRef().nativeElement;
    const rect = canvas.getBoundingClientRect();
    const img = new Image();
    img.onload = () => this.ctx?.drawImage(img, 0, 0, rect.width, rect.height);
    img.src = dataUrl;
  }

  private point(e: PointerEvent): { x: number; y: number } {
    const rect = this.canvasRef().nativeElement.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  start(e: PointerEvent): void {
    if (this.effectiveDisabled() || !this.ctx) return;
    this.canvasRef().nativeElement.setPointerCapture(e.pointerId);
    this.drawing = true;
    this.last = this.point(e);
    const ctx = this.ctx;
    ctx.fillStyle = ctx.strokeStyle = getComputedStyle(this.canvasRef().nativeElement).color || '#000';
    ctx.lineWidth = this.strokeWidth();
    ctx.lineCap = ctx.lineJoin = 'round';
    // punto simple si solo hace click
    ctx.beginPath();
    ctx.arc(this.last.x, this.last.y, this.strokeWidth() / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  move(e: PointerEvent): void {
    if (!this.drawing || !this.ctx || !this.last) return;
    const p = this.point(e);
    this.ctx.beginPath();
    this.ctx.moveTo(this.last.x, this.last.y);
    this.ctx.lineTo(p.x, p.y);
    this.ctx.stroke();
    this.last = p;
  }

  end(e: PointerEvent): void {
    if (!this.drawing) return;
    this.drawing = false;
    this.last = null;
    try {
      this.canvasRef().nativeElement.releasePointerCapture(e.pointerId);
    } catch {}
    const data = this.canvasRef().nativeElement.toDataURL('image/png');
    this.value.set(data);
    this.touched.set(true);
    this.onChange(data);
    this.onTouched();
  }

  clear(): void {
    const c = this.canvasRef().nativeElement;
    this.ctx?.clearRect(0, 0, c.width, c.height);
    this.value.set(null);
    this.onChange(null);
  }

  writeValue(value: string | null): void {
    this.value.set(value || null);
    if (!this.ctx) return; // se pinta en afterNextRender
    const c = this.canvasRef().nativeElement;
    this.ctx.clearRect(0, 0, c.width, c.height);
    if (value) this.paint(value);
  }
  registerOnChange(fn: (v: string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
