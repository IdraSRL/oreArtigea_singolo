// export-excel.js v2.0 - Versione semplificata senza template
import {
  calculateTotalMinutes,
  formatDecimalHours
} from '../common/time-utilis.js';

/**
 * Esporta i dati in formato Excel usando una struttura semplice
 * Rimuove la dipendenza dal template Excel che causava errori
 */
export async function exportToExcel(data, year, month) {
  try {
    // Usa SheetJS invece di ExcelJS per maggiore compatibilità
    const XLSX = await import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm');
    
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthName = new Date(year, month - 1).toLocaleString('it-IT', { month: 'long' });

    // Crea i dati per il foglio Excel
    const worksheetData = [];
    
    // Intestazione principale
    worksheetData.push([`Ore Dipendenti - ${monthName} ${year}`]);
    worksheetData.push([]); // Riga vuota

    // Per ogni dipendente
    for (const [employee, days] of Object.entries(data)) {
      // Nome dipendente
      worksheetData.push([employee]);
      
      // Intestazione giorni
      const headerRow = ['Tipo'];
      for (let d = 1; d <= daysInMonth; d++) {
        headerRow.push(d);
      }
      headerRow.push('Totale');
      worksheetData.push(headerRow);

      const employeeData = calculateEmployeeData(days, year, month, daysInMonth);

      // Riga Ferie
      const ferieRow = ['Ferie', ...employeeData.ferieData, ''];
      worksheetData.push(ferieRow);

      // Riga Malattia
      const malattiaRow = ['Malattia', ...employeeData.malattiaData, ''];
      worksheetData.push(malattiaRow);

      // Riga Ore con totale
      const totaleOreDecimali = formatDecimalHours(employeeData.totMinuti, 2);
      const oreRow = ['Ore', ...employeeData.oreData, totaleOreDecimali];
      worksheetData.push(oreRow);

      // Riga vuota di separazione
      worksheetData.push([]);
    }

    // Crea il workbook e worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Aggiungi il worksheet al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, `${monthName} ${year}`);

    // Scarica il file
    XLSX.writeFile(workbook, `OreDipendenti_${monthName}_${year}.xlsx`);

  } catch (error) {
    console.error('Errore durante l\'esportazione:', error);
    alert('Errore durante l\'esportazione del file Excel. Controlla la console per dettagli.');
  }
}

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