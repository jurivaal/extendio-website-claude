/* Sprachumschaltung für die Rechtstext-Unterseiten — nutzt denselben localStorage-Schlüssel
   wie die Startseite, damit die Sprachwahl überall synchron bleibt. */
(function () {
  'use strict';

  var L = {
    de: { back: '← Zurück zur Startseite', legal: 'Impressum', privacy: 'Datenschutz', cookieSettings: 'Cookie-Einstellungen' },
    es: { back: '← Volver a la página principal', legal: 'Aviso Legal', privacy: 'Privacidad', cookieSettings: 'Configuración de cookies' },
    en: { back: '← Back to homepage', legal: 'Legal Notice', privacy: 'Privacy Policy', cookieSettings: 'Cookie settings' }
  };

  function setLang(lang) {
    if (!L[lang]) lang = 'en';
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-legal-lang]').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-legal-lang') === lang);
    });
    document.querySelectorAll('[data-t]').forEach(function (el) {
      var k = el.getAttribute('data-t');
      if (L[lang][k]) el.textContent = L[lang][k];
    });
    document.querySelectorAll('.lang-switch button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
    try { localStorage.setItem('extendio-lang', lang); } catch (e) {}
    if (window.updateConsentLang) window.updateConsentLang(lang);
  }

  document.querySelectorAll('.lang-switch button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });

  var initial = null;
  try { initial = localStorage.getItem('extendio-lang'); } catch (e) {}
  if (!initial) {
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    initial = ['de', 'es'].indexOf(nav) > -1 ? nav : 'en';
  }
  setLang(initial);
})();
