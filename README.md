# Extendio Website — Hinweise & offene Punkte

Statische One-Page-Website (DE/ES/EN), keine Build-Tools nötig. `index.html` + `assets/` einfach auf beliebiges Hosting legen (z. B. Netlify, Cloudflare Pages, IONOS).

## Hinweis: Arbeitsordner liegt jetzt lokal, nicht mehr in iCloud

Dieses Repo lag ursprünglich im iCloud-Drive-Ordner „Extendio Assets/website". iCloud hat wiederholt mitten in Git-Operationen synchronisiert: erst mit verwaisten `.git/index.lock`-Dateien, die Commits blockierten; danach hat der iCloud-Sync-Dienst sogar die `.git`-Verweisdatei (nach einem Versuch, nur das `.git`-Verzeichnis über `--separate-git-dir` auszulagern) selbstständig entfernt, weil er sie offenbar als verdächtiges Artefakt einstufte. Deshalb liegt der komplette Projektordner jetzt hier unter `~/Developer/extendio-website-claude` — vollständig lokal, außerhalb jeder iCloud-Synchronisation. Die Bild-/PDF-Quellen im iCloud-Ordner „Extendio Assets" bleiben davon unberührt und werden bei Bedarf weiterhin von dort in `assets/` kopiert. Der alte iCloud-Ordner `website/` wurde durch einen kurzen Hinweis auf den neuen Pfad ersetzt.

## Sprache ↔ Amazon-Routing

| Sprache | Marktplatz |
|---|---|
| DE | amazon.de |
| ES | amazon.es |
| EN | amazon.co.uk |

Erstbesuch: Browser-Sprache wird vorausgewählt (de/es, sonst en), Wahl wird in localStorage gespeichert. ASINs und Preise stehen zentral im `<script>`-Block von `index.html` (Konstanten `ASIN`, `PRICES`, `I18N`).

## Vor dem Launch verifizieren

1. **UK-ASINs:** EN-Buttons nutzen dieselben ASINs auf amazon.co.uk (ASINs sind i. d. R. marktplatzübergreifend identisch). Bitte jeden Link einmal auf amazon.co.uk anklicken und prüfen, ob das Listing live ist.
2. **amazon.es:** Wattestäbchen (B0FZM98G9B), Haarklammern (B0GQ46QVKM) und Trolley (B0DKJW844F) — prüfen, ob die Listings auf .es tatsächlich aktiv sind.
3. **Haarklammer-Sets:** Es sind jetzt BEIDE Sets als eigene Karten auf der Seite. Zuordnung (Annahme, vor Launch verifizieren!): Set 1 = Foto `02.01.jpg` (Koralle/Lila) → **B0GM6Y1D2G** (HC-4-set, unbranded); Set 2 = Foto `02.02.jpg` (Mint/Beige) → **B0GQ46QVKM** (HC-4-set-2, branded). Falls vertauscht: in `index.html` die ASINs `clipsSet1`/`clipsSet2` tauschen.
4. **Mini-Links:** Die Parent-ASIN B0GD2N9M5F war als /dp/-Link fehlerhaft — alle Mini-Hauptbuttons (Hero-CTA, Karten-Button, Lila-Swatch) zeigen jetzt auf die Schwarz-Variante B0GD2MV24F; die Farbauswahl übernimmt Amazon dort. Sobald die Lila-ASIN vorliegt: in `ASIN` als `miniLila` ergänzen und den Lila-Swatch umstellen.
5. **Cepillo Mini Preis:** Kein bestätigter Retail-Preis in den Unterlagen — Karte zeigt bewusst „Preis auf Amazon". Bei Bedarf in `PRICES` ergänzen.
6. **Cepillo L Beige (B07HDVVJ33):** NICHT verlinkt — laut Brief vor Verwendung zu verifizieren (passt nicht zur EAN-Liste).

## B2B-/Großhandels-Modul

Unter der Salon-Trolley-Sektion sitzt das Panel „Großhandel & B2B-Anfragen" (`#grosshandel`): eigene Konditionen + Versand direkt ab Lager, Kontakt per **WhatsApp Business** (`wa.me/34634223898`, vorbefüllter Text in Seitensprache) und **E-Mail** (`extendio.es@gmail.com`, Betreff+Text vorbefüllt). Der Footer verlinkt WhatsApp ebenfalls. Voraussetzung: WhatsApp Business ist auf +34 634 22 38 98 eingerichtet — sonst Nummer im `<script>` (Konstante in `setLang`, `wa.me/...`) ändern.

## Marken- & Designschutz-Hinweise

