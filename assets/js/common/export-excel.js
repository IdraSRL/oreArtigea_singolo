// export-excel.js v4.0 - Versione ristrutturata e corretta
import {
  calculateTotalMinutes,
  formatDecimalHours
} from '../common/time-utilis.js';

/**
 * Configurazione per l'esportazione Excel
 */
const EXCEL_CONFIG = {
  maxWidth: 800,
  maxHeight: 600,
  quality: 85,
  templatePath: '../assets/templates/template_ore.xlsx'
};

/**
 * Patterns per trovare celle nel template
 */
const CELL_PATTERNS = {
  name: /nome|dipendente/i,
  month: /mese|periodo/i,
  day: /giorno|data|1|2|3/,
  vacation: /ferie|vacation/i,
  sick: /malattia|sick/i,
  hours: /ore|hours/i
};

/**
 * Classe per gestire l'esportazione Excel
 */
class ExcelExporter {
  constructor() {
    this.ExcelJS = null;
  }

  /**
   * Inizializza ExcelJS
   */
  async initializeExcelJS() {
    if (!this.ExcelJS) {
      console.log('📚 Caricamento libreria ExcelJS...');
      try {
        // Importa ExcelJS correttamente
        const module = await import('https://cdn.jsdelivr.net/npm/exceljs@4.3.0/+esm');
        this.ExcelJS = module.default || module;
        console.log('✅ ExcelJS caricato correttamente');
      } catch (error) {
        console.error('❌ Errore caricamento ExcelJS:', error);
        throw new Error('Impossibile caricare ExcelJS');
      }
    }
    return this.ExcelJS;
  }

