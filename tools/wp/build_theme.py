#!/usr/bin/env python3
"""A WordPress-telepítő csomagjai:
  dist/firstvape-tema.zip   a child téma (Megjelenés → Témák → Téma feltöltése; frissítéskor „Csere a feltöltöttre”)
  dist/firstvape-media.zip  médiacsomag: a feldolgozott termékképek (p/<termék-slug>.webp, 1200 px, átlátszó háttér,
                            FIRSTVAPE logó) – kicsomagolva a wp-content/uploads/firstvape-media/ mappába, vagy
                            wp firstvape setup --media=dist/firstvape-media.zip
Futtatás a repó gyökeréből (előtte: node tools/wp/build_data.mjs):
  python3 tools/wp/build_theme.py [--media <a 1200 px-es képek mappája: product_images.py --work <mappa> → <mappa>/master>]
"""
import argparse
import os
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
THEME = os.path.join(ROOT, 'wp-theme', 'firstvape')
DIST = os.path.join(ROOT, 'dist')
STORED = ('.webp', '.png', '.jpg', '.woff2', '.zip')


def pack(out, base, prefix, skip=lambda rel: False):
    n = 0
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for d, dirs, files in os.walk(base):
            dirs[:] = sorted(x for x in dirs if not x.startswith('.') and x != '__pycache__')
            for f in sorted(files):
                full = os.path.join(d, f)
                rel = os.path.relpath(full, base).replace(os.sep, '/')
                if skip(rel) or f.startswith('.'):
                    continue
                z.write(full, prefix + rel, compress_type=zipfile.ZIP_STORED if f.lower().endswith(STORED) else zipfile.ZIP_DEFLATED)
                n += 1
    print(f'{os.path.relpath(out, ROOT)}  {n} fájl, {os.path.getsize(out) / 1e6:.1f} MB')


ap = argparse.ArgumentParser()
ap.add_argument('--media', help='a feldolgozott 1200 px-es termékképek mappája (<slug>.webp)')
args = ap.parse_args()
os.makedirs(DIST, exist_ok=True)
pack(os.path.join(DIST, 'firstvape-tema.zip'), THEME, 'firstvape/')
if args.media:
    pack(os.path.join(DIST, 'firstvape-media.zip'), args.media, 'p/', skip=lambda rel: not rel.endswith('.webp'))
