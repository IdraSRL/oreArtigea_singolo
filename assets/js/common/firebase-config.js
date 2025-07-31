// firebase-config.js v1.0
// 1) Import delle librerie Firebase v9.22.1
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// 2) Configurazione del progetto
export const firebaseConfig = {
  apiKey: "AIzaSyCcq4vF4yGXOx3XVd30Mhqh4bfF2z8O7XU",
  authDomain: "oredipendenti-81442.firebaseapp.com",
  projectId: "oredipendenti-81442",
  storageBucket: "oredipendenti-81442.firebasestorage.app",
  messagingSenderId: "605987945448",
  appId: "1:605987945448:web:17d89a5f410c07b464025d"
};

// 3) Inizializza Firebase
const app = initializeApp(firebaseConfig);

// 4) Esporta auth e db (NOMINATIVI)
export const auth = getAuth(app);
export const db   = getFirestore(app);
