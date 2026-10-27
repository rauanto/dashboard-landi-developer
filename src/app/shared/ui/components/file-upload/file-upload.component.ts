import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  input,
  output,
  signal,
  computed,
  forwardRef,
  OnDestroy,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  FileUploadVariant,
  FileUploadCategory,
  FileUploadColor,
  FileUploadShape,
  UploadedFileItem,
} from './file-upload.types';

export * from './file-upload.types';

const APP_FILE_UPLOAD_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AppFileUploadComponent),
  multi: true,
};

@Component({
  selector: 'app-file-upload',
  imports: [MatIconModule],
  providers: [APP_FILE_UPLOAD_VALUE_ACCESSOR],
  host: {
    class: 'app-file-upload-host',
    '[class]': 'hostClasses()',
  },
  template: `
    @if (label(); as l) {
      <label class="app-file-upload__label">{{ l }}</label>
    }

    <!-- Input de archivo nativo oculto -->
    <input
      #fileInput
      type="file"
      class="app-file-upload__hidden-input"
      [accept]="effectiveAccept()"
      [multiple]="multiple()"
      [disabled]="effectiveDisabled()"
      (change)="onNativeFileChange($event)"
      tabindex="-1"
    />

    <!-- ======================================= -->
    <!-- VARIANTE: DROPZONE (Área amplia)        -->
    <!-- ======================================= -->
    @if (variant() === 'dropzone') {
      <div
        class="app-file-upload__dropzone"
        [class.app-file-upload__dropzone--dragging]="isDragging()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="triggerFileInput()"
        role="button"
        tabindex="0"
        (keydown.enter)="triggerFileInput()"
        (keydown.space)="triggerFileInput(); $event.preventDefault()"
        [attr.aria-label]="label() || 'Área de subida de archivos'"
      >
        <div class="app-file-upload__icon-circle">
          <mat-icon>{{ dropzoneIcon() }}</mat-icon>
        </div>

        <div class="app-file-upload__texts">
          <span class="app-file-upload__title">
            {{ effectiveTitle() }}
            <span class="app-file-upload__link">explora tus archivos</span>
          </span>
          <span class="app-file-upload__subtext">
            {{ effectiveSubtitle() }}
          </span>
        </div>
      </div>
    }

    <!-- ======================================= -->
    <!-- VARIANTE: COMPACT (Barra horizontal)    -->
    <!-- ======================================= -->
    @if (variant() === 'compact') {
      <div class="app-file-upload__compact">
        <button
          type="button"
          class="app-file-upload__compact-btn"
          (click)="triggerFileInput()"
          [disabled]="effectiveDisabled()"
        >
          <mat-icon>folder_open</mat-icon>
          <span>Examinar</span>
        </button>

        <span
          class="app-file-upload__compact-text"
          [class.app-file-upload__compact-text--filled]="fileList().length > 0"
        >
          @if (fileList().length === 0) {
            {{ compactPlaceholder() }}
          } @else if (fileList().length === 1) {
            {{ fileList()[0].name }} ({{ fileList()[0].formattedSize }})
          } @else {
            {{ fileList().length }} archivos seleccionados
          }
        </span>

        @if (fileList().length > 0 && !effectiveDisabled()) {
          <button
            type="button"
            class="app-file-upload__compact-clear"
            (click)="clearAll($event)"
            aria-label="Limpiar selección"
          >
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>
    }

    <!-- ======================================= -->
    <!-- VARIANTE: BUTTON (Botón píldora)        -->
    <!-- ======================================= -->
    @if (variant() === 'button') {
      <button
        type="button"
        class="app-file-upload__btn-trigger"
        (click)="triggerFileInput()"
        [disabled]="effectiveDisabled()"
      >
        <mat-icon>upload</mat-icon>
        <span>{{ buttonText() }}</span>
      </button>
    }

    <!-- ======================================= -->
    <!-- VARIANTE: IMAGE / AVATAR / BANNER       -->
    <!-- ======================================= -->
    @if (variant() === 'image') {
      <div
        class="app-file-upload__image-wrapper"
        [class.app-file-upload__image-wrapper--circle]="shape() === 'circle'"
        [class.app-file-upload__image-wrapper--rectangle]="shape() === 'rectangle'"
      >
        @if (currentImagePreview(); as preview) {
          <div class="app-file-upload__image-preview">
            <img [src]="preview" alt="Vista previa de imagen" />
            @if (!effectiveDisabled()) {
              <div class="app-file-upload__image-overlay">
                <button
                  type="button"
                  (click)="triggerFileInput()"
                  aria-label="Cambiar imagen"
                  title="Cambiar imagen"
                >
                  <mat-icon>photo_camera</mat-icon>
                </button>
                <button
                  type="button"
                  class="app-file-upload__overlay-delete"
                  (click)="clearAll($event)"
                  aria-label="Eliminar imagen"
                  title="Eliminar imagen"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
          </div>
        } @else {
          <div
            class="app-file-upload__image-placeholder"
            (click)="triggerFileInput()"
            role="button"
            tabindex="0"
            (keydown.enter)="triggerFileInput()"
            (keydown.space)="triggerFileInput(); $event.preventDefault()"
          >
            <mat-icon>{{ shape() === 'circle' ? 'add_a_photo' : 'add_photo_alternate' }}</mat-icon>
            <span>Subir imagen</span>
          </div>
        }
      </div>
    }

    <!-- ======================================= -->
    <!-- LISTA DE ARCHIVOS (Para Dropzone/Button)-->
    <!-- ======================================= -->
    @if ((variant() === 'dropzone' || variant() === 'button') && fileList().length > 0) {
      <div class="app-file-upload__list">
        @for (item of fileList(); track item.id) {
          <div class="app-file-upload__item">
            @if (item.isImage && item.previewUrl) {
              <img [src]="item.previewUrl" class="app-file-upload__item-thumb" alt="Miniatura" />
            } @else {
              <div
                class="app-file-upload__item-badge"
                [style.background-color]="item.color + '15'"
                [style.color]="item.color"
              >
                <mat-icon>{{ item.icon }}</mat-icon>
              </div>
            }

            <div class="app-file-upload__item-details">
              <span class="app-file-upload__item-name" [title]="item.name">{{ item.name }}</span>
              <span class="app-file-upload__item-size">{{ item.formattedSize }}</span>
            </div>

            @if (!effectiveDisabled()) {
              <button
                type="button"
                class="app-file-upload__item-remove"
                (click)="removeFile(item.id, $event)"
                [attr.aria-label]="'Quitar ' + item.name"
              >
                <mat-icon>close</mat-icon>
              </button>
            }
          </div>
        }
      </div>
    }

    <!-- ======================================= -->
    <!-- MENSAJES DE ERROR Y AYUDA               -->
    <!-- ======================================= -->
    @if (effectiveError(); as err) {
      <span class="app-file-upload__helper app-file-upload__helper--error" role="alert">{{ err }}</span>
    } @else if (hint(); as h) {
      <span class="app-file-upload__helper">{{ h }}</span>
    }
  `,
  styleUrl: './file-upload.component.scss',
})
export class AppFileUploadComponent implements ControlValueAccessor, OnDestroy {
  @ViewChild('fileInput')
  private fileInputRef?: ElementRef<HTMLInputElement>;

