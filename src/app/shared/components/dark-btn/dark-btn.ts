import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-dark-btn',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './dark-btn.html',
  styleUrl: './dark-btn.css',
})
export class DarkBtn {
    public themeService = inject(ThemeService);
}
