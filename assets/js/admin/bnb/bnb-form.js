// bnb-form.js
import { db } from "../../common/firebase-config.js";
import {
    doc,
    getDoc,
    setDoc
} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { AuthService } from "../../auth/auth.js";

let tabCount = 0;

/**
 * Inizializza le tab multiple di Bigliettini BnB.
 * Prende dinamicamente liste dipendenti e nomi BnB da Firestore.
 * @param {Object} params
 * @param {HTMLElement} params.navContainer
 * @param {HTMLElement} params.contentContainer
 * @param {HTMLElement} params.addTabBtn
 */

export async function initBnbTabs({ navContainer, contentContainer, addTabBtn }) {
  const user = AuthService.getCurrentUser() || '';

  if (!user) {
    addTabBtn.disabled = true;
    return;
  }

  // Carica dinamicamente employees e bnbNomi da Firestore
  let employeesList = [];
  let bnbNames = [];
  try {
    const empSnap = await getDoc(doc(db, 'Data', 'employees'));
    if (empSnap.exists()) {
      employeesList = empSnap.data().employees || [];
    }
    const bnbSnap = await getDoc(doc(db, 'Data', 'bnbNomi'));
    if (bnbSnap.exists()) {
      bnbNames = bnbSnap.data().bnbNomi || [];
    }
  } catch (err) {
    console.error('Errore caricamento liste BnB:', err);
  }

  // Crea la prima tab e abilita aggiunta
  createNewTab(navContainer, contentContainer, user, employeesList, bnbNames);
  addTabBtn.disabled = false;
  addTabBtn.addEventListener('click', () =>
    createNewTab(navContainer, contentContainer, user, employeesList, bnbNames)
  );

  // Logica filtro tabella globale (se presente)
  const filterBtn = document.getElementById('bnbFilterBtn');
  const dateInput = document.getElementById('bnbFilterDate');
  const tableBody = document.querySelector('#bnbTable tbody');

  if (filterBtn && dateInput && tableBody) {
    filterBtn.addEventListener('click', async e => {
      e.preventDefault();
      tableBody.innerHTML = '';
      const date = dateInput.value;
      if (!date) {
        alert('Seleziona una data prima di filtrare');
        return;
      }
      const rowsData = await handleBnbFilter(date);
      if (!rowsData.length) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 4;
        td.className = 'text-center text-muted';
        td.textContent = `Nessun bigliettino per ${date}.`;
        tr.appendChild(td);
        tableBody.appendChild(tr);
        return;
      }
      rowsData.forEach(entry => {
        const trMain = document.createElement('tr');
        ['date','dip1','dip2','bnb'].forEach(key => {
          const td = document.createElement('td');
          td.contentEditable = 'true';
          td.className = `${key}-cell`;
          td.textContent = entry[key] || '-';
          trMain.appendChild(td);
        });
        tableBody.appendChild(trMain);

        // tasks
        entry.tasks.forEach(task => {
          const trTask = document.createElement('tr');
          trTask.classList.add(task.class);
          trTask.appendChild(document.createElement('td'));
          const tdLabel = document.createElement('td');
          tdLabel.contentEditable = 'true';
          tdLabel.textContent = task.label;
          trTask.appendChild(tdLabel);
          const tdValue = document.createElement('td');
          tdValue.contentEditable = 'true';
          tdValue.textContent = task.value;
          trTask.appendChild(tdValue);
          trTask.appendChild(document.createElement('td'));
          tableBody.appendChild(trTask);
        });

        // biancheria
        const trHdr = document.createElement('tr');
        trHdr.classList.add('section-header');
        const hdrTd = document.createElement('td');
        hdrTd.rowSpan = entry.biancheria.length + 1;
        hdrTd.textContent = 'Biancheria';
        trHdr.appendChild(hdrTd);
        ['Sporco','Pulito','Magazzino'].forEach(col => {
          const td = document.createElement('td');
          td.textContent = col;
          trHdr.appendChild(td);
        });
        tableBody.appendChild(trHdr);
        entry.biancheria.forEach(item => {
          const trItem = document.createElement('tr');
          ['sporco','pulito','magazzino'].forEach(prop => {
            const td = document.createElement('td');
            td.contentEditable = 'true';
            td.textContent = item[prop] || 0;
            trItem.appendChild(td);
          });
          tableBody.appendChild(trItem);
        });
      });
    });
  }
}

