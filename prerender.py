#!/usr/bin/env python3
"""Backt deutsche Texte in index.html und erzeugt statische DE/ES/EN-Routen.

Warum: Die Sprachumschaltung füllt alle Texte per JavaScript. Google rendert JS,
aber die meisten KI-Crawler (GPTBot, ClaudeBot, PerplexityBot, CCBot) NICHT —
ohne Prerender sehen sie eine leere Seite. Dieses Skript füllt alle
data-i18n-Elemente, Alt-Texte und Amazon-Links mit den DE-Werten.
Das Laufzeit-JS überschreibt sie beim Sprachwechsel ohnehin — idempotent.

NACH JEDER TEXTÄNDERUNG in index.html einmal ausführen: python3 prerender.py
"""
import html, json, re, sys, pathlib

HTML = pathlib.Path(__file__).parent / "index.html"
src = HTML.read_text()

def language_block(lang, next_lang=None):
    end = rf"\n\}},\n{next_lang}:\{{" if next_lang else r"\n\}\};"
    m = re.search(rf"{lang}:\{{(.*?){end}", src, re.S)
    if not m:
        sys.exit(f"I18N-{lang.upper()}-Block nicht gefunden")
    return {k: re.sub(r"\\(['\\])", r"\1", v)
            for k, v in re.findall(r"(\w+):'((?:[^'\\]|\\.)*)'", m.group(1))}

translations = {
    'de': language_block('de', 'es'),
    'es': language_block('es', 'en'),
    'en': language_block('en')
}
de = translations['de']

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

titles = {
    'de': 'Extendio — Haar-Accessoires aus Alicante',
    'es': 'Extendio — Accesorios para el pelo, desde Alicante',
    'en': 'Extendio — Hair accessories from Alicante'
}
descriptions = {
    'de': 'Extendio: Entwirrbürsten mit 29 % biobasiertem Anteil (ASTM D6866), Bambus-Wattestäbchen, Haarklammern und Salon-Zubehör. Erhältlich auf Amazon.de.',
    'es': 'Extendio: cepillos desenredantes con un 29 % de base biológica (ASTM D6866), bastoncillos de bambú, pinzas para el pelo y equipamiento para salones. Disponible en Amazon.es.',
    'en': 'Extendio: detangling brushes with 29% bio-based content (ASTM D6866), bamboo cotton swabs, claw clips and salon equipment. Available on Amazon.co.uk.'
}
og_locales = {'de': 'de_DE', 'es': 'es_ES', 'en': 'en_GB'}
markets = {'de': 'www.amazon.de', 'es': 'www.amazon.es', 'en': 'www.amazon.co.uk'}
product_keys = [
    ('p_mini_name', 'p_mini_desc', 'miniNegro'),
    ('p_l_name', 'p_l_desc', 'cepilloL'),
    ('p_swab_name', 'p_swab_desc', 'swabs'),
    ('p_clips1_name', 'p_clips1_desc', 'clipsSet1'),
    ('p_clips2_name', 'p_clips2_desc', 'clipsSet2'),
    ('p_trolley_name', 'p_trolley_desc', 'trolley')
]

def render_language(lang):
    out = src
    words = translations[lang]
    out = re.sub(r'<html lang="[^"]+">', f'<html lang="{lang}">', out, count=1)
    out = re.sub(r'<title>.*?</title>', '<title>' + html.escape(titles[lang]) + '</title>', out, count=1)
    out = re.sub(r'(<meta name="description" content=")[^"]*(">)',
                 lambda m: m.group(1) + html.escape(descriptions[lang], quote=True) + m.group(2), out, count=1)
    out = re.sub(r'(<link rel="canonical" href=")[^"]+(">)',
                 rf'\g<1>https://extendio.es/{lang}/\2', out, count=1)
    out = re.sub(r'(<meta property="og:url" content=")[^"]+(">)',
                 rf'\g<1>https://extendio.es/{lang}/\2', out, count=1)
    out = re.sub(r'(<meta property="og:title" content=")[^"]*(">)',
                 lambda m: m.group(1) + html.escape(titles[lang], quote=True) + m.group(2), out, count=1)
    out = re.sub(r'(<meta property="og:description" content=")[^"]*(">)',
                 lambda m: m.group(1) + html.escape(descriptions[lang], quote=True) + m.group(2), out, count=1)
    out = re.sub(r'(<meta property="og:locale" content=")[^"]*(">)',
                 rf'\g<1>{og_locales[lang]}\2', out, count=1)
    out = re.sub(r'(<meta name="twitter:title" content=")[^"]*(">)',
                 lambda m: m.group(1) + html.escape(titles[lang], quote=True) + m.group(2), out, count=1)

    for key, value in words.items():
        safe = html.escape(value, quote=False)
        pattern = rf'(<(?P<tag>[a-zA-Z0-9]+)\b[^>]*data-i18n="{key}"[^>]*>)(.*?)(</(?P=tag)>)'
        out = re.sub(pattern, lambda m, s=safe: m.group(1) + s + m.group(4), out, flags=re.S)
        pattern_html = rf'(<(?P<tag>[a-zA-Z0-9]+)\b[^>]*data-i18n-html="{key}"[^>]*>)(.*?)(</(?P=tag)>)'
        out = re.sub(pattern_html, lambda m, s=value: m.group(1) + s + m.group(4), out, flags=re.S)
        if key.startswith('alt_'):
            out = re.sub(rf'alt="[^"]*"([^>]*data-i18n-alt="{key}")',
                         lambda m, s=value: 'alt="' + html.escape(s, quote=True) + '"' + m.group(1), out)

    for key, asin in asins.items():
        out = re.sub(rf'(data-buy="{key}"[^>]*href=")[^"]*',
                     rf'\g<1>https://{markets[lang]}/dp/{asin}', out)

    # Strukturierte Produktliste ebenfalls sprach- und marktplatzgerecht ausgeben.
    ld_match = re.search(r'(<script type="application/ld\+json">)(.*?)(</script>)', out, re.S)
    if ld_match:
        data = json.loads(ld_match.group(2))
        item_list = next(x for x in data['@graph'] if x.get('@type') == 'ItemList')
        item_list['name'] = {'de':'Extendio Produkte', 'es':'Productos Extendio', 'en':'Extendio products'}[lang]
        for row, (name_key, desc_key, asin_key) in zip(item_list['itemListElement'], product_keys):
            item = row['item']
            item['name'] = words[name_key]
            item['description'] = words[desc_key]
            item['url'] = f"https://{markets[lang]}/dp/{asins[asin_key]}"
        replacement = ld_match.group(1) + '\n' + json.dumps(data, ensure_ascii=False, indent=2) + '\n' + ld_match.group(3)
        out = out[:ld_match.start()] + replacement + out[ld_match.end():]
    target = pathlib.Path(__file__).parent / lang / 'index.html'
    target.parent.mkdir(exist_ok=True)
    target.write_text(out)

for language in ('de', 'es', 'en'):
    render_language(language)

print(f"Prerender OK — {n} DE-Stellen aktualisiert; statische Routen /de/, /es/, /en/ erzeugt.")