  /**
   * Carica il template Excel
   */
  async loadTemplate() {
    console.log('📄 Caricamento template Excel...');
    try {
      const response = await fetch(EXCEL_CONFIG.templatePath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      console.log('✅ Template caricato, dimensione:', buffer.byteLength, 'bytes');
      
      if (buffer.byteLength < 1000) {
        throw new Error('Template troppo piccolo, probabilmente corrotto');
      }
      
      return buffer;
    } catch (error) {
      console.warn('⚠️ Errore caricamento template:', error.message);
      throw error;
    }
  }

  /**
   * Crea workbook dal template
   */
  async createWorkbookFromTemplate(templateBuffer) {
    const ExcelJS = await this.initializeExcelJS();
    const workbook = new ExcelJS.Workbook();
    
    try {
      await workbook.xlsx.load(templateBuffer);
      console.log('📊 Workbook creato dal template');
      return workbook;
    } catch (error) {
      console.error('❌ Errore creazione workbook:', error);
      throw error;
    }
  }

  /**
   * Trova una cella che contiene un pattern specifico
   */
  findCellByPattern(worksheet, pattern) {
    let foundCell = null;
    
    worksheet.eachRow((row, rowNumber) => {
      if (foundCell) return;
      
      row.eachCell((cell, colNumber) => {
        if (foundCell) return;
        
        const cellValue = cell.value;
        if (cellValue && typeof cellValue === 'string' && pattern.test(cellValue)) {
          foundCell = { row: rowNumber, col: colNumber, value: cellValue };
        }
      });
    });
    
    return foundCell;
  }

  /**
   * Trova una colonna in una riga specifica che contiene un pattern
   */
  findColumnByPattern(worksheet, rowNumber, pattern) {
    const row = worksheet.getRow(rowNumber);
    let foundCol = null;
    
    row.eachCell((cell, colNumber) => {
      if (foundCol) return;
      
      const cellValue = cell.value;
      if (cellValue && typeof cellValue === 'string' && pattern.test(cellValue)) {
        foundCol = colNumber;
      }
    });
    
    return foundCol;
  }

  /**
   * Aggiorna i dati in un foglio di lavoro
   */
  async updateWorksheetData(worksheet, employeeName, employeeDays, year, month, daysInMonth) {
    console.log(`📝 Aggiornamento dati per ${employeeName}`);
    
    // Aggiorna nome dipendente
    const nameCell = this.findCellByPattern(worksheet, CELL_PATTERNS.name);
    if (nameCell) {
      const nextCell = worksheet.getCell(nameCell.row, nameCell.col + 1);
      nextCell.value = employeeName;
    }

    // Aggiorna mese/anno
    const monthCell = this.findCellByPattern(worksheet, CELL_PATTERNS.month);
    if (monthCell) {
      const nextCell = worksheet.getCell(monthCell.row, monthCell.col + 1);
      const monthName = new Date(year, month - 1).toLocaleString('it-IT', { month: 'long' });
      nextCell.value = `${monthName} ${year}`;
    }

    // Calcola i dati del dipendente
    const employeeData = this.calculateEmployeeData(employeeDays, year, month, daysInMonth);
    
    // Trova la tabella dei giorni
    const dayHeaderCell = this.findCellByPattern(worksheet, CELL_PATTERNS.day);
    if (dayHeaderCell) {
      const startRow = dayHeaderCell.row + 1;
      
      // Trova le colonne
      const ferieCol = this.findColumnByPattern(worksheet, dayHeaderCell.row, CELL_PATTERNS.vacation);
      const malattiaCol = this.findColumnByPattern(worksheet, dayHeaderCell.row, CELL_PATTERNS.sick);
      const oreCol = this.findColumnByPattern(worksheet, dayHeaderCell.row, CELL_PATTERNS.hours);
      
      // Popola i dati per ogni giorno
      for (let day = 1; day <= daysInMonth; day++) {
        const rowIndex = startRow + day - 1;
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayData = employeeDays[dateStr] || {};
        
        // Non includere date future
        const today = new Date();
        const currentDate = new Date(dateStr);
        if (currentDate > today) continue;
        
        // Ferie
        if (ferieCol && dayData.ferie) {
          worksheet.getCell(rowIndex, ferieCol).value = 'X';
        }
        
        // Malattia
        if (malattiaCol && dayData.malattia) {
          worksheet.getCell(rowIndex, malattiaCol).value = 'X';
        }
        
        // Ore lavorate
        if (oreCol && Array.isArray(dayData.attività) && dayData.attività.length) {
          const flat = dayData.attività.map(a => ({
            minutes: parseInt(a.minuti, 10) || 0,
            multiplier: parseInt(a.moltiplicatore, 10) || 1,
            people: parseInt(a.persone, 10) || 1
          }));
          
          const rawMinutes = calculateTotalMinutes(flat);
          const decHours = formatDecimalHours(rawMinutes, 2);
          worksheet.getCell(rowIndex, oreCol).value = decHours;
        }
      }
      
      // Aggiorna totali
      const totalRow = startRow + daysInMonth + 1;
      if (oreCol) {
        const totalCell = worksheet.getCell(totalRow, oreCol);
        const totalHours = formatDecimalHours(employeeData.totMinuti, 2);
        totalCell.value = totalHours;
      }
    }
  }

  /**
   * Calcola i dati aggregati per un dipendente
   */
  calculateEmployeeData(days, year, month, daysInMonth) {
    let totalRawMinutes = 0;
    const ferieData = [];
    const malattiaData = [];
    const oreData = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = d.toString().padStart(2, '0');
      const monthStr = month.toString().padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      const record = days[dateStr] || {};

      // Ferie e malattia
      ferieData.push(record.ferie ? 'X' : '');
      malattiaData.push(record.malattia ? 'X' : '');

      // Ore lavorate
      if (Array.isArray(record.attività) && record.attività.length) {
        const flat = record.attività.map(a => ({
          minutes: parseInt(a.minuti, 10) || 0,
          multiplier: parseInt(a.moltiplicatore, 10) || 1,
          people: parseInt(a.persone, 10) || 1
        }));

        const rawMinutes = calculateTotalMinutes(flat);
        const decHours = formatDecimalHours(rawMinutes, 2);

        oreData.push(decHours);
        totalRawMinutes += rawMinutes;
      } else {
        oreData.push('');
      }
    }

    return {
      ferieData,
      malattiaData,
      oreData,
      totMinuti: totalRawMinutes
    };
  }

