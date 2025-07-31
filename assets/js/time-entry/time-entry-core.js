import { db } from "../common/firebase-config.js";
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { FirestoreService } from "../common/firestore-service.js";

function formatISO(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${y}-${m}-${d}`;
}

async function fetchDataArray(varName) {
  try {
    const ref = doc(db, 'Data', varName);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const arr = snap.data()[varName];
      return Array.isArray(arr) ? arr : [];
    }
    console.warn(`⚠️ nessun documento Data/${varName}`);
  } catch (err) {
    console.error(`❌ Errore fetch ${varName}:`, err);
  }
  return [];
}

export async function handleFormSubmit(e) {
  e.preventDefault();
  const restDay = document.getElementById('restDayCheckbox').checked;
  const date = document.getElementById('hiddenDate').value;
  const user = sessionStorage.getItem('loggedUser') || '';
  const cd = window.currentDayData || {};
  if (cd.riposo || cd.ferie || cd.malattia) {
    const s = cd.riposo ? 'riposo' : cd.ferie ? 'ferie' : 'malattia';
    showMessage(`Giorno già segnato come ${s}.`, 'alert-warning');
    return;
  }
  const todayStr = formatISO(new Date());
  const y = new Date(); y.setDate(y.getDate() - 1);
  const yesterdayStr = formatISO(y);
  if (date !== todayStr && date !== yesterdayStr) {
    showMessage('Solo oggi o ieri.', 'alert-warning');
    return;
  }
  const acts = collectActivitiesFromForm();
  const status = { riposo: restDay, ferie: false, malattia: false };
  try {
    const res = await TimeEntryService.saveTimeEntry(user, date, acts, status);
    if (res.success) {
      showMessage('Salvato!', 'alert-success');
      loadActivitiesForDate(date);
    } else {
      console.error('❌ saveTimeEntry failed', res.error);
      showMessage('Errore.', 'alert-danger');
    }
  } catch (e) {
    console.error('❌ handleFormSubmit exception', e);
    showMessage('Errore.', 'alert-danger');
  }
}

export const TimeEntryService = {
  activityTypes: {
    appartamenti: { name: 'Appartamenti', color: '#B71C6B' },
    uffici: { name: 'Uffici', color: '#006669' },
    bnb: { name: 'BnB', color: '#B38F00' },
    pst: { name: 'PST', color: '#283593' }
  },

  async getActivitiesForType(type) {
    const mapVar = { appartamenti: 'appartamenti', uffici: 'uffici', bnb: 'bnb' };
    const vn = mapVar[type];
    if (!vn) return [];
    const arr = await fetchDataArray(vn);
    const mapped = arr
      .map(item => {
        if (typeof item === 'string') {
          const [n, m] = item.split('|');
          return { name: n.trim(), minutes: parseInt(m, 10) || 0 };
        } else if (item && typeof item === 'object') {
          const name = item.name ?? item.nome ?? '';
          const minutes = item.minutes ?? item.minuti ?? 0;
          return { name: String(name), minutes: Number(minutes) };
        } else {
          console.warn('⚠️ elemento non gestito in Data/' + vn + ':', item);
          return null;
        }
      })
      .filter(x => x && x.name);
    return mapped;
  },

  calculateEffectiveMinutes(a) {
    const m = parseInt(a.minutes, 10) || 0;
    const p = parseInt(a.people, 10) || 1;
    const mul = parseInt(a.multiplier, 10) || 1;
    return (m * mul) / p;
  },

  async saveTimeEntry(username, date, activities, status) {
    try {
      const cleaned = activities.map(a => ({
        tipo: a.type || null,
        nome: a.name || null,
        minuti: Number(a.minutes) || 0,
        persone: Number(a.people) || 1,
        moltiplicatore: Number(a.multiplier) || 1
      }));
      const existing = await FirestoreService.getEmployeeDay(username, date);
      const prev = (existing.success && existing.data?.attività) ? existing.data.attività : [];
      const map = {};
      prev.forEach(act => { if (act.nome && act.tipo) map[`${act.nome}|${act.tipo}`] = act });
      cleaned.forEach(act => { if (act.nome && act.tipo) map[`${act.nome}|${act.tipo}`] = act });
      const finalActs = Object.values(map);
      const payload = { data: date, attività: finalActs, riposo: Boolean(status.riposo), ferie: Boolean(status.ferie), malattia: Boolean(status.malattia) };
      const result = await FirestoreService.saveEmployeeDay(username, date, payload);
      return result;
    } catch (e) {
      console.error('❌ saveTimeEntry errore:', e);
      return { success: false, error: e };
    }
  }
};

function showMessage(text, type) {
  const c = document.getElementById('messageContainer');
  if (!c) return;
  const d = document.createElement('div');
  d.className = `alert ${type}`;
  d.textContent = text;
  c.appendChild(d);
  setTimeout(() => c.removeChild(d), 3000);
}

function collectActivitiesFromForm() {
  const out = [];
  document.querySelectorAll('.activity-row').forEach(row => {
    out.push({
      type: row.querySelector('select[name="activityType"]').value || '',
      name: row.querySelector('input[name="activityName"]').value || '',
      minutes: row.querySelector('input[name="activityMinutes"]').value || 0,
      people: row.querySelector('input[name="activityPeople"]').value || 1,
      multiplier: row.querySelector('input[name="activityMultiplier"]').value || 1
    });
  });
  return out;
}

function loadActivitiesForDate(date) {
  // TODO: implementa con FirestoreService.getEmployeeDay
}
