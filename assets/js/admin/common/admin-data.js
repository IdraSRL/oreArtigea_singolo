import {
  getCollection,
  updateDoc
} from "../../common/firestore-service.js";

const tabList    = document.getElementById('groupTabs');
const tabContent = document.getElementById('groupTabContent');
const addBtn     = document.getElementById('add-group');

let docs = [], currentGroup = null;
const complexGroups = ['irene', 'cerrano', 'lorenza', 'molino'];
const fieldOrder    = ['nome', 'indirizzo', 'composizione', 'ospiti', 'ore', 'note', 'mappa'];

async function init() {
  docs = await getCollection('Data');
  renderTabs(docs);
  if (docs.length) selectTab(docs[0].id);
}

function renderTabs(list) {
  tabList.innerHTML = '';
  tabContent.innerHTML = '';
  list.forEach((doc, i) => {
    const id = doc.id;
    const btn = document.createElement('button');
    btn.className = `nav-link${i === 0 ? ' active' : ''}`;
    btn.dataset.bsToggle = 'tab';
    btn.dataset.bsTarget = `#pane-${id}`;
    btn.type = 'button';
    btn.role = 'tab';
    btn.textContent = id;
    btn.onclick = () => selectTab(id);
    tabList.appendChild(btn);

    const pane = document.createElement('div');
    pane.className = `tab-pane fade${i === 0 ? ' show active' : ''}`;
    pane.id = `pane-${id}`;
    pane.role = 'tabpanel';
    tabContent.appendChild(pane);
  });
}

function selectTab(id) {
  currentGroup = id;
  Array.from(tabList.children).forEach(btn => {
    btn.classList.toggle('active', btn.textContent === id);
  });
  const doc = docs.find(d => d.id === id);
  const pane = document.getElementById(`pane-${id}`);
  pane.innerHTML = '';
  const data = doc[id] || [];

  if (!Array.isArray(data)) {
    pane.innerHTML = `
      <div class="input-group mb-3">
        <input id="field-${id}" class="form-control" value="${data}" style="width:100% !important;">
        <button id="save-prim" class="btn btn-success">💾 Salva</button>
      </div>`;
    pane.querySelector('#save-prim').onclick = async () => {
      const val = pane.querySelector(`#field-${id}`).value;
      await updateDoc('Data', id, { [id]: val });
      alert('✅ Salvato');
    };
    return;
  }

  if (complexGroups.includes(id)) {
    data.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'card mb-3';
      card.innerHTML = `
        <div class="card-header d-flex justify-content-between">
          <strong>Elemento ${idx + 1}</strong>
          <div>
            <button class="btn btn-sm btn-success save-item" data-idx="${idx}">💾</button>
            <button class="btn btn-sm btn-danger del-item" data-idx="${idx}">✖️</button>
          </div>
        </div>
        <div class="card-body row gx-2 gy-3"></div>
      `;
      const body = card.querySelector('.card-body');
      const keys = Object.keys(item);
      const ordered = fieldOrder.filter(k => keys.includes(k)).concat(keys.filter(k => !fieldOrder.includes(k)));
      ordered.forEach(key => {
        const form = document.createElement('div');
        form.className = 'col-12';
        const value = Array.isArray(item[key]) ? item[key].join('\n') : (item[key] != null ? item[key] : '');
        form.innerHTML = `
          <label class="form-label text-capitalize">${key}</label>
          <textarea class="form-control" data-field="${key}" data-idx="${idx}" rows="2" style="width:100% !important;">${value}</textarea>
        `;
        body.appendChild(form);
      });
      pane.appendChild(card);
    });

    const add = document.createElement('button');
    add.className = 'btn btn-sm btn-primary';
    add.textContent = '+ Aggiungi elemento';
    add.onclick = async () => {
      data.push({});
      await updateDoc('Data', id, { [id]: data });
      selectTab(id);
    };
    pane.appendChild(add);

    pane.querySelectorAll('.save-item').forEach(btn => {
      btn.onclick = async () => {
        const idx = +btn.dataset.idx;
        const card = pane.querySelector(`.save-item[data-idx="${idx}"]`).closest('.card');
        card.querySelectorAll('[data-field]').forEach(el => {
          const field = el.dataset.field;
          const raw = el.value.trim();
          if (field === 'composizione' || field === 'note') {
            data[idx][field] = raw.split(/\r?\n/).map(s => s.trim()).filter(s => s);
          } else if (field === 'ospiti') {
            data[idx][field] = parseInt(raw, 10) || 0;
          } else if (field === 'ore') {
            data[idx][field] = parseFloat(raw) || 0;
          } else {
            data[idx][field] = raw;
          }
        });
        await updateDoc('Data', id, { [id]: data });
        alert('✅ Elemento salvato');
      };
    });

    pane.querySelectorAll('.del-item').forEach(btn => {
      btn.onclick = async () => {
        const idx = +btn.dataset.idx;
        if (!confirm('Eliminare questo elemento?')) return;
        data.splice(idx, 1);
        await updateDoc('Data', id, { [id]: data });
        selectTab(id);
      };
    });

  } else {
    const keys = Array.from(new Set(data.flatMap(o => Object.keys(o))));
    const table = document.createElement('table');
    table.className = 'table table-sm';
    table.innerHTML = `
      <thead>
        <tr>
          ${keys.map(k => `<th>${k}</th>`).join('')}
          <th>Azioni</th>
        </tr>
      </thead>`;
    const tbody = document.createElement('tbody');
    data.forEach((item, idx) => {
      const tr = document.createElement('tr');
      keys.forEach(k => {
        tr.innerHTML += `
          <td>
            <input class="form-control form-control-sm" data-field="${k}" data-idx="${idx}" value="${item[k] != null ? item[k] : ''}" style="width:100% !important;">
          </td>`;
      });
      tr.innerHTML += `
        <td>
          <button class="btn btn-sm btn-success save-row" data-idx="${idx}">💾</button>
          <button class="btn btn-sm btn-danger del-row" data-idx="${idx}">✖️</button>
        </td>`;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    pane.appendChild(table);

    const addRow = document.createElement('button');
    addRow.className = 'btn btn-sm btn-primary mt-2';
    addRow.textContent = '+ Aggiungi riga';
    addRow.onclick = async () => {
      data.push({});
      await updateDoc('Data', id, { [id]: data });
      selectTab(id);
    };
    pane.appendChild(addRow);

    pane.querySelectorAll('.save-row').forEach(btn => {
      btn.onclick = async () => {
        const idx = +btn.dataset.idx;
        const updated = {};
        keys.forEach(k => {
          const el = pane.querySelector(`[data-field="${k}"][data-idx="${idx}"]`);
          updated[k] = el.value;
        });
        data[idx] = updated;
        await updateDoc('Data', currentGroup, { [currentGroup]: data });
        alert('✅ Riga salvata');
      };
    });

    pane.querySelectorAll('.del-row').forEach(btn => {
      btn.onclick = async () => {
        const idx = +btn.dataset.idx;
        if (!confirm('Eliminare questa riga?')) return;
        data.splice(idx, 1);
        await updateDoc('Data', currentGroup, { [currentGroup]: data });
        selectTab(currentGroup);
      };
    });
  }
}

addBtn.onclick = async () => {
  const name = prompt('ID nuovo gruppo:');
  if (!name) return;
  await updateDoc('Data', name, { [name]: [] });
  init();
};

init();