  /**
   * Salva e scarica il workbook
   */
  async saveAndDownload(workbook, filename) {
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ File scaricato con successo');
    } catch (error) {
      console.error('❌ Errore durante il salvataggio:', error);
      throw error;
    }
  }

  /**
   * Esportazione con template
   */
  async exportWithTemplate(data, year, month) {
    console.log('🚀 Inizio esportazione Excel con template');
    
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthName = new Date(year, month - 1).toLocaleString('it-IT', { month: 'long' });

    // Carica template e crea workbook
    const templateBuffer = await this.loadTemplate();
    const workbook = await this.createWorkbookFromTemplate(templateBuffer);

    // Per ogni dipendente, crea un foglio
    let sheetIndex = 0;
    for (const [employeeName, employeeDays] of Object.entries(data)) {
      console.log(`👤 Elaborazione dipendente: ${employeeName}`);
      
      let worksheet;
      if (sheetIndex === 0) {
        // Usa il primo foglio esistente
        worksheet = workbook.worksheets[0];
        worksheet.name = employeeName;
      } else {
        // Duplica il primo foglio per gli altri dipendenti
        const templateSheet = workbook.worksheets[0];
        worksheet = workbook.addWorksheet(employeeName);
        
        // Copia struttura e formattazione dal template
        this.copyWorksheetStructure(templateSheet, worksheet);
      }

      // Aggiorna i dati nel foglio
      await this.updateWorksheetData(worksheet, employeeName, employeeDays, year, month, daysInMonth);
      sheetIndex++;
    }

    // Salva e scarica
    const filename = `OreDipendenti_${monthName}_${year}.xlsx`;
    await this.saveAndDownload(workbook, filename);
    
    console.log('✅ Esportazione Excel completata con successo');
  }

  /**
   * Copia struttura da un foglio all'altro
   */
  copyWorksheetStructure(sourceSheet, targetSheet) {
    sourceSheet.eachRow((row, rowNumber) => {
      const newRow = targetSheet.getRow(rowNumber);
      row.eachCell((cell, colNumber) => {
        const newCell = newRow.getCell(colNumber);
        
        // Copia valore se non è una formula
        if (cell.type !== this.ExcelJS.ValueType.Formula) {
          newCell.value = cell.value;
        }
        
        // Copia formattazione
        if (cell.style) {
          newCell.style = { ...cell.style };
        }
      });
      
      // Copia altezza riga
      if (row.height) {
        newRow.height = row.height;
      }
    });
    
    // Copia larghezza colonne
    sourceSheet.columns.forEach((col, index) => {
      if (col.width) {
        targetSheet.getColumn(index + 1).width = col.width;
      }
    });
  }
}

/**
 * Classe per l'esportazione fallback senza template
 */
class FallbackExporter {
  /**
   * Esportazione semplificata usando XLSX
   */
  async exportSimple(data, year, month) {
    console.log('🔄 Esportazione fallback senza template');
    
    try {
      const XLSX = await import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm');
      const daysInMonth = new Date(year, month, 0).getDate();
      const monthName = new Date(year, month - 1).toLocaleString('it-IT', { month: 'long' });

      const worksheetData = [];
      worksheetData.push([`Ore Dipendenti - ${monthName} ${year}`]);
      worksheetData.push([]);

      for (const [employee, days] of Object.entries(data)) {
        worksheetData.push([employee]);
        
        const headerRow = ['Tipo'];
        for (let d = 1; d <= daysInMonth; d++) {
          headerRow.push(d);
        }
        headerRow.push('Totale');
        worksheetData.push(headerRow);

        const exporter = new ExcelExporter();
        const employeeData = exporter.calculateEmployeeData(days, year, month, daysInMonth);

        const ferieRow = ['Ferie', ...employeeData.ferieData, ''];
        worksheetData.push(ferieRow);

        const malattiaRow = ['Malattia', ...employeeData.malattiaData, ''];
        worksheetData.push(malattiaRow);

        const totaleOreDecimali = formatDecimalHours(employeeData.totMinuti, 2);
        const oreRow = ['Ore', ...employeeData.oreData, totaleOreDecimali];
        worksheetData.push(oreRow);

        worksheetData.push([]);
      }

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, `${monthName} ${year}`);
      XLSX.writeFile(workbook, `OreDipendenti_${monthName}_${year}_Fallback.xlsx`);
      
      console.log('✅ Esportazione fallback completata');
      
    } catch (fallbackError) {
      console.error('❌ Errore anche nel fallback:', fallbackError);
      throw new Error('Errore durante l\'esportazione del file Excel. Controlla la console per dettagli.');
    }
  }
}

/**
 * Funzione principale di esportazione
 * @param {Object} data - Dati dei dipendenti
 * @param {number} year - Anno
 * @param {number} month - Mese
 */
export async function exportToExcel(data, year, month) {
  const exporter = new ExcelExporter();
  const fallbackExporter = new FallbackExporter();

  try {
    // Prova prima con il template
    await exporter.exportWithTemplate(data, year, month);
  } catch (error) {
    console.error('❌ Errore durante l\'esportazione Excel:', error);
    
    // Fallback: esportazione semplificata
    console.log('🔄 Tentativo esportazione fallback...');
    try {
      await fallbackExporter.exportSimple(data, year, month);
    } catch (fallbackError) {
      console.error('❌ Errore anche nel fallback:', fallbackError);
      alert('Errore durante l\'esportazione del file Excel. Controlla la console per dettagli.');
    }
  }
}