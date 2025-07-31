// export-excel.js v1.0
// export-excel.js
import ExcelJS from 'https://cdn.jsdelivr.net/npm/exceljs/+esm';

import {
  calculateTotalMinutes,
  formatHoursMinutes,
  formatDecimalHours
} from '../common/time-utilis.js';

export async function exportToExcel(data, year, month) {
  try {
    const response = await fetch('../templates/template_ore_dipendenti.xlsx');
    if (!response.ok) throw new Error('Impossibile caricare il template');

    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthName = new Date(year, month - 1).toLocaleString('it-IT', { month: 'long' });

    // Titolo
    worksheet.getCell('A1').value = `Ore Dipendenti - ${monthName} ${year}`;

    let currentRow = 3;

    for (const [employee, days] of Object.entries(data)) {
      // A3: Nome dipendente
      worksheet.getCell(`A${currentRow}`).value = employee;

      // B3:AF3 -> Giorni del mese
      const headerRow = worksheet.getRow(currentRow);
      for (let d = 1; d <= 31; d++) {
        const cell = headerRow.getCell(d + 1);
        cell.value = d <= daysInMonth ? d : '';
      }
      currentRow++;

      // B4:AF4 -> Riga "Permessi" (vuota, ma label in A4)
      worksheet.getCell(`A${currentRow}`).value = 'Permessi';
      currentRow++;

      // Ferie
      const ferieRow = worksheet.getRow(currentRow);
      ferieRow.getCell(1).value = 'Ferie';

      // Malattia
      const malattiaRow = worksheet.getRow(currentRow + 1);
      malattiaRow.getCell(1).value = 'Malattia';

      // Ore
      const oreRow = worksheet.getRow(currentRow + 2);
      oreRow.getCell(1).value = 'Ore';

      const employeeData = calculateEmployeeData(days, year, month, daysInMonth);

      for (let i = 0; i < daysInMonth; i++) {
        ferieRow.getCell(i + 2).value = employeeData.ferieData[i] || '';
        malattiaRow.getCell(i + 2).value = employeeData.malattiaData[i] || '';
        oreRow.getCell(i + 2).value = employeeData.oreData[i] || '';
      }

      // Totale ore decimali in AG7
      oreRow.getCell(33).value = parseFloat((employeeData.totMinuti / 60).toFixed(2));

      // Vai al blocco successivo
      currentRow += 4;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `OreDipendenti_${monthName}_${year}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Errore durante l\'esportazione:', e);
    alert('Errore durante l\'esportazione del file.');
  }
}

function calculateEmployeeData(days, year, month, daysInMonth) {
  let totalRawMinutes = 0;
  const ferieData = [];
  const malattiaData = [];
  const oreData = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr   = d.toString().padStart(2, '0');
    const monthStr = month.toString().padStart(2, '0');
    const dateStr  = `${year}-${monthStr}-${dayStr}`;
    const record   = days[dateStr] || {};

    // Ferie e malattia
    ferieData.push(record.ferie ? 'X' : '');
    malattiaData.push(record.malattia ? 'X' : '');

    // Ore lavorate
    if (Array.isArray(record.attività) && record.attività.length) {
      // Preparo l'array per il calcolo
      const flat = record.attività.map(a => ({
        minutes:    parseInt(a.minuti,       10) || 0,
        multiplier: parseInt(a.moltiplicatore,10) || 1,
        people:     parseInt(a.persone,      10) || 1
      }));

      // Minuti frazionari e ore decimali (2 decimali)
      const rawMinutes = calculateTotalMinutes(flat);
      const decHours   = formatDecimalHours(rawMinutes, 2);

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
