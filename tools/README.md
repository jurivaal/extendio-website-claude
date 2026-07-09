# Video-Werkzeuge (Swift/AVFoundation — kein ffmpeg nötig)

Alle direkt lauffähig mit dem macOS-Systemcompiler (`swift <datei> …`), genutzt
für die Produkt-Video-Loops der Website.

- `contactsheet.swift out.jpg video1 [video2 …]` — Kontaktbogen: pro Video eine
  Zeile mit 3 Frames (15/50/85 %) zum schnellen Sichten von Roh-Footage.
- `densesheet.swift out.jpg video stepSek` — dichtes Frame-Raster EINES Videos
  (alle N Sekunden, mit Zeitlabels) zum Finden des Schnittfensters.
- `clipexport.swift in out.mp4 poster.jpg start end maxKante kbit` — schneidet
  das Segment, entfernt die Tonspur, H.264 mit gewählter Bitrate, behält
  Rotations-Metadaten (Hochformat bleibt Hochformat). Poster-Argument /dev/null
  übergeben und Poster separat erzeugen (der eingebaute Renderer ist defekt).
- `poster.swift video out.jpg sekunde maxKante` — Posterbild (JPEG) aus Frame.

Typischer Ablauf für ein neues Karten-Video:
1. `densesheet` über die Roh-Footage → Schnittfenster wählen (6–10 s, ohne
   Verpackungs-/Logo-Outros)
2. `clipexport … start end 960 1200` (vertikal 848/1000er Bitrate reicht)
3. `poster … 0.2 960`
4. In index.html: `<video class="product-media" autoplay muted loop playsinline
   preload="metadata" poster="assets/….jpg">` + `<source src="assets/….mp4">`
   (siehe bestehende Karten), danach `python3 prerender.py`, committen, pushen.