  variant = input<FileUploadVariant>('dropzone');
  category = input<FileUploadCategory>('all');
  shape = input<FileUploadShape>('rectangle');
  color = input<FileUploadColor>('primary');
  label = input<string | null>(null);
  hint = input<string | null>(null);
  errorMessage = input<string | null>(null);
  disabled = input(false);
  multiple = input(false);
  accept = input<string | null>(null);
  maxFileSizeMb = input<number>(10);
  maxFiles = input<number | null>(null);
  dropzoneTitle = input<string | null>(null);
  dropzoneSubtitle = input<string | null>(null);
  compactPlaceholder = input('Ningún archivo seleccionado');
  buttonText = input('Adjuntar archivo');
  initialPreviewUrl = input<string | null>(null);
  required = input(false);
  requiredErrorMessage = input('Debes adjuntar al menos un archivo');

  filesChange = output<File[]>();
  fileSelect = output<File | null>();
  errorChange = output<string | null>();

  fileList = signal<UploadedFileItem[]>([]);
  isDragging = signal(false);
  validationError = signal<string | null>(null);
  touched = signal(false);
  private cvaDisabled = signal(false);

  private onChange: (value: File | File[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());

  requiredError = computed(() =>
    this.required() && this.touched() && this.fileList().length === 0
      ? this.requiredErrorMessage()
      : null
  );

  effectiveError = computed(() => this.errorMessage() || this.validationError() || this.requiredError());
  hasError = computed(() => !!this.effectiveError());

  currentImagePreview = computed(() => {
    if (this.fileList().length > 0 && this.fileList()[0].previewUrl) {
      return this.fileList()[0].previewUrl;
    }
    return this.initialPreviewUrl();
  });

  effectiveAccept = computed(() => {
    if (this.accept()) return this.accept()!;
    if (this.category() === 'images' || this.variant() === 'image') {
      return 'image/png, image/jpeg, image/webp, image/gif, image/svg+xml';
    }
    if (this.category() === 'documents') {
      return '.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .csv';
    }
    return '*/*';
  });

  dropzoneIcon = computed(() => {
    if (this.category() === 'images') return 'add_photo_alternate';
    if (this.category() === 'documents') return 'upload_file';
    return 'cloud_upload';
  });

  effectiveTitle = computed(() => {
    if (this.dropzoneTitle()) return this.dropzoneTitle()!;
    if (this.category() === 'images') return 'Arrastra tu imagen aquí o ';
    if (this.category() === 'documents') return 'Arrastra tus documentos aquí o ';
    return 'Arrastra tus archivos aquí o ';
  });

  effectiveSubtitle = computed(() => {
    if (this.dropzoneSubtitle()) return this.dropzoneSubtitle()!;
    const maxMb = this.maxFileSizeMb();
    if (this.category() === 'images') {
      return `Formatos PNG, JPG, WEBP o SVG (Máx. ${maxMb} MB)`;
    }
    if (this.category() === 'documents') {
      return `Formatos PDF, Word, Excel o CSV (Máx. ${maxMb} MB)`;
    }
    return `Cualquier formato admitido (Máx. ${maxMb} MB por archivo)`;
  });

  hostClasses = computed(() =>
    [
      `app-file-upload--${this.variant()}`,
      `app-file-upload--${this.hasError() ? 'error' : this.color()}`,
      this.effectiveDisabled() ? 'app-file-upload--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  ngOnDestroy(): void {
    // Revocar cualquier URL de objeto creada en memoria
    for (const item of this.fileList()) {
      if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
    }
  }

  writeValue(value: File | File[] | string | null): void {
    if (!value) {
      this.fileList.set([]);
      return;
    }

    if (typeof value === 'string') {
      // Es una URL existente
      this.fileList.set([
        {
          id: 'remote-1',
          name: value.split('/').pop() || 'Archivo',
          size: 0,
          formattedSize: '',
          type: '',
          isImage: true,
          previewUrl: value,
          icon: 'image',
          color: '#7c3aed',
        },
      ]);
      return;
    }

    if (Array.isArray(value)) {
      const items = value.map((f) => this.buildFileItem(f));
      this.fileList.set(items);
      return;
    }

    if (value instanceof File) {
      this.fileList.set([this.buildFileItem(value)]);
    }
  }

  registerOnChange(fn: (value: File | File[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  triggerFileInput(): void {
    if (this.effectiveDisabled()) return;
    this.touched.set(true);
    this.onTouched();
    this.fileInputRef?.nativeElement.click();
  }

  onNativeFileChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    if (inputEl.files && inputEl.files.length > 0) {
      this.processFiles(Array.from(inputEl.files));
      inputEl.value = ''; // Reset para poder re-seleccionar el mismo archivo si es necesario
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.effectiveDisabled()) return;
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    if (this.effectiveDisabled()) return;
    this.touched.set(true);
    this.onTouched();

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  private processFiles(files: File[]): void {
    this.validationError.set(null);
    this.errorChange.emit(null);

    const maxBytes = this.maxFileSizeMb() * 1024 * 1024;
    const validFiles: File[] = [];

    for (const f of files) {
      if (f.size > maxBytes) {
        const msg = `"${f.name}" supera el tamaño máximo permitido de ${this.maxFileSizeMb()} MB.`;
        this.validationError.set(msg);
        this.errorChange.emit(msg);
        return;
      }

      // Validar categoría si es images
      if (
        (this.category() === 'images' || this.variant() === 'image') &&
        !f.type.startsWith('image/')
      ) {
        const msg = `"${f.name}" no es una imagen válida.`;
        this.validationError.set(msg);
        this.errorChange.emit(msg);
        return;
      }

      validFiles.push(f);
    }

    if (validFiles.length === 0) return;

    if (!this.multiple()) {
      // Reemplazo de un solo archivo
      const single = validFiles[0];
      const item = this.buildFileItem(single);

      // Limpiar previas
      this.revokeCurrentPreviews();
      this.fileList.set([item]);

      this.onChange(single);
      this.filesChange.emit([single]);
      this.fileSelect.emit(single);
    } else {
      // Múltiples archivos
      const newItems = validFiles.map((f) => this.buildFileItem(f));
      let merged = [...this.fileList(), ...newItems];

      if (this.maxFiles() !== null && merged.length > this.maxFiles()!) {
        merged = merged.slice(0, this.maxFiles()!);
        this.validationError.set(`Solo se admiten hasta ${this.maxFiles()} archivos en total.`);
      }

      this.fileList.set(merged);
      const outputFiles = merged.map((i) => i.file).filter((f): f is File => !!f);
      this.onChange(outputFiles);
      this.filesChange.emit(outputFiles);
      this.fileSelect.emit(outputFiles[0] || null);
    }

    this.onTouched();
  }

  removeFile(id: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.effectiveDisabled()) return;

    const target = this.fileList().find((i) => i.id === id);
    if (target?.previewUrl && target.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(target.previewUrl);
    }

    const updated = this.fileList().filter((i) => i.id !== id);
    this.fileList.set(updated);

    const outputFiles = updated.map((i) => i.file).filter((f): f is File => !!f);
    if (!this.multiple()) {
      this.onChange(null);
      this.filesChange.emit([]);
      this.fileSelect.emit(null);
    } else {
      this.onChange(outputFiles);
      this.filesChange.emit(outputFiles);
      this.fileSelect.emit(outputFiles[0] || null);
    }

    this.onTouched();
  }

  clearAll(event?: Event): void {
    if (event) event.stopPropagation();
    if (this.effectiveDisabled()) return;

    this.revokeCurrentPreviews();
    this.fileList.set([]);
    this.onChange(this.multiple() ? [] : null);
    this.filesChange.emit([]);
    this.fileSelect.emit(null);
    this.onTouched();
  }

  private buildFileItem(file: File): UploadedFileItem {
    const meta = this.getFileMeta(file);
    const previewUrl = meta.isImage ? URL.createObjectURL(file) : undefined;

    return {
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      name: file.name,
      size: file.size,
      formattedSize: this.formatBytes(file.size),
      type: file.type,
      isImage: meta.isImage,
      previewUrl,
      icon: meta.icon,
      color: meta.color,
    };
  }

  private getFileMeta(file: File): { icon: string; color: string; isImage: boolean } {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    if (type.startsWith('image/')) {
      return { icon: 'image', color: '#7c3aed', isImage: true };
    }
    if (type.includes('pdf') || name.endsWith('.pdf')) {
      return { icon: 'picture_as_pdf', color: '#dc2626', isImage: false };
    }
    if (
      type.includes('sheet') ||
      type.includes('excel') ||
      type.includes('csv') ||
      name.endsWith('.xls') ||
      name.endsWith('.xlsx') ||
      name.endsWith('.csv')
    ) {
      return { icon: 'table_chart', color: '#16a34a', isImage: false };
    }
    if (
      type.includes('word') ||
      type.includes('document') ||
      name.endsWith('.doc') ||
      name.endsWith('.docx')
    ) {
      return { icon: 'article', color: '#2563eb', isImage: false };
    }
    if (
      type.includes('zip') ||
      type.includes('rar') ||
      type.includes('tar') ||
      name.endsWith('.zip') ||
      name.endsWith('.rar')
    ) {
      return { icon: 'folder_zip', color: '#ea580c', isImage: false };
    }
    return { icon: 'draft', color: '#64748b', isImage: false };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  private revokeCurrentPreviews(): void {
    for (const item of this.fileList()) {
      if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
    }
  }
}
