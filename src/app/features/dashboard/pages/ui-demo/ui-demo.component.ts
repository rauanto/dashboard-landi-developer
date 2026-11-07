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
  AppHeaderFilterComponent,
  AppPageHeaderComponent,
  AppCheckboxComponent,
  AppCheckboxGroupComponent,
  AppChipsComponent,
  AppDateRangeComponent,
  AppDatepickerComponent,
  AppFileUploadComponent,
  AppFormFieldComponent,
  AppContextMenuDirective,
  AppInputComponent,
  AppMenuComponent,
  AppMenuTriggerDirective,
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
  MenuItem,
  MenuPlacement,
  MenuSelectEvent,
  PageHeaderSection,
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
    AppHeaderFilterComponent,
    AppPageHeaderComponent,
    AppCheckboxComponent,
    AppCheckboxGroupComponent,
    AppChipsComponent,
    AppDateRangeComponent,
    AppDatepickerComponent,
    AppFileUploadComponent,
    AppFormFieldComponent,
    AppContextMenuDirective,
    AppInputComponent,
    AppMenuComponent,
    AppMenuTriggerDirective,
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
  readonly headerSections: PageHeaderSection[] = ['toolbar', 'tabs', 'extra'];
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

  // ---------- menús ----------
  ultimaAccion = signal('—');
  readonly placements: MenuPlacement[] = ['below-start', 'below-end', 'above-start', 'above-end', 'right', 'left'];

  private log = (name: string) => () => this.ultimaAccion.set(name);

  menuAcciones: MenuItem[] = [
    { label: 'Editar', icon: 'edit', shortcut: 'Ctrl+E', command: this.log('Editar') },
    { label: 'Duplicar', icon: 'content_copy', shortcut: 'Ctrl+D', command: this.log('Duplicar') },
    {
      type: 'submenu',
      label: 'Compartir',
      icon: 'share',
      children: [
        { label: 'Por correo', icon: 'mail', command: this.log('Compartir · correo') },
        { label: 'WhatsApp', icon: 'chat', command: this.log('Compartir · WhatsApp') },
        {
          type: 'submenu',
          label: 'Exportar como…',
          icon: 'download',
          children: [
            { label: 'PDF', icon: 'picture_as_pdf', command: this.log('Exportar PDF') },
            { label: 'Excel', icon: 'table_chart', command: this.log('Exportar Excel') },
            { label: 'CSV', command: this.log('Exportar CSV') },
          ],
        },
      ],
    },
    { type: 'divider' },
    { type: 'label', label: 'Zona de peligro' },
    { label: 'Archivar', icon: 'archive', command: this.log('Archivar') },
    { label: 'Eliminar', icon: 'delete', color: 'error', shortcut: 'Supr', command: () => this.eliminar() },
  ];

  filtros = signal('Sin cambios');
  // ---- Page header ----
  vistaHeader = new FormControl('lista');
  vistasHeader: SelectOption[] = [
    { value: 'lista', label: 'Lista', icon: 'view_list' },
    { value: 'grid', label: 'Cuadrícula', icon: 'grid_view' },
  ];
  hdrTipo = signal<string | null>(null);
  hdrPersona = signal<string | null>(null);
  hdrTab = signal('todos');
  hdrHide = signal<PageHeaderSection[]>([]);
  hdrTipos: MenuItem[] = ['Documentos', 'Hojas de cálculo', 'PDF', 'Imágenes'].map((label) => ({ label }));
  hdrPersonas: MenuItem[] = ['Yo', 'Equipo de cobranza', 'Sistemas'].map((label) => ({ label }));
  hdrCarpetas: MenuItem[] = [
    { label: 'Nueva carpeta', icon: 'create_new_folder' },
    { label: 'Renombrar', icon: 'edit' },
    { label: 'Compartir', icon: 'share' },
  ];
  toggleHdr(section: PageHeaderSection): void {
    this.hdrHide.update((hidden) =>
      hidden.includes(section) ? hidden.filter((item) => item !== section) : [...hidden, section],
    );
  }

  menuFiltros: MenuItem[] = [
    { type: 'label', label: 'Mostrar' },
    { type: 'checkbox', label: 'Activos', checked: true, keepOpen: true },
    { type: 'checkbox', label: 'Morosos', checked: true, keepOpen: true, badge: 12 },
    { type: 'checkbox', label: 'Dados de baja', keepOpen: true },
    { type: 'divider' },
    { type: 'label', label: 'Ordenar por' },
    { type: 'radio', group: 'orden', label: 'Nombre', value: 'nombre', checked: true, keepOpen: true },
    { type: 'radio', group: 'orden', label: 'Fecha de alta', value: 'fecha', keepOpen: true },
    { type: 'radio', group: 'orden', label: 'Saldo', value: 'saldo', keepOpen: true },
    { type: 'divider' },
    { type: 'radio', group: 'dir', label: 'Ascendente', value: 'asc', checked: true },
    { type: 'radio', group: 'dir', label: 'Descendente', value: 'desc' },
  ];

  menuDetalle: MenuItem[] = [
    { label: 'Aprobar crédito', icon: 'verified', color: 'success', description: 'Pasa a desembolso', command: this.log('Aprobar') },
    { label: 'Solicitar documentos', icon: 'attach_file', description: 'Envía recordatorio al cliente', badge: 3, command: this.log('Solicitar docs') },
    { label: 'Reestructurar', icon: 'autorenew', color: 'warning', description: 'Requiere autorización', disabled: true },
    { label: 'Rechazar', icon: 'block', color: 'error', command: this.log('Rechazar') },
    { label: 'Oculto', hidden: true },
  ];

  readonly clientes = [
    { id: 1, nombre: 'Raúl de la Cruz', telefono: '9931234567', estatus: 'Activo', saldo: 15000 },
    { id: 2, nombre: 'Ana López', telefono: '', estatus: 'Moroso', saldo: 42800 },
    { id: 3, nombre: 'Carlos Pérez', telefono: '9935550101', estatus: 'Activo', saldo: 0 },
  ];

  menuFila: MenuItem[] = [
    { label: 'Ver detalle', icon: 'visibility', command: (c) => this.ultimaAccion.set(`Ver detalle · ${c.nombre}`) },
    { label: 'Editar', icon: 'edit', shortcut: 'Enter', command: (c) => this.ultimaAccion.set(`Editar · ${c.nombre}`) },
    {
      label: 'Llamar',
      icon: 'call',
      disabled: (c) => !c.telefono,
      description: undefined,
      command: (c) => this.ultimaAccion.set(`Llamar · ${c.telefono}`),
    },
    {
      type: 'submenu',
      label: 'Cambiar estatus',
      icon: 'flag',
      children: [
        { type: 'radio', group: 'est', label: 'Activo', value: 'Activo', command: (c) => this.ultimaAccion.set(`Estatus Activo · ${c.nombre}`) },
        { type: 'radio', group: 'est', label: 'Moroso', value: 'Moroso', command: (c) => this.ultimaAccion.set(`Estatus Moroso · ${c.nombre}`) },
        { type: 'radio', group: 'est', label: 'Baja', value: 'Baja', command: (c) => this.ultimaAccion.set(`Estatus Baja · ${c.nombre}`) },
      ],
    },
    { type: 'divider' },
    { label: 'Eliminar', icon: 'delete', color: 'error', hidden: (c) => c.saldo > 0, command: () => this.eliminar() },
    { label: 'No se puede eliminar (tiene saldo)', icon: 'lock', disabled: true, hidden: (c) => c.saldo === 0 },
  ];

  menuTexto: MenuItem[] = [
    { label: 'Cortar', icon: 'content_cut', shortcut: 'Ctrl+X', command: this.log('Cortar') },
    { label: 'Copiar', icon: 'content_copy', shortcut: 'Ctrl+C', command: this.log('Copiar') },
    { label: 'Pegar', icon: 'content_paste', shortcut: 'Ctrl+V', command: this.log('Pegar') },
    { type: 'divider' },
    { label: 'Seleccionar todo', shortcut: 'Ctrl+A', command: this.log('Seleccionar todo') },
  ];

  onFiltro(e: MenuSelectEvent): void {
    this.filtros.set(`${e.item.label}${e.checked === undefined ? '' : e.checked ? ' ✓' : ' ✗'}`);
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
