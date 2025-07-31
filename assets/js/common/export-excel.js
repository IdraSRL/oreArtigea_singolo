// export-excel.js v3.0 - Versione con template Excel
import {
  calculateTotalMinutes,
  formatDecimalHours
} from '../common/time-utilis.js';

/**
 * Esporta i dati in formato Excel usando il template esistente
 * Mantiene tutta la formattazione del template originale
 */
export async function exportToExcel(data, year, month) {
  try {
    console.log('🚀 Inizio esportazione Excel con template');
    
    // Carica ExcelJS
    const ExcelJS = await import('https://cdn.jsdelivr.net/npm/exceljs@4.3.0/+esm');
    
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthName = new Date(year, month - 1).toLocaleString('it-IT', { month: 'long' });

    // Carica il template Excel
    console.log('📄 Caricamento template Excel...');
    const templateResponse = await fetch('../assets/templates/template_ore.xlsx');
    if (!templateResponse.ok) {
      throw new Error(`Errore caricamento template: ${templateResponse.status}`);
    }
    
    const templateBuffer = await templateResponse.arrayBuffer();
    console.log('✅ Template caricato, dimensione:', templateBuffer.byteLength, 'bytes');

    // Crea workbook dal template
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateBuffer);
    console.log('📊 Workbook creato dal template');

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
        templateSheet.eachRow((row, rowNumber) => {
          const newRow = worksheet.getRow(rowNumber);
          row.eachCell((cell, colNumber) => {
            const newCell = newRow.getCell(colNumber);
            
            // Copia valore se non è una formula
            if (cell.type !== ExcelJS.ValueType.Formula) {
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
        templateSheet.columns.forEach((col, index) => {
          if (col.width) {
            worksheet.getColumn(index + 1).width = col.width;
          }
        });
      }

      // Aggiorna i dati nel foglio
      await updateWorksheetData(worksheet, employeeName, employeeDays, year, month, daysInMonth);
      sheetIndex++;
    }

    // Salva e scarica il file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OreDipendenti_${monthName}_${year}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ Esportazione Excel completata con successo');

  } catch (error) {
    console.error('❌ Errore durante l\'esportazione Excel:', error);
    
    // Fallback: esportazione semplificata
    console.log('🔄 Tentativo esportazione fallback...');
    await exportToExcelFallback(data, year, month);
  }
}

/**
 * Aggiorna i dati in un foglio di lavoro mantenendo la formattazione del template
 */
async function updateWorksheetData(worksheet, employeeName, employeeDays, year, month, daysInMonth) {
  console.log(`📝 Aggiornamento dati per ${employeeName}`);
  
  // Cerca le celle chiave nel template (assumendo posizioni standard)
  // Aggiorna nome dipendente (cerca una cella che contiene "Nome" o simile)
  const nameCell = findCellByPattern(worksheet, /nome|dipendente/i);
  if (nameCell) {
    const nextCell = worksheet.getCell(nameCell.row, nameCell.col + 1);
    nextCell.value = employeeName;
  }

  // Aggiorna mese/anno
  const monthCell = findCellByPattern(worksheet, /mese|periodo/i);
  if (monthCell) {
    const nextCell = worksheet.getCell(monthCell.row, monthCell.col + 1);
    const monthName = new Date(year, month - 1).toLocaleString('it-IT', { month: 'long' });
    nextCell.value = `${monthName} ${year}`;
  }

  // Calcola i dati del dipendente
  const employeeData = calculateEmployeeData(employeeDays, year, month, daysInMonth);
  
  // Trova la tabella dei giorni (cerca intestazioni come "Giorno", "Data", etc.)
  const dayHeaderCell = findCellByPattern(worksheet, /giorno|data|1|2|3/);
  if (dayHeaderCell) {
    const startRow = dayHeaderCell.row + 1; // Riga dopo l'intestazione
    
    // Trova le colonne per Ferie, Malattia, Ore
    const ferieCol = findColumnByPattern(worksheet, dayHeaderCell.row, /ferie|vacation/i);
    const malattiaCol = findColumnByPattern(worksheet, dayHeaderCell.row, /malattia|sick/i);
    const oreCol = findColumnByPattern(worksheet, dayHeaderCell.row, /ore|hours/i);
    
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
    
    // Aggiorna totali (cerca celle con formule SUM o totali)
    const totalRow = startRow + daysInMonth + 1;
    if (oreCol) {
      const totalCell = worksheet.getCell(totalRow, oreCol);
      const totalHours = formatDecimalHours(employeeData.totMinuti, 2);
      totalCell.value = totalHours;
    }
  }
}

/**
 * Trova una cella che contiene un pattern specifico
 */
function findCellByPattern(worksheet, pattern) {
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
function findColumnByPattern(worksheet, rowNumber, pattern) {
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
 * Calcola i dati aggregati per un dipendente
 */
function calculateEmployeeData(days, year, month, daysInMonth) {
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
 * Esportazione fallback senza template (in caso di errori)
 */
async function exportToExcelFallback(data, year, month) {
  try {
    console.log('🔄 Esportazione fallback senza template');
    
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

      const employeeData = calculateEmployeeData(days, year, month, daysInMonth);

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
    alert('Errore durante l\'esportazione del file Excel. Controlla la console per dettagli.');
  }
}