#!/usr/bin/env python3
"""
First Vape – termékképek a webshophoz: átlátszó háttér, FIRSTVAPE logó bal felül, a gyenge képek feljavítása.
Az ügyfél kérése (portál, 2026-10-19): „átlátszó háttérrel, a bal felső sarokban FIRSTVAPE logóval … a termék a webshop
sötét hátterén fehér keret nélkül jelenjen meg … pár kép minőségben silányabb, azokat javítsátok fel”.

    python3 -m venv .venv && .venv/bin/pip install pillow numpy opencv-contrib-python-headless "rembg[cpu]"
    .venv/bin/python prototype/tools/product_images.py --work <munkamappa>

Bemenet: prototype/csv/termekkepek.csv (a client_import.py írja: termék ↔ forráskép URL ↔ fájlnév).
Lépések termékenként:
  1. letöltés (a forrás a nagykereskedő képe, 800 × 800, fehér háttér) → <work>/src/
  2. háttér eltávolítása (rembg, isnet-general-use modell; az átlátszó podok, üvegek széle is megmarad) → <work>/cut/
  3. a termék körbevágása; ha a termék kicsi a képen (a hosszabbik oldala < 420 px) vagy életlen: felbontásnövelés
     (Lanczos, két lépésben, élesítéssel); ha a termék nagyon kicsi (< 250 px), a jelentés új forrásképet kér
  4. 1200 × 1200-as átlátszó vászon, a termék középen a logó alatti területen, a FIRSTVAPE logó bal felül
  5. kimenet: <work>/master/<slug>.webp (1200 px, a webshopba) és prototype/assets/img/p/<slug>.webp (640 px, előnézet)
Jelentés: prototype/csv/termekkepek-minoseg.csv (méret, élesség, feljavítva-e).
"""
import argparse
import csv
import hashlib
import os
import urllib.request

import cv2
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CANVAS = 1200
LOGO_W, MARGIN = 300, 48            # a logó szélessége és távolsága a széltől
AREA = (80, 150, CANVAS - 80, CANVAS - 60)  # a termék helye: bal, fent (a logó alatt), jobb, lent
SMALL = 420                          # ennél kisebb termék (px, a forrásképen) feljavításra kerül
SOFT = 900                           # Laplace-variancia: ez alatt életlennek számít
TINY = 250                           # ennél kisebb terméknél a feljavítás sem ad jó képet: új forráskép kell


def download(url, path):
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    data = urllib.request.urlopen(req, timeout=60).read()
    with open(path, 'wb') as f:
        f.write(data)


def cutout(src, dst, session):
    if os.path.exists(dst):
        return Image.open(dst).convert('RGBA')
    from rembg import remove
    out = remove(Image.open(src).convert('RGBA'), session=session, post_process_mask=True)
    out.save(dst)
    return out


def sharpness(rgba):
    a = np.array(rgba)
    g = cv2.cvtColor(a[:, :, :3], cv2.COLOR_RGB2GRAY)
    m = a[:, :, 3] > 200
    lap = cv2.Laplacian(g, cv2.CV_64F)
    return float(lap[m].var()) if m.sum() > 500 else 0.0


def upscale(rgba):
    """Felbontásnövelés Lanczos-szal, két lépésben, élesítéssel. (Mesterséges intelligenciás felnagyítást – EDSR – is
    kipróbáltunk: a kis képeken a címkék szövegét olvashatatlanná „találta ki”, ezért nem használjuk.)"""
    w, h = rgba.size
    target = 1000 / max(w, h)          # a vásznon elérhető legnagyobb méretig, nem tovább
    if target <= 1.05:
        return rgba.filter(ImageFilter.UnsharpMask(radius=1, percent=50, threshold=2))
    mid = rgba.resize((round(w * min(2, target)), round(h * min(2, target))), Image.LANCZOS)
    mid = mid.filter(ImageFilter.UnsharpMask(radius=1, percent=50, threshold=2))
    out = mid.resize((round(w * target), round(h * target)), Image.LANCZOS)
    return out.filter(ImageFilter.UnsharpMask(radius=1.4, percent=70, threshold=2))


