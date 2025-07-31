// time-entry-summary.js

import { AuthService } from "../auth/auth.js";
import { FirestoreService } from "../common/firestore-service.js";
import { AdminService } from "../admin/common/admin-service.js";
// ATTENZIONE: percorso corretto "time-utils.js" e tolta la funzione mai utilizzata
import {
  calculateTotalMinutes,
  formatDecimalHours
} from '../common/time-utilis.js';

document.addEventListener('DOMContentLoaded', () => {
  // Verifica autenticazione
  if (!AuthService.checkAuth()) {
    window.location.href = 'login.html';
    return;
  }

  // Username e visualizzazione utente
  const username    = AuthService.getCurrentUser();
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) {
    userDisplay.textContent = username;
  }

  // ============================================
  // SEZIONE 1: LISTA AGGREGATA PER DATA
  // (Attività recenti con filtro per data singola - RIMOSSA dalla tab Registrazione)
  // ============================================

  // ============================================
  // SEZIONE 2: RIEPILOGO MENSILE
  // (Totali, status e tabella giorno per giorno)
  // ============================================
  const summaryContainer = document.getElementById('summaryContainer');
  const monthSelect      = document.getElementById('monthSelect');

  if (monthSelect && summaryContainer) {
    initializeMonthDropdown();
    // Seleziona di default mese corrente
    const now = new Date();
    const defaultValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthSelect.value = defaultValue;
    loadMonthlyData();
    monthSelect.addEventListener('change', loadMonthlyData);
  }

  function initializeMonthDropdown() {
    const today        = new Date();
    const currentYear  = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    for (let i = 0; i < 12; i++) {
      let month = currentMonth - i;
      let year  = currentYear;
      if (month <= 0) {
        month += 12;
        year  -= 1;
      }
      const monthName = new Date(year, month - 1, 1).toLocaleString('it-IT', { month: 'long' });
      const option = document.createElement('option');
      option.value       = `${year}-${String(month).padStart(2, '0')}`;
      option.textContent = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
      if (i === 0) option.selected = true;
      monthSelect.appendChild(option);
    }
  }

  async function loadMonthlyData() {
    const value = monthSelect.value || '';
    if (!value.includes('-')) {
      summaryContainer.innerHTML = '<p class="text-danger">Mese non valido selezionato.</p>';
      return;
    }
    const [yearStr, monthStr] = value.split('-');
    const year  = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    try {
      showProgress('Caricamento riepilogo mensile...');
      const result = await FirestoreService.getEmployeeMonth(username, year, month);
      if (result.success) {
        const dataObj = { [username]: result.data || {} };
        renderSummary(dataObj, yearStr, monthStr);
      } else {
        summaryContainer.innerHTML = '<p class="text-danger">Errore durante il caricamento dei dati.</p>';
      }
    } catch (err) {
      console.error(err);
      summaryContainer.innerHTML = '<p class="text-danger">Errore durante il caricamento dei dati.</p>';
    } finally {
      hideProgress();
    }
  }

  function renderSummary(dataObj, yearStr, monthStr) {
    const monthData = dataObj[username];
    if (!monthData || Object.keys(monthData).length === 0) {
      summaryContainer.innerHTML = '<p class="text-muted"><i class="fas fa-info-circle me-2"></i>Nessun dato disponibile per questo periodo.</p>';
      return;
    }

    // Totali tramite AdminService.calculateTotalHours
    const totals = AdminService.calculateTotalHours(monthData);
// Ore decimali con 2 cifre e formattazione italiana
const decHours       = totals.decimalHours;
const formattedHours = decHours.toLocaleString('it-IT', {
  minimumFractionDigits: 2
});


    // Inizializza HTML dei totali
    let html = `
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="card bg-primary text-white h-100 border-0">
            <div class="card-body text-center">
              <h5 class="card-title"><i class="fas fa-clock mb-2 d-block"></i>Ore Lavorate</h5>
              <p class="card-text display-6">${formattedHours}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card bg-danger text-white h-100 border-0">
            <div class="card-body text-center">
              <h5 class="card-title"><i class="fas fa-thermometer mb-2 d-block"></i>Malattia</h5>
              <p class="card-text display-6">${totals.sickDays}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card bg-info text-white h-100 border-0">
            <div class="card-body text-center">
              <h5 class="card-title"><i class="fas fa-umbrella-beach mb-2 d-block"></i>Ferie</h5>
              <p class="card-text display-6">${totals.vacationDays}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card bg-warning text-dark h-100 border-0">
            <div class="card-body text-center">
              <h5 class="card-title"><i class="fas fa-bed mb-2 d-block"></i>Riposo</h5>
              <p class="card-text display-6">${totals.restDays}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-bordered table-dark">
          <thead>
            <tr>
              <th><i class="fas fa-calendar me-1"></i>Data</th>
              <th><i class="fas fa-clock me-1"></i>Ore</th>
              <th><i class="fas fa-info-circle me-1"></i>Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    const daysInMonth = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 0).getDate();
    const today = new Date();
    const todayISO = formatISO(today);

for (let day = 1; day <= daysInMonth; day++) {
  const dayStr   = String(day).padStart(2, '0');
  const dateISO  = `${yearStr}-${monthStr.padStart(2, '0')}-${dayStr}`;

  // Non includere date future
  if (dateISO > todayISO) continue;

  const entry  = monthData[dateISO] || {};
  let ore      = '';
  let status   = '';

  // Stato giornaliero
  if (entry.malattia) {
    status = 'Malattia';
  } else if (entry.ferie) {
    status = 'Ferie';
  } else if (entry.riposo) {
    status = 'Riposo';
  } else if (Array.isArray(entry.attività) && entry.attività.length) {
    // Calcolo minuti frazionari e poi format H:MM
    const flatActivities = entry.attività.map(a => ({
      minutes:    parseInt(a.minuti,       10) || 0,
      multiplier: parseInt(a.moltiplicatore,10) || 1,
      people:     parseInt(a.persone,      10) || 1
    }));
    const rawMinutes = calculateTotalMinutes(flatActivities);
// ore decimali con 2 cifre e formato italiano
const decHours = formatDecimalHours(rawMinutes, 2);
ore = decHours.toLocaleString('it-IT', { minimumFractionDigits: 2 });

  }

  // Formattazione data in italiano
  const displayDate = new Date(dateISO)
    .toLocaleDateString('it-IT', { day: 'numeric', month: 'numeric', year: 'numeric' });

  html += `
    <tr>
      <td>${displayDate}</td>
      <td>${ore}</td>
      <td>${status}</td>
    </tr>
  `;
}


    html += `
          </tbody>
        </table>
      </div>
    `;

    summaryContainer.innerHTML = html;
  }

  // ============================================
  // SEZIONE 3: TABELLA COMPLETA ATTIVITÀ MENSILI (FULL LOG)
  // ============================================
  const fullActivityTableBody = document.getElementById('fullActivityTableBody');
  const activityLogDateFilter = document.getElementById('activityLogDateFilter');

  if (fullActivityTableBody) {
    loadFullActivityLog();
  }

  async function loadFullActivityLog() {
    try {
      const now = new Date();
      const year  = now.getFullYear();
      const month = now.getMonth() + 1;
      const result = await FirestoreService.getEmployeeMonth(username, year, month);
      if (result.success) {
        const data = result.data || {};
        const allActivities = [];

        Object.entries(data).forEach(([dateISO, entry]) => {
          if (Array.isArray(entry.attività)) {
            entry.attività.forEach(a => {
              allActivities.push({
                data: dateISO,
                nome: a.nome   || '',
                minuti: a.minuti || '',
                tipo: a.tipo   || ''
              });
            });
          }
        });

        window.allActivities = allActivities;

        // Imposto filtro di default su oggi
        const today = new Date();
        const todayISO = formatISO(today);
        if (activityLogDateFilter) {
          activityLogDateFilter.value = todayISO;
          renderActivityLogTable(allActivities, todayISO);
          activityLogDateFilter.addEventListener('change', () => {
            const selected = activityLogDateFilter.value;
            renderActivityLogTable(allActivities, selected);
          });
        } else {
          renderActivityLogTable(allActivities, null);
        }
      }
    } catch (err) {
      console.error('[loadFullActivityLog] Errore:', err);
    }
  }

  window.renderActivityLogTable = function(activities, filterDate) {
    fullActivityTableBody.innerHTML = '';
    const filtered = filterDate
      ? activities.filter(a => a.data === filterDate)
      : activities;

    if (filtered.length === 0) {
      fullActivityTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted"><i class="fas fa-info-circle me-2"></i>Nessuna attività trovata.</td></tr>';
      return;
    }

    filtered.forEach(activity => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${activity.data}</td>
        <td>${activity.nome}</td>
        <td>${activity.minuti}</td>
        <td>${activity.tipo}</td>
      `;
      fullActivityTableBody.appendChild(row);
    });
  };

  // ============================================
  // EVENTO PERSONALIZZATO “timeEntrySaved”
  // ============================================
  // Quando viene salvata una voce in time-entry-form.js, emettiamo questo evento:
  // window.dispatchEvent(new Event('timeEntrySaved'));
  window.addEventListener('timeEntrySaved', () => {
    // 1) Ricarico il riepilogo mensile (se la sezione è presente)
    if (monthSelect && summaryContainer) {
      loadMonthlyData();
    }
    // 2) Ricarico la tabella completa (se presente)
    if (fullActivityTableBody) {
      loadFullActivityLog();
    }
  });

  // ============================================
  // UTILITY COMUNI: MESSAGGI E PROGRESS
  // ============================================
  function showProgress(text) {
    let progressContainer = document.getElementById('progressContainer');
    if (!progressContainer) {
      progressContainer = document.createElement('div');
      progressContainer.id        = 'progressContainer';
      progressContainer.className = 'progress-container';
      document.body.appendChild(progressContainer);
    }
    progressContainer.innerHTML = `
      <div class="data-stream">
        <div class="server-icon">
          <div class="server-light active"></div>
        </div>
        <div class="progress-text">${text}</div>
      </div>
    `;
  }

  function hideProgress() {
    const progressContainer = document.getElementById('progressContainer');
    if (progressContainer) {
      progressContainer.remove();
    }
  }

  /**
   * Converte oggetto Date in ISO locale 'YYYY-MM-DD'
   */
  function formatISO(date) {
    const d   = String(date.getDate()).padStart(2, '0');
    const m   = String(date.getMonth() + 1).padStart(2, '0');
    const y   = date.getFullYear();
    return `${y}-${m}-${d}`;
  }
});
