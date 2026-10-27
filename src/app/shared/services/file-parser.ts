import { Service } from '@angular/core';

export interface ParsedTableData {
  columns: string[];
  data: any[];
}

@Service()
export class FileParserService {
  constructor() { }

  /**
   * Lee un archivo Excel o CSV y lo convierte en un array de columnas y data
   * (Procesado en un Web Worker en segundo plano)
   * @param file Archivo a procesar
   */
  async parseFile(file: File): Promise<ParsedTableData> {
    return new Promise((resolve, reject) => {
      if (typeof Worker !== 'undefined') {
        const worker = new Worker(new URL('./file-parser.worker', import.meta.url), { type: 'module' });
        
        worker.onmessage = ({ data }) => {
          if (data.error) {
            reject(new Error(data.error));
          } else {
            resolve(data);
          }
          worker.terminate();
        };

        worker.onerror = (error) => {
          reject(error);
          worker.terminate();
        };

        const reader = new FileReader();
        reader.onload = (e: any) => {
          const arrayBuffer = e.target.result;
          worker.postMessage({ arrayBuffer });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Web Workers no están soportados en este navegador.'));
      }
    });
  }
}
