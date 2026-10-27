import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';


@Component({
    selector: 'app-share-link-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ],
    template: `
        <h2 mat-dialog-title class="!flex items-center gap-2">
            <mat-icon class="text-[var(--mat-sys-primary)]">share</mat-icon>
            Compartir enlace
        </h2>

        <mat-dialog-content>
            <p class="text-sm text-[var(--mat-sys-on-surface-variant)] mb-4">
                Comparte este enlace con tus clientes potenciales:
            </p>

            <div class="flex items-center gap-2 p-3 bg-[var(--mat-sys-surface-variant)] rounded-xl mb-4">
                <mat-icon class="text-[var(--mat-sys-on-surface-variant)]">link</mat-icon>
                <span class="flex-1 text-sm font-mono truncate text-[var(--mat-sys-on-surface)]">{{ shareLink }}</span>
            </div>

            <div class="flex gap-2">
                <button mat-flat-button color="primary" (click)="copyLink()" class="flex-1">
                    <mat-icon>content_copy</mat-icon>
                    Copiar
                </button>

                <button mat-stroked-button color="primary" (click)="shareWhatsApp()" class="flex-1">
                    <mat-icon>chat</mat-icon>
                    WhatsApp
                </button>
            </div>

            <div class="mt-6 p-4 bg-[var(--mat-sys-primary-container)] rounded-xl">
                <div class="flex items-start gap-3">
                    <mat-icon class="text-[var(--mat-sys-on-primary-container)] mt-0.5">info</mat-icon>
                    <div>
                        <p class="font-medium text-[var(--mat-sys-on-primary-container)] mb-2">¿Cómo funciona?</p>
                        <ul class="text-sm text-[var(--mat-sys-on-primary-container)] opacity-80 space-y-1 list-disc list-inside">
                            <li>El cliente se registrará como tu prospecto</li>
                            <li>Podrás dar seguimiento desde tu panel</li>
                        </ul>
                    </div>
                </div>
            </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Cerrar</button>
        </mat-dialog-actions>
    `
})
export class ShareLinkDialogComponent implements OnInit {
    private readonly dialogRef = inject(MatDialogRef<ShareLinkDialogComponent>);
    private readonly clipboard = inject(Clipboard);
    private readonly snackBar = inject(MatSnackBar);


    shareLink = '';

    ngOnInit(): void {


        const baseUrl = window.location.origin;
        this.shareLink = `${baseUrl}/cliente/`;
    }

    copyLink(): void {
        this.clipboard.copy(this.shareLink);
        this.snackBar.open('Enlace copiado al portapapeles', 'Cerrar', { duration: 3000 });
    }

    shareWhatsApp(): void {
        const message = encodeURIComponent(`¡Hola! Te comparto el enlace para solicitar tu crédito: ${this.shareLink}`);
        window.open(`https://wa.me/?text=${message}`, '_blank');
    }
}