def compose(obj, logo):
    canvas = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
    l, t, r, b = AREA
    aw, ah = r - l, b - t
    s = min(aw / obj.width, ah / obj.height)
    nw, nh = max(1, round(obj.width * s)), max(1, round(obj.height * s))
    obj = obj.resize((nw, nh), Image.LANCZOS)
    if s > 1.05:
        obj = obj.filter(ImageFilter.UnsharpMask(radius=1, percent=40, threshold=2))
    canvas.alpha_composite(obj, (l + (aw - nw) // 2, t + (ah - nh) // 2))
    canvas.alpha_composite(logo, (MARGIN, MARGIN))
    return canvas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--work', required=True, help='munkamappa (src/, cut/, master/)')
    ap.add_argument('--only', help='csak ezek a slugok (vesszővel)')
    args = ap.parse_args()
    for d in ('src', 'cut', 'master'):
        os.makedirs(os.path.join(args.work, d), exist_ok=True)
    prev_dir = os.path.join(ROOT, 'assets/img/p')
    os.makedirs(prev_dir, exist_ok=True)
    logo = Image.open(os.path.join(ROOT, 'assets/img/first-vape-logo.png')).convert('RGBA')
    logo = logo.resize((LOGO_W, round(logo.height * LOGO_W / logo.width)), Image.LANCZOS)
    from rembg import new_session
    session = new_session('isnet-general-use')
    rows = list(csv.DictReader(open(os.path.join(ROOT, 'csv/termekkepek.csv'), encoding='utf-8')))
    only = set(args.only.split(',')) if args.only else None
    report = []
    done = {}
    for i, r in enumerate(rows):
        if only and r['slug'] not in only:
            continue
        key = hashlib.md5(r['source_url'].encode()).hexdigest()[:12]
        src = os.path.join(args.work, 'src', key + '.jpg')
        download(r['source_url'], src)
        if key in done:  # ugyanaz a forráskép több terméknél: egyszer dolgozzuk fel
            master_img, info = done[key]
        else:
            cut = cutout(src, os.path.join(args.work, 'cut', key + '.png'), session)
            a = np.array(cut)
            a[:, :, 3] = np.where(a[:, :, 3] < 12, 0, a[:, :, 3])
            cut = Image.fromarray(a, 'RGBA')
            bbox = cut.getbbox()
            obj = cut.crop(bbox) if bbox else cut
            src_w = Image.open(src).width
            size = max(obj.size)
            sh = sharpness(obj)
            low = size < SMALL or src_w < 800 or sh < SOFT
            if low:
                obj = upscale(obj)
            master_img = compose(obj, logo)
            info = dict(object_px=size, source_px=src_w, sharpness=round(sh), enhanced='igen' if low else '',
                        new_source='kell' if size < TINY else '',
                        reason=', '.join(x for x, c in (('kicsi a termék a képen', size < SMALL), ('kis felbontás', src_w < 800),
                                                         ('életlen', sh < SOFT)) if c))
            done[key] = (master_img, info)
        master_img.save(os.path.join(args.work, 'master', r['file']), 'WEBP', quality=90, method=4)
        master_img.resize((640, 640), Image.LANCZOS).save(os.path.join(prev_dir, r['file']), 'WEBP', quality=80, method=4)
        report.append(dict(slug=r['slug'], sku=r['sku'], name=r['name'], file=r['file'], **info))
        if i % 25 == 0:
            print(i, len(rows), flush=True)
    if not only:
        with open(os.path.join(ROOT, 'csv/termekkepek-minoseg.csv'), 'w', newline='', encoding='utf-8') as f:
            w = csv.DictWriter(f, fieldnames=list(report[0].keys()))
            w.writeheader()
            w.writerows(report)
    print('kész:', len(report), 'kép,', sum(1 for x in report if x['enhanced']), 'feljavítva,',
          sum(1 for x in report if x['new_source']), 'új forrásképet kér')


if __name__ == '__main__':
    main()
