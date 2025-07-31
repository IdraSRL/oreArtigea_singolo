// admin-service.js v2.0 - Versione semplificata
import { FirestoreService } from '../../common/firestore-service.js';
import {
  calculateTotalMinutes,
  formatDecimalHours
} from '../../common/time-utilis.js';

/**
 * Calcola le ore totali decimali e conteggia i giorni speciali
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
      const flat = day.attività.map(a => ({
        minutes: parseInt(a.minuti, 10) || 0,
        multiplier: parseInt(a.moltiplicatore, 10) || 1,
        people: parseInt(a.persone, 10) || 1
      }));
      rawTotalMinutes += calculateTotalMinutes(flat);
    }
  });

  const decimalHours = formatDecimalHours(rawTotalMinutes, 2);

  return { decimalHours, sickDays, vacationDays, restDays };
}

export const AdminService = {
  /**
   * Restituisce tutti i dati mensili di tutti i dipendenti
   */
  async getMonthlyData(year, month) {
    return FirestoreService.getAllEmployeesMonth(year, month);
  },

  /**
   * Calcola riepilogo ore decimali e giorni speciali per un singolo utente
   */
  calculateTotalHours(daysData) {
    return computeMonthlySummary(daysData);
  }
};