/**
 * Sistema di Versioning Centralizzato
 * Definisce la versione dell'applicazione per il cache-busting
 */

// Versione principale dell'applicazione
export const APP_VERSION = '2.17.0';

// Informazioni aggiuntive (opzionali)
export const BUILD_DATE = '2025-01-27-excel-fix';
export const BUILD_INFO = {
  version: APP_VERSION,
  buildDate: BUILD_DATE,
  description: 'Sistema Gestione Ore e Bigliettini BnB'
};

// Funzione per ottenere la versione corrente
export function getCurrentVersion() {
  return APP_VERSION;
}

// Funzione per verificare se è necessario un aggiornamento
export function checkVersionUpdate() {
  const storedVersion = localStorage.getItem('app_version');
  const currentVersion = APP_VERSION;
  
  if (storedVersion && storedVersion !== currentVersion) {
    console.log(`Versione aggiornata da ${storedVersion} a ${currentVersion}`);
    localStorage.setItem('app_version', currentVersion);
    return true; // Richiede reload
  }
  
  if (!storedVersion) {
    localStorage.setItem('app_version', currentVersion);
  }
  
  return false;
}

// Funzione per mostrare la versione nell'interfaccia
export function displayVersion() {
  const versionElements = document.querySelectorAll('.version-display');
  versionElements.forEach(el => {
    el.textContent = `v${APP_VERSION}`;
  });
}

// Auto-inizializzazione quando il DOM è pronto
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', displayVersion);
}