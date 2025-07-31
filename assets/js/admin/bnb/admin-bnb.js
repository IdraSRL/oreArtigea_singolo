// admin-bnb.js
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { db } from "../../common/firebase-config.js";

/** Ritorna la classe corretta in base al testo (case-insensitive, punto/underscore) */
function getKeywordClass(text) {
  const t = text.trim().toLowerCase();
  if (t.includes('dalmazia'))      return 'dalmazia';
  if (t.includes('martiri'))       return 'martiri';
  if (/c[._]grande/.test(t))       return 'c-grande';
  if (/c[._]piccola/.test(t))      return 'c-piccola';
  return '';
}

/**
 * Applica keyword-classes a:
 *  - tutte le <td> dentro rootEl
 *  - l'eventuale .card-header dentro rootEl
 */
function applyKeywordClasses(rootEl) {
  // colorazione celle
  rootEl.querySelectorAll('td').forEach(td => {
    const cls = getKeywordClass(td.textContent);
    if (cls) td.classList.add(cls);
  });
  // colorazione header
  const header = rootEl.querySelector('.card-header');
  if (header) {
    const clsH = getKeywordClass(header.textContent);
    if (clsH) header.classList.add(clsH);
  }
}

/**
 * Carica e renderizza tutti i bigliettini BnB per la data indicata
 * @param {string} date  // 'YYYY-MM-DD'
 * @param {HTMLElement} container
 */
export async function loadBnbEntries(date, container) {
  container.innerHTML = '';
  try {
    const ref = doc(db, 'Bigliettini', date);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      container.innerHTML = '<p class="text-muted">Nessun bigliettino per questa data.</p>';
      return;
    }
    const data = snap.data();

    Object.entries(data).forEach(([key, d]) => {
      const bnbName = key.replace(/_/g, '.');
      const card = document.createElement('div');
      card.className = 'card mb-4';
      card.innerHTML = `
        <div class="card-header">${bnbName}</div>
        <div class="card-body">
          <h6>Servizi</h6>
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Checkout</th><th>Refresh</th><th>Refresh profondo</th>
                <th>Area comune</th><th>Ciabattine</th><th>Ore extra</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${d.checkout || 0}</td><td>${d.refresh || 0}</td>
                <td>${d.refreshProfondo || 0}</td><td>${d.areaComune || 0}</td>
                <td>${d.ciabattine || 0}</td><td>${d.oreExtra || 0}</td>
              </tr>
            </tbody>
          </table>
          <h6>Biancheria</h6>
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Voce</th><th>Sporco</th><th>Pulito</th><th>Magazzino</th>
              </tr>
            </thead>
            <tbody>
              ${['matrimoniale','federa','viso','corpo','bidet','scendiBagno']
                .map(f => `
                  <tr>
                    <td class="text-capitalize">${f}</td>
                    <td>${d.sporco?.[f] ?? 0}</td>
                    <td>${d.pulito?.[f] ?? 0}</td>
                    <td>${d.magazzino?.[f] ?? 0}</td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `;
      container.appendChild(card);

      // applica colorazione a header + td
      applyKeywordClasses(card);
    });
  } catch (error) {
    console.error('❌ loadBnbEntries error:', error);
    container.innerHTML = '<p class="text-danger">Errore caricamento bigliettini.</p>';
  }
}