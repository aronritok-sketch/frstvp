/*
 * First Vape – prototípus: közös elemek (fejléc, mega menü, mobil menü, mini kosár, lábléc, korellenőrzés)
 * WordPress megfelelő: header.php / footer.php, Megjelenés → Menük (primary, footer-*), Walker a mega menühöz.
 */
(function (FV) {
  'use strict';
  var esc = FV.esc, t = FV.t;

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
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    cloud: '<path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18Z"/>',
    coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.5c-.5-1-1.4-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.9 2.5 2-1 2-2.5 2c-1.2 0-2.1-.5-2.6-1.5M12 6.5v1.5M12 16v1.5"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
    bolt: '<path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z"/>'
  };
  FV.icon = function (name, cls) {
    return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  };
  var I = FV.icon;

  FV.logo = function () {
    return '<a class="logo" href="#/" aria-label="' + esc(t('logoAria')) + '">' +
      '<img class="logo-img" src="' + FV.asset('img/first-vape-logo.png') + '" alt="First Vape" width="791" height="99"></a>';
  };

  /* ---------- Fejléc ---------- */
  function megaFor(item) {
    if (item.brands) {
      return '<div class="mega mega-brands"><div class="wrap mega-in">' +
        '<div class="mega-col mega-wide"><p class="mega-h">' + t('allBrandsAZ') + '</p><div class="brand-grid">' +
        FV.brands.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (b) {
          return '<a class="brand-tile" href="#/marka/' + b.slug + '">' + FV.wordmark(b, 'sm') + '<small>' + FV.nw('wProducts', FV.productsOfBrand(b.slug).length) + '</small></a>';
        }).join('') + '</div></div>' +
        '<div class="mega-col mega-promo"><p class="mega-h">' + t('featuredBrand') + '</p>' + promo(FV.product('elfa-pro-kit-black'), t('elfaPromoTitle'), t('elfaPromoText')) + '</div>' +
        '</div></div>';
    }
    if (!item.cat) return '';
    var c = FV.cat(item.cat).node, prods = FV.productsInCat(c.slug);
    var brands = {};
    prods.forEach(function (p) { brands[p.brand] = (brands[p.brand] || 0) + 1; });
    var feat = prods.filter(function (p) { return p.stock === 'instock'; }).sort(function (a, b) { return b.pop - a.pop; })[0];
    var sub = '<div class="mega-col"><p class="mega-h">' + t('subcats') + '</p><ul class="mega-list">' +
      c.children.map(function (ch) {
        return '<li><a href="#/kategoria/' + ch.slug + '">' + esc(ch.name) + '<span class="cnt">' + FV.productsInCat(ch.slug).length + '</span></a></li>';
      }).join('') + '<li class="mega-all"><a href="#/kategoria/' + c.slug + '">' + t('seeAll') + ' ' + I('chev') + '</a></li></ul></div>';
    var puff = item.puffLinks ? '<div class="mega-col"><p class="mega-h">' + t('byPuffs') + '</p><div class="puff-chips">' +
      [600, 5000, 10000, 20000, 30000, 40000].map(function (n) {
        return '<a class="puff-chip" href="#/kategoria/eldobhato?puff=' + n + '"><b>' + FV.num(n) + '</b><span>' + t('puffUnit') + '</span></a>';
      }).join('') + '</div></div>' : '';
    var br = '<div class="mega-col"><p class="mega-h">' + t('brandsInCat') + '</p><ul class="mega-list">' +
      Object.keys(brands).map(function (s) {
        var b = FV.brand(s);
        return '<li><a href="#/kategoria/' + c.slug + '?marka=' + s + '">' + esc(b.name) + '<span class="cnt">' + brands[s] + '</span></a></li>';
      }).join('') + '</ul></div>';
    return '<div class="mega"><div class="wrap mega-in">' + sub + puff + br +
      '<div class="mega-col mega-promo"><p class="mega-h">' + t('popularNow') + '</p>' + (feat ? promo(feat) : '') + '</div></div></div>';
  }

  function promo(p, title, text) {
    return '<a class="promo-card" href="#/termek/' + p.slug + '" style="--tint:' + FV.tint(p) + '">' +
      '<span class="promo-art">' + FV.art(p) + '</span><span class="promo-txt"><b>' + esc(title || p.name) + '</b>' +
      '<small>' + esc(text || FV.money(FV.price(p))) + '</small></span></a>';
  }

  function menuLabel(m) { return m.cat ? FV.cat(m.cat).name : t(m.lk); }
  FV.menuLabel = menuLabel;

  /* Nyelv- és piacváltó (SK / FR). WordPressben: WPML / Polylang nyelvváltó, piaconként saját URL-lel. */
  function langSwitch(cls) {
    var names = { sk: 'Slovensko – slovenčina', fr: 'France – français' };
    return '<div class="lang-sw ' + cls + '" role="group" aria-label="' + esc(t('langAria')) + '">' + FV.LANGS.map(function (l) {
      return '<button type="button" data-act="set-lang" data-lang="' + l + '" lang="' + l + '" title="' + names[l] + '"' + (l === FV.lang ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + '>' + l.toUpperCase() + '</button>';
    }).join('') + '</div>';
  }
  FV.langSwitch = langSwitch;

  FV.renderHeader = function () {
    var nav = FV.menu.map(function (m, i) {
      var href = m.href || (m.cat ? '#/kategoria/' + m.cat : '#/markak');
      var hasMega = !!(m.cat || m.brands);
      return '<li class="nav-item' + (hasMega ? ' has-mega' : '') + (m.sale ? ' is-sale' : '') + '" data-nav="' + i + '">' +
        '<a class="nav-link" href="' + href + '"' + (hasMega ? ' aria-haspopup="true" aria-expanded="false"' : '') + '>' + esc(menuLabel(m)) + (hasMega ? I('down', 'nav-caret') : '') + '</a>' +
        (hasMega ? megaFor(m) : '') + '</li>';
    }).join('');
    var free = FV.money(FV.ship().freeOver);
    var msg = FV.lang === 'sk'
      ? 'Doručenie DPD za 1–2 pracovné dni · Doprava zadarmo nad <b>' + free + '</b>'
      : 'Expédition depuis la Slovaquie · Livraison offerte dès <b>' + free + '</b>';

    return '<div class="topbar"><div class="wrap topbar-in">' +
      '<p class="tb-msg">' + I('truck') + '<span>' + msg + '</span></p>' +
      '<p class="tb-age"><span class="age-pill">18+</span> ' + t('age18') + '</p>' +
      '<nav class="tb-links" aria-label="' + esc(t('moreLinksAria')) + '"><a href="#/blog">' + t('blog') + '</a><a href="#/oldal/shipping">' + esc(FV.pageTitle('shipping')) + '</a><a href="#/oldal/contact">' + t('contact') + '</a></nav>' +
      langSwitch('tb-lang') +
      '</div></div>' +
      '<header class="hdr"><div class="wrap hdr-in">' +
      '<button class="icon-btn hdr-burger" type="button" data-act="menu-open" aria-label="' + esc(t('menuOpen')) + '">' + I('menu') + '</button>' +
      FV.logo() +
      '<form class="hsearch" role="search" data-search-form autocomplete="off">' +
      '<label class="sr" for="hsearch-q">' + t('searchLabel') + '</label>' +
      I('search', 'hs-ico') +
      '<input id="hsearch-q" name="q" type="search" placeholder="' + esc(t('searchPh')) + '" data-live-search>' +
      '<button class="hs-btn" type="submit">' + t('searchBtn') + '</button>' +
      '<div class="hs-drop" hidden></div></form>' +
      '<nav class="hdr-acts" aria-label="' + esc(t('acctCartAria')) + '">' +
      '<a class="hact" href="#/fiok">' + I('user') + '<span>' + t('account') + '</span></a>' +
      '<a class="hact" href="#/fiok/kedvencek">' + I('heart') + '<span>' + t('wishlist') + '</span><em class="badge" data-wish-count>0</em></a>' +
      '<button class="hact hact-cart" type="button" data-act="cart-open" aria-label="' + esc(t('cart')) + '">' + I('bag') + '<span data-cart-total>' + FV.money(0) + '</span><em class="badge" data-cart-count>0</em></button>' +
      '</nav></div>' +
      '<nav class="mainnav" aria-label="' + esc(t('mainNavAria')) + '"><div class="wrap"><ul class="nav-list">' + nav + '</ul></div></nav>' +
      '</header>' +
      mobileMenu() + miniCart();
  };

  function mobileMenu() {
    var items = FV.menu.map(function (m) {
      if (m.cat) {
        var c = FV.cat(m.cat).node;
        return '<li><details><summary>' + esc(menuLabel(m)) + I('down') + '</summary><ul>' +
          '<li><a href="#/kategoria/' + c.slug + '">' + t('seeAll') + ': ' + esc(c.short) + '</a></li>' +
          c.children.map(function (ch) { return '<li><a href="#/kategoria/' + ch.slug + '">' + esc(ch.name) + '</a></li>'; }).join('') +
          (m.puffLinks ? '<li class="mm-puffs">' + [600, 5000, 10000, 20000, 40000].map(function (n) { return '<a class="puff-chip sm" href="#/kategoria/eldobhato?puff=' + n + '"><b>' + FV.num(n) + '</b></a>'; }).join('') + '</li>' : '') +
          '</ul></details></li>';
      }
      if (m.brands) {
        return '<li><details><summary>' + t('brands') + I('down') + '</summary><ul>' +
          FV.brands.map(function (b) { return '<li><a href="#/marka/' + b.slug + '">' + esc(b.name) + '</a></li>'; }).join('') +
          '<li><a href="#/markak">' + t('allBrands') + '</a></li></ul></details></li>';
      }
      return '<li><a class="mm-link' + (m.sale ? ' is-sale' : '') + '" href="' + m.href + '">' + esc(menuLabel(m)) + '</a></li>';
    }).join('');
    return '<div class="drawer drawer-left" data-drawer="menu" hidden><div class="drawer-scrim" data-act="drawer-close"></div>' +
      '<aside class="drawer-panel" aria-label="' + esc(t('mobileMenuAria')) + '"><div class="drawer-head">' + FV.logo() +
      '<button class="icon-btn" type="button" data-act="drawer-close" aria-label="' + esc(t('close')) + '">' + I('close') + '</button></div>' +
      '<ul class="mm">' + items + '</ul>' +
      '<ul class="mm mm-sec"><li><a href="#/fiok">' + I('user') + ' ' + t('myAccount') + '</a></li><li><a href="#/fiok/rendelesek">' + I('box') + ' ' + t('myOrders') + '</a></li><li><a href="#/fiok/kedvencek">' + I('heart') + ' ' + t('wishlist') + '</a></li><li><a href="#/blog">' + I('star') + ' ' + t('blog') + '</a></li><li><a href="#/oldal/contact">' + I('mail') + ' ' + t('contact') + '</a></li></ul>' +
      '<div class="mm-lang"><span>' + t('langAria') + '</span>' + langSwitch('mm-lang-sw') + '</div>' +
      '</aside></div>';
  }

  function miniCart() {
    return '<div class="drawer drawer-right" data-drawer="cart" hidden><div class="drawer-scrim" data-act="drawer-close"></div>' +
      '<aside class="drawer-panel" aria-label="' + esc(t('cart')) + '"><div class="drawer-head"><p class="drawer-title">' + t('cart') + '</p>' +
      '<button class="icon-btn" type="button" data-act="drawer-close" aria-label="' + esc(t('close')) + '">' + I('close') + '</button></div>' +
      '<div class="mc-body" data-minicart></div></aside></div>';
  }

  FV.renderMiniCart = function () {
    var tt = FV.cart.totals(), el = FV.$('[data-minicart]');
    FV.$$('[data-cart-count]').forEach(function (e) { e.textContent = tt.count; e.hidden = !tt.count; });
    FV.$$('[data-cart-total]').forEach(function (e) { e.textContent = FV.money(tt.sub); });
    FV.$$('[data-wish-count]').forEach(function (e) { var n = FV.wish.ids().length; e.textContent = n; e.hidden = !n; });
    if (!el) return;
    if (!tt.lines.length) {
      el.innerHTML = '<div class="empty">' + I('bag', 'empty-ico') + '<p>' + t('cartEmpty') + '</p><a class="btn" href="#/kategoria/eldobhato" data-act="drawer-close">' + t('startShopping') + '</a></div>';
      return;
    }
    var left = FV.ship().freeOver - tt.sub;
    el.innerHTML = '<div class="freebar"><p>' + (left > 0 ? t('freeLeft', { x: FV.money(left) }) : t('freeReached')) + '</p>' +
      '<span class="freebar-track"><i style="width:' + Math.min(100, tt.sub / FV.ship().freeOver * 100) + '%"></i></span></div>' +
      '<ul class="mc-list">' + tt.lines.map(function (l, i) {
        return '<li class="mc-item"><a class="mc-art" href="#/termek/' + l.p.slug + '" style="--tint:' + FV.tint(l.p) + '">' + FV.art(l.p) + '</a>' +
          '<div class="mc-info"><a href="#/termek/' + l.p.slug + '">' + esc(l.p.name) + '</a>' + variantText(l.v) +
          '<div class="mc-row">' + qtyCtl(i, l.qty) + '<b class="num">' + FV.money(l.total) + '</b></div></div></li>';
      }).join('') + '</ul>' +
      '<div class="mc-foot"><p class="mc-sum"><span>' + t('subtotal') + '</span><b class="num">' + FV.money(tt.sub) + '</b></p>' +
      '<p class="mc-weight">' + I('scale') + ' ' + t('parcelWeight') + ': <b class="num">' + FV.kg(tt.weight) + '</b></p>' +
      '<a class="btn btn-ghost" href="#/kosar" data-act="drawer-close">' + t('viewCart') + '</a>' +
      '<a class="btn btn-primary" href="#/penztar" data-act="drawer-close">' + t('toCheckout') + '</a></div>';
  };

  function variantText(v) {
    var k = Object.keys(v || {});
    if (!k.length) return '';
    var names = { iz: t('a_iz'), nikotin: t('a_nikotinShort'), szin: t('a_szin') };
    return '<small class="variant">' + k.map(function (x) { return (names[x] || x) + ': ' + esc(x === 'szin' ? FV.colorName(v[x]) : v[x]); }).join(' · ') + '</small>';
  }
  FV.variantText = variantText;

  function qtyCtl(idx, q) {
    return '<span class="qty qty-sm"><button type="button" data-act="line-qty" data-i="' + idx + '" data-d="-1" aria-label="' + esc(t('decrease')) + '">' + I('minus') + '</button>' +
      '<b class="num">' + q + '</b><button type="button" data-act="line-qty" data-i="' + idx + '" data-d="1" aria-label="' + esc(t('increase')) + '">' + I('plus') + '</button></span>';
  }
  FV.qtyCtl = qtyCtl;

  /* ---------- Lábléc ---------- */
  FV.renderFooter = function () {
    var pages = FV.pageList().filter(function (k) { return k !== 'contact'; }), short = t('pageShort') || {};
    return '<section class="newsletter"><div class="wrap nl-in"><div><h2>' + t('nlTitle') + '</h2>' +
      '<p>' + t('nlText') + '</p></div>' +
      '<form class="nl-form" data-newsletter><label class="sr" for="nl-mail">' + t('email') + '</label><input id="nl-mail" type="email" required placeholder="' + esc(t('emailPh')) + '">' +
      '<button class="btn btn-primary" type="submit">' + t('subscribe') + '</button>' +
      '<label class="nl-ok"><input id="nl-accept" type="checkbox" required><span>' + t('nlAccept') + '</span></label></form></div></section>' +
      '<footer class="ftr"><div class="wrap ftr-grid">' +
      '<div class="ftr-brand">' + FV.logo() + '<p>' + t('ftrAbout') + '</p>' +
      '<div class="social"><a href="#/prototipus" aria-label="Facebook">f</a><a href="#/prototipus" aria-label="Instagram">ig</a><a href="#/prototipus" aria-label="TikTok">tt</a></div></div>' +
      '<div><p class="ftr-h">' + t('products') + '</p><ul>' + FV.categories.map(function (c) { return '<li><a href="#/kategoria/' + c.slug + '">' + esc(c.name) + '</a></li>'; }).join('') +
      '<li><a href="#/markak">' + t('brands') + '</a></li><li><a href="#/akciok">' + t('sale') + '</a></li></ul></div>' +
      '<div><p class="ftr-h">' + t('info') + '</p><ul>' +
      pages.map(function (k) { return '<li><a href="#/oldal/' + k + '">' + esc(short[k] || FV.pageTitle(k)) + '</a></li>'; }).join('') + '</ul></div>' +
      '<div><p class="ftr-h">' + t('customer') + '</p><ul><li><a href="#/oldal/contact">' + t('contact') + '</a></li><li><a href="#/fiok">' + t('myAccount') + '</a></li><li><a href="#/fiok/rendelesek">' + t('orders') + '</a></li><li><a href="#/fiok/kedvencek">' + t('wishlist') + '</a></li></ul></div>' +
      '</div><div class="wrap ftr-pay"><div class="pay-badges"><span>Teya</span><span>VISA</span><span>Mastercard</span><span>Apple Pay</span><span>Google Pay</span>' + (FV.mkt().carrier ? '<span class="dpd">' + FV.mkt().carrier + '</span>' : '') + '</div>' +
      '<p class="warn-line">' + t('nicWarn') + '</p></div>' +
      '<div class="wrap ftr-bottom"><p>© 2026 First Vape · John&amp;Jen s.r.o.</p><p>' + t('madeBy') + '</p></div></footer>';
  };

  /* ---------- Korellenőrzés (18+) ---------- */
  FV.renderAgeGate = function () {
    if (FV.store.get('age_ok', false)) return '';
    return '<div class="agegate" data-agegate role="dialog" aria-modal="true" aria-labelledby="age-t"><div class="ag-card">' +
      langSwitch('ag-lang') +
      '<img class="ag-logo" src="' + FV.asset('img/first-vape-logo.png') + '" alt="First Vape" width="791" height="99"><span class="age-pill big">18+</span><h2 id="age-t">' + t('ageQ') + '</h2>' +
      '<p>' + t('ageText') + '</p>' +
      '<div class="ag-acts"><button class="btn btn-primary" type="button" data-act="age-yes">' + t('ageYes') + '</button>' +
      '<button class="btn btn-ghost" type="button" data-act="age-no">' + t('ageNo') + '</button></div>' +
      '<p class="ag-no" hidden>' + t('ageDenied') + '</p></div></div>';
  };

  /* ---------- Élő kereső lenyíló ---------- */
  FV.renderLiveSearch = function (q) {
    var res = FV.search(q).slice(0, 5), sug = FV.suggest(q);
    if (!res.length && !sug.length) return '<p class="hs-empty">' + t('lsNone', { q: esc(q) }) + '</p>';
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
      '<a class="hs-all" href="#/kereses/' + encodeURIComponent(q) + '">' + t('lsAll', { n: FV.search(q).length }) + ' ' + I('chev') + '</a>';
  };
})(window.FV);
