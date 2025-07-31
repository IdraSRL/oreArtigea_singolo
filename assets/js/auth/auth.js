// auth.js v1.0
// assets/js/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { firebaseConfig } from "../common/firebase-config.js";

// Init Firebase
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

export const AuthService = {
  _employees: null,
  _masterPwd: null,

  async loadEmployees() {
    if (!this._employees) {
      try {
        const snap = await getDoc(doc(db, "Data", "employees"));
        this._employees = snap.exists() ? snap.data().employees || [] : [];
      } catch {
        this._employees = [];
      }
    }
    return this._employees;
  },

  async loadMasterPassword() {
    if (this._masterPwd == null) {
      try {
        const snap = await getDoc(doc(db, "Data", "masterPassword"));
        const data = snap.exists() ? snap.data() : {};
        this._masterPwd = data.password ?? data.masterPassword ?? "";
      } catch {
        this._masterPwd = "";
      }
    }
    return this._masterPwd;
  },

  login(username, password) {
    if (username === "admin") {
      return { success: false, message: "Usa login amministratore" };
    }
    const emp = (this._employees || []).find(e => e.name === username);
    if (!emp) return { success: false, message: "Dipendente non trovato" };

    const ok =
      emp.password === password ||
      password === emp.masterPassword; // fallback
    if (!ok) return { success: false, message: "Password non valida" };

    sessionStorage.setItem("loggedUser", username);
    sessionStorage.removeItem("isAdmin");
    return { success: true, isAdmin: false };
  },

  async loginAdmin(password) {
    const mp = await this.loadMasterPassword();
    if (password === mp) {
      sessionStorage.setItem("loggedUser", "admin");
      sessionStorage.setItem("isAdmin", "true");
      return { success: true };
    }
    return { success: false, message: "Password admin non valida" };
  },

  logout() {
    sessionStorage.removeItem("loggedUser");
    sessionStorage.removeItem("isAdmin");
    window.location.href = "login.html";
  },

  checkAuth() {
    return !!sessionStorage.getItem("loggedUser");
  },

  isAdmin() {
    return sessionStorage.getItem("isAdmin") === "true";
  },

  getCurrentUser() {
    return sessionStorage.getItem("loggedUser");
  },

  // init dipendenti
  async initLogin(formId, selectId, pwdInputId, messageId) {
  if (this.checkAuth()) {
    window.location.href = this.isAdmin() ? "admin.html" : "timeEntry.html";
    return;
  }

  const employees = await this.loadEmployees();
  const sel       = document.getElementById(selectId);

  // 1) Pulisci la select prima di popolarla
  sel.innerHTML = '<option value="">Seleziona un dipendente</option>';

  // 2) Popola la select con i dipendenti
  employees
    .sort((a, b) => a.name.localeCompare(b.name, "it"))
    .forEach(emp => {
      const o = document.createElement("option");
      o.value = emp.name;
      o.textContent = emp.name;
      sel.appendChild(o);
    });

  // 3) Imposta il listener sul form
  const form = document.getElementById(formId);
  const msg  = document.getElementById(messageId);

  form.addEventListener("submit", e => {
    e.preventDefault();
    const user = sel.value;
    const pass = document.getElementById(pwdInputId).value.trim();
    if (!user || !pass) {
      return this._showMsg(msg, "Inserisci username e password");
    }
    const res = this.login(user, pass);
    if (res.success) {
      window.location.href = res.isAdmin ? "admin.html" : "timeEntry.html";
    } else {
      this._showMsg(msg, res.message);
    }
  });
},


  // init admin
  async initAdminLogin(formId, pwdInputId, messageId) {
    if (this.checkAuth() && this.isAdmin()) {
      window.location.href = "admin.html";
      return;
    }
    const form = document.getElementById(formId);
    const msg  = document.getElementById(messageId);
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const pass = document.getElementById(pwdInputId).value.trim();
      if (!pass) return this._showMsg(msg,"Inserisci la password");
      const res = await this.loginAdmin(pass);
      if (res.success) {
        window.location.href = "admin.html";
      } else {
        this._showMsg(msg,res.message);
      }
    });
  },

  _showMsg(container,text) {
    container.textContent = text;
    container.classList.remove("d-none");
    setTimeout(()=>container.classList.add("d-none"),3000);
  }
};

// auto-init se presente il form nel DOM
document.addEventListener("DOMContentLoaded",()=>{
  if (document.getElementById("loginForm")) {
    AuthService.initLogin("loginForm","username","password","loginMessage");
  }
  if (document.getElementById("adminLoginForm")) {
    AuthService.initAdminLogin("adminLoginForm","adminPassword","adminMessage");
  }
});
