// firestore-service.js v1.0
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  startAt,
  endAt
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const FirestoreService = {
  /**
   * Restituisce l'elenco di dipendenti dal documento 'employees' in collezione 'Data'
   */
  async getEmployees() {
    const ref = doc(db, 'Data', 'employees');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return Array.isArray(data.employees) ? data.employees : [];
    }
    return [];
  },

  /**
   * Salva i dati giornalieri per un dipendente
   */
  async saveEmployeeDay(username, date, data) {
    try {
      const employeeId = username.replaceAll(' ', '_');
      const dayDocRef = doc(db, 'dipendenti', employeeId, 'ore', date);
      await setDoc(dayDocRef, data, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('🔥 Errore in saveEmployeeDay:', error);
      return { success: false, error };
    }
  },

  /**
   * Recupera i dati di un singolo giorno per un dipendente
   */
  async getEmployeeDay(username, date) {
    try {
      const employeeId = username.replaceAll(' ', '_');
      if (!employeeId || !date) {
        throw new Error('Parametri mancanti');
      }
      const ref = doc(db, 'dipendenti', employeeId, 'ore', date);
      const snap = await getDoc(ref);
      return { success: true, data: snap.exists() ? snap.data() : {} };
    } catch (error) {
      console.error('🔥 Errore in getEmployeeDay:', error);
      return { success: false, error };
    }
  },

  /**
   * Recupera tutti i dati del mese per un singolo dipendente
   */
  async getEmployeeMonth(username, year, month) {
    try {
      const employeeId = username.replaceAll(' ', '_');
      const oreRef = collection(db, 'dipendenti', employeeId, 'ore');
      const start = `${year}-${String(month).padStart(2,'0')}-01`;
      const end   = `${year}-${String(month).padStart(2,'0')}-31`;
      const q = query(
        oreRef,
        orderBy('data'),
        startAt(start),
        endAt(end)
      );
      const snap = await getDocs(q);
      const data = {};
      snap.forEach(d => { data[d.id] = d.data(); });
      return { success: true, data };
    } catch (error) {
      console.error('🔥 Errore in getEmployeeMonth:', error);
      return { success: false, error };
    }
  },

  /**
   * Recupera i dati di tutti i dipendenti per un mese
   */
  async getAllEmployeesMonth(year, month) {
    try {
      const allData   = {};
      const employees = await this.getEmployees();
for (const emp of employees) {
  const name   = emp.name;
  const result = await this.getEmployeeMonth(name, year, month);
  if (result.success) {
    // anche se result.data è {} lo includiamo lo stesso
    allData[name] = result.data || {};
  }
}

      return { success: true, data: allData };
    } catch (error) {
      console.error('🔥 Errore in getAllEmployeesMonth:', error);
      return { success: false, error };
    }
  },

  /**
   * Recupera tutte le attività (cronologiche) di un dipendente
   */
  async getAllEmployeeActivities(username) {
    try {
      const employeeId = username.replaceAll(' ', '_');
      const colRef     = collection(db, 'dipendenti', employeeId, 'ore');
      const q          = query(colRef, orderBy('__name__', 'desc'));
      const snap       = await getDocs(q);
      const results = [];
      snap.forEach(docSnap => {
        results.push({ date: docSnap.id, ...docSnap.data() });
      });
      return results;
    } catch (error) {
      console.error('🔥 Errore in getAllEmployeeActivities:', error);
      return [];
    }
  }
};

/**
 * Named export per leggere l’intera collezione come array di documenti
 */
export async function getCollection(collName) {
  const colRef = collection(db, collName);
  const snap   = await getDocs(colRef);
  const results = [];
  snap.forEach(docSnap => {
    results.push({ id: docSnap.id, ...docSnap.data() });
  });
  return results;
}

/**
 * Named export per creare/aggiornare un documento in merge
 */
export async function updateDoc(collName, docId, data) {
  const docRef = doc(db, collName, docId);
  await setDoc(docRef, data, { merge: true });
  return { success: true };
}