Auf der Seite (Hero-Badges, Fakten-Karte „®", Badge auf beiden Bürsten-Karten, Footer-Zeile) steht: Extendio = **eingetragene Unionsmarke (EUIPO)**, Bürsten-Design = **EU-weit eingetragenes Geschmacksmuster**. Bewusst NICHT „patentiert" formuliert — ein Geschmacksmuster ist ein eingetragenes Design, kein Patent; die falsche Bezeichnung wäre angreifbar.

Eingetragene Nummern (aus den EUIPO-Dokumenten, Juli 2026 auf der Website ergänzt):
- **Unionsmarke „Extendio"** (Bildmarke mit Wortelement): Nr. **019082088**, angemeldet 22.09.2024 (Fast Track), Klassen 21 Haarbürsten + 26 Haarverlängerungen. ⚠️ Die vorliegenden PDFs belegen Anmeldung + Gebührenzahlung — die **Eintragungsurkunde** einmal in eSearch (euipo.europa.eu/eSearch, Nr. 019082088) gegenprüfen/herunterladen.
- **EU-Geschmacksmuster**: Nr. **015112996-0001** („Haarbürste mit Spiralkopf und Katzenohren Klein") und **015112996-0002**, Eintragung bestätigt per EUIPO-Mitteilung vom 06.08.2025. Inhaber: Juri Vaal + Mischa Agapov. Achtung: EU-Marke/Geschmacksmuster gelten NICHT automatisch in UK (Brexit) — die Texte sagen deshalb nur „EU-weit". Falls UK-Schutz (comparable trade mark / re-registered design) existiert, können die EN-Texte auf „EU & UK" erweitert werden.

## Rechtstexte & Cookie-Consent

- **Unterseiten** (Texte wortgetreu aus `Extendio_Rechtstexte_ES_DE_EN.pdf`, je Sprache der passende Abschnitt, umgeschaltet über denselben Sprachumschalter/localStorage wie die Startseite): `legal.html` (Aviso Legal/Impressum/Legal Notice), `privacy.html` (Privacidad/Datenschutz/Privacy), `cookies.html` (Cookie-Richtlinie inkl. Tabelle). Zwei PDF-Platzhalter wurden nach Rückfrage gefüllt: „Letzte Aktualisierung" = 05.07.2026; Zelle „aktuelle Cookies (notwendig)" = „Keine Cookies — nur localStorage (Sprachwahl, Cookie-Einstellung)".
- **Footer** aller Seiten verlinkt Impressum/Datenschutz/Cookies + „Cookie-Einstellungen" (öffnet den Banner erneut, `data-cookie-settings`).
- **Cookie-Banner** (`assets/consent.js`, eigenständig, wird auf jeder Seite geladen):
  - Ebene 1: „Alle akzeptieren" / „Alle ablehnen" / „Einstellungen" — alle drei Buttons exakt gleich groß (verifiziert 462×48 px), kein Dark Pattern.
  - Ebene 2: Kategorien einzeln togglebar; notwendig = immer aktiv (deaktiviert); Analyse/Marketing standardmäßig AUS (keine Vorab-Häkchen); Inhalte = Cookie-Tabelle aus dem PDF.
  - Einwilligung in `localStorage['extendio-consent']`, **gültig max. 12 Monate** (danach erscheint der Banner erneut — getestet).
  - **Künftige Analytics-/Ads-Tools** in `consent.js` oben in `CONSENT_SCRIPTS` eintragen (`{src:'…', attrs:{async:''}}`) — sie werden erst NACH erteilter Einwilligung der jeweiligen Kategorie geladen. Danach: Cookie-Tabelle auf `cookies.html` + Datenschutz Abschnitt 3 in allen drei Sprachen ergänzen (steht so auch in der PDF-Checkliste).
  - Banner-Sprache folgt der Seitensprache (auch bei Umschalten bei offenem Banner).
- Keine EU-ODR-Verlinkung (Plattform am 20.07.2025 eingestellt; im Impressum steht der erklärende Hinweis aus dem PDF).

## SEO & KI-Auffindbarkeit

- **`prerender.py`** backt die deutschen Texte statisch in `index.html` (Standard für Crawler ohne JavaScript — GPTBot, ClaudeBot, PerplexityBot & Co. führen kein JS aus!). **Nach jeder Textänderung in `index.html` einmal `python3 prerender.py` ausführen**, dann committen.
- `robots.txt` — alle Such- und KI-Crawler ausdrücklich erlaubt, verweist auf die Sitemap.
- `sitemap.xml` — alle 4 Seiten (bei neuen Seiten ergänzen, `lastmod` aktualisieren).
- `llms.txt` — Marken-Kurzprofil für KI-Assistenten (Fakten: Materialien, Schutzrechte, B2B-Kontakt).
- `index.html` Head: Canonical (https://extendio.es/), Open-Graph/Twitter-Karten (`assets/og-image.jpg`, 1200×630), JSON-LD (Organization + WebSite + 6 Produkte mit Amazon-Offer-Links).
- Rechtsseiten stehen auf `noindex, follow` (gewollt).
- Nach dem Launch: Domain in der **Google Search Console** anmelden (Property extendio.es, Sitemap einreichen) und in **Bing Webmaster Tools** (füttert auch ChatGPT-Suche). Das kann nur Juri mit seinem Konto.

## Empfohlen: Amazon Attribution

In Seller Central (Brand Registry vorausgesetzt) Attribution-Tags erzeugen und an die Links hängen (`?maas=...`), pro Produkt × Sprache ein Tag. Qualifiziert für den Brand Referral Bonus (~10 %) und liefert Klick-/Conversion-Daten. Einfachste Stelle: in `index.html` die Konstante `MARKETPLACE` bzw. die `setLang()`-Linklogik erweitern.

## Compliance

Der gesamte Website-Text ist frei von verbotenen Umwelt-Begriffen (biodegradable, plastikfrei, nachhaltig, ecológico, sostenible, eco-friendly usw. — geprüft in allen drei Sprachen). Nur belegte Fakten: 29 % biobasierter Anteil (Beta Analytic, ASTM D6866), Bambus + 100 % Baumwolle, CE/TÜV. **Bei jeder Textänderung gilt dieselbe Regel.** Nur Retail-Preise, keine Business-Preise.

Hinweis: Auf den Produktfotos (Verpackung) sind teils „Eco Friendly / 100% Biodegradable"-Icons sichtbar — das sind Bestandteile der physischen Verpackung, kein Website-Text. Mittelfristig beim Verpackungs-Redesign bereinigen.

## Assets

`assets/` enthält web-optimierte Kopien (Fotos max. 1400 px JPEG 82 %; Videos H.264, stumm) — Originale bleiben unangetastet im iCloud-Ordner „Extendio Assets".

**Video-Loops (Stand 2026-07-09)** — alle selbst geschnitten via Swift/AVFoundation (kein ffmpeg nötig), `autoplay muted loop playsinline`, Poster-JPEG vom Segmentanfang, Reduced-Motion pausiert auf Poster:
| Slot | Datei | Quelle (Original) | Segment |
|---|---|---|---|
| Hero | `hero-brush-rotate.mp4` | Telegram-Bürsten-Makro (Downloads) | 10,5–18,5 s |
| Mini | `mini-brush-demo.mp4` | dieselbe Quelle | 24–30,5 s |
| Bürste L | `brush-l-demo.mp4` | dieselbe Quelle | 17–23 s |
| Set 1 | `clawclip-demo.mp4` | `IMG_3691.MOV` (Downloads) | 0–10 s |
| Set 2 | `clawclip2-demo.mp4` | `IMG_3691.MOV` | 26,5–33 s |
| Trolley | `trolley-loop.mp4` | `EXT0195_1.mov` (victoriapriebe-Ordner) | 63,5–71,5 s |

Wattestäbchen-Karte: Foto `wattestaebchen.jpg` (= `CottonSwab_IMG_6800.jpeg`, geöffnete Box) als Platzhalter, bis Footage gedreht ist — Tausch dann analog per `<video class="product-media">`. Übrige Fotos: Sets-JSON-LD nutzt `haarklammern_set1/2.jpg`, Mini-JSON-LD `mini_lila.jpg`, L `cepillo_l.jpg`, Trolley `trolley.jpg` (Fotoquellen: `02.01/02.02.jpg`, `Brush_Photos_444.jpg`, `blue2.jpg`, `Rollwagen_001 (V2).jpg`). Nummernschema der `Brush_Photos_*` im iCloud-Ordner: Doppel-/Einzel-Ziffern = GROSSE Bürste, Dreifach-Ziffern = MINI.

**Achtung:** Die Amazon-Listing-Karten in `Extendio/Große Haarbürste/1.jpg`, den ES/FR-Unterordnern und `Extendio/доп карточки/` enthalten eingebrannten Text („Nachhaltig", „Plastikfreie Verpackung") — für die Website NICHT verwenden (Compliance). Gleiche Begriffe sind laut Brief auch im Amazon-Backend noch offen. Logo: `Logo_Extendio_Vaal.png` (dunkler Hintergrund `#0e000e` — Header/Hero nutzen exakt diese Farbe, Logo wird per `mix-blend-mode:screen` eingeblendet).
