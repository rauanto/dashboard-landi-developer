import { Injectable, inject } from '@angular/core';
import { GridFilterService } from './grid-filter.service';
import { GridHeatmapService } from './grid-heatmap.service';

@Injectable()
export class GridReportService {
  private filterService = inject(GridFilterService);
  private heatmapService = inject(GridHeatmapService);

  generateReport(
    allColumns: string[],
    orderedColumns: string[],
    hiddenColumns: string[],
    sortColumn: string | null,
    sortDirection: string | null,
    pageSize: string = 'LEGAL'
  ) {
    const filters = Array.from(this.filterService.filters().entries()).map(([col, filter]) => {
      const result: any = {
        column: col,
        type: filter.type,
      };

      if (filter.type === 'text') {
        result.values = filter.values;
      } else if (filter.type === 'range') {
        result.min = filter.min;
        result.max = filter.max;
      }

      return result;
    });

    const heatmaps = Array.from(this.heatmapService.configs().entries())
      .filter(([_, config]) => config.enabled)
      .map(([col, config]) => {
        const result: any = {
          column: col,
          direction: config.direction,
          dataType: config.dataType,
        };

        if (config.dataType === 'text' && config.textRules) {
          result.textRules = config.textRules;
        }

        return result;
      });

    return {
      schema_: {
        totalColumns: allColumns.length,
        allColumns: allColumns,
        orderedColumns: orderedColumns,
        visibleColumns: orderedColumns.filter((c) => !hiddenColumns.includes(c)),
        hiddenColumns: hiddenColumns,
        pageSize: pageSize
      },
      sort: {
        column: sortColumn || "",
        direction: sortDirection || ""
      },
      heatmaps: heatmaps,
      filters: filters,
      timestamp: new Date().toISOString(),
    };
  }
}
