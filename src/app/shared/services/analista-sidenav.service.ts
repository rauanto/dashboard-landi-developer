import { Injectable, signal } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class AnalistaSidenavService {
    isOpen = signal<boolean>(false);


    toggle() {
        this.isOpen.update(value => !value);
    }

    open() {
        this.isOpen.set(true);
    }

    close() {
        this.isOpen.set(false);

    }
}
