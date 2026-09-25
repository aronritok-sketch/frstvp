/*
 * First Vape – prototípus: közös elemek (fejléc, mega menü, mobil menü, mini kosár, lábléc, korellenőrzés)
 * WordPress megfelelő: header.php / footer.php, Megjelenés → Menük (primary, footer-*), Walker a mega menühöz.
 */
(function (FV) {
  'use strict';
  var esc = FV.esc;

  /* ---------- Ikonok ---------- */
  var P = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
    heart: '<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9Z"/>',
    bag: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    box: '<path d="M3 7l9-4 9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/>',
    scale: '<path d="M12 4v16M5 20h14"/><path d="M5 8h14l-3 6h-8L5 8Z" transform="translate(0 -1)"/>',
    bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2Z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    pin: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>'
  };
  FV.icon = function (name, cls) {
    return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  };
  var I = FV.icon;

  FV.logo = function () {
    return '<a class="logo" href="#/" aria-label="First Vape – főoldal">' +
      '<span class="logo-mark" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<span class="logo-word">first<b>vape</b></span></a>';
  };

  /* ---------- Fejléc ---------- */
  function megaFor(item) {
    if (item.brands) {
      return '<div class="mega mega-brands"><div class="wrap mega-in">' +
        '<div class="mega-col mega-wide"><p class="mega-h">Összes márka A–Z</p><div class="brand-grid">' +
        FV.brands.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (b) {
          return '<a class="brand-tile" href="#/marka/' + b.slug + '">' + FV.wordmark(b, 'sm') + '<small>' + FV.productsOfBrand(b.slug).length + ' termék</small></a>';
        }).join('') + '</div></div>' +
        '<div class="mega-col mega-promo"><p class="mega-h">Kiemelt márka</p>' + promo(FV.product('elfa-pro-kit-black'), 'ELFA pod rendszer', 'Egy akkumulátor, 3 szín, több tucat pod íz.') + '</div>' +
        '</div></div>';
    }
    if (!item.cat) return '';
    var c = FV.cat(item.cat).node, prods = FV.productsInCat(c.slug);
    var brands = {};
    prods.forEach(function (p) { brands[p.brand] = (brands[p.brand] || 0) + 1; });
    var feat = prods.filter(function (p) { return p.stock === 'instock'; }).sort(function (a, b) { return b.pop - a.pop; })[0];
    var sub = '<div class="mega-col"><p class="mega-h">Alkategóriák</p><ul class="mega-list">' +
      c.children.map(function (ch) {
        return '<li><a href="#/kategoria/' + ch.slug + '">' + esc(ch.name) + '<span class="cnt">' + FV.productsInCat(ch.slug).length + '</span></a></li>';
      }).join('') + '<li class="mega-all"><a href="#/kategoria/' + c.slug + '">Összes ' + esc(c.short.toLowerCase()) + ' ' + I('chev') + '</a></li></ul></div>';
    var puff = item.puffLinks ? '<div class="mega-col"><p class="mega-h">Keresés slukkszám szerint</p><div class="puff-chips">' +
      [600, 5000, 10000, 20000, 30000, 40000].map(function (n) {
        return '<a class="puff-chip" href="#/kategoria/eldobhato?puff=' + n + '"><b>' + FV.num(n) + '</b><span>puff</span></a>';
      }).join('') + '</div></div>' : '';
    var br = '<div class="mega-col"><p class="mega-h">Márkák ebben a kategóriában</p><ul class="mega-list">' +
      Object.keys(brands).map(function (s) {
        var b = FV.brand(s);
        return '<li><a href="#/kategoria/' + c.slug + '?marka=' + s + '">' + esc(b.name) + '<span class="cnt">' + brands[s] + '</span></a></li>';
      }).join('') + '</ul></div>';
    return '<div class="mega"><div class="wrap mega-in">' + sub + puff + br +
      '<div class="mega-col mega-promo"><p class="mega-h">Most népszerű</p>' + (feat ? promo(feat) : '') + '</div></div></div>';
  }

  function promo(p, title, text) {
    return '<a class="promo-card" href="#/termek/' + p.slug + '" style="--tint:' + FV.tint(p) + '">' +
      '<span class="promo-art">' + FV.art(p) + '</span><span class="promo-txt"><b>' + esc(title || p.name) + '</b>' +
      '<small>' + esc(text || FV.money(FV.price(p))) + '</small></span></a>';
  }

  FV.renderHeader = function () {
    var nav = FV.menu.map(function (m, i) {
      var href = m.href || (m.cat ? '#/kategoria/' + m.cat : '#/markak');
      var hasMega = !!(m.cat || m.brands);
      return '<li class="nav-item' + (hasMega ? ' has-mega' : '') + (m.sale ? ' is-sale' : '') + '" data-nav="' + i + '">' +
        '<a class="nav-link" href="' + href + '"' + (hasMega ? ' aria-haspopup="true" aria-expanded="false"' : '') + '>' + esc(m.label) + (hasMega ? I('down', 'nav-caret') : '') + '</a>' +
        (hasMega ? megaFor(m) : '') + '</li>';
    }).join('');

    return '<div class="topbar"><div class="wrap topbar-in">' +
      '<p class="tb-msg">' + I('truck') + '<span>DPD szállítás 1–2 munkanap alatt · Ingyenes szállítás <b>50 €</b> felett</span></p>' +
      '<p class="tb-age"><span class="age-pill">18+</span> Csak nagykorúak részére</p>' +
      '<div class="tb-lang" role="group" aria-label="Nyelv és piac"><a href="#/prototipus" title="Szlovák piac">SK</a><a class="on" href="#/prototipus" title="Magyar">HU</a><a href="#/prototipus" title="Angol">EN</a></div>' +
      '</div></div>' +
      '<header class="hdr"><div class="wrap hdr-in">' +
      '<button class="icon-btn hdr-burger" type="button" data-act="menu-open" aria-label="Menü megnyitása">' + I('menu') + '</button>' +
      FV.logo() +
      '<form class="hsearch" role="search" data-search-form autocomplete="off">' +
      '<label class="sr" for="hsearch-q">Keresés a termékek között</label>' +
      I('search', 'hs-ico') +
      '<input id="hsearch-q" name="q" type="search" placeholder="Márka, íz, puff szám… pl. Elfbar 40000" data-live-search>' +
      '<button class="hs-btn" type="submit">Keresés</button>' +
      '<div class="hs-drop" hidden></div></form>' +
      '<nav class="hdr-acts" aria-label="Fiók és kosár">' +
      '<a class="hact" href="#/fiok">' + I('user') + '<span>Fiók</span></a>' +
      '<a class="hact" href="#/fiok/kedvencek">' + I('heart') + '<span>Kedvencek</span><em class="badge" data-wish-count>0</em></a>' +
      '<button class="hact hact-cart" type="button" data-act="cart-open">' + I('bag') + '<span data-cart-total>0,00 €</span><em class="badge" data-cart-count>0</em></button>' +
      '</nav></div>' +
      '<nav class="mainnav" aria-label="Fő navigáció"><div class="wrap"><ul class="nav-list">' + nav + '</ul></div></nav>' +
      '</header>' +
      mobileMenu() + miniCart();
  };

  function mobileMenu() {
    var items = FV.menu.map(function (m) {
      if (m.cat) {
        var c = FV.cat(m.cat).node;
        return '<li><details><summary>' + esc(m.label) + I('down') + '</summary><ul>' +
          '<li><a href="#/kategoria/' + c.slug + '">Összes ' + esc(c.short.toLowerCase()) + '</a></li>' +
          c.children.map(function (ch) { return '<li><a href="#/kategoria/' + ch.slug + '">' + esc(ch.name) + '</a></li>'; }).join('') +
          (m.puffLinks ? '<li class="mm-puffs">' + [600, 5000, 10000, 20000, 40000].map(function (n) { return '<a class="puff-chip sm" href="#/kategoria/eldobhato?puff=' + n + '"><b>' + FV.num(n) + '</b></a>'; }).join('') + '</li>' : '') +
          '</ul></details></li>';
      }
      if (m.brands) {
        return '<li><details><summary>Márkák' + I('down') + '</summary><ul>' +
          FV.brands.map(function (b) { return '<li><a href="#/marka/' + b.slug + '">' + esc(b.name) + '</a></li>'; }).join('') +
          '<li><a href="#/markak">Összes márka</a></li></ul></details></li>';
      }
      return '<li><a class="mm-link' + (m.sale ? ' is-sale' : '') + '" href="' + m.href + '">' + esc(m.label) + '</a></li>';
    }).join('');
    return '<div class="drawer drawer-left" data-drawer="menu" hidden><div class="drawer-scrim" data-act="drawer-close"></div>' +
      '<aside class="drawer-panel" aria-label="Mobil menü"><div class="drawer-head">' + FV.logo() +
      '<button class="icon-btn" type="button" data-act="drawer-close" aria-label="Bezárás">' + I('close') + '</button></div>' +
      '<ul class="mm">' + items + '</ul>' +
      '<ul class="mm mm-sec"><li><a href="#/fiok">' + I('user') + ' Fiókom</a></li><li><a href="#/fiok/rendelesek">' + I('box') + ' Rendeléseim</a></li><li><a href="#/fiok/kedvencek">' + I('heart') + ' Kedvencek</a></li><li><a href="#/oldal/kapcsolat">' + I('mail') + ' Kapcsolat</a></li></ul>' +
      '</aside></div>';
  }

  function miniCart() {
    return '<div class="drawer drawer-right" data-drawer="cart" hidden><div class="drawer-scrim" data-act="drawer-close"></div>' +
      '<aside class="drawer-panel" aria-label="Kosár"><div class="drawer-head"><p class="drawer-title">Kosár</p>' +
      '<button class="icon-btn" type="button" data-act="drawer-close" aria-label="Bezárás">' + I('close') + '</button></div>' +
      '<div class="mc-body" data-minicart></div></aside></div>';
  }

  FV.renderMiniCart = function () {
    var t = FV.cart.totals(), el = FV.$('[data-minicart]');
    FV.$$('[data-cart-count]').forEach(function (e) { e.textContent = t.count; e.hidden = !t.count; });
    FV.$$('[data-cart-total]').forEach(function (e) { e.textContent = FV.money(t.sub); });
    FV.$$('[data-wish-count]').forEach(function (e) { var n = FV.wish.ids().length; e.textContent = n; e.hidden = !n; });
    if (!el) return;
    if (!t.lines.length) {
      el.innerHTML = '<div class="empty">' + I('bag', 'empty-ico') + '<p>A kosár üres.</p><a class="btn" href="#/kategoria/eldobhato" data-act="drawer-close">Vásárlás indítása</a></div>';
      return;
    }
    var left = FV.shipping.freeOver - t.sub;
    el.innerHTML = '<div class="freebar"><p>' + (left > 0 ? 'Még <b>' + FV.money(left) + '</b> és ingyenes a szállítás' : '<b>Ingyenes szállítás</b> jár a rendelésedhez') + '</p>' +
      '<span class="freebar-track"><i style="width:' + Math.min(100, t.sub / FV.shipping.freeOver * 100) + '%"></i></span></div>' +
      '<ul class="mc-list">' + t.lines.map(function (l, i) {
        return '<li class="mc-item"><a class="mc-art" href="#/termek/' + l.p.slug + '" style="--tint:' + FV.tint(l.p) + '">' + FV.art(l.p) + '</a>' +
          '<div class="mc-info"><a href="#/termek/' + l.p.slug + '">' + esc(l.p.name) + '</a>' + variantText(l.v) +
          '<div class="mc-row">' + qtyCtl(i, l.qty) + '<b class="num">' + FV.money(l.total) + '</b></div></div></li>';
      }).join('') + '</ul>' +
      '<div class="mc-foot"><p class="mc-sum"><span>Részösszeg</span><b class="num">' + FV.money(t.sub) + '</b></p>' +
      '<p class="mc-weight">' + I('scale') + ' Csomag súlya: <b class="num">' + FV.kg(t.weight) + '</b></p>' +
      '<a class="btn btn-ghost" href="#/kosar" data-act="drawer-close">Kosár megtekintése</a>' +
      '<a class="btn btn-primary" href="#/penztar" data-act="drawer-close">Tovább a pénztárhoz</a></div>';
  };

  function variantText(v) {
    var k = Object.keys(v || {});
    if (!k.length) return '';
    var names = { iz: 'Íz', nikotin: 'Nikotin', szin: 'Szín' };
    return '<small class="variant">' + k.map(function (x) { return (names[x] || x) + ': ' + esc(v[x]); }).join(' · ') + '</small>';
  }
  FV.variantText = variantText;

  function qtyCtl(idx, q) {
    return '<span class="qty qty-sm"><button type="button" data-act="line-qty" data-i="' + idx + '" data-d="-1" aria-label="Csökkentés">' + I('minus') + '</button>' +
      '<b class="num">' + q + '</b><button type="button" data-act="line-qty" data-i="' + idx + '" data-d="1" aria-label="Növelés">' + I('plus') + '</button></span>';
  }
  FV.qtyCtl = qtyCtl;

  /* ---------- Lábléc ---------- */
  FV.renderFooter = function () {
    return '<section class="newsletter"><div class="wrap nl-in"><div><h2>Új ízek és akciók elsőként</h2>' +
      '<p>Havonta legfeljebb két levél. Bármikor leiratkozhatsz.</p></div>' +
      '<form class="nl-form" data-newsletter><label class="sr" for="nl-mail">E-mail cím</label><input id="nl-mail" type="email" required placeholder="nev@email.hu">' +
      '<button class="btn btn-primary" type="submit">Feliratkozom</button>' +
      '<label class="nl-ok"><input id="nl-accept" type="checkbox" required><span>Elfogadom az <a href="#/oldal/adatvedelem">adatkezelési tájékoztatót</a>, és elmúltam 18 éves.</span></label></form></div></section>' +
      '<footer class="ftr"><div class="wrap ftr-grid">' +
      '<div class="ftr-brand">' + FV.logo() + '<p>Prémium e-cigaretták, podok és liquidek, eredeti forrásból. Szlovákiai raktárból, DPD-vel szállítva.</p>' +
      '<div class="social"><a href="#/prototipus" aria-label="Facebook">f</a><a href="#/prototipus" aria-label="Instagram">ig</a><a href="#/prototipus" aria-label="TikTok">tt</a></div></div>' +
      '<div><p class="ftr-h">Termékek</p><ul>' + FV.categories.map(function (c) { return '<li><a href="#/kategoria/' + c.slug + '">' + esc(c.name) + '</a></li>'; }).join('') +
      '<li><a href="#/markak">Márkák</a></li><li><a href="#/akciok">Akciók</a></li></ul></div>' +
      '<div><p class="ftr-h">Információ</p><ul>' +
      ['szallitas-es-fizetes', 'aszf', 'adatvedelem', 'elallas', 'cookie'].map(function (k) { return '<li><a href="#/oldal/' + k + '">' + esc(FV.pages[k].replace('Általános Szerződési Feltételek', 'ÁSZF').replace('Adatvédelmi tájékoztató', 'Adatvédelem')) + '</a></li>'; }).join('') + '</ul></div>' +
      '<div><p class="ftr-h">Ügyfél</p><ul><li><a href="#/oldal/kapcsolat">Kapcsolat</a></li><li><a href="#/fiok">Felhasználói fiók</a></li><li><a href="#/fiok/rendelesek">Rendelések</a></li><li><a href="#/fiok/kedvencek">Kedvencek</a></li></ul></div>' +
      '</div><div class="wrap ftr-pay"><div class="pay-badges"><span>Teya</span><span>VISA</span><span>Mastercard</span><span>Apple Pay</span><span>Google Pay</span><span class="dpd">DPD</span></div>' +
      '<p class="warn-line">Ez a termék nikotint tartalmaz, amely erős függőséget okozó anyag. Használata nemdohányzók számára nem javasolt.</p></div>' +
      '<div class="wrap ftr-bottom"><p>© 2026 First Vape · John&amp;Jen s.r.o.</p><p>Készítette: Ideastyle ProVision</p></div></footer>';
  };

  /* ---------- Korellenőrzés (18+) ---------- */
  FV.renderAgeGate = function () {
    if (FV.store.get('age_ok', false)) return '';
    return '<div class="agegate" data-agegate role="dialog" aria-modal="true" aria-labelledby="age-t"><div class="ag-card">' +
      '<span class="age-pill big">18+</span><h2 id="age-t">Elmúltál 18 éves?</h2>' +
      '<p>A First Vape oldalain nikotintartalmú termékek szerepelnek, amelyek csak nagykorúak számára vásárolhatók meg.</p>' +
      '<div class="ag-acts"><button class="btn btn-primary" type="button" data-act="age-yes">Igen, elmúltam 18 éves</button>' +
      '<button class="btn btn-ghost" type="button" data-act="age-no">Nem</button></div>' +
      '<p class="ag-no" hidden>Sajnáljuk, az oldal tartalma számodra nem elérhető.</p></div></div>';
  };

  /* ---------- Élő kereső lenyíló ---------- */
  FV.renderLiveSearch = function (q) {
    var res = FV.search(q).slice(0, 5), sug = FV.suggest(q);
    if (!res.length && !sug.length) return '<p class="hs-empty">Nincs találat erre: <b>' + esc(q) + '</b>. Próbáld márkával vagy puff számmal.</p>';
    return (sug.length ? '<div class="hs-sug">' + sug.map(function (s) {
      return '<a href="' + s.href + '"><em>' + esc(s.type) + '</em>' + esc(s.label) + '</a>';
    }).join('') + '</div>' : '') +
      '<ul class="hs-res">' + res.map(function (p) {
        var a = p.attrs;
        var meta = [FV.brand(p.brand).name].concat((a.puff || []).map(FV.puffLabel), a.nikotin || [], a.iz || []).slice(0, 4).join(' · ');
        return '<li><a href="#/termek/' + p.slug + '"><span class="hs-art" style="--tint:' + FV.tint(p) + '">' + FV.art(p) + '</span>' +
          '<span class="hs-txt"><b>' + esc(p.name) + '</b><small>' + esc(meta) + '</small></span>' +
          '<span class="hs-price num">' + FV.money(FV.price(p)) + '</span></a></li>';
      }).join('') + '</ul>' +
      '<a class="hs-all" href="#/kereses/' + encodeURIComponent(q) + '">Összes találat (' + FV.search(q).length + ') ' + I('chev') + '</a>';
  };
})(window.FV);
