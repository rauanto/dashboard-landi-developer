import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DOCUMENT, JsonPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AppAutocompleteComponent,
  AppAvatarComponent,
  AppBadgeComponent,
  AppButtonComponent,
  AppButtonToggleComponent,
  AppCardComponent,
  AppCheckboxComponent,
  AppCheckboxGroupComponent,
  AppChipsComponent,
  AppDateRangeComponent,
  AppDatepickerComponent,
  AppFileUploadComponent,
  AppFormFieldComponent,
  AppInputComponent,
  AppMultiSelectComponent,
  AppNumberStepperComponent,
  AppOtpInputComponent,
  AppRadioGroupComponent,
  AppRepeaterComponent,
  AppSearchableSelectComponent,
  AppSelectComponent,
  AppSignaturePadComponent,
  AppSlideToggleComponent,
  AppSliderComponent,
  AppStepComponent,
  AppStepperComponent,
  ConfirmService,
  SelectOption,
  ToastPosition,
  ToastService,
  algunoRequeridoValidator,
  clabeValidator,
  codigoPostalValidator,
  curpValidator,
  mayorDeEdadValidator,
  matchFieldsValidator,
  passwordFuerteValidator,
  rfcValidator,
  telefonoMxValidator,
} from '@shared/ui';

const COLORS = ['primary', 'secondary', 'tertiary', 'success', 'warning', 'info', 'error'] as const;

@Component({
  selector: 'app-ui-demo',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    AppAutocompleteComponent,
    AppAvatarComponent,
    AppBadgeComponent,
    AppButtonComponent,
    AppButtonToggleComponent,
    AppCardComponent,
    AppCheckboxComponent,
    AppCheckboxGroupComponent,
    AppChipsComponent,
    AppDateRangeComponent,
    AppDatepickerComponent,
    AppFileUploadComponent,
    AppFormFieldComponent,
    AppInputComponent,
    AppMultiSelectComponent,
    AppNumberStepperComponent,
    AppOtpInputComponent,
    AppRadioGroupComponent,
    AppRepeaterComponent,
    AppSearchableSelectComponent,
    AppSelectComponent,
    AppSignaturePadComponent,
    AppSlideToggleComponent,
    AppSliderComponent,
    AppStepComponent,
    AppStepperComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-demo.component.html',
  styleUrl: './ui-demo.component.scss',
})
export class UiDemoComponent {
  private fb = inject(FormBuilder).nonNullable;
  private doc = inject(DOCUMENT);
  private confirm = inject(ConfirmService);
  toast = inject(ToastService);

  // ---------- catálogos ----------
  readonly colors = COLORS;
  readonly variants = ['outlined', 'filled'] as const;
  readonly sizes = ['xs', 'sm', 'md', 'lg'] as const;
  readonly sizes3 = ['sm', 'md', 'lg'] as const;
  readonly buttonVariants = ['filled', 'tonal', 'outlined', 'text', 'elevated'] as const;
  readonly badgeVariants = ['filled', 'tonal', 'outlined'] as const;
  readonly badgeColors = [...COLORS, 'neutral'] as const;
  readonly cardVariants = ['elevated', 'filled', 'outlined'] as const;

  readonly estados: SelectOption[] = [
    { label: 'Tabasco', value: 'TAB', icon: 'location_on' },
    { label: 'Chiapas', value: 'CHP' },
    { label: 'Veracruz', value: 'VER' },
    { label: 'Campeche', value: 'CAM' },
    { label: 'Yucatán', value: 'YUC' },
    { label: 'Quintana Roo', value: 'ROO' },
    { label: 'Ciudad de México', value: 'CDMX' },
    { label: 'Nuevo León', value: 'NL', disabled: true },
  ];
  readonly generos: SelectOption[] = [
    { label: 'Mujer', value: 'M' },
    { label: 'Hombre', value: 'H' },
    { label: 'Prefiero no decirlo', value: 'X' },
  ];
  readonly planes: SelectOption[] = [
    { label: 'Básico', value: 'basic', description: 'Hasta $20,000 · 12 meses' },
    { label: 'Plus', value: 'plus', description: 'Hasta $80,000 · 24 meses' },
    { label: 'Premium', value: 'premium', description: 'Hasta $300,000 · 48 meses' },
  ];
  readonly frecuencias: SelectOption[] = [
    { label: 'Semanal', value: 'sem' },
    { label: 'Quincenal', value: 'qui' },
    { label: 'Mensual', value: 'men' },
  ];
  readonly dias: SelectOption[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => ({ label: d, value: d }));
  readonly destinos: SelectOption[] = [
    { label: 'Capital de trabajo', value: 'capital' },
    { label: 'Equipo', value: 'equipo' },
    { label: 'Vehículo', value: 'vehiculo' },
    { label: 'Mejoras al local', value: 'local' },
    { label: 'Consolidación de deuda', value: 'deuda' },
  ];
  readonly vistas: SelectOption[] = [
    { label: 'Lista', value: 'list', icon: 'view_list' },
    { label: 'Tarjetas', value: 'grid', icon: 'grid_view' },
    { label: 'Mapa', value: 'map', icon: 'map' },
  ];

