import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-viewer-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './pdf-viewer-dialog.html',
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .full-screen-pdf-dialog .mdc-dialog__surface {
      padding: 0 !important;
      border-radius: 0 !important;
      background: #323639 !important;
    }
    .full-screen-pdf-dialog .mat-mdc-dialog-container {
      padding: 0 !important;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class PdfViewerDialog {
  private sanitizer = inject(DomSanitizer);
  public data: { pdfUrl: string, fileName: string } = inject(MAT_DIALOG_DATA);
  public dialogRef = inject(MatDialogRef<PdfViewerDialog>);
  
  public safePdfUrl: SafeResourceUrl;

  constructor() {
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.pdfUrl);
  }

  downloadPdf() {
    const a = document.createElement('a');
    a.href = this.data.pdfUrl;
    a.download = this.data.fileName || 'reporte.pdf';
    a.click();
  }

  close() {
    this.dialogRef.close();
  }
}
