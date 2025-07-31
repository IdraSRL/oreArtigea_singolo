/**
 * Cache-Busting Loader System
 * Sistema di caricamento dinamico con cache-busting automatico
 *
 * Questo script:
 * 1. Carica la versione corrente da version.js
 * 2. Aggiunge il parametro ?v=VERSION a tutti i file CSS, JS e risorse interne
 * 3. Gestisce il reload automatico quando la versione cambia
 */

(async function() {
  'use strict';

  // === COSTANTE VERSIONE ===
  let APP_VERSION = null;
  let isVersionLoaded = false;

  /**
   * STEP 1: Carica la versione da version.js (modulo ES)
   * Nota: loader.js deve essere incluso con <script type="module">
   */
  async function loadVersion() {
    try {
      const versionModule = await import('./version.js?cache' + Date.now());
      APP_VERSION = versionModule.APP_VERSION;
    } catch (e) {
      console.warn('Impossibile importare version.js, uso timestamp:', e);
      APP_VERSION = Date.now().toString();
    }
    isVersionLoaded = true;
    console.log('🔄 Versione caricata:', APP_VERSION);
    return APP_VERSION;
  }

  /**
   * STEP 2: Controlla se la versione è cambiata
   * e forza il reload senza cache
   */
  function checkForVersionUpdate(version) {
    const stored = localStorage.getItem('app_version');
    if (stored && stored !== version) {
      console.log(`🔄 Aggiornamento: ${stored} → ${version}`);
      localStorage.setItem('app_version', version);
      // reload bypassando la cache
      window.location.reload();
      return true;
    }
    if (!stored) {
      localStorage.setItem('app_version', version);
    }
    return false;
  }

  /**
   * Aggiunge ?v=VERSION solo alle risorse interne dello stesso dominio
   */
  function addVersionParam(url) {
    try {
      const u = new URL(url, location.href);
      // Non versionare risorse CDN esterne
      if (u.origin !== location.origin) return url;
      // Non versionare se l'URL è già assoluto e punta al nostro dominio
      if (url.startsWith('http') && u.origin === location.origin) {
        return url; // Mantieni l'URL originale se già assoluto
      }
      return u.pathname + `?v=${APP_VERSION}`;
    } catch {
      return url;
    }
  }

  /**
   * STEP 3: Cache-busting per <link rel="stylesheet">
   */
  function bustCSS() {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute('href').split('?')[0];
      link.href = addVersionParam(href);
      console.log(`📄 CSS: ${href} → ${link.href}`);
    });
  }

  /**
   * STEP 4: Cache-busting per <script src>
   */
  function bustJS() {
    document.querySelectorAll('script[src]').forEach(script => {
      const src = script.getAttribute('src');
      if (src.includes('loader.js')) return;
      const clean = src.split('?')[0];
      const newScript = document.createElement('script');
      newScript.src = addVersionParam(clean);
      if (script.async) newScript.async = true;
      if (script.defer) newScript.defer = true;
      if (script.type) newScript.type = script.type;
      script.replaceWith(newScript);
      console.log(`📜 JS: ${clean} → ${newScript.src}`);
    });
  }

  /**
   * STEP 5: Cache-busting altre risorse (iframe, img)
   */
  function bustOther() {
    document.querySelectorAll('iframe[src], img[src]').forEach(el => {
      const src = el.getAttribute('src').split('?')[0];
      // Solo se è una risorsa relativa
      if (!src.startsWith('http') && src.trim()) {
        el.src = addVersionParam(src);
        console.log(`🖼️ Risorsa: ${src} → ${el.src}`);
      }
    });
  }

  /**
   * STEP 6: Aggiorna visualizzazione versione in UI
   */
  function updateUI() {
    document.querySelectorAll('.version-display').forEach(el => {
      el.textContent = `v${APP_VERSION}`;
    });
  }

  /**
   * STEP 7: Inizializzazione
   */
  async function init() {
    console.log('🚀 Init cache-busting...');
    await loadVersion();
    if (checkForVersionUpdate(APP_VERSION)) return;
    bustCSS();
    bustJS();
    bustOther();
    updateUI();
    console.log('✅ Cache-busting completato');
  }

  // Avvio
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // API di debug
  window.cacheBustingSystem = {
    getVersion: () => APP_VERSION,
    isLoaded: () => isVersionLoaded,
    clearCache: () => localStorage.removeItem('app_version'),
    reload: () => window.location.reload()
  };
})();