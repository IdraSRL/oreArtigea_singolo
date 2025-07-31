// time-entry-core.js

import { db } from "../common/firebase-config.js";
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { FirestoreService } from "../common/firestore-service.js";

/**
 * Converte un oggetto Date in stringa ISO locale 'YYYY-MM-DD'
 */
function formatISO(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${y}-${m}-${d}`;
}

/**
 * Recupera da Firestore l'array statico (es. 'appartamenti')
 */
async function fetchDataArray(varName) {
  try {
    const ref = doc(db, 'Data', varName);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const arr = snap.data()[varName];
      return Array.isArray(arr) ? arr : [];
    }
  } catch (e) {
    console.error(`fetchDataArray(${varName}) error:`, e);
  }
  return [];
}

export const TimeEntryService = {
  activityTypes: {
    appartamenti: { name: "Appartamenti", color: "#B71C6B" },
    uffici:        { name: "Uffici",       color: "#006669" },
    bnb:           { name: "BnB",          color: "#B38F00" },
    pst:           { name: "PST",          color: "#283593" }
  },

  /**
   * Restituisce le attività disponibili per un tipo, leggendo da Firestore
   */
  async getActivitiesForType(type) {
    const map = { appartamenti: 'appartamenti', uffici: 'uffici', bnb: 'bnb' };
    const varName = map[type];
    if (!varName) return [];
    const arr = await fetchDataArray(varName);
    return arr.map(item => {
      const [name, minutes] = item.split('|');
      return { name: name.trim(), minutes: parseInt(minutes, 10) || 0 };
    });
  },

  /**
   * Calcola i minuti effettivi: (minuti * moltiplicatore) / persone
   */
  calculateEffectiveMinutes({ minutes, people, multiplier }) {
    const m = parseInt(minutes, 10) || 0;
    const p = parseInt(people, 10) || 1;
    const mul = parseInt(multiplier, 10) || 1;
    return (m * mul) / p;
  },

  /**
   * Salva su Firestore le attività di un dipendente in una data specifica
   */
  async saveTimeEntry(username, date, activities, status) {
    try {
      const clean = activities.map(a => ({
        tipo:           a.type       || null,
        nome:           a.name       || null,
        minuti:         Number(a.minutes)   || 0,
        persone:        Number(a.people)    || 1,
        moltiplicatore: Number(a.multiplier) || 1
      }));

      const existing = await FirestoreService.getEmployeeDay(username, date);
      const prev = (existing.success && existing.data) ? existing.data : {};
      const prevActs = Array.isArray(prev.attività) ? prev.attività : [];

      const mapActs = {};
      prevActs.forEach(act => mapActs[`${act.nome}|${act.tipo}`] = act);
      clean.forEach(act => {
        const key = `${act.nome}|${act.tipo}`;
        if (!mapActs[key]) {
          mapActs[key] = act;
        } else {
          const ex = mapActs[key];
          ex.minuti = ex.minuti + act.minuti;
          ex.persone = act.persone;
          ex.moltiplicatore = act.moltiplicatore;
        }
      });

      const finalActs = Object.values(mapActs);
      const payload = {
        data:      date,
        attività:  finalActs,
        riposo:    status.riposo   ?? prev.riposo   ?? false,
        ferie:     status.ferie    ?? prev.ferie    ?? false,
        malattia:  status.malattia ?? prev.malattia ?? false
      };

      return await FirestoreService.saveEmployeeDay(username, date, payload);
    } catch (err) {
      console.error('[❌] saveTimeEntry error:', err);
      return { success: false, error: err };
    }
  }
};