  readonly hoy = new Date();
  readonly hace18 = new Date(this.hoy.getFullYear() - 18, this.hoy.getMonth(), this.hoy.getDate());
  readonly finDeSemana = (d: Date | null) => !!d && d.getDay() !== 0 && d.getDay() !== 6;
  readonly moneda = (v: number) => `$ ${v.toLocaleString('es-MX')}`;
  readonly esCorreo = (t: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? null : 'Correo inválido');

  // ---------- estado de demos ----------
  dark = signal(false);
  loadingBtn = signal(false);
  toggleModes: SelectOption[] = [
    { label: 'Claro', value: 'light', icon: 'light_mode' },
    { label: 'Oscuro', value: 'dark', icon: 'dark_mode' },
  ];
  mode = new FormControl('light');

  posiciones: SelectOption[] = [
    { label: '↖', value: 'top-left' },
    { label: '↑ Arriba', value: 'top-center' },
    { label: '↗', value: 'top-right' },
    { label: '↙', value: 'bottom-left' },
    { label: '↓ Abajo', value: 'bottom-center' },
    { label: '↘', value: 'bottom-right' },
  ];
  labPos = new FormControl<ToastPosition>('top-right');

  demoCtrl = {
    checkbox: new FormControl(true),
    group: new FormControl(['Lun', 'Mié']),
    radio: new FormControl('men'),
    toggle: new FormControl(true),
    bt: new FormControl('list'),
    btMulti: new FormControl(['Lun']),
    fecha: new FormControl<string | null>(null),
    rango: new FormControl({ start: null, end: null }),
    num: new FormControl(12),
    slider: new FormControl(25000),
    sliderRange: new FormControl({ start: 20, end: 70 }),
    chips: new FormControl(['hola@correo.com']),
    chipsTags: new FormControl<string[]>([]),
    firma: new FormControl<string | null>(null),
    multi: new FormControl(['TAB', 'CHP']),
    searchable: new FormControl('VER'),
    select: new FormControl('TAB'),
    auto: new FormControl(''),
    otp: new FormControl(''),
    requiredEmpty: new FormControl('', Validators.required),
    texto: new FormControl('Texto de ejemplo'),
    disabledSelect: new FormControl({ value: 'CHP', disabled: true }),
  };

