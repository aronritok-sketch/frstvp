#!/usr/bin/env python3
"""
Előnézet zipben a CRM ügyfélportál jóváhagyásához: prototype/dist/firstvape-elonezet.zip

A portál „Weboldal-előnézet (zip)” anyaga a zip gyökerében lévő index.html-t nyitja meg homokozóban
(CSP sandbox, allow-same-origin nélkül), asztali / tablet / mobil nézetben. Ezért:
- a zipben index.html + assets/ van (css, js, img, fonts), minden típus a portál engedélyezett listáján;
- a betűk a csomagban vannak (assets/fonts), külső cím nincs;
- a localStorage helyett a homokozóban window.name őrzi az állapotot (assets/js/core.js, FV.store);
- a belső „Prototípus infó” gomb kimarad, helyette bezárható „Előnézet” sáv kerül alulra.

Futtatás a repó gyökeréből:  python3 prototype/tools/build_zip.py
"""
import pathlib
import re
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'dist' / 'firstvape-elonezet.zip'
TYPES = {'.html', '.css', '.js', '.png', '.jpg', '.webp', '.svg', '.woff2'}

BAR = """<div class="proto-bar" data-proto-bar role="note" lang="hu" hidden>
  <p><b>Előnézet.</b> A First Vape új webshopjának kattintható előnézete. Az űrlapok és a rendelés nem küldenek el semmit,
  fizetés nincs. A termékképek, a márkalogók és a jogi szövegek helyőrzők.</p>
  <button type="button" class="proto-bar-x" aria-label="Bezárás">×</button>
</div>
<style>
.proto-bar { position: fixed; left: 16px; right: 16px; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); z-index: 150; max-width: 760px; margin-inline: auto;
  display: flex; align-items: center; gap: 14px; padding: 12px 14px 12px 18px; border-radius: 12px; background: rgba(27, 20, 31, .94);
  border: 1px solid #4A3D52; box-shadow: 0 20px 50px rgba(0, 0, 0, .5); color: #CFC5D6; font: 400 14px/1.45 "Barlow", system-ui, sans-serif; }
.proto-bar[hidden] { display: none !important; }
.proto-bar b { color: #fff; }
.proto-bar-x { flex: none; width: 34px; height: 34px; border-radius: 8px; border: 1px solid #4A3D52; background: transparent; color: #fff; font-size: 20px; line-height: 1; cursor: pointer; }
.proto-bar-x:hover { border-color: #EC2F4B; }
</style>
<script>
(function () {
  var bar = document.querySelector('[data-proto-bar]');
  bar.hidden = !!FV.store.get('proto_bar_closed', false);
  bar.querySelector('button').addEventListener('click', function () { bar.hidden = true; FV.store.set('proto_bar_closed', true); });
})();
</script>
"""


def index_html():
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    html = re.sub(r'\n<a class="proto-fab"[^>]*>.*?</a>', '', html)
    html = html.replace('<title>First Vape</title>', '<title>First Vape – az új webshop előnézete</title>')
    return html.replace('</body>', BAR + '</body>')


def main():
    files = sorted(p for p in (ROOT / 'assets').rglob('*') if p.is_file() and p.suffix.lower() in TYPES)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.writestr('index.html', index_html())
        for p in files:
            rel = p.relative_to(ROOT).as_posix()
            # a képek és betűk már tömörítettek, azokat csak tároljuk
            method = zipfile.ZIP_DEFLATED if p.suffix in ('.css', '.js', '.svg') else zipfile.ZIP_STORED
            z.write(p, rel, compress_type=method)
    print('%s  %d fájl, %.1f MB' % (OUT.relative_to(ROOT.parent), len(files) + 1, OUT.stat().st_size / 1e6))


if __name__ == '__main__':
    main()
