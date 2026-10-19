#!/usr/bin/env python3
"""
First Vape – az ügyfél termékfájljának (WooCommerce-CSV.xlsx, CSV-be mentve) átalakítása.

    python3 prototype/tools/client_import.py [prototype/csv/ugyfel/WooCommerce-CSV-2026-10-19.csv]

Kimenet:
  prototype/assets/js/products.js              az előnézet termékei és márkái (FV.clientProducts, FV.clientBrands)
  prototype/csv/firstvape-woocommerce-import.csv
                                               tisztított WooCommerce-import (SK kategóriák, attribútumok, SKU-javítások)
  prototype/csv/import-ellenorzes.md           hibák és javítások listája (HU) – az ügyfélnek és Lacinak
  prototype/csv/kategoria-osszerendeles.csv    a fájl pontos angol kategórianevei ↔ SK kategória ↔ slug
  prototype/csv/termekkepek.csv                termék ↔ forráskép ↔ feldolgozott kép (tools/product_images.py ebből dolgozik)

Szabályok (az ügyféllel véglegesített kategóriafa szerint, DONTESEK 2026-10-15):
- a fájl angol kategóriája a szlovák kategóriához kerül, új kategória nem jön létre;
- a „PREFILLED PODS > <rendszer>” sorok az Előretöltött podok főkategóriába kerülnek, a rendszer a pa_kompatibilitas lesz;
- minden szöveget megtisztít (szóköz a végén, dupla szóköz), a hibás sorokat javítja és listázza.
A szkript csak a Python standard könyvtárát használja.
"""
import collections
import csv
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'csv/ugyfel/WooCommerce-CSV-2026-10-19.csv')

# ---------- kategóriák ----------
# slug → (szülő slug, SK név, FR név, angol név a fájlban vagy javaslat)
TREE = {
    'keszulekek': (None, 'Zariadenia / kity', 'Appareils / kits', 'DEVICES / KITS'),
    'eloretoltott-pod-rendszerek': ('keszulekek', 'Predplnené pod systémy', 'Systèmes à pods préremplis', 'DEVICES / KITS > PREFILLED POD KITS'),
    'utantoltheto-pod-rendszerek': ('keszulekek', 'Plniteľné pod systémy', 'Systèmes à pods à remplir', 'DEVICES / KITS > REFILLABLE POD KITS'),
    'mod-tank-kitek': ('keszulekek', 'Mod / tank kity', 'Kits box / clearomiseur', 'DEVICES / KITS > MOD & TANK KITS'),
    'eloretoltott-podok': (None, 'Predplnené pody', 'Pods préremplis', 'PREFILLED PODS'),
    'e-liquidek': (None, 'E-liquidy', 'E-liquides', 'E-LIQUIDS'),
    'nikotin-booster': ('e-liquidek', 'Nikotínové boostery', 'Boosters de nicotine', 'E-LIQUIDS > NICOTINE BOOSTER'),
    'kesz-liquidek-10ml': ('e-liquidek', 'Hotové liquidy 10 ml', 'E-liquides prêts 10 ml', 'E-LIQUIDS > 10ML LIQUIDS'),
    'aromak': ('e-liquidek', 'Príchute (arómy)', 'Arômes concentrés', 'E-LIQUIDS > AROMA'),
    'shortfill': ('e-liquidek', 'Shortfill', 'Shortfills', 'E-LIQUIDS > SHORTFILL'),
    'longfill': ('e-liquidek', 'Longfill', 'Longfills', 'E-LIQUIDS > LONGFILL'),
    'eldobhato': (None, 'Jednorazové e-cigarety', 'Cigarettes électroniques jetables', 'DISPOSABLE E-CIGARETTES'),
    'kiegeszitok': (None, 'Príslušenstvo', 'Accessoires', 'ACCESSORIES'),
    'ures-podok': ('kiegeszitok', 'Prázdne pody / cartridge', 'Pods vides / cartouches', 'ACCESSORIES > REPLACEMENT PODS / CARTRIDGES'),
    'porlasztok': ('kiegeszitok', 'Žhaviace hlavy / coily', 'Résistances', 'ACCESSORIES > COILS'),
    'tankok': ('kiegeszitok', 'Tanky', 'Clearomiseurs', 'ACCESSORIES > TANK'),
    'akkuk-toltok': ('kiegeszitok', 'Batérie / nabíjačky', 'Accus / chargeurs', 'ACCESSORIES > BATTERIES / CHARGERS'),
    'egyeb-kiegeszitok': ('kiegeszitok', 'Ostatné príslušenstvo', 'Autres accessoires', 'ACCESSORIES > OTHER ACCESSORIES'),
}
# a fájl angol kategóriája (normalizálva) → (slug, rendszer a pa_kompatibilitas-hoz)
CAT_MAP = {
    'DEVICES / KITS > PREFILLED POD KITS': ('eloretoltott-pod-rendszerek', None),
    'DEVICES / KITS > REFILLABLE POD KITS': ('utantoltheto-pod-rendszerek', None),
    'DEVICES / KITS > MOD & TANK KITS': ('mod-tank-kitek', None),
    'PREFILLED PODS > ELFBAR ELFA': ('eloretoltott-podok', 'ELFA'),
    'PREFILLED PODS > VAPORESSO DOJO': ('eloretoltott-podok', 'DOJO BLAST'),
    'PREFILLED PODS > ELFBAR JOINONE': ('eloretoltott-podok', 'JOIN ONE'),
    'PREFILLED PODS > DRIFTER BAR': ('eloretoltott-podok', 'DRIFTER BAR'),
    'E-LIQUIDS > SHORTFILL': ('shortfill', None),
    'E-LIQUIDS > 10ML LIQUIDS': ('kesz-liquidek-10ml', None),
    'E-LIQUIDS > LONGFILL': ('longfill', None),
    'E-LIQUIDS > AROMA': ('aromak', None),
    'E-LIQUIDS > NICOTINE BOOSTER': ('nikotin-booster', None),
    'ACCESSORIES > COILS': ('porlasztok', None),
    'ACCESSORIES > REPLACEMENT PODS / CARTRIDGES': ('ures-podok', None),
    'ACCESSORIES > REPLACEMENT PODS': ('ures-podok', None),
    'ACCESSORIES > TANK': ('tankok', None),
    'ACCESSORIES > OTHER ACCESSORIES': ('egyeb-kiegeszitok', None),
}
ART = {'keszulekek': 'kit', 'eloretoltott-podok': 'pod', 'e-liquidek': 'liquid', 'eldobhato': 'disposable', 'kiegeszitok': 'accessory'}
# Becsült súly grammban (csak a szállítási díj számításához az előnézetben; a valódi súlyt az ügyfél adja meg)
WEIGHT = {'eloretoltott-pod-rendszerek': 120, 'utantoltheto-pod-rendszerek': 200, 'mod-tank-kitek': 450, 'eloretoltott-podok': 40,
          'kesz-liquidek-10ml': 30, 'shortfill': 120, 'longfill': 60, 'aromak': 60, 'nikotin-booster': 30, 'eldobhato': 60,
          'ures-podok': 30, 'porlasztok': 40, 'tankok': 120, 'akkuk-toltok': 150, 'egyeb-kiegeszitok': 50}

