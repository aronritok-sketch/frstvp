#!/usr/bin/env python3
"""
First Vape – termékképek a webshophoz: átlátszó háttér, FIRSTVAPE logó bal felül, a gyenge képek feljavítása.
Az ügyfél kérése (portál, 2026-10-19): „átlátszó háttérrel, a bal felső sarokban FIRSTVAPE logóval … a termék a webshop
sötét hátterén fehér keret nélkül jelenjen meg … pár kép minőségben silányabb, azokat javítsátok fel”.

    python3 -m venv .venv && .venv/bin/pip install pillow numpy opencv-contrib-python-headless "rembg[cpu]"
    .venv/bin/pip install --index-url https://download.pytorch.org/whl/cpu torch
    curl -LO https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth
    .venv/bin/python prototype/tools/product_images.py --work <munkamappa> --sr realesr-general-x4v3.pth --model birefnet-general
    (a BiRefNet ~25 s / kép és ~8 GB memória: 15-ös adagokban, --only-val futtatva a gyorsítótár miatt folytatható)

Bemenet: prototype/csv/termekkepek.csv (a client_import.py írja: termék ↔ forráskép URL ↔ fájlnév), és ha van,
prototype/csv/termekkepek-forras-csere.csv (slug → jobb forráskép, pl. a gyártó átlátszó PNG-je; ilyenkor a kép saját
átlátszósága a maszk, a rembg nem fut rá; a „resz” oszlop szóközzel elválasztva: jobb = csak a jobb szélső tárgy,
alja=<px> vagy <bal px>/<jobb px> = a tükröződés levágása a forráskép e sora alatt, sav=<px> = felette ekkora sávban a
halvány maradék is (alapból 28; fehér flakonnál 0), uveg = flakon-körvonal, doboz = egyenes szélű doboz saját fotón).
Lépések termékenként:
  1. letöltés (a forrás a nagykereskedő képe, 800 × 800, fehér háttér) → <work>/src/
  2. háttér eltávolítása (rembg, isnet-general-use modell) → <work>/cut/; a végleges maszk a rembg maszkja ∪ a fehér
     háttértől eltérő képpontok, lyukak kitöltve: így a termékből semmi nem vész el (doboz, ezüst coil – az ügyfél
     jelezte, 2026-10-20), és az átlátszó kupak / üveg átlátszatlan marad (a sötét háttéren nem lesz piszkos)
  3. felbontásnövelés Real-ESRGAN-nal (realesr-general-x4v3, a szerző kiadása; --sr <modell.pth>, PyTorch CPU) a teljes
     forrásképen ×4 → <work>/sr/, majd a termék körbevágva LEkicsinyítve kerül a vászonra (éles, nem elmosott);
     ha a termék nagyon kicsi (< 250 px) a forrásképen, a jelentés új forrásképet kér
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
from scipy import ndimage

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


def object_mask(src_rgb, cut_alpha):
    """Termékmaszk a forrás felbontásán: a fehér háttértől erősen eltérő képpontok ∪ a rembg maszkja, lyukak kitöltve,
    apró foltok nélkül. A halvány árnyék (eltérés ≤ 40) kimarad."""
    src = src_rgb.astype(int)
    bg = np.median(np.concatenate([src[0], src[-1], src[:, 0], src[:, -1]]), axis=0)
    dist = np.abs(src - bg).max(axis=2)
    rb = cut_alpha > 110
    # amit csak a szín alapján veszünk be (a modell nem): színes vagy sötét képpont lehet, halványszürke nem – az a padló
    # tükröződése / árnyéka (NIO, ELFA Pro – az ügyfél jelezte, 2026-10-22)
    sat = src.max(axis=2) - src.min(axis=2)
    lum = src.mean(axis=2)
    strong = (dist > 40) & (rb | (sat > 24) | (lum < 150))
    base = ndimage.binary_opening(strong | rb, iterations=1)
    # lyuk csak ott töltődik ki, ahol a modell vagy a szín szerint termék (pl. fehér címke a dobozon); a két tárgy
    # közti fehér rés (készülék és pod között) üres marad – az ügyfél jelezte, 2026-10-22
    holes, hn = ndimage.label(ndimage.binary_fill_holes(base) & ~base)
    if hn:
        idx = range(1, hn + 1)
        fill = (np.asarray(ndimage.mean(rb, holes, idx)) > 0.5) | (np.asarray(ndimage.mean(dist, holes, idx)) > 25) | \
               (np.asarray(ndimage.sum(np.ones_like(base), holes, idx)) < base.size * 0.0004)
        base = base | np.concatenate([[False], fill])[holes]
    m = base
    lab, n = ndimage.label(m)
    if not n:
        return m
    sizes = ndimage.sum(m, lab, range(1, n + 1))
    light = ndimage.labeled_comprehension(dist, lab, range(1, n + 1), lambda v: np.percentile(v, 90), float, 0)
    cov = ndimage.mean(rb, lab, range(1, n + 1))
    sl = ndimage.find_objects(lab)
    sure = [i for i in range(n) if cov[i] >= 0.5]
    top = min(sl[i][0].start for i in sure) if sure else 0
    bottom = max(sl[i][0].stop for i in sure) if sure else m.shape[0]
    h, w = m.shape
    keep = np.zeros(n + 1, bool)
    for i in range(n):
        if sizes[i] < max(400, sizes.max() * 0.01):
            continue
        if cov[i] < 0.2:
            ys, xs = sl[i]
            cy = (ys.start + ys.stop) / 2
            # amit a rembg nem ismert fel: csak a termék magasságában marad (pl. a kivágott coilok); a tükröződés
            # alatta és a nagyker sarokcímkéje („EXCLUSIVITÉ”) jobbra fent kimarad
            if not top <= cy <= bottom or (xs.start > w * 0.68 and ys.stop < h * 0.32):
                continue
            if light[i] < 90:  # halvány szürke folt (padló-tükröződés), nem coil / alkatrész
                continue
        keep[i + 1] = True
    return keep[lab]


def bottle_mask(mask):
    """Álló flakon(ok) maszkja tárgyanként: a sor két széle közt kitöltve, a fél szélesség soronként mediánnal simítva,
    a tárgy függőleges tengelyére tükrözve; a széles csoport (több összeérő flakon) oszloponként kitöltve."""
    lab, n = ndimage.label(mask)
    out = np.zeros_like(mask)
    for i, (ys, xs) in enumerate(ndimage.find_objects(lab)):
        part = lab[ys, xs] == i + 1
        if part.sum() < mask.sum() * 0.02:  # apró folt (a tükröződés maradéka a flakon alatt): kimarad
            continue
        if part.shape[1] > part.shape[0]:
            # egymás mellett összeérő flakonok (Chubby 120 ml, 8 db): oszloponként a teteje és az alja között kitöltve,
            # a felső és az alsó körvonal simítva – a flakonok közti háttér a nyakaknál üres marad
            cols = np.nonzero(part.any(axis=0))[0]
            top = ndimage.median_filter(np.array([np.argmax(part[:, x]) for x in cols]), size=5, mode='nearest')
            bot = ndimage.median_filter(np.array([part.shape[0] - 1 - np.argmax(part[::-1, x]) for x in cols]), size=9,
                                        mode='nearest')
            for x, t, b in zip(cols, top, bot):
                out[ys.start + t:ys.start + b + 1, xs.start + x] = True
            continue
        rows = np.nonzero(part.any(axis=1))[0]
        left = np.array([np.argmax(part[y]) for y in rows])
        right = np.array([part.shape[1] - 1 - np.argmax(part[y][::-1]) for y in rows])
        c = np.median((left + right) / 2)
        half = ndimage.median_filter(np.maximum(c - left, right - c), size=9, mode='nearest')
        half = np.minimum(half, ndimage.median_filter((right - left) / 2 + 1, size=31, mode='nearest') * 1.04)
        for y, hw in zip(rows, half):
            out[ys.start + y, xs.start + max(0, int(round(c - hw))):xs.start + int(round(c + hw)) + 1] = True
    return out


def box_mask(mask):
    """Álló doboz (saját fotó): a legnagyobb tárgy bal és jobb széle soronként, a két szélre robusztusan egyenes illesztve
    (a doboz széle egyenes, a fotó kissé dőlhet); ami a két egyenesen kívül van, az a háttér (a fehér asztal a fehér
    címke mellett), a kettő között kitöltve."""
    lab, n = ndimage.label(mask)
    if not n:
        return mask
    big = 1 + int(np.argmax(ndimage.sum(mask, lab, range(1, n + 1))))
    part = lab == big
    rows = np.nonzero(part.any(axis=1))[0]
    left = np.array([np.argmax(part[y]) for y in rows], float)
    right = np.array([part.shape[1] - 1 - np.argmax(part[y][::-1]) for y in rows], float)
    out = np.zeros_like(mask)
    fit = []
    for edge in (left, right):
        good = np.abs(edge - ndimage.median_filter(edge, size=61, mode='nearest')) < 3
        fit.append(np.polyval(np.polyfit(rows[good], edge[good], 1), rows))
    for y, l, r, fl, fr in zip(rows, left, right, *fit):
        a, b = int(round(max(l, fl - 2))), int(round(min(r, fr + 2)))
        if b > a:
            out[y, a:b + 1] = True
    return out


class SuperRes:
    """Real-ESRGAN „realesr-general-x4v3” (SRVGGNetCompact, ×4) – a hálózat a szerző kódja szerint, a súlyok a kiadásából."""

    def __init__(self, weights):
        import torch
        import torch.nn as nn
        import torch.nn.functional as F
        self.torch = torch

        class Net(nn.Module):
            def __init__(self, feat=64, conv=32, up=4):
                super().__init__()
                self.up = up
                self.body = nn.ModuleList([nn.Conv2d(3, feat, 3, 1, 1), nn.PReLU(num_parameters=feat)])
                for _ in range(conv):
                    self.body.extend([nn.Conv2d(feat, feat, 3, 1, 1), nn.PReLU(num_parameters=feat)])
                self.body.append(nn.Conv2d(feat, 3 * up * up, 3, 1, 1))
                self.shuffle = nn.PixelShuffle(up)

            def forward(self, x):
                out = x
                for layer in self.body:
                    out = layer(out)
                return self.shuffle(out) + F.interpolate(x, scale_factor=self.up, mode='nearest')

        sd = torch.load(weights, map_location='cpu', weights_only=True)
        self.net = Net()
        self.net.load_state_dict(sd.get('params', sd.get('params_ema', sd)))
        self.net.eval()

    def __call__(self, rgb, cache):
        if os.path.exists(cache):
            return np.asarray(Image.open(cache).convert('RGB'))
        x = self.torch.from_numpy(rgb.astype(np.float32) / 255).permute(2, 0, 1)[None]
        with self.torch.inference_mode():
            y = self.net(x)[0].clamp(0, 1).permute(1, 2, 0).numpy()
        out = (y * 255).round().astype(np.uint8)
        Image.fromarray(out).save(cache)
        return out


def product_rgba(src_rgb, mask, sr_rgb):
    """A termék RGBA-ban, körbevágva: a felnagyított (vagy eredeti) kép + a maszk 1 forrás-px-lel befelé húzva (a fehér
    szegély ne látsszon), lágy éllel."""
    k = sr_rgb.shape[0] // src_rgb.shape[0] if sr_rgb is not None else 1
    rgb = sr_rgb if sr_rgb is not None else src_rgb
    m = ndimage.binary_erosion(mask, iterations=1)
    a = Image.fromarray((m * 255).astype(np.uint8)).resize((rgb.shape[1], rgb.shape[0]), Image.LANCZOS)
    a = a.filter(ImageFilter.GaussianBlur(0.6 * k))
    obj = Image.fromarray(rgb).convert('RGBA')
    obj.putalpha(a)
    bbox = obj.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    return obj.crop(bbox) if bbox else obj


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
    ap.add_argument('--model', default='isnet-general-use', help='rembg modell (pl. birefnet-general: lassabb, pontosabb)')
    ap.add_argument('--sr', help='Real-ESRGAN súlyfájl (realesr-general-x4v3.pth); nélküle a régi Lanczos-felnagyítás')
    args = ap.parse_args()
    sr = SuperRes(args.sr) if args.sr else None
    for d in ('src', 'cut', 'master', 'sr', 'cut-' + args.model):
        os.makedirs(os.path.join(args.work, d), exist_ok=True)
    prev_dir = os.path.join(ROOT, 'assets/img/p')
    os.makedirs(prev_dir, exist_ok=True)
    logo = Image.open(os.path.join(ROOT, 'assets/img/first-vape-logo.png')).convert('RGBA')
    logo = logo.resize((LOGO_W, round(logo.height * LOGO_W / logo.width)), Image.LANCZOS)
    import onnxruntime as ort
    _opts = ort.SessionOptions

    def lean_opts():
        # a BiRefNet a memória-arénával képenként egyre több memóriát foglal (14 GB után a rendszer leállította): kikapcsolva
        o = _opts()
        o.enable_cpu_mem_arena = False
        o.enable_mem_pattern = False
        return o
    ort.SessionOptions = lean_opts
    from rembg import new_session
    session = new_session(args.model)
    cutdir = 'cut' if args.model == 'isnet-general-use' else 'cut-' + args.model
    rows = list(csv.DictReader(open(os.path.join(ROOT, 'csv/termekkepek.csv'), encoding='utf-8')))
    alt = os.path.join(ROOT, 'csv/termekkepek-forras-csere.csv')
    if os.path.exists(alt):
        swap = {r['slug']: r for r in csv.DictReader(open(alt, encoding='utf-8'))}
        for r in rows:
            sw = swap.get(r['slug'])
            if sw:
                r['source_url'] = sw['source_url'] or r['source_url']
                r['part'] = sw.get('resz', '')
    only = set(args.only.split(',')) if args.only else None
    report = []
    done = {}
    for i, r in enumerate(rows):
        if only and r['slug'] not in only:
            continue
        key = hashlib.md5(r['source_url'].encode()).hexdigest()[:12]
        src = os.path.join(args.work, 'src', key + '.jpg')
        download(r['source_url'], src)
        base = key  # a háttér-eltávolítás és a felnagyítás a forrásképhez tartozik: a kivágástól független
        if r.get('part'):
            key = key + '-' + ''.join(ch if ch.isalnum() else '_' for ch in r['part'])  # ugyanaz a forrás, más kivágás: külön feldolgozás
        if key in done:  # ugyanaz a forráskép több terméknél: egyszer dolgozzuk fel
            master_img, info = done[key]
        else:
            raw = Image.open(src)
            # a PNG forrás saját átlátszósága: fehérre téve (alatta fekete is lehet), és a maszkból kizárva; a háttér
            # eltávolítása mindig fut (a nagyker PNG-jein az átlátszó szegély közepén átlátszatlan fehér négyzet is lehet)
            rgba = raw.convert('RGBA')
            white = Image.new('RGBA', rgba.size, (255, 255, 255, 255))
            white.alpha_composite(rgba)
            src_rgb = np.asarray(white.convert('RGB'))
            own = np.asarray(rgba)[:, :, 3]
            ys, xs = np.nonzero(own > 10)
            card = len(xs) and (own > 10).sum() / ((xs.max() - xs.min() + 1) * (ys.max() - ys.min() + 1)) > 0.95
            if own.min() < 10 and not card:
                cut = own  # valóban átlátszó, kivágott forrás (pl. a gyártó PNG-je): a saját alfája pontos
            else:
                cut = np.minimum(np.asarray(cutout(src, os.path.join(args.work, cutdir, base + '.png'), session))[:, :, 3], own)
            mask = object_mask(src_rgb, cut)
            mask &= own > 10
            opts = dict(t.partition('=')[::2] for t in r.get('part', '').split())
            if 'alja' in opts:
                # a padló tükröződése levágva: a termék alja a forrásképen (px), vagy ferde vonal: bal szél/jobb szél
                # (A&L 30 ml, Saiyen, Geekvape doboz – az ügyfél jelezte, 2026-10-23)
                yl, _, yr = opts['alja'].partition('/')
                h, w = mask.shape
                line = np.linspace(float(yl), float(yr or yl), w)
                mask &= np.arange(h)[:, None] < line[None, :]
                # a vágás feletti sávban a halvány, fehéres képpont még a tükröződés (a flakon lekerekített alsó sarka)
                px = src_rgb.astype(int)
                pale = (px.mean(axis=2) > 185) & (px.max(axis=2) - px.min(axis=2) < 45)
                band = np.arange(h)[:, None] >= line[None, :] - int(opts.get('sav', 28))  # sav=0: fehér flakonnál ki
                refl, rn = ndimage.label(ndimage.binary_opening(pale & band, iterations=2))
                edge = np.arange(h)[:, None] >= line[None, :] - 3  # csak ami a vágásig ér: a címke fehér része marad
                touch = np.unique(refl[edge & (refl > 0)])
                mask &= ~np.isin(refl, touch[touch > 0])
                mask = ndimage.binary_opening(mask, iterations=2) | (mask & ~band)
            if 'uveg' in opts:
                # flakon: soronként kitöltve a két széle között, a körvonal simítva és tükörszimmetrikus – az átlátszó nyak
                # nem lesz rés (Hades 50 ml, Obvious), a fehér flakon széle nem csipkés (Succube, Nagato, Chubby)
                mask = bottle_mask(mask)
            if 'doboz' in opts:
                # saját fotó dobozról (az ügyfél szlovák címkés fotói): egyenes szélek, a mellette lévő asztal kimarad
                mask = box_mask(mask)
            if 'jobb' in opts:
                # csak a jobb szélső tárgy (pl. a pod a doboz nélkül: a 0 mg-os terméknél a nagyker a 20 mg-os doboz képét adta)
                lab, n = ndimage.label(mask)
                if n > 1:
                    sl = ndimage.find_objects(lab)
                    big = [i for i in range(n) if ndimage.sum(mask, lab, i + 1) > mask.sum() * 0.05]
                    right = max(big, key=lambda i: sl[i][1].start)
                    mask = lab == right + 1
            ys, xs = np.nonzero(mask)
            size = int(max(xs.max() - xs.min(), ys.max() - ys.min())) + 1 if len(xs) else 0
            src_w = src_rgb.shape[1]
            plain = Image.fromarray(src_rgb).convert('RGBA')
            plain.putalpha(Image.fromarray((mask * 255).astype(np.uint8)))
            sh = sharpness(plain)
            low = size < SMALL or src_w < 800 or sh < SOFT
            if sr:
                obj = product_rgba(src_rgb, mask, sr(src_rgb, os.path.join(args.work, 'sr', base + '.png')))
            else:
                obj = product_rgba(src_rgb, mask, None)
                if low:
                    obj = upscale(obj)
            master_img = compose(obj, logo)
            info = dict(object_px=size, source_px=src_w, sharpness=round(sh), enhanced=('AI ×4' if sr else 'igen' if low else ''),
                        new_source='kell' if size < TINY else '',
                        reason=', '.join(x for x, c in (('kicsi a termék a képen', size < SMALL), ('kis felbontás', src_w < 800),
                                                         ('életlen', sh < SOFT)) if c))
            done[key] = (master_img, info)
        master_img.save(os.path.join(args.work, 'master', r['file']), 'WEBP', quality=90, method=4)
        master_img.resize((640, 640), Image.LANCZOS).save(os.path.join(prev_dir, r['file']), 'WEBP', quality=80, method=4)
        report.append(dict(slug=r['slug'], sku=r['sku'], name=r['name'], file=r['file'], **info))
        if i % 25 == 0:
            print(i, len(rows), flush=True)
    rep = os.path.join(ROOT, 'csv/termekkepek-minoseg.csv')
    if only and os.path.exists(rep):  # --only: a jelentés többi sora marad
        new = {x['slug']: x for x in report}
        report = [new.pop(x['slug'], x) for x in csv.DictReader(open(rep, encoding='utf-8'))] + list(new.values())
    if report:
        with open(rep, 'w', newline='', encoding='utf-8') as f:
            w = csv.DictWriter(f, fieldnames=list(report[0].keys()))
            w.writeheader()
            w.writerows(report)
    print('kész:', len(report), 'kép,', sum(1 for x in report if x['enhanced']), 'feljavítva,',
          sum(1 for x in report if x['new_source']), 'új forrásképet kér')


if __name__ == '__main__':
    main()
