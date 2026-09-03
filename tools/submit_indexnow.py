#!/usr/bin/env python3
"""Submit every canonical URL in sitemap.xml to the IndexNow network."""
from pathlib import Path
import json
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
KEY = "755f78a8942765686e3b8ec386bd9782"
HOST = "extendio.es"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"

tree = ET.parse(ROOT / "sitemap.xml")
namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
urls = [node.text for node in tree.findall("sm:url/sm:loc", namespace) if node.text]
payload = json.dumps({
    "host": HOST,
    "key": KEY,
    "keyLocation": KEY_LOCATION,
    "urlList": urls,
}).encode()
request = urllib.request.Request(
    ENDPOINT,
    data=payload,
    headers={"Content-Type": "application/json; charset=utf-8"},
    method="POST",
)
with urllib.request.urlopen(request, timeout=30) as response:
    print(f"IndexNow HTTP {response.status}: submitted {len(urls)} URLs")