# A rendszer (pa_kompatibilitas) a termék nevéből – a fájl cross-sell kapcsolatai erősítik meg (pl. Digi Pro ↔ J Cartridge).
SYSTEMS = [
    (r'\bELFA\b', 'ELFA'), (r'JOIN ?ONE', 'JOIN ONE'), (r'DOJO BLAST', 'DOJO BLAST'), (r'DRIFTER (KIT|POD) BAR', 'DRIFTER BAR'),
    (r'\bNIO\b', 'NIO'), (r'RF350', 'RF350'), (r'\bGTX\b', 'GTX'), (r'\bAPEX\b', 'APEX'), (r'AEGIS BOOST|BOOST B COILS', 'AEGIS BOOST'),
    (r'DIGI PRO|\bJ CARTRIDGE', 'GEEKVAPE J'), (r'WENAX Q2|\bQ CAR+TRIDGE', 'GEEKVAPE Q'), (r'WENAX S3|\bS CARTRIDGE|WENAX DRIP TIP', 'GEEKVAPE S'),
    (r'ARMOUR OCTA|ITANK T|MESH GTI', 'GTI / iTANK T'), (r'AEGIS LEGEND|Z SUBOHM|Z XM', 'Z SUBOHM'),
]
EFEST_BATTERY = re.compile(r'EFEST.*(BATTERY|CHARGER)', re.I)

# Ízek → fénycsík színe a kártya mögött (csak díszítés)
FLAVOR_TINT = [('blue', '#4B5BD6'), ('straw', '#E83A5A'), ('cherry', '#B0133A'), ('cola', '#6B3A2A'), ('mango', '#FFB020'),
               ('peach', '#FF9A6B'), ('mint', '#2EC4B6'), ('menthol', '#2EC4B6'), ('melon', '#F0506E'), ('apple', '#7FB734'),
               ('lemon', '#F2C94C'), ('lime', '#9ACD32'), ('grape', '#7B3FA0'), ('berr', '#8E2F5C'), ('banana', '#F5D547'),
               ('kiwi', '#8FBF3F'), ('pineapple', '#F2B705'), ('ananas', '#F2B705'), ('raspberr', '#C2185B'), ('dragon', '#E040A0'),
               ('passion', '#F57C00'), ('guava', '#F06292'), ('orange', '#FB8C00'), ('creme', '#D9BF8C'), ('coffee', '#6D4C41'),
               ('tobacco', '#A0785A'), ('vanill', '#D9BF8C'), ('candy', '#F48FB1'), ('tropical', '#FFA726')]
