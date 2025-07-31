import { db } from "../../common/firebase-config.js";
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

/**
 * Crea la sezione di un appartamento
 */
function creaSezioneAppartamento(appartamento, tipo) {
  const section = document.createElement('section');
  section.className = `apartment-section ${tipo} mb-4`;
  section.innerHTML = `
    <div class="card bg-secondary border-secondary">
      <div 
        class="card-header clickable-container d-flex justify-content-between align-items-center"
        onclick="this.nextElementSibling.querySelector('details').open = !this.nextElementSibling.querySelector('details').open"
      >
        <h5 class="mb-0 text-light">${appartamento.nome}</h5>
        <span class="text-light small">Apri/Chiudi</span>
      </div>
      <div class="card-body p-0">
        <details>
          <summary style="display: none;"></summary>
          <div class="apartment-content p-3">
            <div class="row g-3 mb-3">
              <div class="col-12">
                <strong class="text-light">📍 Indirizzo:</strong>
                <span class="text-secondary ms-2">${appartamento.indirizzo}</span>
              </div>
              <div class="col-12">
                <strong class="text-light">👥 Ospiti:</strong>
                <span class="text-secondary ms-2">${appartamento.ospiti}</span>
              </div>
              <div class="col-12">
                <strong class="text-light">⏰ Ore:</strong>
                <span class="text-secondary ms-2">${appartamento.ore}</span>
              </div>
            </div>
            <div class="mb-3">
              <strong class="text-light d-block mb-2">🏠 Composizione:</strong>
              <ul class="list-unstyled ps-3">
                ${Array.isArray(appartamento.composizione)
                  ? appartamento.composizione.map(item => `<li class="text-secondary mb-1">• ${item}</li>`).join('')
                  : `<li class="text-secondary mb-1">• ${appartamento.composizione}</li>`
                }
              </ul>
            </div>
            ${appartamento.note && appartamento.note.length > 0 ? `
            <div class="mb-3">
              <strong class="text-light d-block mb-2">📝 Note:</strong>
              <div class="ps-3">
                ${appartamento.note.map(nota => `<p class="text-secondary mb-2">${nota}</p>`).join('')}
              </div>
            </div>
            ` : ''}
            <div class="text-center">
              <a href="${appartamento.mappa}" class="btn btn-sm btn-light" target="_blank" rel="noopener">
                🛣️ Vai a Google Maps
              </a>
            </div>
          </div>
        </details>
      </div>
    </div>
  `;
  return section;
}

/**
 * Recupera un array dal documento Data/{varName}
 */
async function fetchDataArray(varName) {
  try {
    const ref = doc(db, 'Data', varName);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return Array.isArray(data[varName]) ? data[varName] : [];
    }
  } catch (err) {
    console.error(`Errore fetch ${varName}:`, err);
  }
  return [];
}

/**
 * Inserisce le sezioni per ogni appartamento
 */
async function insertApp() {
  const [ireneData, cerranoData, lorenzaData, molinoData] = await Promise.all([
    fetchDataArray('irene'),
    fetchDataArray('cerrano'),
    fetchDataArray('lorenza'),
    fetchDataArray('molino')
  ]);

  const containerIrene   = document.getElementById('irene');
  const containerCerrano = document.getElementById('cerrano');
  const containerLorenza = document.getElementById('lorenza');
  const containerMolino  = document.getElementById('molino');

  ireneData.forEach(app     => containerIrene.appendChild(creaSezioneAppartamento(app, 'irene')));
  cerranoData.forEach(app    => containerCerrano.appendChild(creaSezioneAppartamento(app, 'cerrano')));
  lorenzaData.forEach(app    => containerLorenza.appendChild(creaSezioneAppartamento(app, 'lorenza')));
  molinoData.forEach(app     => containerMolino.appendChild(creaSezioneAppartamento(app, 'molino')));
}


document.addEventListener('DOMContentLoaded', insertApp);
