/*
 * First Vape – prototípus: segédfüggvények, tároló, kereső, szűrők, termékillusztrációk
 */
(function (FV) {
  'use strict';

  /* ---------- Alap segédfüggvények ---------- */
  FV.$ = function (sel, root) { return (root || document).querySelector(sel); };
  FV.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  FV.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  FV.money = function (n) {
    return n.toFixed(2).replace('.', ',') + ' ' + FV.currency;
  };

  FV.num = function (n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  FV.puffLabel = function (n) { return FV.num(n) + ' ' + FV.t('puffUnit'); };

  FV.kg = function (g) {
    return g >= 1000 ? (g / 1000).toFixed(2).replace('.', ',') + ' kg' : g + ' g';
  };

  /**
   * Keresési normalizálás:
   *  - kisbetű, ékezetek nélkül
   *  - ezres tagolás eltávolítása: „40 000” / „40.000” → „40000”
   *  - „40k” → „40000”
   */
  FV.norm = function (s) {
    s = String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    s = s.replace(/(\d)[\s .,](?=\d{3}(\D|$))/g, '$1');
    s = s.replace(/(\d)[\s .,](?=\d{3}(\D|$))/g, '$1');
    s = s.replace(/\b(\d+)\s?k\b/g, function (m, d) { return String(+d * 1000); });
    s = s.replace(/(\d+)\s?(mg|ml)\b/g, '$1$2');
    return s.replace(/\s+/g, ' ').trim();
  };

  /* ---------- Lookups ---------- */
  FV.catIndex = {};
  FV.categories.forEach(function (c) {
    FV.catIndex[c.slug] = { slug: c.slug, name: c.name, parent: null, node: c };
    (c.children || []).forEach(function (ch) {
      FV.catIndex[ch.slug] = { slug: ch.slug, name: ch.name, parent: c.slug, node: ch };
    });
  });
  FV.cat = function (slug) { return FV.catIndex[slug]; };
  FV.brand = function (slug) {
    for (var i = 0; i < FV.brands.length; i++) if (FV.brands[i].slug === slug) return FV.brands[i];
    return null;
  };
  FV.product = function (key) {
    for (var i = 0; i < FV.products.length; i++) {
      var p = FV.products[i];
      if (p.slug === key || p.id === +key) return p;
    }
    return null;
  };
  // Az adatban szlovák bruttó ár van; a megjelenített ár az aktuális piac ÁFÁ-jával (FV.gross, i18n.js)
  FV.regular = function (p) { return FV.gross(p.price); };
  FV.salePrice = function (p) { return p.sale ? FV.gross(p.sale) : null; };
  FV.price = function (p) { return FV.gross(p.sale || p.price); };
  FV.discount = function (p) { return p.sale ? Math.round((1 - p.sale / p.price) * 100) : 0; };
  FV.inCat = function (p, slug) { return p.cats.indexOf(slug) !== -1; };
  FV.productsInCat = function (slug) { return FV.products.filter(function (p) { return FV.inCat(p, slug); }); };
  FV.productsOfBrand = function (slug) { return FV.products.filter(function (p) { return p.brand === slug; }); };
  FV.primaryCat = function (p) {
    for (var i = 0; i < p.cats.length; i++) if (FV.cat(p.cats[i]) && !FV.cat(p.cats[i]).parent) return FV.cat(p.cats[i]);
    return FV.cat(p.cats[0]);
  };
  FV.leafCat = function (p) {
    for (var i = 0; i < p.cats.length; i++) if (FV.cat(p.cats[i]) && FV.cat(p.cats[i]).parent) return FV.cat(p.cats[i]);
    return null;
  };

  FV.stockInfo = function (p) {
    var t = FV.t;
    if (p.stock === 'discontinued') return { cls: 'st-disc', label: t('stDisc'), short: t('stDiscShort') };
    if (p.stock === 'outofstock') return { cls: 'st-out', label: t('stOut'), short: t('stOutShort') };
    if (p.qty <= 15) return { cls: 'st-low', label: t('stLow', { n: p.qty }), short: t('stLowShort') };
    return { cls: 'st-in', label: t('stIn'), short: t('stIn') };
  };

  /* ---------- Tároló (localStorage, hibatűrő) ---------- */
  var mem = {};
  FV.store = {
    get: function (k, d) {
      try {
        var v = window.localStorage.getItem('fv_' + k);
        return v == null ? (k in mem ? mem[k] : d) : JSON.parse(v);
      } catch (e) { return k in mem ? mem[k] : d; }
    },
    set: function (k, v) {
      mem[k] = v;
      try { window.localStorage.setItem('fv_' + k, JSON.stringify(v)); } catch (e) { /* privát mód */ }
    }
  };

  /* ---------- Kosár ---------- */
  FV.cart = {
    items: function () { return FV.store.get('cart', null) || FV.cart.demo(); },
    demo: function () {
      // Az első megnyitáskor két mintatétel, hogy a kosár és a pénztár kitöltve látszódjon
      if (FV.store.get('cart_seeded', false)) return [];
      var seed = [
        { id: FV.product('elfbar-bc40000-blueberry-ice').id, qty: 2, v: {} },
        { id: FV.product('elfa-pod-blueberry').id, qty: 3, v: {} }
      ];
      FV.store.set('cart', seed);
      FV.store.set('cart_seeded', true);
      return seed;
    },
    save: function (items) { FV.store.set('cart', items); FV.emit('cart'); },
    key: function (it) { return it.id + '|' + JSON.stringify(it.v || {}); },
    add: function (id, qty, v) {
      var items = FV.cart.items(), k = id + '|' + JSON.stringify(v || {}), found = false;
      items.forEach(function (it) { if (FV.cart.key(it) === k) { it.qty += qty; found = true; } });
      if (!found) items.push({ id: id, qty: qty, v: v || {} });
      FV.cart.save(items);
    },
    setQty: function (idx, qty) {
      var items = FV.cart.items();
      if (!items[idx]) return;
      if (qty <= 0) items.splice(idx, 1); else items[idx].qty = qty;
      FV.cart.save(items);
    },
    lines: function () {
      return FV.cart.items().map(function (it) {
        var p = FV.product(it.id);
        return p ? { p: p, qty: it.qty, v: it.v || {}, total: FV.price(p) * it.qty, weight: p.weight * it.qty } : null;
      }).filter(Boolean);
    },
    totals: function () {
      var l = FV.cart.lines(), sub = 0, w = 0, n = 0, save = 0;
      l.forEach(function (x) { sub += x.total; w += x.weight; n += x.qty; if (x.p.sale) save += (FV.regular(x.p) - FV.salePrice(x.p)) * x.qty; });
      return { lines: l, sub: sub, weight: w, count: n, save: save };
    }
  };

  FV.shippingCost = function (methodId, weight, sub) {
    var m = FV.ship().methods.filter(function (x) { return x.id === methodId; })[0];
    if (!m) return null;
    if (sub >= FV.ship().freeOver) return 0;
    for (var i = 0; i < m.tiers.length; i++) if (weight <= m.tiers[i].max) return m.tiers[i].price;
    return null;
  };

  /* ---------- Kedvencek ---------- */
  FV.wish = {
    ids: function () { return FV.store.get('wish', []); },
    has: function (id) { return FV.wish.ids().indexOf(id) !== -1; },
    toggle: function (id) {
      var ids = FV.wish.ids(), i = ids.indexOf(id);
      if (i === -1) ids.push(id); else ids.splice(i, 1);
      FV.store.set('wish', ids);
      FV.emit('wish');
      return i === -1;
    }
  };

  /* ---------- Egyszerű eseményrendszer ---------- */
  var handlers = {};
  FV.on = function (ev, fn) { (handlers[ev] = handlers[ev] || []).push(fn); };
  FV.emit = function (ev, data) { (handlers[ev] || []).forEach(function (fn) { fn(data); }); };

  /* ---------- Keresés ----------
   * WordPress oldalon: a keresés kiterjesztése a terméknévre, márkára, kategóriára,
   * az összes pa_* attribútumra, SKU-ra és EAN-ra (tax_query + meta_query, normalizált számokkal).
   */
  function indexOf(p) {
    if (p._idx) return p._idx;
    var b = FV.brand(p.brand), a = p.attrs;
    var cats = p.cats.map(function (c) { return FV.cat(c) ? FV.cat(c).name : ''; }).join(' ');
    p._idx = {
      name: FV.norm(p.name),
      brand: FV.norm(b ? b.name : ''),
      attrs: FV.norm([].concat(a.iz || [], a.nikotin || [], a.ml || [], a.kompat || [], (a.szin || []).map(FV.colorName), a.szin || []).join(' ')),
      puff: (a.puff || []).map(String),
      cats: FV.norm(cats),
      ids: FV.norm(p.sku + ' ' + p.ean)
    };
    p._idx.all = [p._idx.name, p._idx.brand, p._idx.attrs, p._idx.puff.join(' '), (a.puff && a.puff.length ? 'puff ' + FV.norm(FV.t('puffUnit')) : ''), p._idx.cats, p._idx.ids].join(' ');
    return p._idx;
  }

  FV.search = function (q) {
    var tokens = FV.norm(q).split(' ').filter(function (t) { return t && ['puff', 'puffs', 'potiahnuti', 'potiahnutia', 'bouffee', 'bouffees'].indexOf(t) === -1; });
    if (!tokens.length) return [];
    var res = [];
    FV.products.forEach(function (p) {
      var ix = indexOf(p), score = 0, ok = true;
      tokens.forEach(function (t) {
        if (!ok) return;
        var s = 0;
        if (/^\d+$/.test(t)) {
          if (ix.puff.indexOf(t) !== -1) s += 14;
          else if (ix.puff.some(function (x) { return x.indexOf(t) === 0; })) s += 6;
        }
        if (ix.name.indexOf(t) !== -1) s += ix.name.split(' ').indexOf(t) !== -1 ? 10 : 6;
        if (ix.brand.indexOf(t) !== -1) s += ix.brand === t ? 9 : 5;
        if (ix.attrs.indexOf(t) !== -1) s += 5;
        if (ix.cats.indexOf(t) !== -1) s += 3;
        if (ix.ids.indexOf(t) !== -1) s += 7;
        if (!s && ix.all.indexOf(t) !== -1) s = 1;
        if (!s) ok = false; else score += s;
      });
      if (ok) res.push({ p: p, score: score + p.pop / 100 + (p.stock === 'discontinued' ? -4 : 0) });
    });
    res.sort(function (a, b) { return b.score - a.score; });
    return res.map(function (r) { return r.p; });
  };

  /* Javaslatok az élő keresőhöz: márkák, kategóriák, attribútum értékek */
  FV.suggest = function (q) {
    var nq = FV.norm(q), out = [];
    if (nq.length < 2) return out;
    var tokens = nq.split(' ');
    function hit(label) {
      var n = FV.norm(label);
      return tokens.some(function (t) { return t.length > 1 && n.indexOf(t) !== -1; });
    }
    FV.brands.forEach(function (b) {
      if (hit(b.name)) out.push({ type: FV.t('sBrand'), label: b.name, href: '#/marka/' + b.slug });
    });
    Object.keys(FV.catIndex).forEach(function (k) {
      var c = FV.catIndex[k];
      if (hit(c.name)) out.push({ type: FV.t('sCat'), label: c.name, href: '#/kategoria/' + k });
    });
    var puffs = {};
    FV.products.forEach(function (p) { (p.attrs.puff || []).forEach(function (x) { puffs[x] = 1; }); });
    Object.keys(puffs).forEach(function (x) {
      tokens.forEach(function (t) {
        if (/^\d{3,}$/.test(t) && x.indexOf(t) === 0) out.push({ type: FV.t('sPuff'), label: FV.puffLabel(+x), href: '#/kategoria/eldobhato?puff=' + x });
      });
    });
    var flav = {};
    FV.products.forEach(function (p) { (p.attrs.iz || []).forEach(function (x) { flav[x] = 1; }); });
    Object.keys(flav).forEach(function (x) {
      if (tokens.some(function (t) { return t.length > 2 && FV.norm(x).indexOf(t) !== -1; })) out.push({ type: FV.t('sFlavor'), label: x, href: '#/kereses/' + encodeURIComponent(x) });
    });
    var seen = {};
    return out.filter(function (o) { var k = o.type + o.label; if (seen[k]) return false; seen[k] = 1; return true; }).slice(0, 6);
  };

  /* ---------- Szűrők (WooCommerce layered nav megfelelője) ---------- */
  FV.facetDefs = [
    { key: 'marka', lk: 'a_marka', get: function (p) { return [p.brand]; }, name: function (v) { var b = FV.brand(v); return b ? b.name : v; } },
    { key: 'kat', lk: 'a_kat', get: function (p) { return p.cats.filter(function (c) { return FV.cat(c) && FV.cat(c).parent; }); }, name: function (v) { return FV.cat(v).name; } },
    { key: 'puff', lk: 'a_puff', get: function (p) { return (p.attrs.puff || []).map(String); }, name: function (v) { return FV.puffLabel(+v); }, sort: 'num', mono: true },
    { key: 'iz', lk: 'a_iz', get: function (p) { return p.attrs.iz || []; }, name: function (v) { return v; }, swatch: 'flavor' },
    { key: 'nikotin', lk: 'a_nikotin', get: function (p) { return p.attrs.nikotin || []; }, name: function (v) { return v; }, sort: 'num', mono: true },
    { key: 'ml', lk: 'a_ml', get: function (p) { return p.attrs.ml || []; }, name: function (v) { return v; }, sort: 'num', mono: true },
    { key: 'kompat', lk: 'a_kompat', get: function (p) { return p.attrs.kompat || []; }, name: function (v) { return v; } },
    { key: 'szin', lk: 'a_szin', get: function (p) { return p.attrs.szin || []; }, name: function (v) { return FV.colorName(v); }, swatch: 'color' },
    { key: 'keszlet', lk: 'a_keszlet', get: function (p) { return [p.stock]; }, name: function (v) { return FV.t({ instock: 'fInstock', outofstock: 'fOut', discontinued: 'fDisc' }[v]); } }
  ];

  FV.applyFilters = function (list, f, skipKey) {
    return list.filter(function (p) {
      for (var i = 0; i < FV.facetDefs.length; i++) {
        var d = FV.facetDefs[i];
        if (d.key === skipKey) continue;
        var sel = f[d.key];
        if (!sel || !sel.length) continue;
        var vals = d.get(p);
        if (!sel.some(function (s) { return vals.indexOf(s) !== -1; })) return false;
      }
      var pr = FV.price(p);
      if (f.min != null && pr < f.min) return false;
      if (f.max != null && pr > f.max) return false;
      if (f.akcio && !p.sale) return false;
      return true;
    });
  };

  // Tényezők és darabszámok (az adott tényező saját kijelölését figyelmen kívül hagyva, mint a WC „OR” szűrőnél)
  FV.facets = function (base, f) {
    return FV.facetDefs.map(function (d) {
      var pool = FV.applyFilters(base, f, d.key), counts = {}, all = {};
      base.forEach(function (p) { d.get(p).forEach(function (v) { all[v] = 1; }); });
      pool.forEach(function (p) { d.get(p).forEach(function (v) { counts[v] = (counts[v] || 0) + 1; }); });
      var vals = Object.keys(all);
      if (d.sort === 'num') vals.sort(function (a, b) { return parseFloat(a) - parseFloat(b); });
      else vals.sort(function (a, b) { return d.name(a).localeCompare(d.name(b), FV.lang); });
      return { def: d, values: vals.map(function (v) { return { v: v, n: counts[v] || 0, on: (f[d.key] || []).indexOf(v) !== -1 }; }) };
    }).filter(function (fc) { return fc.values.length > 1 || fc.values.some(function (x) { return x.on; }); });
  };

  FV.sorters = {
    pop: { lk: 'sortPop', fn: function (a, b) { return b.pop - a.pop; } },
    uj: { lk: 'sortNew', fn: function (a, b) { return a.date < b.date ? 1 : -1; } },
    ar_n: { lk: 'sortAsc', fn: function (a, b) { return FV.price(a) - FV.price(b); } },
    ar_cs: { lk: 'sortDesc', fn: function (a, b) { return FV.price(b) - FV.price(a); } },
    puff: { lk: 'sortPuff', fn: function (a, b) { return ((b.attrs.puff || [0])[0]) - ((a.attrs.puff || [0])[0]); } }
  };

  /* ---------- Kapcsolódó termékek ----------
   * Automatikus szabályok a pa_kompatibilitas attribútum alapján:
   *   készülék → kompatibilis podok / üres podok / porlasztók
   *   pod      → kapcsolódó készülék
   *   minden   → alternatívák (azonos alkategória, hasonló puff, más márka is)
   */
  function shares(a, b) {
    var x = a.attrs.kompat || [], y = b.attrs.kompat || [];
    return x.some(function (v) { return y.indexOf(v) !== -1; });
  }
  FV.related = function (p) {
    var isDevice = FV.inCat(p, 'keszulekek');
    var isPod = FV.inCat(p, 'eloretoltott-podok') || FV.inCat(p, 'ures-podok') || FV.inCat(p, 'porlasztofejek');
    var others = FV.products.filter(function (x) { return x.id !== p.id && x.stock !== 'discontinued'; });
    var out = [];
    if (isDevice) {
      out.push({ title: FV.t('relPods'), note: 'pa_kompatibilitas egyezés', items: others.filter(function (x) { return !FV.inCat(x, 'keszulekek') && shares(p, x) && !FV.inCat(x, 'toltok'); }) });
    }
    if (isPod) {
      out.push({ title: FV.t('relDevice'), note: 'pa_kompatibilitas egyezés', items: others.filter(function (x) { return FV.inCat(x, 'keszulekek') && shares(p, x); }) });
    }
    var leaf = FV.leafCat(p), prim = FV.primaryCat(p);
    var alt = others.filter(function (x) { return leaf ? FV.inCat(x, leaf.slug) : FV.inCat(x, prim.slug); });
    if (alt.length < 4) alt = alt.concat(others.filter(function (x) { return FV.inCat(x, prim.slug) && alt.indexOf(x) === -1; }));
    alt.sort(function (a, b) { return (b.stock === 'instock') - (a.stock === 'instock') || b.pop - a.pop; });
    out.push({ title: FV.t(p.stock === 'discontinued' ? 'relInstead' : 'relAlt'), note: 'azonos kategória', items: alt });
    return out.map(function (g) { g.items = g.items.slice(0, 4); return g; }).filter(function (g) { return g.items.length; });
  };

  /* ---------- Termékillusztrációk (SVG) ----------
   * A prototípusban nincsenek termékfotók; ezek a vektoros helyőrzők a terméktípust és az ízszínt mutatják.
   * A WordPress témában a WooCommerce termékképek (featured image + galéria) kerülnek a helyükre.
   */
  var gid = 0;
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function f(c) { return Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt))); }
    return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }
  FV.shade = shade;

  // sötét felületen a termékszín „füstös” fényként jelenik meg a kép mögött (CSS: radial-gradient)
  FV.tint = function (p) {
    var n = parseInt(p.color.slice(1), 16), lum = (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
    return lum < 0.2 ? '#7A6A9E' : p.color; // fekete/sötét termék mögé világosabb fény, hogy elváljon a háttértől
  };

  FV.art = function (p, opt) {
    opt = opt || {};
    var c = p.color, id = 'g' + (++gid), dark = shade(c, -0.35), light = shade(c, 0.35);
    var brand = FV.brand(p.brand), bname = FV.esc(brand ? brand.name.toUpperCase() : '');
    var puff = (p.attrs.puff || [])[0] || 0;
    var defs = '<defs><linearGradient id="' + id + '" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="' + light + '"/><stop offset="1" stop-color="' + dark + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'h" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>';
    var shadow = '<ellipse cx="120" cy="214" rx="54" ry="7" fill="#000" fill-opacity=".45"/>';
    var body = '';
    var view = opt.view || 0;
    var tf = view === 1 ? ' transform="rotate(-14 120 120)"' : view === 2 ? ' transform="translate(0 6) scale(1)"' : '';

    if (p.art === 'disposable') {
      var h = puff >= 20000 ? 164 : puff >= 5000 ? 150 : 132, w = puff >= 20000 ? 72 : puff >= 5000 ? 62 : 50;
      var x = 120 - w / 2, y = 208 - h;
      body = '<rect x="' + (x + w * 0.2) + '" y="' + (y - 26) + '" width="' + (w * 0.6) + '" height="36" rx="12" fill="#2E2735"/>' +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (w * 0.42) + '" fill="url(#' + id + ')"/>' +
        '<rect x="' + (x + 8) + '" y="' + (y + 16) + '" width="10" height="' + (h - 40) + '" rx="5" fill="url(#' + id + 'h)"/>' +
        (puff >= 10000 ? '<rect x="' + (120 - 18) + '" y="' + (y + h * 0.52) + '" width="36" height="22" rx="5" fill="#101014"/><text x="120" y="' + (y + h * 0.52 + 15) + '" text-anchor="middle" font-family="Barlow Semi Condensed,sans-serif" font-size="10" font-weight="600" fill="' + light + '">' + Math.round(puff / 1000) + 'K</text>' : '') +
        '<text x="' + (120 + 4) + '" y="' + (y + h * 0.36) + '" transform="rotate(-90 ' + (120 + 4) + ' ' + (y + h * 0.36) + ')" text-anchor="middle" font-family="Barlow Semi Condensed,sans-serif" font-weight="700" font-size="' + (w > 55 ? 12 : 10) + '" fill="#fff" fill-opacity=".92" letter-spacing="1">' + bname + '</text>';
    } else if (p.art === 'pod') {
      var pod = function (px, liquid) {
        return '<path d="M' + (px + 8) + ' 60 h28 l6 30 h-40 z" fill="#2E2735"/>' +
          '<rect x="' + (px - 2) + '" y="88" width="48" height="96" rx="10" fill="#E9E6F0" fill-opacity=".9" stroke="#2E2735" stroke-opacity=".15"/>' +
          '<rect x="' + (px + 3) + '" y="' + (120) + '" width="38" height="58" rx="7" fill="' + liquid + '" fill-opacity=".85"/>' +
          '<rect x="' + (px + 6) + '" y="96" width="6" height="80" rx="3" fill="#fff" fill-opacity=".6"/>' +
          '<rect x="' + (px - 2) + '" y="180" width="48" height="26" rx="6" fill="#352C3C"/>' +
          '<circle cx="' + (px + 14) + '" cy="193" r="3" fill="#c9b27a"/><circle cx="' + (px + 30) + '" cy="193" r="3" fill="#c9b27a"/>';
      };
      body = p.pack === 2 ? pod(66, c) + pod(126, shade(c, -0.1)) : pod(98, c);
    } else if (p.art === 'kit') {
      var sw = FV.colorSwatches[(p.attrs.szin || [])[0]] || c;
      var big = FV.inCat(p, 'box-mod-kitek');
      if (big) {
        body = '<rect x="104" y="30" width="32" height="46" rx="6" fill="#d9dde6" stroke="#2E2735" stroke-opacity=".2"/><rect x="110" y="44" width="20" height="28" rx="3" fill="#E9A23B" fill-opacity=".7"/><rect x="112" y="20" width="16" height="14" rx="4" fill="#2E2735"/>' +
          '<rect x="72" y="74" width="96" height="136" rx="16" fill="' + shade(sw, 0.1) + '"/><rect x="72" y="74" width="96" height="136" rx="16" fill="url(#' + id + 'h)" fill-opacity=".5"/>' +
          '<rect x="88" y="96" width="46" height="30" rx="4" fill="#0e0f13"/><text x="111" y="116" text-anchor="middle" font-family="Barlow Semi Condensed,sans-serif" font-size="11" fill="#7CF3C1">80W</text>' +
          '<rect x="146" y="94" width="10" height="40" rx="5" fill="#2E2735" fill-opacity=".7"/><circle cx="102" cy="148" r="5" fill="#2E2735" fill-opacity=".6"/><circle cx="120" cy="148" r="5" fill="#2E2735" fill-opacity=".6"/>';
      } else {
        body = '<rect x="96" y="30" width="48" height="58" rx="12" fill="#E9E6F0" fill-opacity=".92" stroke="#2E2735" stroke-opacity=".15"/>' +
          '<rect x="104" y="52" width="32" height="32" rx="7" fill="' + shade(sw === '#1B1B1F' ? '#4B5BD6' : sw, 0.1) + '" fill-opacity=".7"/><rect x="106" y="20" width="28" height="16" rx="6" fill="#2E2735"/>' +
          '<rect x="88" y="84" width="64" height="126" rx="22" fill="' + sw + '"/><rect x="94" y="96" width="10" height="100" rx="5" fill="url(#' + id + 'h)"/>' +
          '<rect x="116" y="170" width="8" height="18" rx="4" fill="#fff" fill-opacity=".55"/>';
      }
    } else if (p.art === 'liquid') {
      var big2 = /(50|60) ml/.test(p.name) || (p.attrs.ml || [])[0] === '20 ml';
      var bw = big2 ? 88 : 70, bh = big2 ? 128 : 108, bx = 120 - bw / 2, by = 210 - bh;
      body = '<path d="M' + (120 - 6) + ' ' + (by - 58) + ' h12 l4 20 h-20 z" fill="#2E2735"/>' +
        '<rect x="' + (120 - 20) + '" y="' + (by - 40) + '" width="40" height="44" rx="6" fill="#2E2735"/>' +
        '<rect x="' + (120 - 20) + '" y="' + (by - 40) + '" width="40" height="8" rx="3" fill="#fff" fill-opacity=".15"/>' +
        '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="14" fill="#F4F2F7" stroke="#2E2735" stroke-opacity=".12"/>' +
        '<rect x="' + bx + '" y="' + (by + bh * 0.28) + '" width="' + bw + '" height="' + bh * 0.52 + '" fill="url(#' + id + ')"/>' +
        '<text x="120" y="' + (by + bh * 0.5) + '" text-anchor="middle" font-family="Barlow Semi Condensed,sans-serif" font-weight="700" font-size="' + (bname.length > 10 ? 7.5 : 9) + '" fill="#fff">' + bname + '</text>' +
        '<text x="120" y="' + (by + bh * 0.66) + '" text-anchor="middle" font-family="Barlow Semi Condensed,sans-serif" font-size="9" fill="#fff" fill-opacity=".9">' + FV.esc((p.attrs.ml || [''])[0]) + '</text>' +
        '<rect x="' + (bx + 7) + '" y="' + (by + 8) + '" width="7" height="' + (bh - 20) + '" rx="3.5" fill="#fff" fill-opacity=".7"/>';
    } else {
      var acc = p.acc;
      if (acc === 'cartridge') {
        body = '<path d="M104 58 h32 l6 30 h-44 z" fill="#2E2735"/><rect x="92" y="86" width="56" height="100" rx="12" fill="' + shade(c, 0.75) + '" stroke="' + c + '" stroke-width="3"/><rect x="100" y="96" width="7" height="80" rx="3.5" fill="#fff" fill-opacity=".8"/><rect x="92" y="180" width="56" height="26" rx="6" fill="#352C3C"/><rect x="114" y="120" width="12" height="40" rx="3" fill="' + c + '" fill-opacity=".35"/>';
      } else if (acc === 'coil') {
        body = '<rect x="96" y="54" width="48" height="150" rx="8" fill="#b9bec8"/><rect x="96" y="54" width="48" height="150" rx="8" fill="url(#' + id + 'h)"/>' +
          '<rect x="104" y="96" width="32" height="50" rx="4" fill="#E3D6B8"/>' +
          [0, 1, 2, 3, 4].map(function (i) { return '<line x1="104" y1="' + (100 + i * 10) + '" x2="136" y2="' + (100 + i * 10) + '" stroke="#8a8f99" stroke-width="2"/>'; }).join('') +
          '<rect x="96" y="54" width="48" height="16" rx="6" fill="' + c + '"/><rect x="102" y="196" width="36" height="12" rx="4" fill="#352C3C"/>';
      } else if (acc === 'cable') {
        body = '<path d="M70 70 C 70 170, 170 60, 170 170" fill="none" stroke="' + c + '" stroke-width="9" stroke-linecap="round"/>' +
          '<rect x="58" y="36" width="24" height="40" rx="6" fill="#3a3744"/><rect x="63" y="22" width="14" height="16" rx="3" fill="#c7cbd3"/>' +
          '<rect x="158" y="164" width="24" height="40" rx="6" fill="#3a3744"/><rect x="163" y="202" width="14" height="10" rx="3" fill="#c7cbd3"/>';
      } else if (acc === 'cotton') {
        body = '<rect x="70" y="110" width="100" height="96" rx="12" fill="' + c + '"/><text x="120" y="164" text-anchor="middle" font-family="Barlow Semi Condensed,sans-serif" font-size="11" font-weight="700" fill="#fff">COTTON</text>' +
          '<circle cx="96" cy="104" r="22" fill="#fff" stroke="#e0e0ea"/><circle cx="124" cy="92" r="26" fill="#fff" stroke="#e0e0ea"/><circle cx="148" cy="108" r="20" fill="#fff" stroke="#e0e0ea"/>';
      } else {
        body = '<rect x="58" y="70" width="124" height="136" rx="14" fill="#352C3C"/><rect x="68" y="80" width="104" height="116" rx="8" fill="' + shade(c, 0.1) + '"/>' +
          '<rect x="80" y="92" width="8" height="92" rx="4" fill="#c7cbd3"/><rect x="96" y="92" width="8" height="92" rx="4" fill="#c7cbd3"/><rect x="112" y="92" width="6" height="92" rx="3" fill="#2E2735"/><rect x="126" y="92" width="10" height="70" rx="3" fill="#c7cbd3"/><rect x="144" y="92" width="16" height="16" rx="8" fill="#2E2735"/>';
      }
    }
    return '<svg class="art" viewBox="0 0 240 240" role="img" aria-label="' + FV.esc(p.name) + '">' + defs + shadow + '<g' + tf + '>' + body + '</g></svg>';
  };

  /* Márka „logó” – típográfiai wordmark a valódi logók helyett */
  FV.wordmark = function (b, size) {
    return '<span class="wm wm-' + b.style + (size ? ' wm-' + size : '') + '" style="--wm:' + b.color + '">' + FV.esc(b.name) + '</span>';
  };
})(window.FV);
