import { Injectable, signal } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';

@Injectable({
  providedIn: 'root'
})
export class GlobalSidenavService {
  isOpen = signal<boolean>(false);
  portalContent = signal<TemplatePortal<any> | null>(null);

  toggle() {
    this.isOpen.update(value => !value);
  }

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  setContent(portal: TemplatePortal<any>) {
    this.portalContent.set(portal);
  }

  clearContent() {
    this.portalContent.set(null);
    this.close();
  }
}
