#!/usr/bin/env python3
"""
First Vape – egyfájlos, ügyfélnek küldhető prototípus (portál / e-mail).

    python3 prototype/tools/build_single.py

Kimenet: prototype/dist/firstvape-prototipus.html
- minden CSS, JS és kép beágyazva (data URI), letöltve internet nélkül is megnyílik
  (a Google Fonts betűkhöz net kell, anélkül tartalék betűvel jelenik meg)
- noindex, alul „Dizájn-prototípus” sáv bezárás gombbal
- a belső „Prototípus infó” gomb (fejlesztői átadó oldal) kimarad
Portálra: python3 prototype/tools/build_single.py --zip
→ prototype/dist/FirstVape-prototipus.zip (HTML + a két CSV-sablon + OLVASS-EL.txt)
Függőség nincs (Python 3 standard könyvtár).
"""
import base64
import pathlib
import re
import sys
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'dist' / 'firstvape-prototipus.html'


def data_uri(rel, mime):
    return 'data:%s;base64,%s' % (mime, base64.b64encode((ROOT / rel).read_bytes()).decode())


def main():
    index = (ROOT / 'index.html').read_text(encoding='utf-8')
    scripts = re.findall(r'<script src="assets/js/([\w.-]+)"></script>', index)
    fonts = re.search(r'<link rel="stylesheet" href="(https://fonts\.googleapis\.com/[^"]+)">', index).group(1)

    css = (ROOT / 'assets/css/style.css').read_text(encoding='utf-8')
    css = css.replace('url("../img/smoke.jpg")', 'url("%s")' % data_uri('assets/img/smoke.jpg', 'image/jpeg'))

    js = '\n'.join((ROOT / 'assets/js' / f).read_text(encoding='utf-8') for f in scripts)
    if '</script' in js.lower():
        raise SystemExit('Hiba: a JS-ben lezáró script-tag van – escape-eld így: <\\/script>')

    images = {k: data_uri('assets/' + k, 'image/png') for k in
              ('img/first-vape-logo.png', 'img/smoke-a.png', 'img/smoke-b.png')}
    asset_map = ', '.join("'%s': '%s'" % kv for kv in images.items())

    bar = """
<div class="proto-bar" data-proto-bar role="note" lang="hu">
  <p><b>Dizájn-prototípus.</b> Bemutató a First Vape új webshopjáról. Nem élő oldal: rendelés, hírlevél és üzenet nem megy el.
  A termékképek, a márkalogók és a jogi szövegek helyőrzők.</p>
  <button type="button" class="proto-bar-x" aria-label="Bezárás">×</button>
</div>"""
    bar_css = """
.proto-bar { position: fixed; left: 16px; right: 16px; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); z-index: 150; max-width: 760px; margin-inline: auto;
  display: flex; align-items: center; gap: 14px; padding: 12px 14px 12px 18px; border-radius: 12px; background: rgba(27, 20, 31, .94);
  border: 1px solid #4A3D52; box-shadow: 0 20px 50px rgba(0, 0, 0, .5); color: #CFC5D6; font: 400 14px/1.45 "Barlow", system-ui, sans-serif; backdrop-filter: blur(10px); }
.proto-bar b { color: #fff; }
.proto-bar-x { flex: none; width: 34px; height: 34px; border-radius: 8px; border: 1px solid #4A3D52; background: transparent; color: #fff; font-size: 20px; line-height: 1; cursor: pointer; }
.proto-bar-x:hover { border-color: #EC2F4B; }
"""
    bar_js = """
(function () {
  var bar = document.querySelector('[data-proto-bar]');
  try { if (sessionStorage.getItem('fv_proto_bar') === '0') bar.hidden = true; } catch (e) {}
  bar.querySelector('button').addEventListener('click', function () {
    bar.hidden = true;
    try { sessionStorage.setItem('fv_proto_bar', '0'); } catch (e) {}
  });
})();
"""

    html = """<!doctype html>
<html lang="sk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>First Vape – webshop prototípus</title>
<meta name="theme-color" content="#151017">
<link rel="icon" href="%(favicon)s">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="%(fonts)s">
<style>
%(css)s
%(bar_css)s
</style>
</head>
<body>
<a class="skip" href="#main" data-act="skip">Preskočiť na obsah</a>
<div id="site-header"></div>
<main id="main" tabindex="-1"></main>
<div id="site-footer"></div>
<div class="toast" data-toast role="status" aria-live="polite" hidden></div>
%(bar)s
<script>
window.FV = window.FV || {}; FV.assetMap = { %(asset_map)s };
%(js)s
%(bar_js)s
</script>
</body>
</html>
""" % {
        'favicon': data_uri('assets/img/favicon.png', 'image/png'),
        'fonts': fonts, 'css': css, 'bar_css': bar_css, 'bar': bar,
        'asset_map': asset_map, 'js': js, 'bar_js': bar_js,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding='utf-8')
    print('%s (%d KB)' % (OUT.relative_to(ROOT.parent), OUT.stat().st_size // 1024))
    if '--zip' in sys.argv:
        make_zip()


README_TXT = """First Vape – az új webshop kattintható prototípusa
=================================================

Megnyitás
- Csomagold ki a mappát, és nyisd meg a firstvape-prototipus.html fájlt böngészőben (Chrome, Safari vagy Edge).
- Telefonon is működik. Internet nélkül is megnyílik (net nélkül egyszerűbb betűtípussal).
- Ez nem élő oldal: a rendelés, a hírlevél és az üzenetek nem mennek el.
- Szlovák / francia váltás: jobb felül, telefonon a menü alján.

CSV-sablonok (termékadatokhoz)
- firstvape-termekimport-sablon.csv – teljes termékimport (új termékek és frissítés SKU alapján)
- firstvape-ar-keszlet-frissites.csv – gyors ár- és készletfrissítés
  Formátum: UTF-8, vessző elválasztó; több érték vesszővel egy cellában; alkategória „Szülő > Gyerek”; súly kg-ban;
  státusz: Aktív / Készlethiányos / Kifutott. A sablonokban lévő termékek mintaadatok.

HelloProVision
"""


def make_zip():
    out = ROOT / 'dist' / 'FirstVape-prototipus.zip'
    folder = 'FirstVape-prototipus/'
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        z.write(OUT, folder + OUT.name)
        for name in ('firstvape-termekimport-sablon.csv', 'firstvape-ar-keszlet-frissites.csv'):
            z.write(ROOT / 'csv' / name, folder + name)
        z.writestr(folder + 'OLVASS-EL.txt', README_TXT.replace('\n', '\r\n'))
    print('%s (%d KB)' % (out.relative_to(ROOT.parent), out.stat().st_size // 1024))


if __name__ == '__main__':
    main()