function createNewTab(navContainer, contentContainer, name, employeesList, bnbNames) {
  const idx      = tabCount++;
  const tabId    = `bnbTab-${idx}`;
  const tabNavId = `bnbTabNav-${idx}`;

  // 1) Bottone di navigazione
  const li = document.createElement('li');
  li.className = 'nav-item';
  li.role      = 'presentation';
  li.innerHTML = `
    <button
      class="nav-link ${idx===0?'active':''}"
      id="${tabNavId}"
      data-bs-toggle="tab"
      data-bs-target="#${tabId}"
      type="button"
      role="tab"
      aria-controls="${tabId}"
      aria-selected="${idx===0}"
    >
      Bigliettino ${idx+1}
    </button>
  `;
  navContainer.appendChild(li);

  // 2) Clona template e assegna ID a tab-pane
  const tpl  = document.getElementById('bnb-form-template');
  const pane = tpl.content.firstElementChild.cloneNode(true);
  pane.id = tabId;
  pane.setAttribute('aria-labelledby', tabNavId);
  if (idx===0) pane.classList.add('show','active');
  contentContainer.appendChild(pane);

  // 2.b) Imposta l’ID sul div dei messaggi
  const msgEl = pane.querySelector('.bnb-message');
  msgEl.id = `bnbMessage-${idx}`;

  // 3) Previeni submit nativo del form e rendi Salva un button
  const formEl = pane.querySelector('.bnb-form');
  formEl.addEventListener('submit', e => e.preventDefault());
  const btnSave = pane.querySelector('.btn-save');
  btnSave.type = 'button';
  btnSave.addEventListener('click', () => handleBnbSubmit(idx));

  // Pulsante Chiudi
  const btnClose = pane.querySelector('.btn-close');
  btnClose.type = 'button';
  btnClose.addEventListener('click', () => closeTab(idx));

  // 4) Data e BnB
  const dateInput = pane.querySelector('.bnbDate');
  dateInput.id = `bnbDate-${idx}`;
  const bnbList = bnbNames.map(x => typeof x==='string'? x : x.name);
  const bnbSelect = pane.querySelector('.bnbSelect');
  bnbSelect.id = `bnbSelect-${idx}`;
  populateSelectOptions(bnbSelect.id, bnbList);

  // 5) Dipendenti
  const dip1 = pane.querySelector('.dip1Input');
  dip1.id    = `dip1Input-${idx}`;
  dip1.value = name;
  const dip2 = pane.querySelector('.dip2Input');
  dip2.id = `dip2Input-${idx}`;
  const empNames = employeesList.map(x => typeof x==='string'? x : x.name);
  populateSelectOptions(dip2.id, empNames, true);

  // 6) Task generali
  const taskRanges = {
    checkoutSelect:       [0,4],
    refreshSelect:        [0,4],
    refreshProfondoSelect:[0,4],
    areaComuneSelect:     [0,1],
    ciabattineSelect:     [0,8],
    oreExtraSelect:       [0,2]
  };
  Object.entries(taskRanges).forEach(([cls,[min,max]])=>{
    const sel = pane.querySelector(`.${cls}`);
    sel.id = `${cls}-${idx}`;
    generateSelectRange(sel.id, min, max);
  });

  // 7) Checkout → Sporco/Pulito
const chk = pane.querySelector(`#checkoutSelect-${idx}`);
chk.addEventListener('change', (e) => {
  const n = parseInt(e.target.value, 10) || 0;

  // Definisco qui il moltiplicatore per ciascun tipo
  const multipliers = {
    matrimoniale: 3,
    federa:        4,
    viso:          2,
    corpo:         2,
    bidet:         2,
    scendiBagno:   1,
  };

  Object.entries(multipliers).forEach(([field, factor]) => {
    const count = factor * n;
    const sporcoEl    = document.getElementById(`${field}Sporco-${idx}`);
    const pulitoEl    = document.getElementById(`${field}Pulito-${idx}`);
    const magazzinoEl = document.getElementById(`${field}Magazzino-${idx}`);

    if (sporcoEl)    sporcoEl.value    = count;
    if (pulitoEl)    pulitoEl.value    = count;
    if (magazzinoEl) magazzinoEl.value = 0;
  });
});


  // 8) Biancheria
  ['matrimoniale','federa','viso','corpo','bidet','scendiBagno'].forEach(f=>{
    ['Sporco','Pulito','Magazzino'].forEach(type=>{
      const sel = pane.querySelector(`.${f+type}`);
      sel.id = `${f+type}-${idx}`;
      generateSelectRange(sel.id, 0, 16);
    });
  });

  // 9) Attiva subito la tab creata
  if (idx>0) {
    const triggerEl = document.getElementById(tabNavId);
    new bootstrap.Tab(triggerEl).show();
  }
}