  // ---------- formulario completo (solicitud) ----------
  form = this.fb.group({
    personales: this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, telefonoMxValidator()]],
      curp: ['', [Validators.required, curpValidator()]],
      rfc: ['', [Validators.required, rfcValidator('fisica')]],
      nacimiento: [null as string | null, [Validators.required, mayorDeEdadValidator(18)]],
      genero: ['', Validators.required],
    }),
    domicilio: this.fb.group({
      cp: ['', [Validators.required, codigoPostalValidator()]],
      estado: ['', Validators.required],
      calle: ['', Validators.required],
      notas: [''],
    }),
    financiero: this.fb.group({
      plan: ['', Validators.required],
      monto: [15000, [Validators.required, Validators.min(1000)]],
      plazo: [12, [Validators.required, Validators.min(1), Validators.max(48)]],
      frecuencia: ['men', Validators.required],
      destino: [[] as string[], Validators.required],
      clabe: ['', [Validators.required, clabeValidator()]],
      referencias: this.fb.array([this.crearReferencia()], [Validators.minLength(1)]),
    }),
    seguridad: this.fb.group(
      {
        password: ['', [Validators.required, passwordFuerteValidator()]],
        confirm: ['', Validators.required],
        firma: [null as string | null, Validators.required],
        terminos: [false, Validators.requiredTrue],
      },
      { validators: [matchFieldsValidator('password', 'confirm', 'Las contraseñas no coinciden')] }
    ),
  });

  grupoAlgunContacto = this.fb.group(
    { telefono: [''], email: [''] },
    { validators: [algunoRequeridoValidator(['telefono', 'email'])] }
  );

  enviado = signal<unknown>(null);
  guardando = signal(false);

  get referencias(): FormArray {
    return this.form.controls.financiero.controls.referencias;
  }

  nuevaReferencia = () => this.crearReferencia();

  private crearReferencia() {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, telefonoMxValidator()]],
      parentesco: ['', Validators.required],
    });
  }

  constructor() {
    this.mode.valueChanges.pipe(takeUntilDestroyed()).subscribe((v) => this.setMode(v));
  }

  // ---------- toast lab ----------
  private get pos(): ToastPosition {
    return this.labPos.value ?? 'top-right';
  }

  reintentar = () => this.toast.info('Reintentando…', { position: this.pos });

  toastLargo(): void {
    this.toast.error('No se pudo completar el depósito', {
      position: this.pos,
      description:
        'La CLABE 012180015678901234 fue rechazada por el banco receptor porque la cuenta se encuentra restringida o cancelada. ' +
        'Verifica el número con el cliente, confirma que el titular coincida con el solicitante y vuelve a intentarlo. ' +
        'Si el problema persiste, contacta a soporte con el folio SPEI 20261027-998877.',
    });
  }

  cola(): void {
    this.toast.warning('Sesión por expirar', { blocking: true, description: 'Guarda tu avance.', position: this.pos });
    ['Se guardó el borrador', 'Se sincronizaron 3 registros', 'Correo enviado'].forEach((m) =>
      this.toast.success(m, { position: this.pos })
    );
  }

  cargando(): void {
    const t = this.toast.loading('Guardando cliente…', { position: this.pos });
    setTimeout(() => t.success('Cliente guardado', { description: 'Folio CL-00123' }), 2000);
  }

  promesa(ok: boolean): void {
    const p = new Promise<string>((res, rej) => setTimeout(() => (ok ? res('CL-00123') : rej(new Error('Timeout'))), 2000));
    this.toast
      .promise(p, { loading: 'Enviando solicitud…', success: (f) => `Solicitud enviada (${f})`, error: (e) => `Error: ${(e as Error).message}` }, { position: this.pos })
      .catch(() => undefined);
  }

  porEvento(): void {
    this.toast.info('Procesando archivo…', { position: this.pos, duration: 0, closeOn: timer(4000), description: 'Se cerrará sola cuando termine el evento.' });
  }

  spam(): void {
    for (let i = 1; i <= 8; i++) this.toast.info(`Notificación ${i}`, { position: this.pos, duration: 15000 });
  }

  duplicados(): void {
    for (let i = 0; i < 4; i++) this.toast.error('Sin conexión con el servidor', { position: this.pos });
  }

  // ---------- acciones ----------
  setMode(value: unknown): void {
    this.dark.set(value === 'dark');
    this.doc.documentElement.classList.toggle('dark', this.dark());
  }

  fakeLoad(): void {
    this.loadingBtn.set(true);
    setTimeout(() => this.loadingBtn.set(false), 1800);
  }

  async preguntar(): Promise<void> {
    const ok = await this.confirm.ask({
      title: '¿Enviar solicitud?',
      message: 'Revisaremos tu información y te contactaremos en 24 horas.',
      icon: 'send',
      confirmLabel: 'Enviar',
    });
    this.toast.info(ok ? 'Confirmado' : 'Cancelado');
  }

  async eliminar(): Promise<void> {
    if (await this.confirm.delete('cliente')) this.toast.success('Cliente eliminado');
  }

  enviar(): void {
    this.guardando.set(true);
    setTimeout(() => {
      this.guardando.set(false);
      this.enviado.set(this.form.getRawValue());
      this.toast.success('Solicitud enviada correctamente');
    }, 1200);
  }

  validarTodo(): void {
    this.form.markAllAsTouched();
    this.toast.warning('Se marcaron todos los campos para mostrar errores');
  }

  resetForm(): void {
    this.form.reset();
    this.enviado.set(null);
  }
}