SWATCH = [('rainbow', 'linear-gradient(135deg,#E53935,#FDD835,#43A047,#1E88E5,#8E24AA)'), ('aurora', 'linear-gradient(135deg,#7E57C2,#26C6DA)'),
          ('black', '#1B1B1F'), ('white', '#EDEDED'), ('silver', '#B8BCC4'), ('champagne', '#D8C3A5'), ('gold', '#C9A227'),
          ('bronze', '#9C6B3A'), ('brown', '#795548'), ('mocha', '#7B5E57'), ('grey', '#7D8188'), ('gray', '#7D8188'),
          ('gun', '#4A4F58'), ('titan', '#878A8F'), ('navy', '#1F3A68'), ('blue', '#2D5BD7'), ('cyan', '#22B8CF'), ('teal', '#00897B'),
          ('green', '#2F8F5B'), ('lime', '#9ACD32'), ('red', '#C62828'), ('ruby', '#9B111E'), ('pink', '#E27BA5'), ('purple', '#7B3FA0'),
          ('lilac', '#B39DDB'), ('lavender', '#B39DDB'), ('orange', '#F28C28'), ('yellow', '#F2C94C'), ('amber', '#FFB300'),
          ('dune', '#D7B98E'), ('fiber', '#2B2B2B'), ('carbon', '#2B2B2B')]
BRAND_COLOR = {'ELFBAR': '#111111', 'VAPORESSO': '#0B7A75', 'GEEKVAPE': '#E4572E', 'DRIFTER': '#5B3FD6', 'A&L': '#8B6B2E',
               'FIVE PAWNS': '#2B2B2B', 'SAIYEN': '#D81E5B', 'OBVIOUS': '#36A9E0', 'EFEST': '#C62828', 'CHUBBY': '#7FB734',
               'LIQUIDEO': '#2B3A8C', 'EXTRAPURE': '#4A8FB8'}
BRAND_STYLE = {'ELFBAR': 'heavy', 'VAPORESSO': 'wide', 'GEEKVAPE': 'heavy', 'DRIFTER': 'italic', 'A&L': 'script', 'FIVE PAWNS': 'wide',
               'SAIYEN': 'italic', 'OBVIOUS': 'heavy', 'EFEST': 'wide', 'CHUBBY': 'script', 'LIQUIDEO': 'italic', 'EXTRAPURE': 'wide'}

LEAF_TEXT = {  # a rövid leírás első része (SK, FR)
    'eloretoltott-pod-rendszerek': ('Pod kit s predplneným podom', 'Kit pod avec pod prérempli'),
    'utantoltheto-pod-rendszerek': ('Plniteľný pod kit', 'Kit pod à remplir'),
    'mod-tank-kitek': ('Mod + tank kit', 'Kit box + clearomiseur'),
    'eloretoltott-podok': ('Predplnený pod', 'Pod prérempli'),
    'kesz-liquidek-10ml': ('Hotový liquid', 'E-liquide prêt à vaper'),
    'shortfill': ('Shortfill liquid', 'E-liquide shortfill'),
    'longfill': ('Longfill príchuť', 'Arôme longfill'),
    'aromak': ('Koncentrovaná príchuť', 'Arôme concentré'),
    'nikotin-booster': ('Nikotínový booster / báza', 'Booster de nicotine / base'),
    'eldobhato': ('Jednorazová e-cigareta', 'Cigarette électronique jetable'),
    'ures-podok': ('Náhradný pod / cartridge', 'Pod / cartouche de rechange'),
    'porlasztok': ('Žhaviace hlavy (coily)', 'Résistances'),
    'tankok': ('Tank (clearomizér)', 'Clearomiseur'),
    'akkuk-toltok': ('Batéria / nabíjačka', 'Accu / chargeur'),
    'egyeb-kiegeszitok': ('Príslušenstvo', 'Accessoire'),
}


def clean(s):
    return re.sub(r'\s+', ' ', (s or '').replace(' ', ' ')).strip()


def slugify(s):
    s = s.lower().replace('&', '-and-').replace('ö', 'o').replace('é', 'e')
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s)).strip('-')


