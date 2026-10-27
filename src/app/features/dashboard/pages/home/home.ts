import { Component, signal } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { PillTabs, TabItem } from '@shared/components/pill-tabs/pill-tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';

import {
  AppButtonComponent,
  AppBadgeComponent,
  AppInputComponent,
  AppOtpInputComponent,
  AppFileUploadComponent,
  AppCardComponent,
  AppSelectComponent,
  AppMultiSelectComponent,
  AppSearchableSelectComponent,
  AppAutocompleteComponent,
  SelectOption,
  AppCheckboxComponent,
  AppCheckboxGroupComponent,
  AppRadioGroupComponent,
  AppSlideToggleComponent,
  AppDatepickerComponent,
  AppDateRangeComponent,
  AppFormFieldComponent,
  AppChipsComponent,
  AppSliderComponent,
  AppButtonToggleComponent,
  AppNumberStepperComponent,
  AppStepperComponent,
  AppStepComponent,
  AppRepeaterComponent
} from '@shared/ui';
import { App } from '@/app';

@Component({
  selector: 'app-home',
  imports: [
    MatGridListModule,
    PillTabs,
    MatDividerModule,
    AppButtonComponent,
    AppBadgeComponent,
    AppInputComponent,
    AppOtpInputComponent,
    AppFileUploadComponent,
    AppCardComponent,
    AppSelectComponent,
    AppMultiSelectComponent,
    AppSearchableSelectComponent,
    AppAutocompleteComponent,
    AppCheckboxComponent,
    AppCheckboxGroupComponent,
    AppRadioGroupComponent,
    AppSlideToggleComponent,
    AppDatepickerComponent,
    AppDateRangeComponent,
    AppFormFieldComponent,
    AppChipsComponent,
    AppSliderComponent,
    AppButtonToggleComponent,
    AppNumberStepperComponent,
    AppStepperComponent,
    AppStepComponent,
    AppRepeaterComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  activeTab = signal<string>('buttons');


  tabs: TabItem[] = [
    {
      id: 'buttons',
      label: 'Buttons',
      icon: 'smart_button',
    },
    {
      id: 'inputs',
      label: 'Inputs',
      icon: 'input',
    },
    {
      id: 'badges',
      label: 'Badges',
      icon: 'badge',
    },
    {
      id: 'cards',
      label: 'Cards',
      icon: 'branding_watermark',
    },
    {
      id: 'selects',
      label: 'Selects',
      icon: 'list',
    },
    {
      id: 'files',
      label: 'Archivos',
      icon: 'upload_file',
    },
    {
      id: 'checkboxes',
      label: 'Checkboxes',
      icon: 'check_box',
    },
    {
      id: 'radios',
      label: 'Radios',
      icon: 'radio_button_checked',
    },
    {
      id: 'slide-toggles',
      label: 'Slide Toggles',
      icon: 'toggle_on',
    },
    {
      id: 'datepickers',
      label: 'Datepickers',
      icon: 'date_range',
    },
    {
      id: 'form-fields',
      label: 'Form Fields',
      icon: 'form_field',
    },
    {
      id: 'chips',
      label: 'Chips',
      icon: 'label',
    },
    {
      id: 'sliders',
      label: 'Sliders',
      icon: 'slider',
    },
    {
      id: 'button-toggles',
      label: 'Button Toggles',
      icon: 'button_toggle',
    },
    {
      id: 'number-steppers',
      label: 'Number Steppers',
      icon: 'number_stepper',
    },
    {
      id: 'steppers',
      label: 'Steppers',
      icon: 'stepper',
    },
    {
      id: 'repeater',
      label: 'Repeater',
      icon: 'repeater',
    },
  ];

  roleOptions: SelectOption[] = [
    { label: 'Administrador', value: 'admin', description: 'Acceso total al sistema', icon: 'shield' },
    { label: 'Editor', value: 'editor', description: 'Edición y publicación de contenido', icon: 'edit' },
    { label: 'Usuario', value: 'user', description: 'Acceso estándar de lectura y consulta', icon: 'person' },
    { label: 'Invitado', value: 'guest', description: 'Acceso restringido temporal', icon: 'visibility' },
  ];

  technologyOptions: SelectOption[] = [
    { label: 'Angular 22', value: 'angular' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'Tailwind CSS', value: 'tailwind' },
    { label: 'RxJS', value: 'rxjs' },
    { label: 'Node.js', value: 'nodejs' },
    { label: 'PostgreSQL', value: 'postgres' },
    { label: 'Docker', value: 'docker' },
  ];

  countryOptions: SelectOption[] = [
    { label: 'Argentina', value: 'AR' },
    { label: 'Brasil', value: 'BR' },
    { label: 'Chile', value: 'CL' },
    { label: 'Colombia', value: 'CO' },
    { label: 'España', value: 'ES' },
    { label: 'México', value: 'MX' },
    { label: 'Perú', value: 'PE' },
    { label: 'Estados Unidos', value: 'US' },
  ];
}

