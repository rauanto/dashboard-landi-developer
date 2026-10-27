/// <reference lib="webworker" />
import * as xlsx from 'xlsx';

addEventListener('message', ({ data }) => {
  const { arrayBuffer } = data;
  try {
    const workbook = xlsx.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    const jsonData = xlsx.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });

    if (!jsonData || jsonData.length === 0) {
      postMessage({ columns: [], data: [] });
      return;
    }

    const rawColumns = jsonData[0] || [];
    
    // Guardamos el índice original de cada columna para no desfasar los datos si hay columnas vacías
    const columnsInfo = rawColumns
      .map((c, index) => ({ name: c ? String(c).trim() : '', index }))
      .filter(c => c.name.length > 0);

    const columns = columnsInfo.map(c => c.name);

    if (columns.length === 0) {
      postMessage({ columns: [], data: [] });
      return;
    }

    const dataRows = jsonData.slice(1).map(rowArray => {
      const rowObject: any = {};
      columnsInfo.forEach(c => {
        rowObject[c.name] = rowArray[c.index];
      });
      return rowObject;
    });
    
    const parsedData = dataRows.filter(row => 
      Object.values(row).some(val => val !== null && val !== undefined && val !== '')
    );

    postMessage({ columns, data: parsedData });
  } catch (error) {
    postMessage({ error: (error as Error).message });
  }
});
