/* Extendio Cookie-Consent — eigenständiges Modul (Banner + Einstellungen + Consent-Loader).
   Einwilligung gilt max. 12 Monate (danach wird erneut gefragt).
   Nicht-notwendige Skripte werden ERST nach Einwilligung geladen: künftige Tools
   (Google Analytics, Meta Pixel …) unten in CONSENT_SCRIPTS eintragen — sonst nichts nötig. */
(function () {
  'use strict';

  var KEY = 'extendio-consent';
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; /* 12 Monate */

  var GA_MEASUREMENT_ID = 'G-Z3CH776PWX'; /* Google Analytics 4 — extendio.es */

  /* Künftige weitere Analytics-/Marketing-Skripte hier ergänzen. */
  var CONSENT_SCRIPTS = {
    analytics: [{ src: 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID, attrs: { async: '' } }],
    marketing: []
  };

  var T = {
    es: {
      title: 'Cookies',
      text: 'Pequeños archivos que el sitio guarda en tu dispositivo para recordar información sobre tu visita. Más información en nuestra ',
      policy: 'Política de Cookies',
      accept: 'Aceptar todo', reject: 'Rechazar todo', config: 'Configurar',
      save: 'Guardar selección', back: '← Volver',
      always: 'Siempre activas',
      consentYes: 'Consentimiento: sí', consentNo: 'Consentimiento: no',
      cats: {
        necessary: { name: 'Estrictamente necesarias', purpose: 'Idioma, funcionamiento básico, seguridad', current: 'Sin cookies — solo almacenamiento local (localStorage): idioma, estado del consentimiento' },
        analytics: { name: 'Analítica/estadística', purpose: 'Medir visitas y comportamiento agregado', current: 'Google Analytics 4 (Google Ireland Ltd.) — cookies _ga y _ga_<container-id>, hasta 2 años; IP anonimizada' },
        marketing: { name: 'Marketing/publicidad', purpose: 'Medir campañas, remarketing', current: 'Ninguna todavía' }
      },
      currentLabel: 'Cookies actuales: '
    },
    de: {
      title: 'Cookies',
      text: 'Kleine Dateien, die die Website auf deinem Gerät speichert, um Informationen über deinen Besuch zu merken. Mehr dazu in unserer ',
      policy: 'Cookie-Richtlinie',
      accept: 'Alle akzeptieren', reject: 'Alle ablehnen', config: 'Einstellungen',
      save: 'Auswahl speichern', back: '← Zurück',
      always: 'Immer aktiv',
      consentYes: 'Einwilligung: ja', consentNo: 'Einwilligung: nein',
      cats: {
        necessary: { name: 'Technisch notwendig', purpose: 'Sprache, Grundfunktionen, Sicherheit', current: 'Keine Cookies — nur lokale Speicherung (localStorage): Sprachwahl, Cookie-Einstellung' },
        analytics: { name: 'Analyse/Statistik', purpose: 'Besuchs-/Nutzungsmessung', current: 'Google Analytics 4 (Google Ireland Ltd.) — Cookies _ga und _ga_<Container-ID>, bis zu 2 Jahre; IP anonymisiert' },
        marketing: { name: 'Marketing/Werbung', purpose: 'Kampagnenmessung, Remarketing', current: 'Noch keine' }
      },
      currentLabel: 'Aktuell eingesetzte Cookies: '
    },
    en: {
      title: 'Cookies',
      text: 'Small files the site stores on your device to remember information about your visit. Learn more in our ',
      policy: 'Cookie Policy',
      accept: 'Accept all', reject: 'Reject all', config: 'Settings',
      save: 'Save selection', back: '← Back',
      always: 'Always on',
      consentYes: 'Consent: yes', consentNo: 'Consent: no',
      cats: {
        necessary: { name: 'Strictly necessary', purpose: 'Language, core functionality, security', current: 'No cookies — local storage only (localStorage): language, consent state' },
        analytics: { name: 'Analytics/statistics', purpose: 'Visit/behaviour measurement', current: 'Google Analytics 4 (Google Ireland Ltd.) — cookies _ga and _ga_<container-id>, up to 2 years; IP anonymised' },
        marketing: { name: 'Marketing/advertising', purpose: 'Campaign measurement, remarketing', current: 'None yet' }
      },
      currentLabel: 'Cookies currently in use: '
    }
  };

  function currentLang() {
    try {
      var l = localStorage.getItem('extendio-lang');
      if (l && T[l]) return l;
    } catch (e) {}
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return T[nav] ? nav : 'en';
  }

  function getConsent() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY));
      if (!c || typeof c.ts !== 'number') return null;
      if (Date.now() - c.ts > MAX_AGE_MS) return null; /* abgelaufen → erneut fragen */
      return c;
    } catch (e) { return null; }
  }

  function saveConsent(analytics, marketing) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: 1, ts: Date.now(), necessary: true, analytics: !!analytics, marketing: !!marketing }));
    } catch (e) {}
    applyConsent();
    hideBanner();
  }

  /* Lädt registrierte Skripte NUR für Kategorien mit erteilter Einwilligung — genau einmal. */
  function applyConsent() {
    var c = getConsent();
    if (!c) return;
    ['analytics', 'marketing'].forEach(function (cat) {
      if (!c[cat]) return;
      CONSENT_SCRIPTS[cat].forEach(function (s) {
        if (s._loaded) return;
        var el = document.createElement('script');
        el.src = s.src;
        if (s.attrs) Object.keys(s.attrs).forEach(function (k) { el.setAttribute(k, s.attrs[k]); });
        document.head.appendChild(el);
        s._loaded = true;
      });
    });

    /* Google Analytics erst NACH Einwilligung initialisieren (gtag.js wird oben bereits geladen) */
    if (c.analytics && !window._gaInited) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
      window._gaInited = true;
    }
  }

  /* ---------- UI ---------- */
  var css = [
    '#ecb{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);width:min(760px,calc(100vw - 24px));z-index:9999;',
    'background:#150818;color:#f3e9f4;border:1px solid rgba(201,138,94,.5);border-radius:18px;',
    'box-shadow:0 24px 70px rgba(0,0,0,.55);padding:24px 26px;font-family:Jost,sans-serif;display:none}',
    '#ecb.ecb-open{display:block}',
    '#ecb h2{font-family:"Playfair Display",serif;font-size:1.25rem;font-weight:600;margin:0 0 8px;color:#f3e9f4}',
    '#ecb p{margin:0 0 18px;font-size:.92rem;font-weight:300;line-height:1.55;opacity:.9}',
    '#ecb a{color:#e0b394;text-decoration:underline}',
    '.ecb-actions{display:flex;gap:10px;flex-wrap:wrap}',
    /* Alle Buttons exakt gleich groß & gleich gewichtet — kein Dark Pattern */
    '.ecb-btn{flex:1 1 150px;min-height:48px;padding:12px 16px;border-radius:99px;font-family:Jost,sans-serif;',
    'font-size:.95rem;font-weight:600;letter-spacing:.03em;cursor:pointer;border:0;text-align:center;transition:.2s}',
    '.ecb-btn:hover{transform:translateY(-1px)}',
    '.ecb-accept{background:linear-gradient(100deg,#c73bdd,#8a2be2);color:#fff}',
    '.ecb-reject{background:linear-gradient(100deg,#c98a5e,#b3744a);color:#fff}',
    '.ecb-config{background:transparent;border:1.5px solid #c98a5e;color:#e0b394}',
    '.ecb-cat{border-top:1px solid rgba(243,233,244,.12);padding:14px 0}',
    '.ecb-cat-head{display:flex;align-items:center;justify-content:space-between;gap:14px}',
    '.ecb-cat-name{font-weight:600;font-size:.98rem}',
    '.ecb-cat-desc{font-size:.83rem;font-weight:300;opacity:.75;margin-top:5px;line-height:1.5}',
    '.ecb-flag{font-size:.75rem;color:#e0b394;letter-spacing:.04em}',
    /* Toggle */
    '.ecb-sw{position:relative;display:inline-block;width:46px;height:26px;flex:none}',
    '.ecb-sw input{opacity:0;width:0;height:0}',
    '.ecb-sl{position:absolute;cursor:pointer;inset:0;background:rgba(243,233,244,.22);border-radius:99px;transition:.2s}',
    '.ecb-sl:before{content:"";position:absolute;height:20px;width:20px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.2s}',
    '.ecb-sw input:checked + .ecb-sl{background:linear-gradient(100deg,#c73bdd,#8a2be2)}',
    '.ecb-sw input:checked + .ecb-sl:before{transform:translateX(20px)}',
    '.ecb-sw input:disabled + .ecb-sl{opacity:.55;cursor:not-allowed}',
    '@media(max-width:560px){#ecb{padding:20px 18px}.ecb-btn{flex:1 1 100%}}'
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;

  var banner, level = 1, toggles = { analytics: false, marketing: false };

  function policyHref() {
    /* funktioniert von Startseite und Unterseiten aus */
    return /\/(legal|privacy|cookies)\.html$/.test(location.pathname) ? 'cookies.html' : 'cookies.html';
  }

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function render() {
    var t = T[currentLang()];
    if (level === 1) {
      banner.innerHTML =
        '<h2>' + t.title + '</h2>' +
        '<p>' + esc(t.text) + '<a href="' + policyHref() + '">' + t.policy + '</a>.</p>' +
        '<div class="ecb-actions">' +
        '<button type="button" class="ecb-btn ecb-accept" data-act="accept">' + t.accept + '</button>' +
        '<button type="button" class="ecb-btn ecb-reject" data-act="reject">' + t.reject + '</button>' +
        '<button type="button" class="ecb-btn ecb-config" data-act="config">' + t.config + '</button>' +
        '</div>';
    } else {
      var cat = function (id, checked, disabled) {
        var c = t.cats[id];
        return '<div class="ecb-cat"><div class="ecb-cat-head">' +
          '<div><span class="ecb-cat-name">' + c.name + '</span> ' +
          '<span class="ecb-flag">' + (id === 'necessary' ? t.always : (checked ? t.consentYes : t.consentNo)) + '</span>' +
          '<div class="ecb-cat-desc">' + c.purpose + '<br>' + t.currentLabel + c.current + '</div></div>' +
          '<label class="ecb-sw"><input type="checkbox" data-cat="' + id + '"' +
          (checked ? ' checked' : '') + (disabled ? ' disabled' : '') + '><span class="ecb-sl"></span></label>' +
          '</div></div>';
      };
      banner.innerHTML =
        '<h2>' + t.config + '</h2>' +
        '<p>' + esc(t.text) + '<a href="' + policyHref() + '">' + t.policy + '</a>.</p>' +
        cat('necessary', true, true) +
        cat('analytics', toggles.analytics, false) +
        cat('marketing', toggles.marketing, false) +
        '<div class="ecb-actions" style="margin-top:18px">' +
        '<button type="button" class="ecb-btn ecb-accept" data-act="save">' + t.save + '</button>' +
        '<button type="button" class="ecb-btn ecb-config" data-act="back">' + t.back + '</button>' +
        '</div>';
    }
  }

  function showBanner(startLevel) {
    level = startLevel || 1;
    var c = getConsent();
    toggles.analytics = !!(c && c.analytics);
    toggles.marketing = !!(c && c.marketing);
    render();
    banner.classList.add('ecb-open');
  }

  function hideBanner() { banner.classList.remove('ecb-open'); }

  function init() {
    document.head.appendChild(styleEl);
    banner = document.createElement('div');
    banner.id = 'ecb';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    document.body.appendChild(banner);

    banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'accept') saveConsent(true, true);
      else if (act === 'reject') saveConsent(false, false);
      else if (act === 'config') { level = 2; render(); }
      else if (act === 'back') { level = 1; render(); }
      else if (act === 'save') {
        banner.querySelectorAll('input[data-cat]').forEach(function (i) {
          if (i.dataset.cat !== 'necessary') toggles[i.dataset.cat] = i.checked;
        });
        saveConsent(toggles.analytics, toggles.marketing);
      }
    });
    banner.addEventListener('change', function (e) {
      var i = e.target;
      if (i.matches('input[data-cat]') && i.dataset.cat !== 'necessary') {
        toggles[i.dataset.cat] = i.checked;
        render();
      }
    });

    /* Footer-Link „Cookie-Einstellungen" (data-cookie-settings) öffnet den Banner erneut */
    document.querySelectorAll('[data-cookie-settings]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); showBanner(2); });
    });

    if (!getConsent()) showBanner(1);
    applyConsent();
  }

  /* öffentliche API */
  window.openCookieSettings = function () { showBanner(2); };
  window.updateConsentLang = function () { if (banner && banner.classList.contains('ecb-open')) render(); };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