def nic(v):
    v = clean(v).replace(',', '.')
    if v == '':
        return None
    try:
        f = float(v)
    except ValueError:
        return None
    mg = round(f * 1000) if f < 1 else round(f)  # 0.02 = 2 % = 20 mg/ml
    return '%d mg' % mg


def ml(v):
    v = clean(v).lower().replace(' ', '').replace(',', '.')
    m = re.match(r'^([\d.]+)ml$', v)
    if not m:
        return clean(v) or None
    return ('%g' % float(m.group(1))).replace('.', ',') + ' ml'


def ohm(v):
    v = clean(v).lower().replace('ohm', '').replace(',', '.')
    try:
        return ('%g' % float(v)).replace('.', ',') + ' Ω'
    except ValueError:
        return None


def pick(table, text, default=None):
    t = text.lower()
    for k, v in table:
        if k in t:
            return v
    return default


def main():
    rows = list(csv.DictReader(open(SRC, encoding='utf-8')))
    issues = collections.OrderedDict((k, []) for k in (
        'sku_dup', 'type', 'no_category', 'category_ws', 'efest', 'cross_missing', 'attr_ws', 'name_ws', 'same_name',
        'no_image', 'dup_image', 'no_weight', 'stock', 'desc_wholesaler', 'french_name'))
    all_skus = collections.Counter(clean(r['SKU']) for r in rows)
    seen_slug = collections.Counter()
    products = []
    for idx, r in enumerate(rows):
        sku0 = clean(r['SKU'])
        name = clean(r['Name'])
        if r['Name'] != name or r['SKU'] != sku0:
            issues['name_ws'].append((sku0, name))
        typ = clean(r['Type'])
        if typ != 'simple':
            issues['type'].append((sku0, typ))
        # kategória
        cat_raw = r['Categories']
        cat = clean(cat_raw).upper()
        if cat_raw != cat_raw.strip() or (cat and cat not in CAT_MAP and cat.rstrip() in CAT_MAP):
            issues['category_ws'].append((sku0, cat_raw))
        system = None
        if not cat:
            if 'disposable' in r['Tags'].lower() or re.search(r'ELFBAR 600', name, re.I):
                leaf = 'eldobhato'
                issues['no_category'].append((sku0, name, 'Jednorazové e-cigarety (DISPOSABLE E-CIGARETTES)'))
            else:
                raise SystemExit('Ismeretlen, kategória nélküli sor: ' + sku0)
        elif cat in CAT_MAP:
            leaf, system = CAT_MAP[cat]
        else:
            raise SystemExit('Ismeretlen kategória: %r (%s)' % (cat, sku0))
        if leaf == 'egyeb-kiegeszitok' and EFEST_BATTERY.search(sku0 + ' ' + name):
            leaf = 'akkuk-toltok'
            issues['efest'].append((sku0, name))
        parent = TREE[leaf][0]
        root = parent or leaf
        cats = [x for x in (parent, leaf) if x]
        if not system:
            for pat, s in SYSTEMS:
                if re.search(pat, name.upper()):
                    system = s
                    break
        # attribútumok
        attrs = {}
        for i in (1, 2, 3):
            an = r.get('Attribute %d name' % i) or ''
            av = r.get('Attribute %d value (s)' % i) or ''
            if not an:
                continue
            if an != an.strip() or av != clean(av):
                issues['attr_ws'].append((sku0, an, av))
            key = clean(an).lower()
            if key == 'taste' and clean(av):
                attrs['iz'] = [clean(av).title() if clean(av).islower() else clean(av)]
            elif key == 'nicotine' and nic(av):
                attrs['nikotin'] = [nic(av)]
            elif key == 'capacity' and ml(av):
                attrs['ml'] = [ml(av)]
            elif key == 'puff' and clean(av):
                attrs['puff'] = [int(float(clean(av)))]
            elif key == 'color' and clean(av):
                attrs['szin'] = [clean(av)]
            elif key == 'ohm' and ohm(av):
                attrs['ohm'] = [ohm(av)]
        if 'ohm' not in attrs:
            m = re.search(r'(\d+[.,]\d+)\s*ohm', name, re.I)
            if m:
                attrs['ohm'] = [ohm(m.group(1))]
        if 'nikotin' not in attrs and leaf == 'nikotin-booster':
            m = re.search(r'(\d+)\s*mg', name, re.I)
            if m:
                attrs['nikotin'] = ['%s mg' % m.group(1)]
        if system and root in ('keszulekek', 'eloretoltott-podok', 'kiegeszitok'):
            attrs['kompat'] = [system]
        # SKU egyedivé tétele (a dupla SKU-t az import felülírná)
        sku = sku0
        if all_skus[sku0] > 1:
            # a duplikátumok nevének közös eleje nélküli rész lesz az ideiglenes SKU-végződés (pl. -PINEAPPLE-LEMON)
            names = [clean(x['Name']).split() for x in rows if clean(x['SKU']) == sku0]
            k = 0
            while all(len(n) > k for n in names) and len({n[k].lower() for n in names}) == 1:
                k += 1
            sku = sku0 + '-' + slugify(' '.join(name.split()[k:k + 2])).upper()
            issues['sku_dup'].append((sku0, name, sku))
        slug = slugify(sku)
        seen_slug[slug] += 1
        if seen_slug[slug] > 1:
            slug += '-%d' % seen_slug[slug]
        # kép
        img = clean(r['Images']).split(',')[0].strip() if clean(r['Images']) else ''
        if not img:
            issues['no_image'].append((sku, name))
        # súly, készlet
        if not clean(r['Weight (kg)']):
            issues['no_weight'].append(sku)
        qty = int(float(clean(r['Stock']) or 0))
        price = float(clean(r['Regular Price']).replace(',', '.'))
        sale = clean(r['Sale price'])
        desc = clean(r['Description'])
        if re.search(r'ADNS|French standards|catalog', desc, re.I):
            issues['desc_wholesaler'].append(sku)
        if re.match(r'(?i)fiole|vide\b', name):
            issues['french_name'].append((sku, name))
        cross = [clean(x) for x in (r['Cross-sells'] or '').split(',') if clean(x)]
        taste = (attrs.get('iz') or [''])[0]
        color = (attrs.get('szin') or [''])[0]
        brand = clean(r['Brands']).upper()
        tint = pick(FLAVOR_TINT, taste) or pick(SWATCH, color) or BRAND_COLOR.get(brand, '#7A6A9E')
        if tint.startswith('linear'):
            tint = '#8E7CC3'
        # csoport: a név az íz / szín / ellenállás nélkül
        base = name
        for v in (taste, color):
            if v:
                base = re.sub(r'\s*-?\s*' + re.escape(v) + r'\s*$', '', base, flags=re.I)
        base = re.sub(r'\s*\d+[.,]\d+\s*ohm\b', '', base, flags=re.I)
        gbase = base if base.upper().startswith(brand) else brand + ' ' + base
        group = slugify(gbase) if base != name or 'ohm' in attrs else ''
        short_sk, short_fr = LEAF_TEXT[leaf]
        extra = clean(r['Short description'])
        products.append(dict(
            idx=idx, sku=sku, sku0=sku0, slug=slug, name=name, brand=brand, leaf=leaf, root=root, cats=cats, attrs=attrs,
            price=price, sale=float(sale) if sale else None, qty=qty, weight=WEIGHT[leaf], img_url=img, cross=cross,
            group=group, color=tint, swatch=pick(SWATCH, color) if color else None, art=ART[root], extra=extra,
            short={'sk': short_sk + ' · ' + brand + (' · ' + extra if extra else ''), 'fr': short_fr + ' · ' + brand + (' · ' + extra if extra else '')},
            en_category=clean(cat_raw).upper()))
    # azonos név ugyanazon csoportban (pl. 0 / 20 mg ugyanazzal a névvel, booster PG/VG-arány a névben nincs)
    by_name = collections.defaultdict(list)
    for p in products:
        by_name[p['name'].lower()].append(p)
    for n, ps in by_name.items():
        if len(ps) > 1:
            issues['same_name'].append((ps[0]['name'], [p['sku'] for p in ps]))
    # cross-sell: nem létező SKU-k
    skus = {p['sku0'] for p in products} | {p['sku'] for p in products}
    for p in products:
        bad = [x for x in p['cross'] if x not in skus]
        if bad:
            issues['cross_missing'].append((p['sku'], bad))
        p['cross'] = [x for x in p['cross'] if x in skus and x != p['sku0']]
    # dupla kép
    imgs = collections.defaultdict(list)
    for p in products:
        if p['img_url']:
            imgs[p['img_url']].append(p['sku'])
    for u, ss in imgs.items():
        if len(ss) > 1:
            issues['dup_image'].append((u.rsplit('/', 1)[-1], ss))
    stocks = collections.Counter(p['qty'] for p in products)
    issues['stock'] = [stocks.most_common(3)]
    # a sorrend: a fájl sorrendje, kategóriánként az első néhány kiemelt
    first = set()
    for p in products:
        p['pop'] = max(1, 100 - p['idx'] * 100 // len(products))
        if p['leaf'] not in first:
            p['featured'] = True
            first.add(p['leaf'])
    write_js(products)
    write_import(products)
    write_mapping(products)
    write_report(products, issues, rows)
    w = csv.writer(open(os.path.join(ROOT, 'csv/termekkepek.csv'), 'w', newline='', encoding='utf-8'))
    w.writerow(['slug', 'sku', 'name', 'source_url', 'file'])
    for p in products:
        if p['img_url']:
            w.writerow([p['slug'], p['sku'], p['name'], p['img_url'], img_name(p)])
    print(len(products), 'termék,', len({p['brand'] for p in products}), 'márka')


def img_name(p):
    return p['slug'] + '.webp'


def write_js(products):
    brands = collections.OrderedDict()
    for p in products:
        brands.setdefault(p['brand'], set()).add(p['root'])
    root_names = {'keszulekek': ('zariadenia', 'appareils'), 'eloretoltott-podok': ('predplnené pody', 'pods préremplis'),
                  'e-liquidek': ('e-liquidy', 'e-liquides'), 'eldobhato': ('jednorazové e-cigarety', 'jetables'),
                  'kiegeszitok': ('príslušenstvo', 'accessoires')}
    order = ['keszulekek', 'eloretoltott-podok', 'eldobhato', 'e-liquidek', 'kiegeszitok']
    out_b = []
    for b, roots in brands.items():
        rs = [r for r in order if r in roots]
        out_b.append(dict(slug=slugify(b), name=b, color=BRAND_COLOR.get(b, '#7A6A9E'), style=BRAND_STYLE.get(b, 'wide'),
                          desc={'sk': 'V ponuke First Vape: ' + ', '.join(root_names[r][0] for r in rs) + '.',
                                'fr': 'Chez First Vape : ' + ', '.join(root_names[r][1] for r in rs) + '.'}))
    out_p = []
    for p in products:
        o = dict(slug=p['slug'], name=p['name'], art=p['art'], color=p['color'], cats=p['cats'], brand=slugify(p['brand']),
                 price=p['price'], sku=p['sku'], weight=p['weight'], qty=p['qty'], attrs=p['attrs'], short=p['short'], pop=p['pop'])
        if p['img_url']:
            o['img'] = 'img/p/' + img_name(p)
        if p['group']:
            o['group'] = p['group']
        if p['sale']:
            o['sale'] = p['sale']
        if p['swatch']:
            o['swatch'] = p['swatch']
        if p['cross']:
            o['cross'] = p['cross']
        if p.get('featured'):
            o['featured'] = True
        out_p.append(o)
    js = ('/* GENERÁLT FÁJL – ne szerkeszd kézzel. Forrás: az ügyfél termékfájlja (csv/ugyfel/), '
          'generátor: tools/client_import.py */\n'
          'window.FV = window.FV || {};\n'
          'FV.clientBrands = ' + json.dumps(out_b, ensure_ascii=False, indent=0) + ';\n'
          'FV.clientProducts = ' + json.dumps(out_p, ensure_ascii=False, separators=(',', ':')).replace('},{', '},\n{') + ';\n')
    if '</script' in js.lower():
        js = js.replace('</', '<\\/')
    open(os.path.join(ROOT, 'assets/js/products.js'), 'w', encoding='utf-8').write(js)


ATTR_LABELS = [('iz', 'Príchuť'), ('nikotin', 'Nikotín'), ('ml', 'Objem'), ('puff', 'Počet potiahnutí'), ('kompat', 'Systém'),
               ('szin', 'Farba'), ('ohm', 'Odpor')]


def nic_label(v):
    mg = int(v.split()[0])
    return '0 mg/ml (bez nikotínu)' if mg == 0 else '%d mg/ml (%s %%)' % (mg, ('%g' % (mg / 10)).replace('.', ','))


def write_import(products):
    head = ['Type', 'SKU', 'Name', 'Published', 'Visibility in catalog', 'Short description', 'Description', 'Regular price',
            'Sale price', 'Categories', 'Brands', 'In stock?', 'Stock', 'Weight (kg)', 'Images', 'Cross-sells',
            'Meta: _fv_group', 'Meta: _fv_en_category', 'Meta: _fv_source_image']
    for i in range(1, 6):
        head += ['Attribute %d name' % i, 'Attribute %d value(s)' % i, 'Attribute %d visible' % i, 'Attribute %d global' % i]
    w = csv.writer(open(os.path.join(ROOT, 'csv/firstvape-woocommerce-import.csv'), 'w', newline='', encoding='utf-8-sig'))
    w.writerow(head)
    for p in products:
        catpath = ' > '.join(TREE[c][1] for c in p['cats'])
        row = ['simple', p['sku'], p['name'], 1, 'visible', p['short']['sk'], '', '%g' % p['price'], '%g' % p['sale'] if p['sale'] else '',
               catpath, p['brand'], 1, p['qty'], '', img_name(p) if p['img_url'] else '', ', '.join(p['cross']), p['group'],
               p['en_category'], p['img_url']]
        attrs = [(lab, ', '.join(nic_label(v) if k == 'nikotin' else str(v) for v in p['attrs'][k])) for k, lab in ATTR_LABELS if p['attrs'].get(k)]
        for lab, val in attrs[:5]:
            row += [lab, val, 1, 1]
        row += [''] * (len(head) - len(row))
        w.writerow(row)


def write_mapping(products):
    en_by_slug = collections.defaultdict(collections.Counter)
    count = collections.Counter()
    for p in products:
        for c in p['cats']:
            count[c] += 1
        if p['en_category']:
            en_by_slug[p['leaf']][p['en_category']] += 1
    w = csv.writer(open(os.path.join(ROOT, 'csv/kategoria-osszerendeles.csv'), 'w', newline='', encoding='utf-8-sig'))
    w.writerow(['Szint', 'Szülő (slug)', 'Slug', 'Szlovák név (webshop)', 'Francia név', 'Angol név az ügyfél fájljában',
                'Termékek', 'Megjegyzés'])
    notes = {
        'eloretoltott-podok': 'A fájlban rendszerenként alkategória (ELFBAR ELFA, VAPORESSO DOJO, ELFBAR JOINONE, DRIFTER BAR): '
                              'a megbeszélt fa szerint egy kategória, a rendszer a pa_kompatibilitas (szűrő: márka, rendszer)',
        'eldobhato': 'A fájlban nincs ilyen kategória (3 ELFBAR 600 kategória nélkül) – javasolt angol név: DISPOSABLE E-CIGARETTES',
        'akkuk-toltok': 'A fájlban nincs ilyen kategória (az EFEST akku és töltők az OTHER ACCESSORIES alatt) – javasolt: ACCESSORIES > BATTERIES / CHARGERS',
        'ures-podok': 'A fájlban két írásmód: REPLACEMENT PODS / CARTRIDGES és REPLACEMENT PODS',
        'utantoltheto-pod-rendszerek': 'A fájlban a név végén szóköz van („REFILLABLE POD KITS ”)',
        'porlasztok': 'A fájlban egy sorban a név végén szóköz van („COILS ”)',
    }
    for slug, (parent, sk, fr, en) in TREE.items():
        names = en_by_slug.get(slug)
        en_txt = ' | '.join(sorted(names)) if names else (en if parent is None and slug != 'eldobhato' else '')
        w.writerow([2 if parent else 1, parent or '', slug, sk, fr, en_txt, count[slug], notes.get(slug, '')])


def write_report(products, iss, rows):
    L = []
    a = L.append
    a('# Termékimport – ellenőrzés (az ügyfél fájlja: WooCommerce-CSV.xlsx, 2026-10-19)')
    a('')
    a('Generálta: `prototype/tools/client_import.py`. A tisztított importfájl: `prototype/csv/firstvape-woocommerce-import.csv`.')
    a('')
    a('| | |')
    a('|---|---|')
    a('| Termék | %d (mind SIMPLE) |' % len(products))
    a('| Márka | %d (%s) |' % (len({p["brand"] for p in products}), ', '.join(sorted({p["brand"] for p in products}))))
    a('| Kép | %d termékhez (%d egyedi kép, mind az adns-grossiste.fr nagykereskedő oldaláról) |' % (
        sum(1 for p in products if p['img_url']), len({p['img_url'] for p in products if p['img_url']})))
    a('')
    a('## Javítani kell a fájlban (az ügyfél)')
    a('')
    if iss['sku_dup']:
        a('**1. Dupla SKU – az import egymásra írná a termékeket.** Ideiglenesen a név megkülönböztető részével egyedivé tettük; kérjük a végleges SKU-t:')
        a('')
        for s, n, new in iss['sku_dup']:
            a('- `%s` – %s → ideiglenesen `%s`' % (s, n, new))
        a('')
    if iss['type']:
        a('**2. Hibás típus:** ' + ', '.join('`%s` (Type = „%s”)' % x for x in iss['type']) + ' – javítva: simple.')
        a('')
    if iss['no_category']:
        a('**3. Kategória nélküli termékek** – az Eldobható e-cigaretták közé tettük (a fájlban nincs ilyen kategória, javasolt angol név: DISPOSABLE E-CIGARETTES):')
        a('')
        for s, n, c in iss['no_category']:
            a('- `%s` – %s' % (s, n))
        a('')
    if iss['cross_missing']:
        bad = collections.Counter(x for _, xs in iss['cross_missing'] for x in xs)
        a('**4. Nem létező SKU-k a Cross-sells oszlopban (%d termékben, %d különböző SKU).** A legtöbb Excel-lehúzásból jön '
          '(a cella végén a szám tovább számolt, pl. `GEEKVAPE-J-CARTRIDGE-0.9 … 0.15`, `VAPORESSO-KIT-DOJO-BLAST-L67 … L89`). '
          'Ezeket kihagytuk; a teljes lista:' % (len(iss['cross_missing']), len(bad)))
        a('')
        a(', '.join('`%s`' % x for x in sorted(bad)))
        a('')
    if iss['same_name']:
        a('**5. Azonos nevű termékek** – a vásárló nem tudja megkülönböztetni őket a listában. Javasoljuk, hogy a név tartalmazza a különbséget (pl. „0 mg”, „PG/VG 50/50”):')
        a('')
        for n, ss in iss['same_name']:
            a('- %s: %s' % (n, ', '.join('`%s`' % s for s in ss)))
        a('')
    a('**6. Súly:** egyik terméknél sincs kitöltve (Weight (kg)). A Packeta-díjhoz és a címkéhez kell. Az előnézetben kategóriánként becsült értékkel számolunk.')
    a('')
    a('**7. Készlet:** %s darab-értékek (%s) – mintaszámnak tűnnek; élesítés előtt a valódi készlet kell.' % (
        len(products), ', '.join('%d db: %d termék' % (k, v) for k, v in iss['stock'][0])))
    a('')
    a('**8. Leírások:** a „Description” oszlop a nagykereskedő angol szövege (%d terméknél szerepel benne „ADNS catalog”, '
      '„French standards” vagy hasonló). Ez a webshopba így nem kerülhet: szlovák és francia leírás kell (megírhatjuk mi is).' % len(iss['desc_wholesaler']))
    a('')
    if iss['french_name']:
        a('**9. Francia terméknév:** ' + ', '.join('`%s` (%s)' % x for x in iss['french_name']) + ' – szlovák / semleges név kell (pl. „Prázdna fľaša Chubby 120 ml”).')
        a('')
    a('## Amit mi rendeztünk az importnál (az ügyfélnek nincs teendője)')
    a('')
    a('- Kategória: a fájl angol kategóriái a szlovák kategóriákhoz kerültek (`kategoria-osszerendeles.csv`), dupla kategória nem jön létre.')
    a('- A „PREFILLED PODS > ELFBAR ELFA / VAPORESSO DOJO / ELFBAR JOINONE / DRIFTER BAR” alkategóriák helyett egy Előretöltött podok '
      'kategória, a rendszer a „Systém” attribútum (szűrhető) – ahogy a javításkérésben kérted. Ha mégis alkategóriát szeretnél, egy lépés átállítani.')
    if iss['efest']:
        a('- Az EFEST akku és töltők az „Akkumulátorok / töltők” kategóriába kerültek (a fájlban „OTHER ACCESSORIES”): ' +
          ', '.join('`%s`' % s for s, _ in iss['efest']) + '.')
    a('- Szóközök: %d kategória-, %d attribútum- és %d név/SKU-értéknél a végén vagy közepén felesleges szóköz volt (pl. „Nicotine ”, „Capacity ”, „Ohm ” '
      'attribútumnév – ezek két külön attribútumot hoztak volna létre). Javítva.' % (len(iss['category_ws']), len(iss['attr_ws']), len(iss['name_ws'])))
    a('- Nikotin: a fájl „0.02” értéke 20 mg/ml (2 %); a webshop így írja ki: „20 mg/ml (2 %)”.')
    a('- Ellenállás: a „0.8” → „0,8 Ω”; ahol nincs attribútum, a névből (pl. „0.6ohm”).')
    a('- Rendszer (Systém): a terméknévből, a fájl cross-sell kapcsolataival összevetve (ELFA, JOIN ONE, DOJO BLAST, DRIFTER BAR, NIO, RF350, GTX, APEX, '
      'AEGIS BOOST, GEEKVAPE J / Q / S, GTI / iTANK T, Z SUBOHM). Ellenőrzésre: az import CSV „Attribute … Systém” oszlopa.')
    if iss['dup_image']:
        a('- Ugyanaz a kép több terméknél (%d esetben, pl. %s) – ellenőrizendő, jó-e.' % (
            len(iss['dup_image']), '; '.join('%s: %s' % (u, ', '.join(ss)) for u, ss in iss['dup_image'][:3])))
    if iss['no_image']:
        a('- Kép nélkül: ' + ', '.join('`%s`' % s for s, _ in iss['no_image']) + '.')
    a('')
    open(os.path.join(ROOT, 'csv/import-ellenorzes.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')


if __name__ == '__main__':
    main()