/**
 * “Salva Bigliettino”: prende sempre “dip1” da AuthService.getCurrentUser()
 */
async function handleBnbSubmit(idx) {
    const messageEl = document.getElementById(`bnbMessage-${idx}`);
    messageEl.classList.add('d-none');

    const date = document.getElementById(`bnbDate-${idx}`).value;
    const bnb = document.getElementById(`bnbSelect-${idx}`).value;
    const dip2 = document.getElementById(`dip2Input-${idx}`).value;

    // PRIMA: prendi sempre dip1 da AuthService
    const dip1 = AuthService.getCurrentUser() || '';
    document.getElementById(`dip1Input-${idx}`).value = dip1;

    console.log(
        'DEBUG handleBnbSubmit idx=',
        idx,
        'date=',
        date,
        'bnb=',
        bnb,
        'dip1=',
        dip1
    );

    if (!date || !bnb || !dip1) {
        messageEl.textContent =
            'Compila i campi obbligatori (data, BnB, Dipendente 1).';
        messageEl.className = 'alert alert-danger mt-3';
        messageEl.classList.remove('d-none');
        return;
    }

    const entryData = {
        dip1,
        dip2: dip2 || '',
        checkout:
            parseInt(
                document.getElementById(`checkoutSelect-${idx}`).value,
                10
            ) || 0,
        refresh:
            parseInt(
                document.getElementById(`refreshSelect-${idx}`).value,
                10
            ) || 0,
        refreshProfondo:
            parseInt(
                document.getElementById(`refreshProfondoSelect-${idx}`).value,
                10
            ) || 0,
        areaComune:
            parseInt(
                document.getElementById(`areaComuneSelect-${idx}`).value,
                10
            ) || 0,
        ciabattine:
            parseInt(
                document.getElementById(`ciabattineSelect-${idx}`).value,
                10
            ) || 0,
        oreExtra:
            parseInt(
                document.getElementById(`oreExtraSelect-${idx}`).value,
                10
            ) || 0,
        sporco: getSezione('Sporco', idx),
        pulito: getSezione('Pulito', idx),
        magazzino: getSezione('Magazzino', idx),
        timestamp: new Date().toISOString(),
    };

    const safeKey = bnb.replace(/\./g, '_');
    const refDoc = doc(db, 'Bigliettini', date);

    try {
        const docSnap = await getDoc(refDoc);
        const docData = docSnap.exists() ? docSnap.data() : {};
        docData[safeKey] = entryData;
        await setDoc(refDoc, docData);

        messageEl.textContent = 'Bigliettino salvato con successo!';
        messageEl.className = 'alert alert-success mt-3';
        messageEl.classList.remove('d-none');
    } catch (error) {
        console.error('Errore durante il salvataggio del Bigliettino:', error);
        messageEl.textContent =
            'Si è verificato un errore durante il salvataggio.';
        messageEl.className = 'alert alert-danger mt-3';
        messageEl.classList.remove('d-none');
    }
}

