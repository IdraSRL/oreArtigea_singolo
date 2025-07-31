import { FirestoreService } from '../../common/firestore-service.js';
import { utils, writeFile } from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";
import {
  calculateTotalMinutes,
  formatDecimalHours
} from '../../common/time-utilis.js';

/**
 * Calcola le ore totali decimali, i minuti non servono più separatamente,
 * e conteggia i giorni di malattia, ferie e riposo.
 * @param {Object} daysData - Oggetto con chiavi "YYYY-MM-DD" e valori { attività, malattia, ferie, riposo }.
 * @returns {{ decimalHours: number, sickDays: number, vacationDays: number, restDays: number }}
 */
function computeMonthlySummary(daysData) {
  let rawTotalMinutes = 0;
  let sickDays = 0;
  let vacationDays = 0;
  let restDays = 0;

  Object.values(daysData).forEach(day => {
    if (day.malattia) {
      sickDays++;
    } else if (day.ferie) {
      vacationDays++;
    } else if (day.riposo) {
      restDays++;
    } else if (Array.isArray(day.attività) && day.attività.length) {
      // Accumulo minuti frazionari del giorno
      const flat = day.attività.map(a => ({
        minutes:    parseInt(a.minuti,       10) || 0,
        multiplier: parseInt(a.moltiplicatore,10) || 1,
        people:     parseInt(a.persone,      10) || 1
      }));
      rawTotalMinutes += calculateTotalMinutes(flat);
    }
  });

  // Converto in ore decimali (2 decimali)
  const decimalHours = formatDecimalHours(rawTotalMinutes, 2);

  return { decimalHours, sickDays, vacationDays, restDays };
}

export const AdminService = {
  /**
   * Restituisce tutti i dati mensili di tutti i dipendenti.
   */
  async getMonthlyData(year, month) {
    return FirestoreService.getAllEmployeesMonth(year, month);
  },

  /**
   * Calcola riepilogo ore decimali e giorni speciali per un singolo utente.
   * @param {Object} daysData
   */
  calculateTotalHours(daysData) {
    return computeMonthlySummary(daysData);
  },

  /**
   * Genera e fa scaricare un file Excel con riepilogo mensile in ore decimali.
   * @param {Object} params
   * @param {Object} params.data   - { dipendente: { "YYYY-MM-DD": { attività, malattia, ferie, riposo } }, … }
   * @param {number} params.year   - Anno
   * @param {number} params.month  - Mese (1–12)
   */
  async exportToExcel({ data, year, month }) {
    const sheetName = new Date(year, month - 1)
      .toLocaleString('it-IT', { month: 'long', year: 'numeric' });

    const daysInMonth = Array.from({ length: 31 }, (_, i) => String(i + 1));
    const monthStr = String(month).padStart(2, '0');

    const combinedSheetData = [];

    for (const [username, days] of Object.entries(data)) {
      if (!days || Object.keys(days).length === 0) continue;

      const headerRow    = [`Dipendente: ${username}`, ...daysInMonth];
      const ferieRow     = ['FERIE'];
      const malattiaRow  = ['MALATTIA'];
      const riposoRow    = ['RIPOSO'];
      const oreRow       = ['ORE'];

      let monthlyTotal = 0;

      daysInMonth.forEach(dayNum => {
        const dayPadded = dayNum.padStart(2, '0');
        const dateKey   = `${year}-${monthStr}-${dayPadded}`;
        const info      = days[dateKey] || {};

        ferieRow.push(info.ferie ? 1 : 0);
        malattiaRow.push(info.malattia ? 1 : 0);
        riposoRow.push(info.riposo ? 1 : 0);

        // Minuti frazionari e ore decimali giornaliere
        const flat = Array.isArray(info.attività)
          ? info.attività.map(a => ({
              minutes:    parseInt(a.minuti,       10) || 0,
              multiplier: parseInt(a.moltiplicatore,10) || 1,
              people:     parseInt(a.persone,      10) || 1
            }))
          : [];

        const rawMinutes = calculateTotalMinutes(flat);
        const decHours   = formatDecimalHours(rawMinutes, 2);
        oreRow.push(decHours);
        monthlyTotal += decHours;
      });

      const hasData =
        ferieRow.slice(1).some(v => v > 0) ||
        malattiaRow.slice(1).some(v => v > 0) ||
        riposoRow.slice(1).some(v => v > 0) ||
        oreRow.slice(1).some(v => v > 0);

      if (!hasData) continue;

      // Aggiungo totale mensile decimale a fine riga "ORE"
      oreRow.push(Number(monthlyTotal.toFixed(2)));

      combinedSheetData.push(headerRow);
      combinedSheetData.push(ferieRow);
      combinedSheetData.push(malattiaRow);
      combinedSheetData.push(riposoRow);
      combinedSheetData.push(oreRow);
      combinedSheetData.push([]); // riga vuota di separazione
    }

    if (combinedSheetData.length === 0) {
      combinedSheetData.push(['Nessun dato disponibile per questo mese']);
    }

    const newSheet = utils.aoa_to_sheet(combinedSheetData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, newSheet, sheetName);
    writeFile(workbook, `OreDipendenti_${sheetName}.xlsx`);
  }
};
