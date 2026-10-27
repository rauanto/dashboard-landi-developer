import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { GridHeatmapService } from '../../services/grid-heatmap.service';

export interface HeatmapSettingsDialogData {
  columns: string[];
  heatmapService: GridHeatmapService;
  sampleData: any; // First row to infer data type
}

@Component({
  selector: 'app-heatmap-settings-dialog',
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule, 
    MatSlideToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './heatmap-settings-dialog.html',
  styleUrl: './heatmap-settings-dialog.scss'
})
export class HeatmapSettingsDialog {
  dialogRef = inject(MatDialogRef<HeatmapSettingsDialog>);
  data = inject<HeatmapSettingsDialogData>(MAT_DIALOG_DATA);
  heatmapService = this.data.heatmapService;

  inferDataType(colName: string): 'number' | 'date' | 'text' {
    const val = this.data.sampleData?.[colName];
    if (val && typeof val === 'string') {
      if (val.includes('-') && !isNaN(Date.parse(val))) return 'date';
      if (!isNaN(Number(val))) return 'number';
      return 'text';
    }
    return 'number';
  }

  addTextRule(colName: string) {
    const config = this.getConfig(colName);
    if (config) {
      const rules = config.textRules ? [...config.textRules] : [];
      rules.push({ value: '', color: '#85E0A3' }); // default light green
      this.heatmapService.setConfig(colName, { ...config, textRules: rules });
    }
  }

  removeTextRule(colName: string, index: number) {
    const config = this.getConfig(colName);
    if (config && config.textRules) {
      const rules = [...config.textRules];
      rules.splice(index, 1);
      this.heatmapService.setConfig(colName, { ...config, textRules: rules });
    }
  }

  updateTextRule(colName: string, index: number, value: string, color: string) {
    const config = this.getConfig(colName);
    if (config && config.textRules) {
      const rules = [...config.textRules];
      rules[index] = { value, color };
      this.heatmapService.setConfig(colName, { ...config, textRules: rules });
    }
  }

  toggleColumn(colName: string) {
    this.heatmapService.toggleConfig(colName, this.inferDataType(colName));
  }

  getConfig(colName: string) {
    return this.heatmapService.configs().get(colName) || null;
  }

  updateConfig(colName: string, updates: Partial<any>) {
    const config = this.getConfig(colName);
    if (config) {
      this.heatmapService.setConfig(colName, { ...config, ...updates });
    }
  }
}
