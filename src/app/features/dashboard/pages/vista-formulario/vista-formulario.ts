import { Component } from '@angular/core';
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
} from '@shared/ui';

@Component({
  selector: 'app-vista-formulario',
  imports: [AppButtonComponent, AppBadgeComponent, AppInputComponent, AppOtpInputComponent, AppFileUploadComponent, AppCardComponent, AppSelectComponent, AppMultiSelectComponent, AppSearchableSelectComponent, AppAutocompleteComponent],
  templateUrl: './vista-formulario.html',
  styleUrl: './vista-formulario.css',
})
export class VistaFormulario {}