/**
 * Filtra gli invii per data e popola la tabella.
 */
export async function handleBnbFilter(filterDate) {
  if (!filterDate) return [];

  const refDoc = doc(db, 'Bigliettini', filterDate);
  const docSnap = await getDoc(refDoc);
  if (!docSnap.exists()) return [];

  const data = docSnap.data();
  return Object.entries(data).map(([safeKey, details]) => {
    const bnbName = safeKey.replace(/_/g, '.');

    // Tutti i campi di task
    const tasks = [
      { label: 'Check-Out:',          value: details.checkout        || 0, class: 'row-checkout'          },
      { label: 'Refresh:',            value: details.refresh         || 0, class: 'row-refresh'           },
      { label: 'Refresh Profondo:',   value: details.refreshProfondo || 0, class: 'row-refresh-profondo'  },
      { label: 'Area Comune:',        value: details.areaComune      || 0, class: 'row-area-comune'       },
      { label: 'Ciabattine:',         value: details.ciabattine      || 0, class: 'row-ciabattine'        },
      { label: 'Ore Extra:',          value: details.oreExtra        || 0, class: 'row-ore-extra'         },
    ];

    // Biancheria
    const fields = ['matrimoniale','federa','viso','corpo','bidet','scendiBagno'];
    const biancheria = fields.map(f => ({
      sporco:    details.sporco?.[f]    ?? 0,
      pulito:    details.pulito?.[f]    ?? 0,
      magazzino: details.magazzino?.[f] ?? 0,
    }));

    return {
      date:      filterDate,
      dip1:      details.dip1,
      dip2:      details.dip2,
      bnb:       bnbName,
      tasks,
      biancheria,
    };
  });
}
/**
 * Chiude la tab idx (rimuove nav e tab-pane).
 */
function closeTab(idx) {
    const tabNav = document.getElementById(`bnbTabNav-${idx}`);
    const tabPane = document.getElementById(`bnbTab-${idx}`);
    if (tabNav) {
        const li = tabNav.closest('li');
        if (li) li.remove();
    }
    if (tabPane) {
        tabPane.remove();
    }
    const anyNav = document.querySelector('#bnbTabsNav .nav-link');
    if (anyNav) new bootstrap.Tab(anyNav).show();
}

/**
 * Popola una <select> (ID fornito) con un array di stringhe.
 * Se allowEmpty = true, inserisce in testa “— Seleziona —”.
 */
function populateSelectOptions(selectId, arr, allowEmpty = false) {
    const sel = document.getElementById(selectId);
    sel.innerHTML = '';
    if (allowEmpty) {
        const empty = document.createElement('option');
        empty.value = '';
        empty.textContent = '— Seleziona —';
        sel.appendChild(empty);
    }
    arr.forEach((val) => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        sel.appendChild(opt);
    });
}

/**
 * Genera opzioni da “min” a “max” dentro <select id=selectId>.
 */
function generateSelectRange(selectId, min, max) {
    const sel = document.getElementById(selectId);
    sel.innerHTML = '';
    for (let i = min; i <= max; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i;
        sel.appendChild(opt);
    }
}

/**
 * Ritorna un oggetto contenente i 6 campi per la sezione tipo (es. “Sporco”) della tab idx.
 */
function getSezione(tipo, idx) {
    const fields = ['matrimoniale', 'federa', 'viso', 'corpo', 'bidet', 'scendiBagno'];
    const result = {};
    fields.forEach((f) => {
        const sel = document.getElementById(`${f}${tipo}-${idx}`);
        result[f] = parseInt(sel.value, 10) || 0;
    });
    return result;
}
