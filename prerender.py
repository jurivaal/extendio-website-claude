#!/usr/bin/env python3
"""Backt die DEUTSCHEN Texte statisch in index.html (Standard-Sprache für Crawler).

Warum: Die Sprachumschaltung füllt alle Texte per JavaScript. Google rendert JS,
aber die meisten KI-Crawler (GPTBot, ClaudeBot, PerplexityBot, CCBot) NICHT —
ohne Prerender sehen sie eine leere Seite. Dieses Skript füllt alle
data-i18n-Elemente, Alt-Texte und Amazon-Links mit den DE-Werten.
Das Laufzeit-JS überschreibt sie beim Sprachwechsel ohnehin — idempotent.

NACH JEDER TEXTÄNDERUNG in index.html einmal ausführen:  python3 prerender.py
"""
import re, sys, pathlib

HTML = pathlib.Path(__file__).parent / "index.html"
src = HTML.read_text()

# ---- DE-Wörterbuch aus dem I18N-Block parsen ----
m = re.search(r"const I18N = \{\nde:\{(.*?)\n\},\nes:\{", src, re.S)
if not m:
    sys.exit("I18N-DE-Block nicht gefunden — Struktur geändert?")
de = {}
for k, v in re.findall(r"(\w+):'((?:[^'\\]|\\.)*)'", m.group(1)):
    de[k] = v.replace("\\'", "'")

# ---- ASINs parsen (keine Preise mehr im Code — Karten zeigen nur "Preis auf Amazon") ----
asins = dict(re.findall(r"^\s*(\w+):'(B0[A-Z0-9]{8})'", src, re.M))

n = 0
def sub(pattern, repl, s):
    global n
    out, c = re.subn(pattern, repl, s)
    n += c
    return out

# Nur LEERE Elemente füllen (zwischen > und < steht nichts)
for key, text in de.items():
    src = sub(r'(data-i18n="' + key + r'"[^>]*>)(</)', lambda mm, t=text: mm.group(1) + t + mm.group(2), src)
    src = sub(r'(data-i18n-html="' + key + r'"[^>]*>)(</)', lambda mm, t=text: mm.group(1) + t + mm.group(2), src)
    src = sub(r'(data-i18n-alt="' + key + r'")', lambda mm, t=text: mm.group(1), src) if False else src

# Alt-Texte: alt="" vor data-i18n-alt="key" füllen
def fill_alt(mm):
    global n
    key = mm.group(2)
    if key in de:
        n += 1
        return 'alt="' + de[key] + '"' + mm.group(1) + 'data-i18n-alt="' + key + '"'
    return mm.group(0)
src = re.sub(r'alt="[^"]*"([^>]*)data-i18n-alt="(\w+)"', fill_alt, src)

# Amazon-Links (DE-Marktplatz als statischer Standard)
def fill_buy(mm):
    global n
    key = mm.group(1)
    if key in asins:
        n += 1
        return 'data-buy="' + key + '"' + mm.group(2) + 'href="https://www.amazon.de/dp/' + asins[key] + '"'
    return mm.group(0)
src = re.sub(r'data-buy="(\w+)"([^>]*?)href="[^"]*"', fill_buy, src)

# B2B-Kontaktlinks (DE-Standard)
wa = "https://wa.me/34634223898?text=" + "Hallo%20Extendio!%20Ich%20interessiere%20mich%20f%C3%BCr%20Gro%C3%9Fhandelskonditionen.%20Produkte%2FMengen%3A%20"
src = sub(r'(data-wa )href="[^"]*"', r'\1href="' + wa + '"', src)
src = sub(r'(data-mailto )href="[^"]*"', r'\1href="mailto:extendio.es@gmail.com"', src)

HTML.write_text(src)
print(f"Prerender OK — {n} Stellen mit DE-Inhalten gefüllt.")
