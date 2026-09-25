/*
 * First Vape – prototípus: oldalnézetek
 * Minden nézet egy WooCommerce sablonnak felel meg (lásd #/prototipus oldal).
 */
(function (FV) {
  'use strict';
  var esc = FV.esc, I = FV.icon, money = FV.money;
  FV.views = {};

  function crumbs(list) {
    return '<nav class="crumbs" aria-label="Morzsamenü"><ol><li><a href="#/">Főoldal</a></li>' +
      list.map(function (c, i) {
        return '<li>' + (c.href && i < list.length - 1 ? '<a href="' + c.href + '">' + esc(c.label) + '</a>' : '<span aria-current="page">' + esc(c.label) + '</span>') + '</li>';
      }).join('') + '</ol></nav>';
  }

  function specsLine(p) {
    var a = p.attrs, out = [];
    (a.puff || []).slice(0, 1).forEach(function (x) { out.push(FV.puffLabel(x)); });
    if (a.nikotin && a.nikotin.length) out.push(a.nikotin.join(' / '));
    (a.ml || []).slice(0, 1).forEach(function (x) { out.push(x); });
    if (!out.length && a.kompat && a.kompat.length) out.push(a.kompat[0]);
    if (!out.length && a.szin && a.szin.length) out.push(a.szin.length + ' szín');
    return out;
  }

  function priceHtml(p, big) {
    return '<span class="price' + (big ? ' price-big' : '') + '">' +
      (p.sale ? '<del class="num">' + money(p.price) + '</del><ins class="num">' + money(p.sale) + '</ins>' : '<b class="num">' + money(p.price) + '</b>') + '</span>';
  }
  FV.priceHtml = priceHtml;

  function needsOptions(p) {
    return p.variable && ['nikotin', 'szin', 'iz'].some(function (k) { return (p.attrs[k] || []).length > 1; });
  }

  FV.card = function (p) {
    var st = FV.stockInfo(p), d = FV.discount(p), b = FV.brand(p.brand), wished = FV.wish.has(p.id);
    var badges = (d ? '<span class="bdg bdg-sale">−' + d + '%</span>' : '') +
      (p.stock === 'discontinued' ? '<span class="bdg bdg-disc">Kifutott</span>' : '') +
      (p.stock === 'outofstock' ? '<span class="bdg bdg-out">Készlethiány</span>' : '');
    var action;
    if (p.stock === 'instock') {
      action = needsOptions(p)
        ? '<a class="pc-add pc-opt" href="#/termek/' + p.slug + '">Opciók</a>'
        : '<button class="pc-add" type="button" data-act="add" data-id="' + p.id + '" aria-label="Kosárba: ' + esc(p.name) + '">' + I('plus') + '<span>Kosárba</span></button>';
    } else if (p.stock === 'outofstock') {
      action = '<a class="pc-add pc-notify" href="#/termek/' + p.slug + '">' + I('bell') + '<span>Értesítés</span></a>';
    } else {
      action = '<a class="pc-add pc-notify" href="#/termek/' + p.slug + '">Helyettesítő</a>';
    }
    return '<article class="pcard' + (p.stock !== 'instock' ? ' is-' + p.stock : '') + '">' +
      '<a class="pc-media" href="#/termek/' + p.slug + '" style="--tint:' + FV.tint(p) + '" tabindex="-1" aria-hidden="true">' + FV.art(p) + '</a>' +
      '<div class="pc-badges">' + badges + '</div>' +
      '<button class="pc-wish' + (wished ? ' on' : '') + '" type="button" data-act="wish" data-id="' + p.id + '" aria-pressed="' + wished + '" aria-label="Kedvencekhez: ' + esc(p.name) + '">' + I('heart') + '</button>' +
      '<div class="pc-body"><a class="pc-brand" href="#/marka/' + b.slug + '">' + esc(b.name) + '</a>' +
      '<h3 class="pc-name"><a href="#/termek/' + p.slug + '">' + esc(p.name) + '</a></h3>' +
      '<ul class="pc-specs">' + specsLine(p).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
      '<div class="pc-foot"><div>' + priceHtml(p) + '<span class="stock ' + st.cls + '">' + esc(st.short) + '</span></div>' + action + '</div></div></article>';
  };

  function grid(list, cls) {
    return '<div class="pgrid ' + (cls || '') + '">' + list.map(FV.card).join('') + '</div>';
  }

  function sectionHead(title, link, linkLabel, eyebrow) {
    return '<div class="sec-head"><div>' + (eyebrow ? '<p class="eyebrow">' + esc(eyebrow) + '</p>' : '') + '<h2>' + esc(title) + '</h2></div>' +
      (link ? '<a class="more" href="' + link + '">' + esc(linkLabel) + I('chev') + '</a>' : '') + '</div>';
  }

  /* ================= FŐOLDAL ================= */
  var PUFF_STEPS = [600, 5000, 10000, 20000, 30000, 40000];

  FV.views.home = function () {
    var sale = FV.products.filter(function (p) { return p.sale && p.stock === 'instock'; }).sort(function (a, b) { return FV.discount(b) - FV.discount(a); }).slice(0, 4);
    var elfaKit = FV.product('elfa-pro-kit-black');
    var elfaPods = FV.products.filter(function (p) { return FV.inCat(p, 'elfa-podok'); });
    var tabs = ['eldobhato', 'eloretoltott-podok', 'e-liquidek', 'keszulekek'];

    return '<section class="hero"><div class="wrap hero-in">' +
      '<div class="hero-copy"><p class="eyebrow">Eldobhatók · Podok · Liquidek</p>' +
      '<h1>Minden puff <span class="hl">számít.</span></h1>' +
      '<p class="lead">Eldobható e-cigaretták 600-tól 40&nbsp;000 puffig, ELFA és XROS podok, prémium liquidek. Eredeti termékek, 1–2 napos DPD szállítással.</p>' +
      '<div class="hero-cta"><a class="btn btn-primary btn-lg" href="#/kategoria/eldobhato">Eldobhatók böngészése</a><a class="btn btn-ghost btn-lg" href="#/akciok">Heti akciók</a></div>' +
      '<ul class="hero-facts"><li><b class="num">' + FV.products.length + '</b> termék</li><li><b class="num">' + FV.brands.length + '</b> márka</li><li><b class="num">1–2</b> nap DPD</li></ul></div>' +
      '<div class="pufffinder" data-pufffinder><p class="pf-label">Puff kereső</p>' +
      '<p class="pf-q">Hány slukkot szeretnél egy eszközből?</p>' +
      '<output class="pf-val num" id="pf-out" for="pf-range">20&nbsp;000</output><span class="pf-unit">puff</span>' +
      '<label class="sr" for="pf-range">Puff szám</label>' +
      '<input id="pf-range" class="pf-range" type="range" min="0" max="' + (PUFF_STEPS.length - 1) + '" step="1" value="3" data-pf-range>' +
      '<div class="pf-ticks" aria-hidden="true">' + PUFF_STEPS.map(function (n) { return '<span>' + (n >= 1000 ? n / 1000 + 'k' : n) + '</span>'; }).join('') + '</div>' +
      '<a class="btn btn-primary pf-go" href="#/kategoria/eldobhato?puff=20000" data-pf-go>Mutasd a <span data-pf-count>0</span> terméket</a></div>' +
      '</div></section>' +

      '<section class="wrap sec"><div class="catgrid">' + FV.categories.map(function (c) {
        var rep = FV.productsInCat(c.slug).sort(function (a, b) { return b.pop - a.pop; })[0];
        return '<a class="cattile" href="#/kategoria/' + c.slug + '" style="--tint:' + FV.shade(c.color, 0.86) + '">' +
          '<span class="ct-art">' + (rep ? FV.art(rep) : '') + '</span>' +
          '<span class="ct-txt"><b>' + esc(c.name) + '</b><small>' + FV.productsInCat(c.slug).length + ' termék · ' + c.children.length + ' alkategória</small></span>' + I('chev', 'ct-go') + '</a>';
      }).join('') + '</div></section>' +

      '<section class="wrap sec">' + sectionHead('Heti akciók', '#/akciok', 'Összes akció', 'Akciós ár a készlet erejéig') + grid(sale) + '</section>' +

      '<section class="sec system"><div class="wrap sys-in"><div class="sys-copy"><p class="eyebrow">Kompatibilitás</p>' +
      '<h2>Egy akkumulátor, ' + elfaPods.length + ' pod íz</h2>' +
      '<p>Minden podnál és készüléknél jelöljük, melyik rendszerrel működik. A termékoldalon automatikusan megjelennek a kompatibilis podok és a hozzá illő készülék.</p>' +
      '<div class="sys-tags"><a class="tag" href="#/kategoria/eloretoltott-podok?kompat=ELFA%20kompatibilis">ELFA kompatibilis</a><a class="tag" href="#/kategoria/kiegeszitok?kompat=Vaporesso%20XROS%20kompatibilis">Vaporesso XROS kompatibilis</a><a class="tag" href="#/kategoria/eloretoltott-podok?kompat=Lost%20Mary%20TAPPO%20kompatibilis">Lost Mary TAPPO kompatibilis</a></div></div>' +
      '<div class="sys-combo"><div class="sys-kit">' + FV.card(elfaKit) + '</div><span class="sys-plus" aria-hidden="true">' + I('plus') + '</span><div class="sys-pods">' +
      elfaPods.map(function (p) { return '<a class="mini" href="#/termek/' + p.slug + '" style="--tint:' + FV.tint(p) + '"><span>' + FV.art(p) + '</span><b>' + esc(p.attrs.iz[0]) + '</b><small class="num">' + money(FV.price(p)) + '</small></a>'; }).join('') +
      '</div></div></div></section>' +

      '<section class="wrap sec">' + sectionHead('Márkáink', '#/markak', 'Összes márka') + '<div class="brandstrip">' +
      FV.brands.map(function (b) { return '<a class="brand-tile" href="#/marka/' + b.slug + '">' + FV.wordmark(b) + '<small>' + FV.productsOfBrand(b.slug).length + ' termék</small></a>'; }).join('') + '</div></section>' +

      '<section class="wrap sec">' + sectionHead('Legnépszerűbb termékek', null, null, 'A vásárlók kedvencei') +
      '<div class="tabs" role="tablist" aria-label="Népszerű kategóriák">' + tabs.map(function (t, i) {
        return '<button class="tab' + (i ? '' : ' on') + '" type="button" role="tab" aria-selected="' + (i ? 'false' : 'true') + '" data-act="home-tab" data-tab="' + t + '">' + esc(FV.cat(t).node.short) + '</button>';
      }).join('') + '</div><div data-home-tab>' + popular(tabs[0]) + '</div></section>' +

      '<section class="usp"><div class="wrap usp-in">' +
      usp('truck', 'DPD 1–2 munkanap', 'Hétköznap 14:00-ig leadott rendelést még aznap feladjuk.') +
      usp('shield', '100% eredeti termékek', 'Közvetlenül a gyártóktól és hivatalos forgalmazóktól.') +
      usp('card', 'Biztonságos fizetés', 'Bankkártya, Apple Pay és Google Pay a Teya rendszerén keresztül.') +
      usp('receipt', 'Automatikus e-számla', 'A számlát a rendelés után azonnal e-mailben küldjük.') +
      '</div></section>';
  };

  function usp(ic, t, d) { return '<div class="usp-item">' + I(ic) + '<div><b>' + esc(t) + '</b><p>' + esc(d) + '</p></div></div>'; }

  function popular(cat) {
    return grid(FV.productsInCat(cat).filter(function (p) { return p.stock !== 'discontinued'; }).sort(function (a, b) { return b.pop - a.pop; }).slice(0, 4));
  }
  FV.views.popular = popular;
  FV.PUFF_STEPS = PUFF_STEPS;

  /* ================= TERMÉKLISTA (kategória / márka / akció / keresés) ================= */
  FV.shopState = null;

  FV.views.shop = function (ctx, query) {
    var base, title, desc = '', head = '', bc = [], subnav = '';
    if (ctx.type === 'cat') {
      var c = FV.cat(ctx.slug);
      if (!c) return FV.views.notfound();
      base = FV.productsInCat(c.slug);
      title = c.name;
      var parent = c.parent ? FV.cat(c.parent) : null;
      var root = parent ? parent.node : c.node;
      desc = root.desc;
      if (parent) bc.push({ label: parent.name, href: '#/kategoria/' + parent.slug });
      bc.push({ label: c.name });
      subnav = '<div class="subnav" role="list">' +
        '<a role="listitem" class="chip' + (!parent ? ' on' : '') + '" href="#/kategoria/' + root.slug + '">Összes</a>' +
        root.children.map(function (ch) {
          return '<a role="listitem" class="chip' + (ch.slug === c.slug ? ' on' : '') + '" href="#/kategoria/' + ch.slug + '">' + esc(ch.name) + ' <span class="cnt">' + FV.productsInCat(ch.slug).length + '</span></a>';
        }).join('') + '</div>';
    } else if (ctx.type === 'brand') {
      var b = FV.brand(ctx.slug);
      if (!b) return FV.views.notfound();
      base = FV.productsOfBrand(b.slug);
      title = b.name;
      bc.push({ label: 'Márkák', href: '#/markak' }, { label: b.name });
      var cats = {};
      base.forEach(function (p) { var pc = FV.primaryCat(p); cats[pc.slug] = (cats[pc.slug] || 0) + 1; });
      head = '<div class="brandhead"><div class="bh-mark">' + FV.wordmark(b, 'xl') + '</div><div><p>' + esc(b.desc) + '</p>' +
        '<div class="subnav">' + Object.keys(cats).map(function (k) {
          return '<a class="chip" href="#/kategoria/' + k + '?marka=' + b.slug + '">' + esc(FV.cat(k).name) + ' <span class="cnt">' + cats[k] + '</span></a>';
        }).join('') + '</div></div></div>';
    } else if (ctx.type === 'sale') {
      base = FV.products.filter(function (p) { return p.sale; });
      title = 'Akciók';
      desc = 'Minden akciós termék egy helyen. Az akciós ár a készlet erejéig érvényes.';
      bc.push({ label: 'Akciók' });
    } else {
      base = FV.search(ctx.q);
      title = 'Keresés';
      bc.push({ label: 'Keresés: ' + ctx.q });
      head = searchHead(ctx.q, base.length);
    }

    var f = parseFilters(query);
    FV.shopState = { ctx: ctx, base: base, f: f };

    var h1 = ctx.type === 'search' ? '' : '<div class="shop-title"><h1>' + esc(title) + '</h1>' + (desc ? '<p>' + esc(desc) + '</p>' : '') + '</div>';

    return '<div class="wrap">' + crumbs(bc) + h1 + head + subnav +
      '<div class="shop">' +
      '<aside class="filters" data-filters aria-label="Szűrők"><div class="f-head"><p class="f-title">' + I('filter') + ' Szűrők</p>' +
      '<button class="icon-btn f-close" type="button" data-act="filters-close" aria-label="Szűrők bezárása">' + I('close') + '</button></div>' +
      '<div class="f-body" data-facets></div>' +
      '<div class="f-apply"><button class="btn btn-primary" type="button" data-act="filters-close" data-f-apply>Mutasd a termékeket</button></div></aside>' +
      '<div class="results"><div class="toolbar">' +
      '<button class="btn btn-ghost f-open" type="button" data-act="filters-open">' + I('filter') + ' Szűrők <span class="badge" data-fcount hidden>0</span></button>' +
      '<p class="rcount" data-rcount></p>' +
      '<label class="sort"><span>Rendezés</span><select id="sort-sel" data-sort>' + Object.keys(FV.sorters).map(function (k) {
        return '<option value="' + k + '"' + (f.rend === k ? ' selected' : '') + '>' + FV.sorters[k].label + '</option>';
      }).join('') + '</select></label></div>' +
      '<div class="active-f" data-active></div>' +
      '<div data-results></div><nav class="pager" data-pager aria-label="Lapozás"></nav></div></div></div>';
  };

  function searchHead(q, n) {
    var nq = FV.norm(q).split(' '), chips = [];
    FV.brands.forEach(function (b) { if (nq.indexOf(FV.norm(b.name)) !== -1) chips.push('Márka: ' + b.name); });
    nq.forEach(function (t) { if (/^\d{3,}$/.test(t)) chips.push('Puff: ' + FV.num(t)); });
    nq.forEach(function (t) { if (/^\d+mg$/.test(t)) chips.push('Nikotin: ' + t.replace('mg', ' mg')); });
    return '<div class="srchead"><h1>' + n + ' találat erre: <q>' + esc(q) + '</q></h1>' +
      (chips.length ? '<p class="sr-understood">Így értelmeztük: ' + chips.map(function (c) { return '<span class="tag">' + esc(c) + '</span>'; }).join('') + '</p>' : '') +
      (n ? '' : '<div class="empty"><p>Nincs találat. Keress márkára (pl. <a href="#/kereses/Elfbar">Elfbar</a>), ízre (<a href="#/kereses/mango">mango</a>) vagy puff számra (<a href="#/kereses/40000">40000</a>).</p></div>') + '</div>';
  }

  var FKEYS = ['marka', 'kat', 'puff', 'iz', 'nikotin', 'ml', 'kompat', 'szin', 'keszlet'];
  function parseFilters(q) {
    var f = { rend: q.rend || 'pop', oldal: +(q.oldal || 1) };
    FKEYS.forEach(function (k) { f[k] = q[k] ? q[k].split(',') : []; });
    if (q.min) f.min = +q.min;
    if (q.max) f.max = +q.max;
    return f;
  }

  function filtersToQuery(f) {
    var parts = [];
    FKEYS.forEach(function (k) { if (f[k] && f[k].length) parts.push(k + '=' + f[k].map(encodeURIComponent).join(',')); });
    if (f.min != null) parts.push('min=' + f.min);
    if (f.max != null) parts.push('max=' + f.max);
    if (f.rend && f.rend !== 'pop') parts.push('rend=' + f.rend);
    if (f.oldal > 1) parts.push('oldal=' + f.oldal);
    return parts.length ? '?' + parts.join('&') : '';
  }

  var PER_PAGE = 12;
  FV.renderShop = function (keepFacets) {
    var s = FV.shopState;
    if (!s) return;
    var f = s.f, list = FV.applyFilters(s.base, f).slice();
    if (s.ctx.type !== 'search' || f.rend !== 'pop') list.sort(FV.sorters[f.rend] ? FV.sorters[f.rend].fn : FV.sorters.pop.fn);
    // a kifutott termékek a lista végére kerülnek
    list.sort(function (a, b) { return (a.stock === 'discontinued') - (b.stock === 'discontinued'); });

    var pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if (f.oldal > pages) f.oldal = pages;
    var pageItems = list.slice((f.oldal - 1) * PER_PAGE, f.oldal * PER_PAGE);

    var res = FV.$('[data-results]');
    res.innerHTML = list.length ? grid(pageItems, 'pgrid-shop') :
      '<div class="empty"><p>Ezekkel a szűrőkkel nincs találat.</p><button class="btn" type="button" data-act="f-clear">Szűrők törlése</button></div>';
    FV.$('[data-rcount]').innerHTML = '<b class="num">' + list.length + '</b> termék';

    var pager = FV.$('[data-pager]');
    pager.innerHTML = pages > 1 ? Array.apply(null, Array(pages)).map(function (_, i) {
      return '<button type="button" class="pg' + (i + 1 === f.oldal ? ' on' : '') + '" data-act="page" data-p="' + (i + 1) + '"' + (i + 1 === f.oldal ? ' aria-current="page"' : '') + '>' + (i + 1) + '</button>';
    }).join('') : '';

    // aktív szűrő chipek
    var chips = [];
    FV.facetDefs.forEach(function (d) {
      (f[d.key] || []).forEach(function (v) { chips.push('<button type="button" class="chip on" data-act="f-remove" data-k="' + d.key + '" data-v="' + esc(v) + '">' + esc(d.label) + ': ' + esc(d.name(v)) + I('close') + '</button>'); });
    });
    if (f.min != null || f.max != null) chips.push('<button type="button" class="chip on" data-act="f-remove" data-k="ar">Ár: ' + money(f.min || 0) + ' – ' + money(f.max || priceBounds(s.base)[1]) + I('close') + '</button>');
    FV.$('[data-active]').innerHTML = chips.length ? chips.join('') + '<button type="button" class="linkbtn" data-act="f-clear">Összes törlése</button>' : '';
    var fc = FV.$('[data-fcount]');
    fc.textContent = chips.length; fc.hidden = !chips.length;
    var ap = FV.$('[data-f-apply]');
    if (ap) ap.textContent = list.length + ' termék mutatása';

    if (!keepFacets) renderFacets();
    else updateFacetCounts();

    var hash = location.hash.split('?')[0] + filtersToQuery(f);
    try { history.replaceState(null, '', hash); } catch (e) { /* sandbox */ }
  };

  function priceBounds(list) {
    var lo = Infinity, hi = 0;
    list.forEach(function (p) { var x = FV.price(p); lo = Math.min(lo, x); hi = Math.max(hi, x); });
    return [Math.floor(lo), Math.ceil(hi)];
  }

  function facetList(fc) {
    var d = fc.def, many = fc.values.length > 6;
    return '<ul class="f-list' + (many ? ' f-scroll' : '') + '">' + fc.values.map(function (x, i) {
      var id = 'f-' + d.key + '-' + i;
      var sw = d.swatch === 'flavor' ? '<i class="sw" style="background:' + (FV.flavorColors[x.v] || '#ccc') + '"></i>' :
        d.swatch === 'color' ? '<i class="sw" style="background:' + (FV.colorSwatches[x.v] || '#ccc') + '"></i>' : '';
      return '<li><input type="checkbox" id="' + id + '" data-f="' + d.key + '" value="' + esc(x.v) + '"' + (x.on ? ' checked' : '') + (x.n || x.on ? '' : ' disabled') + '>' +
        '<label for="' + id + '">' + sw + '<span class="' + (d.mono ? 'num' : '') + '">' + esc(d.name(x.v)) + '</span><em class="cnt" data-cnt="' + d.key + '|' + esc(x.v) + '">' + x.n + '</em></label></li>';
    }).join('') + '</ul>';
  }

  function renderFacets() {
    var s = FV.shopState, fcs = FV.facets(s.base, s.f), pb = priceBounds(s.base);
    var hide = s.ctx.type === 'brand' ? 'marka' : '';
    var open = FV.store.get('facets_closed', {});
    var html = fcs.filter(function (fc) { return fc.def.key !== hide; }).map(function (fc) {
      return '<details class="facet" data-facet="' + fc.def.key + '"' + (open[fc.def.key] ? '' : ' open') + '><summary>' + esc(fc.def.label) + I('down') + '</summary>' + facetList(fc) + '</details>';
    }).join('');
    var lo = s.f.min != null ? s.f.min : pb[0], hi = s.f.max != null ? s.f.max : pb[1];
    html += '<details class="facet" open><summary>Ár' + I('down') + '</summary><div class="price-f" data-price-f data-lo="' + pb[0] + '" data-hi="' + pb[1] + '">' +
      '<div class="pr-track"><i data-pr-fill></i><label class="sr" for="pr-min">Minimum ár</label><input id="pr-min" type="range" min="' + pb[0] + '" max="' + pb[1] + '" step="1" value="' + lo + '" data-pr="min">' +
      '<label class="sr" for="pr-max">Maximum ár</label><input id="pr-max" type="range" min="' + pb[0] + '" max="' + pb[1] + '" step="1" value="' + hi + '" data-pr="max"></div>' +
      '<p class="pr-vals num"><span data-pr-lo>' + money(lo) + '</span><span data-pr-hi>' + money(hi) + '</span></p></div></details>';
    html += '<label class="f-toggle"><input type="checkbox" id="f-akcio" data-f-akcio' + (s.f.akcio ? ' checked' : '') + '><span>Csak akciós termékek</span></label>';
    FV.$('[data-facets]').innerHTML = html;
    paintPrice();
  }

  function updateFacetCounts() {
    var s = FV.shopState, fcs = FV.facets(s.base, s.f);
    fcs.forEach(function (fc) {
      fc.values.forEach(function (x) {
        var el = FV.$('[data-cnt="' + fc.def.key + '|' + CSS.escape(x.v) + '"]');
        if (el) {
          el.textContent = x.n;
          var inp = el.parentNode.previousSibling;
          if (inp) inp.disabled = !(x.n || x.on);
        }
      });
    });
  }

  function paintPrice() {
    var box = FV.$('[data-price-f]');
    if (!box) return;
    var lo = +box.dataset.lo, hi = +box.dataset.hi, a = +FV.$('[data-pr="min"]').value, b = +FV.$('[data-pr="max"]').value;
    var fill = FV.$('[data-pr-fill]');
    fill.style.left = ((a - lo) / (hi - lo || 1) * 100) + '%';
    fill.style.right = (100 - (b - lo) / (hi - lo || 1) * 100) + '%';
    FV.$('[data-pr-lo]').textContent = money(a);
    FV.$('[data-pr-hi]').textContent = money(b);
  }
  FV.paintPrice = paintPrice;
  FV.priceBounds = priceBounds;

  /* ================= MÁRKÁK ================= */
  FV.views.brands = function () {
    var groups = {};
    FV.brands.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (b) {
      var L = b.name[0].toUpperCase();
      (groups[L] = groups[L] || []).push(b);
    });
    return '<div class="wrap">' + crumbs([{ label: 'Márkák' }]) +
      '<div class="shop-title"><h1>Márkák</h1><p>' + FV.brands.length + ' márka, mindegyik saját oldallal és szűrhető termékkínálattal.</p></div>' +
      '<nav class="az" aria-label="Kezdőbetű">' + Object.keys(groups).map(function (L) { return '<a href="#/markak" data-act="az" data-l="' + L + '">' + L + '</a>'; }).join('') + '</nav>' +
      Object.keys(groups).map(function (L) {
        return '<section class="az-group" id="az-' + L + '"><h2 class="az-l">' + L + '</h2><div class="brand-grid lg">' + groups[L].map(function (b) {
          var n = FV.productsOfBrand(b.slug).length;
          return '<a class="brand-card" href="#/marka/' + b.slug + '">' + FV.wordmark(b, 'lg') + '<p>' + esc(b.desc) + '</p><small>' + n + ' termék ' + I('chev') + '</small></a>';
        }).join('') + '</div></section>';
      }).join('') + '</div>';
  };

  /* ================= TERMÉKOLDAL ================= */
  FV.views.product = function (slug) {
    var p = FV.product(slug);
    if (!p) return FV.views.notfound();
    var b = FV.brand(p.brand), st = FV.stockInfo(p), prim = FV.primaryCat(p), leaf = FV.leafCat(p), a = p.attrs;
    var bc = [{ label: prim.name, href: '#/kategoria/' + prim.slug }];
    if (leaf) bc.push({ label: leaf.name, href: '#/kategoria/' + leaf.slug });
    bc.push({ label: p.name });

    var opts = ['iz', 'nikotin', 'szin'].filter(function (k) { return (a[k] || []).length > 1; });
    var optHtml = opts.map(function (k) {
      var label = { iz: 'Íz', nikotin: 'Nikotinerősség', szin: 'Szín' }[k];
      return '<fieldset class="opt"><legend>' + label + ': <b data-opt-val="' + k + '">válassz</b></legend><div class="opt-row">' +
        a[k].map(function (v, i) {
          var sw = k === 'szin' ? '<i class="sw" style="background:' + (FV.colorSwatches[v] || '#ccc') + '"></i>' : '';
          return '<label class="opt-chip"><input type="radio" name="opt-' + k + '" id="opt-' + k + '-' + i + '" value="' + esc(v) + '" data-opt="' + k + '">' + sw + '<span class="' + (k === 'nikotin' ? 'num' : '') + '">' + esc(v) + '</span></label>';
        }).join('') + '</div></fieldset>';
    }).join('');

    var buy;
    if (p.stock === 'instock') {
      buy = '<form class="buy" data-buy data-id="' + p.id + '">' + optHtml +
        '<div class="buy-row"><span class="qty"><button type="button" data-act="qty" data-d="-1" aria-label="Csökkentés">' + I('minus') + '</button>' +
        '<label class="sr" for="buy-qty">Mennyiség</label><input id="buy-qty" class="num" type="number" min="1" max="' + p.qty + '" value="1" inputmode="numeric">' +
        '<button type="button" data-act="qty" data-d="1" aria-label="Növelés">' + I('plus') + '</button></span>' +
        '<button class="btn btn-primary btn-lg buy-btn" type="submit">' + I('bag') + ' Kosárba teszem</button>' +
        '<button class="icon-btn wish-lg' + (FV.wish.has(p.id) ? ' on' : '') + '" type="button" data-act="wish" data-id="' + p.id + '" aria-pressed="' + FV.wish.has(p.id) + '" aria-label="Kedvencekhez">' + I('heart') + '</button></div>' +
        '<p class="buy-err" data-buy-err hidden></p></form>';
    } else if (p.stock === 'outofstock') {
      buy = '<form class="notify" data-notify><p><b>Jelenleg nincs készleten.</b> Írd meg az e-mail címed, és szólunk, amint újra elérhető.</p>' +
        '<div class="nl-row"><label class="sr" for="notify-mail">E-mail cím</label><input id="notify-mail" type="email" required placeholder="nev@email.hu"><button class="btn btn-primary" type="submit">' + I('bell') + ' Értesítést kérek</button></div>' +
        '<p class="ok-msg" hidden>Köszönjük! E-mailt küldünk, amint a termék újra raktáron lesz.</p></form>';
    } else {
      buy = '<div class="notice-disc">' + I('info') + '<div><b>Ez a termék kifutott.</b><p>A gyártó már nem forgalmazza, ezért nem rendelhető. Az oldal megmarad, hogy a keresőkből érkezők megtalálják a helyettesítő termékeket.</p><a class="btn btn-primary" href="#alternativak" data-act="scroll" data-t="rel-groups">Helyettesítő termékek</a></div></div>';
    }

    var specs = [
      ['Márka', '<a href="#/marka/' + b.slug + '">' + esc(b.name) + '</a>'],
      ['Íz', (a.iz || []).join(', ')],
      ['Nikotinerősség', (a.nikotin || []).join(' / ')],
      ['Kiszerelés', (a.ml || []).join(', ')],
      ['Puff / slukkszám', (a.puff || []).map(FV.puffLabel).join(', ')],
      ['Kompatibilitás', (a.kompat || []).map(function (k) { return '<a href="#/kereses/' + encodeURIComponent(k) + '">' + esc(k) + '</a>'; }).join(', ')],
      ['Szín', (a.szin || []).join(', ')],
      ['Cikkszám (SKU)', '<span class="num">' + esc(p.sku) + '</span>'],
      ['EAN', '<span class="num">' + esc(p.ean) + '</span>'],
      ['Súly', '<span class="num">' + FV.kg(p.weight) + '</span>']
    ].filter(function (r) { return r[1]; });

    var keySpecs = [
      a.puff && a.puff.length ? ['Puff', FV.num(a.puff[0])] : null,
      a.nikotin && a.nikotin.length ? ['Nikotin', a.nikotin.join(' / ')] : null,
      a.ml && a.ml.length ? ['Kiszerelés', a.ml[0]] : null,
      a.kompat && a.kompat.length ? ['Rendszer', a.kompat[0].replace(' kompatibilis', '')] : null,
      a.szin && a.szin.length ? ['Színek', String(a.szin.length)] : null
    ].filter(Boolean).slice(0, 4);

    var views = [0, 1, 2];
    var related = FV.related(p);
    var cats = p.cats.map(function (c) { return FV.cat(c) ? '<a href="#/kategoria/' + c + '">' + esc(FV.cat(c).name) + '</a>' : ''; }).join(', ');
    var hasNic = (a.nikotin || []).some(function (x) { return x !== '0 mg'; });

    var ld = { '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.sku, gtin13: p.ean, brand: { '@type': 'Brand', name: b.name },
      weight: { '@type': 'QuantitativeValue', value: p.weight, unitCode: 'GRM' },
      offers: { '@type': 'Offer', priceCurrency: 'EUR', price: FV.price(p).toFixed(2), availability: 'https://schema.org/' + (p.stock === 'instock' ? 'InStock' : p.stock === 'outofstock' ? 'OutOfStock' : 'Discontinued') } };

    return '<div class="wrap">' + crumbs(bc) +
      '<div class="pdp">' +
      '<div class="gallery"><div class="g-main" style="--tint:' + FV.tint(p) + '" data-g-main>' + FV.art(p) +
      '<div class="pc-badges">' + (FV.discount(p) ? '<span class="bdg bdg-sale">−' + FV.discount(p) + '%</span>' : '') + (p.stock === 'discontinued' ? '<span class="bdg bdg-disc">Kifutott</span>' : '') + '</div></div>' +
      '<div class="g-thumbs" role="list">' + views.map(function (v) {
        return '<button role="listitem" type="button" class="g-th' + (v ? '' : ' on') + '" data-act="gview" data-v="' + v + '" data-id="' + p.id + '" style="--tint:' + FV.tint(p) + '" aria-label="' + (v + 1) + '. kép">' + FV.art(p, { view: v }) + '</button>';
      }).join('') + '</div></div>' +

      '<div class="pinfo"><a class="pi-brand" href="#/marka/' + b.slug + '">' + FV.wordmark(b, 'sm') + '</a>' +
      '<h1>' + esc(p.name) + '</h1>' +
      '<p class="pi-short">' + esc(p.short) + '</p>' +
      (keySpecs.length ? '<dl class="keyspecs">' + keySpecs.map(function (k) { return '<div><dt>' + k[0] + '</dt><dd class="num">' + esc(k[1]) + '</dd></div>'; }).join('') + '</dl>' : '') +
      '<div class="pi-price">' + priceHtml(p, true) + (p.sale ? '<span class="save">Megtakarítás: ' + money(p.price - p.sale) + '</span>' : '') + '</div>' +
      '<p class="stock-lg ' + st.cls + '"><i></i>' + esc(st.label) + '</p>' +
      buy +
      '<ul class="pi-perks"><li>' + I('truck') + '<span><b>DPD házhozszállítás 1–2 munkanap</b> · 14:00-ig leadott rendelést még aznap feladjuk</span></li>' +
      '<li>' + I('receipt') + '<span>Automatikus e-számla a rendelés után</span></li>' +
      '<li>' + I('shield') + '<span>Eredeti termék, 14 napos elállási jog (bontatlan csomagolás esetén)</span></li></ul>' +
      '<p class="pi-cats">Kategóriák: ' + cats + '</p>' +
      (hasNic ? '<p class="nic-warn">Ez a termék nikotint tartalmaz, amely erős függőséget okozó anyag. Használata nemdohányzók számára nem javasolt.</p>' : '') +
      '</div></div>' +

      '<div class="ptabs"><div class="tabs" role="tablist">' +
      '<button class="tab on" type="button" role="tab" aria-selected="true" data-act="ptab" data-t="leiras">Leírás</button>' +
      '<button class="tab" type="button" role="tab" aria-selected="false" data-act="ptab" data-t="spec">Specifikáció</button>' +
      '<button class="tab" type="button" role="tab" aria-selected="false" data-act="ptab" data-t="szall">Szállítás és visszaküldés</button></div>' +
      '<div class="tabpane" data-pane="leiras">' + longDesc(p) + '</div>' +
      '<div class="tabpane" data-pane="spec" hidden><div class="tbl-wrap"><table class="spec-tbl"><tbody>' + specs.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
      '<div class="tabpane" data-pane="szall" hidden><div class="prose"><p>A termék súlya <b class="num">' + FV.kg(p.weight) + '</b>. A szállítási díjat a kosár teljes súlya alapján számoljuk, <b>50 €</b> feletti rendelésnél ingyenes.</p>' + shipTable() + '<p>Bontatlan, sértetlen csomagolású terméket 14 napon belül visszaküldhetsz. Részletek: <a href="#/oldal/elallas">Elállási információk</a>.</p></div></div>' +
      '</div>' +

      '<div id="rel-groups">' + related.map(function (g) {
        return '<section class="sec">' + sectionHead(g.title) + grid(g.items) + '</section>';
      }).join('') + '</div>' +
      '</div>' +
      (p.stock === 'instock' ? '<div class="sticky-buy" data-sticky-buy><div class="wrap sb-in"><span class="sb-name">' + esc(p.name) + '</span>' + priceHtml(p) + '<button class="btn btn-primary" type="button" data-act="sticky-add">Kosárba</button></div></div>' : '') +
      '<script type="application/ld+json">' + JSON.stringify(ld).replace(/</g, '\\u003c') + '</script>';
  };

  function longDesc(p) {
    var a = p.attrs, b = FV.brand(p.brand), parts = ['<div class="prose"><p>' + esc(p.short) + '</p>'];
    if (p.art === 'disposable') {
      parts.push('<p>A ' + esc(b.name) + ' eldobható eszköz töltés nélkül, azonnal használható: kicsomagolod, és kész. ' +
        (a.puff[0] >= 10000 ? 'A beépített kijelző mutatja az akkumulátor és a liquid szintjét, az USB-C csatlakozó pedig lehetővé teszi, hogy a teljes ' + FV.puffLabel(a.puff[0]) + ' kapacitást kihasználd.' : 'A kompakt méret miatt zsebben és táskában is kényelmesen elfér.') + '</p>');
      parts.push('<h3>A dobozban</h3><ul><li>1 db ' + esc(p.name) + '</li><li>Használati útmutató (magyar, szlovák)</li></ul>');
    } else if (p.art === 'pod') {
      parts.push('<p>Előretöltött, zárt pod: nem kell tölteni, nem szivárog. Egyszerűen pattintsd a kompatibilis akkumulátorra (' + esc((a.kompat || []).join(', ')) + '), és már használhatod is.</p>');
    } else if (p.art === 'kit') {
      parts.push('<p>Újratölthető eszköz, amellyel hosszú távon olcsóbb a használat, mint eldobható termékekkel. Az akkumulátor USB-C kábellel tölthető.</p><h3>A dobozban</h3><ul><li>1 db akkumulátor</li><li>1 db pod</li><li>USB-C töltőkábel</li><li>Használati útmutató</li></ul>');
    } else if (p.art === 'liquid') {
      parts.push('<p>Európai TPD szabályozásnak megfelelő, gyermekbiztos zárral ellátott palack. Tárolás száraz, hűvös helyen, gyermekektől elzárva.</p>');
    }
    parts.push('</div>');
    return parts.join('');
  }

  function shipTable() {
    return '<div class="tbl-wrap"><table class="ship-tbl"><thead><tr><th scope="col">Csomag súlya</th>' + FV.shipping.methods.map(function (m) { return '<th scope="col">' + esc(m.name) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      FV.shipping.methods[0].tiers.map(function (t, i) {
        var prev = i ? FV.shipping.methods[0].tiers[i - 1].max : 0;
        return '<tr><td class="num">' + FV.kg(prev) + ' – ' + FV.kg(t.max) + '</td>' + FV.shipping.methods.map(function (m) {
          var tt = m.tiers[i];
          return '<td class="num">' + (tt ? money(tt.price) : '–') + '</td>';
        }).join('') + '</tr>';
      }).join('') + '<tr class="free"><td>' + money(FV.shipping.freeOver) + ' feletti rendelés</td>' + FV.shipping.methods.map(function () { return '<td>Ingyenes</td>'; }).join('') + '</tr></tbody></table></div>';
  }
  FV.shipTable = shipTable;

  /* ================= KOSÁR ================= */
  FV.views.cart = function () {
    return '<div class="wrap">' + crumbs([{ label: 'Kosár' }]) + steps(1) + '<div data-cartpage></div></div>';
  };

  function steps(n) {
    var s = ['Kosár', 'Adatok és szállítás', 'Fizetés', 'Visszaigazolás'];
    return '<ol class="steps" aria-label="Rendelés lépései">' + s.map(function (x, i) {
      return '<li class="' + (i + 1 < n ? 'done' : i + 1 === n ? 'on' : '') + '"' + (i + 1 === n ? ' aria-current="step"' : '') + '><span class="num">' + (i + 1) + '</span>' + x + '</li>';
    }).join('') + '</ol>';
  }

  FV.renderCartPage = function () {
    var el = FV.$('[data-cartpage]');
    if (!el) return;
    var t = FV.cart.totals();
    if (!t.lines.length) {
      el.innerHTML = '<div class="empty big">' + I('bag', 'empty-ico') + '<h1>A kosarad üres</h1><p>Nézz körül a legnépszerűbb termékeink között.</p><a class="btn btn-primary" href="#/kategoria/eldobhato">Eldobhatók</a></div>';
      return;
    }
    var method = FV.store.get('ship', 'dpd-home');
    var ship = FV.shippingCost(method, t.weight, t.sub);
    el.innerHTML = '<div class="cartgrid"><div><h1 class="h-page">Kosár <span class="muted num">(' + t.count + ' db)</span></h1>' +
      '<ul class="cart-lines">' + t.lines.map(function (l, i) {
        return '<li class="cl"><a class="cl-art" href="#/termek/' + l.p.slug + '" style="--tint:' + FV.tint(l.p) + '">' + FV.art(l.p) + '</a>' +
          '<div class="cl-info"><a class="cl-name" href="#/termek/' + l.p.slug + '">' + esc(l.p.name) + '</a>' + FV.variantText(l.v) +
          '<small class="muted">Cikkszám: <span class="num">' + esc(l.p.sku) + '</span> · Súly: <span class="num">' + FV.kg(l.p.weight) + '</span>/db</small>' +
          '<div class="cl-unit">' + priceHtml(l.p) + '</div></div>' +
          '<div class="cl-qty">' + FV.qtyCtl(i, l.qty) + '<button type="button" class="linkbtn" data-act="line-remove" data-i="' + i + '">' + I('trash') + ' Törlés</button></div>' +
          '<b class="cl-total num">' + money(l.total) + '</b></li>';
      }).join('') + '</ul>' +
      '<form class="coupon" data-coupon><label for="cp">Kuponkód</label><div class="nl-row"><input id="cp" type="text" placeholder="pl. FIRST10"><button class="btn btn-ghost" type="submit">Beváltás</button></div><p class="muted" data-cp-msg></p></form></div>' +
      summary(t, method, ship, true) + '</div>';
  };

  function summary(t, method, ship, withCta) {
    return '<aside class="summary"><h2>Összesítés</h2>' +
      '<dl class="sum"><div><dt>Részösszeg</dt><dd class="num">' + money(t.sub) + '</dd></div>' +
      (t.save ? '<div class="sum-save"><dt>Megtakarítás</dt><dd class="num">−' + money(t.save) + '</dd></div>' : '') +
      '<div><dt>Csomag súlya ' + I('info', 'tip') + '</dt><dd class="num">' + FV.kg(t.weight) + '</dd></div></dl>' +
      '<fieldset class="shipsel"><legend>Szállítás</legend>' + FV.shipping.methods.map(function (m) {
        var c = FV.shippingCost(m.id, t.weight, t.sub);
        return '<label class="radio-card"><input type="radio" name="ship" id="ship-' + m.id + '" value="' + m.id + '" data-ship' + (m.id === method ? ' checked' : '') + '>' +
          '<span><b>' + esc(m.name) + '</b><small>' + m.eta + '</small></span><em class="num">' + (c === 0 ? 'Ingyenes' : c == null ? '–' : money(c)) + '</em></label>';
      }).join('') + '</fieldset>' +
      (t.sub < FV.shipping.freeOver ? '<p class="freehint">Még <b class="num">' + money(FV.shipping.freeOver - t.sub) + '</b> és ingyenes a szállítás.</p>' : '') +
      '<dl class="sum total"><div><dt>Fizetendő</dt><dd class="num">' + money(t.sub + (ship || 0)) + '</dd></div></dl><p class="muted small">Az árak tartalmazzák az áfát.</p>' +
      (withCta ? '<a class="btn btn-primary btn-lg btn-block" href="#/penztar">Tovább a pénztárhoz</a>' : '') + '</aside>';
  }
  FV.summary = summary;

  /* ================= PÉNZTÁR ================= */
  FV.views.checkout = function () {
    var t = FV.cart.totals();
    if (!t.lines.length) return '<div class="wrap">' + crumbs([{ label: 'Pénztár' }]) + '<div class="empty big"><h1>A kosarad üres</h1><a class="btn btn-primary" href="#/">Vissza a főoldalra</a></div></div>';
    function fld(id, label, type, ph, extra) {
      return '<div class="fld ' + (extra || '') + '"><label for="' + id + '">' + label + '</label><input id="' + id + '" name="' + id + '" type="' + (type || 'text') + '" placeholder="' + (ph || '') + '" required></div>';
    }
    return '<div class="wrap">' + crumbs([{ label: 'Kosár', href: '#/kosar' }, { label: 'Pénztár' }]) + steps(2) +
      '<form class="checkout" data-checkout novalidate><div class="co-main">' +
      '<div class="co-demo"><p>Prototípus: a mezőket egy kattintással kitöltheted mintaadatokkal.</p><button class="btn btn-ghost" type="button" data-act="co-fill">Mintaadatok kitöltése</button></div>' +
      '<section class="co-sec"><h2>Kapcsolat</h2><div class="fgrid">' + fld('co-email', 'E-mail cím', 'email', 'nev@email.hu') + fld('co-phone', 'Telefonszám', 'tel', '+421 9xx xxx xxx') + '</div></section>' +
      '<section class="co-sec"><h2>Számlázási adatok</h2><div class="fgrid">' + fld('co-first', 'Keresztnév') + fld('co-last', 'Vezetéknév') +
      '<label class="f-toggle span2"><input type="checkbox" id="co-company"><span>Cégként vásárolok (számla cégnévre)</span></label>' +
      '<div class="span2 co-company" data-company hidden><div class="fgrid"><div class="fld span2"><label for="co-cname">Cégnév</label><input id="co-cname" type="text"></div><div class="fld"><label for="co-ico">IČO / Cégjegyzékszám</label><input id="co-ico" type="text"></div><div class="fld"><label for="co-dic">DIČ / IČ DPH (adószám)</label><input id="co-dic" type="text"></div></div></div>' +
      '<div class="fld"><label for="co-country">Ország</label><select id="co-country"><option>Szlovákia</option><option>Magyarország</option><option>Csehország</option></select></div>' +
      fld('co-zip', 'Irányítószám', 'text', '') + fld('co-city', 'Település') + fld('co-street', 'Utca, házszám', 'text', '', 'span2') + '</div></section>' +
      '<section class="co-sec"><h2>Szállítási mód</h2><div class="shipsel" data-co-ship></div>' +
      '<div class="fld pickup" data-pickup hidden><label for="co-pickup">DPD Pickup pont</label><select id="co-pickup"><option>Válassz átvételi pontot…</option><option>DPD Pickup – Bratislava, Obchodná 12</option><option>DPD Pickup – Košice, Hlavná 55</option><option>DPD csomagautomata – Nitra, Štefánikova 3</option></select></div></section>' +
      '<section class="co-sec"><h2>Fizetés</h2><div class="paysel">' +
      '<label class="radio-card"><input type="radio" name="pay" id="pay-teya" value="teya" checked><span><b>Bankkártya, Apple Pay, Google Pay</b><small>Biztonságos online fizetés a Teya rendszerén keresztül</small></span><em class="paylogos"><i>VISA</i><i>MC</i><i>Teya</i></em></label>' +
      '<label class="radio-card"><input type="radio" name="pay" id="pay-cod" value="cod"><span><b>Utánvét</b><small>Fizetés a DPD futárnál készpénzzel vagy kártyával</small></span><em class="num">+1,50 €</em></label></div></section>' +
      '<section class="co-sec"><h2>Megjegyzés</h2><div class="fld"><label class="sr" for="co-note">Megjegyzés a rendeléshez</label><textarea id="co-note" rows="3" placeholder="pl. kapukód, kézbesítési kérés"></textarea></div>' +
      '<label class="f-toggle"><input type="checkbox" id="co-18" required><span>Kijelentem, hogy elmúltam 18 éves.</span></label>' +
      '<label class="f-toggle"><input type="checkbox" id="co-terms" required><span>Elolvastam és elfogadom az <a href="#/oldal/aszf">ÁSZF</a>-et és az <a href="#/oldal/adatvedelem">adatvédelmi tájékoztatót</a>.</span></label>' +
      '<p class="buy-err" data-co-err hidden></p></section></div>' +
      '<div class="co-side" data-co-summary></div></form></div>';
  };

  FV.renderCheckoutSide = function () {
    var box = FV.$('[data-co-summary]');
    if (!box) return;
    var t = FV.cart.totals(), method = FV.store.get('ship', 'dpd-home');
    var ship = FV.shippingCost(method, t.weight, t.sub), cod = (FV.$('#pay-cod') || {}).checked ? 1.5 : 0;
    FV.$('[data-co-ship]').innerHTML = FV.shipping.methods.map(function (m) {
      var c = FV.shippingCost(m.id, t.weight, t.sub);
      return '<label class="radio-card"><input type="radio" name="coship" id="coship-' + m.id + '" value="' + m.id + '" data-ship' + (m.id === method ? ' checked' : '') + '><span><b>' + esc(m.name) + '</b><small>' + m.eta + ' · csomag súlya ' + FV.kg(t.weight) + '</small></span><em class="num">' + (c === 0 ? 'Ingyenes' : money(c)) + '</em></label>';
    }).join('');
    FV.$('[data-pickup]').hidden = method !== 'dpd-pickup';
    box.innerHTML = '<aside class="summary"><h2>Rendelésed</h2><ul class="co-lines">' + t.lines.map(function (l) {
      return '<li><span class="co-art" style="--tint:' + FV.tint(l.p) + '">' + FV.art(l.p) + '<em class="num">' + l.qty + '</em></span><span class="co-n">' + esc(l.p.name) + FV.variantText(l.v) + '</span><b class="num">' + money(l.total) + '</b></li>';
    }).join('') + '</ul><dl class="sum"><div><dt>Részösszeg</dt><dd class="num">' + money(t.sub) + '</dd></div>' +
      '<div><dt>Szállítás (' + esc(method === 'dpd-home' ? 'DPD házhoz' : 'DPD Pickup') + ')</dt><dd class="num">' + (ship === 0 ? 'Ingyenes' : money(ship)) + '</dd></div>' +
      (cod ? '<div><dt>Utánvét díja</dt><dd class="num">' + money(cod) + '</dd></div>' : '') + '</dl>' +
      '<dl class="sum total"><div><dt>Fizetendő</dt><dd class="num">' + money(t.sub + ship + cod) + '</dd></div></dl>' +
      '<button class="btn btn-primary btn-lg btn-block" type="submit">Megrendelés és fizetés</button>' +
      '<p class="muted small center">' + I('shield') + ' A kártyaadatokat a Teya kezeli, mi nem tároljuk őket.</p></aside>';
  };

  FV.views.thanks = function () {
    var o = FV.store.get('last_order', null);
    if (!o) return FV.views.notfound();
    return '<div class="wrap">' + steps(4) + '<div class="thanks"><span class="thanks-ico">' + I('check') + '</span>' +
      '<h1>Köszönjük a rendelést!</h1><p>Rendelésszám: <b class="num">' + o.no + '</b> · Összeg: <b class="num">' + money(o.total) + '</b></p>' +
      '<ol class="timeline"><li class="done"><b>Rendelés rögzítve</b><small>Visszaigazolást küldtünk ide: ' + esc(o.email) + '</small></li>' +
      '<li class="done"><b>' + (o.pay === 'cod' ? 'Utánvétes fizetés' : 'Fizetés sikeres (Teya)') + '</b><small>' + (o.pay === 'cod' ? 'A futárnál fizetsz.' : 'A tranzakció azonosítója e-mailben.') + '</small></li>' +
      '<li class="done"><b>E-számla elküldve</b><small>A számlát automatikusan kiállítottuk és e-mailben elküldtük.</small></li>' +
      '<li><b>Átadás a DPD-nek</b><small>A csomagkövetési számot e-mailben küldjük, amint a csomagot feladtuk.</small></li></ol>' +
      '<div class="hero-cta center"><a class="btn btn-primary" href="#/fiok/rendelesek">Rendeléseim</a><a class="btn btn-ghost" href="#/">Vissza a főoldalra</a></div></div></div>';
  };

  /* ================= FIÓK ================= */
  var ORDERS = [
    { no: 'FV-2026-10482', date: '2026. 09. 21.', status: 'Átadva a DPD-nek', cls: 'st-low', total: 64.3, track: '13852004816211' },
    { no: 'FV-2026-10217', date: '2026. 08. 30.', status: 'Kézbesítve', cls: 'st-in', total: 31.6, track: '13852004513877' },
    { no: 'FV-2026-09874', date: '2026. 07. 12.', status: 'Kézbesítve', cls: 'st-in', total: 19.9, track: '13852003998102' }
  ];
  FV.views.account = function (tab) {
    tab = tab || 'attekintes';
    var tabs = { attekintes: 'Áttekintés', rendelesek: 'Rendelések', kedvencek: 'Kedvencek', cimek: 'Címek', adatok: 'Fiókadatok' };
    var body;
    if (tab === 'rendelesek') {
      body = '<h2>Rendelések</h2>' + ordersTable(ORDERS);
    } else if (tab === 'kedvencek') {
      var w = FV.wish.ids().map(FV.product).filter(Boolean);
      body = '<h2>Kedvencek <span class="muted num">(' + w.length + ')</span></h2>' + (w.length ? grid(w) : '<div class="empty"><p>Még nincs kedvenced. A termékkártyák szív ikonjával tudsz termékeket ide menteni.</p><a class="btn" href="#/kategoria/eldobhato">Termékek böngészése</a></div>');
    } else if (tab === 'cimek') {
      body = '<h2>Címek</h2><div class="addr-grid"><div class="addr"><h3>Számlázási cím</h3><p>Kovács Anna<br>Hlavná 12<br>945 01 Komárno<br>Szlovákia</p><button class="linkbtn" type="button">Szerkesztés</button></div>' +
        '<div class="addr"><h3>Szállítási cím</h3><p>Kovács Anna<br>Hlavná 12<br>945 01 Komárno<br>Szlovákia</p><button class="linkbtn" type="button">Szerkesztés</button></div></div>';
    } else if (tab === 'adatok') {
      body = '<h2>Fiókadatok</h2><form class="fgrid narrow" data-fake-form><div class="fld"><label for="ac-first">Keresztnév</label><input id="ac-first" value="Anna"></div><div class="fld"><label for="ac-last">Vezetéknév</label><input id="ac-last" value="Kovács"></div><div class="fld span2"><label for="ac-mail">E-mail</label><input id="ac-mail" type="email" value="anna.kovacs@example.com"></div><div class="fld span2"><button class="btn btn-primary" type="submit">Mentés</button><p class="ok-msg" hidden>Mentve.</p></div></form>';
    } else {
      body = '<h2>Szia, Anna!</h2><p class="muted">Innen éred el a rendeléseidet, a kedvenceidet és a címeidet.</p>' +
        '<div class="acc-cards"><a href="#/fiok/rendelesek" class="acc-card">' + I('box') + '<b class="num">' + ORDERS.length + '</b><span>rendelés</span></a>' +
        '<a href="#/fiok/kedvencek" class="acc-card">' + I('heart') + '<b class="num">' + FV.wish.ids().length + '</b><span>kedvenc</span></a>' +
        '<a href="#/fiok/cimek" class="acc-card">' + I('pin') + '<b class="num">2</b><span>cím</span></a></div>' +
        '<h3>Legutóbbi rendelés</h3>' + ordersTable(ORDERS.slice(0, 1));
    }
    return '<div class="wrap">' + crumbs([{ label: 'Fiókom', href: '#/fiok' }, { label: tabs[tab] }]) +
      '<div class="account"><nav class="acc-nav" aria-label="Fiók menü">' + Object.keys(tabs).map(function (k) {
        return '<a href="#/fiok' + (k === 'attekintes' ? '' : '/' + k) + '" class="' + (k === tab ? 'on' : '') + '"' + (k === tab ? ' aria-current="page"' : '') + '>' + tabs[k] + '</a>';
      }).join('') + '<a href="#/" class="muted">Kijelentkezés</a></nav><div class="acc-body">' + body + '</div></div></div>';
  };

  function ordersTable(list) {
    return '<div class="tbl-wrap"><table class="orders"><thead><tr><th scope="col">Rendelés</th><th scope="col">Dátum</th><th scope="col">Állapot</th><th scope="col">Összeg</th><th scope="col">DPD követés</th><th scope="col">Számla</th></tr></thead><tbody>' +
      list.map(function (o) {
        return '<tr><td class="num"><b>' + o.no + '</b></td><td>' + o.date + '</td><td><span class="stock ' + o.cls + '">' + o.status + '</span></td><td class="num">' + money(o.total) + '</td><td class="num">' + o.track + '</td><td><button type="button" class="linkbtn">PDF</button></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ================= TARTALMI OLDALAK ================= */
  FV.views.page = function (slug) {
    var title = FV.pages[slug];
    if (!title) return FV.views.notfound();
    var c = {
      'szallitas-es-fizetes': '<h2>Szállítás</h2><p>A csomagokat a DPD szállítja. Hétköznap 14:00-ig leadott rendelést még aznap feladjuk. A szállítási díj a kosárban lévő termékek összsúlya alapján számolódik, ezért minden terméknél megadjuk a súlyt.</p>' + shipTable() +
        '<h2>Fizetés</h2><ul><li><b>Online bankkártyás fizetés</b> (Visa, Mastercard, Apple Pay, Google Pay) a Teya biztonságos fizetési oldalán.</li><li><b>Utánvét</b>: fizetés a DPD futárnál, 1,50 € kezelési díjjal.</li></ul>' +
        '<h2>Számla</h2><p>A számlát a rendelés után automatikusan kiállítjuk és e-mailben elküldjük. A fiókodban a Rendelések menüpontban is letöltheted.</p>',
      'aszf': '<p>Az Általános Szerződési Feltételek a John&amp;Jen s.r.o. által üzemeltetett First Vape webáruházban történő vásárlás feltételeit tartalmazzák.</p><h2>1. Az üzemeltető adatai</h2><p>A végleges szöveget és a cégadatokat az ügyfél adja át; a WordPress oldalon ez szerkeszthető oldalként kerül be.</p><h2>2. Nagykorúság</h2><p>A webáruházban kizárólag 18. életévüket betöltött személyek vásárolhatnak.</p>',
      'adatvedelem': '<p>Tájékoztató arról, hogyan kezeljük a vásárlók személyes adatait (GDPR).</p><h2>Milyen adatokat kezelünk?</h2><ul><li>Név, e-mail cím, telefonszám, számlázási és szállítási cím</li><li>Rendelési adatok</li><li>Hírlevél-feliratkozás</li></ul><h2>Adatfeldolgozók</h2><ul><li>DPD – csomagszállítás</li><li>Teya – online fizetés</li><li>SuperFaktúra – számlázás</li></ul>',
      'elallas': '<p>A termék kézhezvételétől számított 14 napon belül indoklás nélkül elállhatsz a vásárlástól.</p><h2>Kivételek</h2><p>Higiéniai okokból a felbontott e-liquidek, előretöltött podok és eldobható eszközök nem küldhetők vissza.</p><h2>Menete</h2><ol><li>Jelezd elállási szándékod a kapcsolatfelvételi űrlapon vagy e-mailben.</li><li>Küldd vissza a terméket bontatlan csomagolásban.</li><li>A vételárat a visszaérkezéstől számított 14 napon belül visszautaljuk.</li></ol>',
      'cookie': '<p>Az oldal sütiket használ a kosár és a bejelentkezés működéséhez, valamint – hozzájárulás esetén – statisztikai és marketing célokra.</p><h2>Süti kategóriák</h2><ul><li><b>Szükséges</b>: kosár, bejelentkezés, korellenőrzés</li><li><b>Statisztika</b>: látogatottság mérése</li><li><b>Marketing</b>: hirdetések mérése (Google Ads, Meta)</li></ul>',
      'kapcsolat': '<div class="contact"><div><h2>Elérhetőségek</h2><ul class="clist"><li>' + I('mail') + '<span>info@firstvape.sk</span></li><li>' + I('phone') + '<span>Ügyfélszolgálat hétköznap 9:00–17:00</span></li><li>' + I('pin') + '<span>John&amp;Jen s.r.o., Szlovákia</span></li></ul></div>' +
        '<form class="fgrid" data-fake-form><div class="fld"><label for="ct-name">Név</label><input id="ct-name" required></div><div class="fld"><label for="ct-mail">E-mail</label><input id="ct-mail" type="email" required></div><div class="fld span2"><label for="ct-order">Rendelésszám (ha van)</label><input id="ct-order" placeholder="FV-2026-…"></div><div class="fld span2"><label for="ct-msg">Üzenet</label><textarea id="ct-msg" rows="5" required></textarea></div><div class="fld span2"><button class="btn btn-primary" type="submit">Üzenet küldése</button><p class="ok-msg" hidden>Köszönjük, üzenetedet megkaptuk. 1 munkanapon belül válaszolunk.</p></div></form></div>'
    }[slug];
    return '<div class="wrap">' + crumbs([{ label: title }]) + '<div class="pagegrid"><nav class="side-nav" aria-label="Információk">' +
      Object.keys(FV.pages).map(function (k) { return '<a href="#/oldal/' + k + '" class="' + (k === slug ? 'on' : '') + '">' + esc(FV.pages[k]) + '</a>'; }).join('') +
      '</nav><article class="prose page"><h1>' + esc(title) + '</h1>' + c + '</article></div></div>';
  };

  FV.views.notfound = function () {
    return '<div class="wrap"><div class="empty big"><h1>Az oldal nem található</h1><p>Lehet, hogy a termék már nem elérhető. Próbáld a keresőt.</p><a class="btn btn-primary" href="#/">Főoldal</a></div></div>';
  };

  /* ================= PROTOTÍPUS / FEJLESZTŐI ÁTADÁS ================= */
  FV.views.proto = function () {
    var rows = [
      ['Főoldal', '#/', 'front-page.php – blokkok: kategória csempék, akciók (on_sale), kompatibilitás blokk, márkák, népszerű termékek'],
      ['Kategória oldal + szűrők', '#/kategoria/eldobhato', 'taxonomy-product_cat.php · WooCommerce layered nav (filter_pa_*) + márka és ár szűrő, AJAX frissítés'],
      ['Alkategória, szűrt URL', '#/kategoria/eldobhato?puff=40000', 'Szűrt URL-ek indexelhetők / canonical kezelés SEO-hoz'],
      ['Márkaoldal', '#/marka/elfbar', 'taxonomy-product_brand.php (WooCommerce Brands) – leírás, logó, szűrhető lista'],
      ['Márkák A–Z', '#/markak', 'Oldal sablon: összes product_brand kifejezés'],
      ['Akciók', '#/akciok', 'Oldal sablon: wc_get_product_ids_on_sale()'],
      ['Keresés', '#/kereses/Elfbar%2040000', 'Kiterjesztett termékkereső: név + márka + pa_* attribútumok + kategória + SKU + EAN, számnormalizálás'],
      ['Termékoldal', '#/termek/elfbar-bc40000-blueberry-ice', 'single-product.php – specifikációk attribútumokból, SKU, EAN (global_unique_id), súly, JSON-LD'],
      ['Változatos termék', '#/termek/vaporesso-xros-4-mini', 'Variable product: pa_szin / pa_nikotin változatok'],
      ['Készlethiányos termék', '#/termek/elfbar-bc40000-watermelon-ice', 'Készlet státusz: outofstock + visszatérési értesítő'],
      ['Kifutott termék', '#/termek/drifter-bar-30000-grape', 'Egyedi készlet státusz: „discontinued” – oldal marad, helyettesítő termékek'],
      ['Kosár', '#/kosar', 'cart.php – súlyalapú DPD díj, ingyenes szállítási küszöb'],
      ['Pénztár', '#/penztar', 'checkout – DPD Home / Pickup, Teya fizetés, utánvét, cégadatok (IČO/DIČ), 18+ megerősítés'],
      ['Fiók', '#/fiok', 'My Account – rendelések DPD követési számmal, számla letöltés, kedvencek'],
      ['Információs oldalak', '#/oldal/szallitas-es-fizetes', 'WordPress oldalak, lábléc menüből']
    ];
    var csv = ['Terméknév', 'SKU', 'EAN', 'Kategória', 'Márka', 'Íz', 'Nikotin', 'ML', 'Puff', 'Kompatibilitás', 'Szín', 'Normál ár', 'Akciós ár', 'Készlet', 'Státusz', 'Súly (g)', 'Rövid leírás', 'Hosszú leírás', 'Kép URL-ek'];
    return '<div class="wrap">' + crumbs([{ label: 'Prototípus áttekintés' }]) +
      '<div class="shop-title"><h1>Prototípus áttekintés</h1><p>A First Vape új WooCommerce frontendjének kattintható HTML prototípusa. Jóváhagyás után ebből készül a WordPress téma.</p></div>' +
      '<section class="sec"><h2>Az adatmodell alapelve</h2><div class="model">' +
      '<div><b>Kategória</b><span>mi a termék</span><code>product_cat</code></div>' +
      '<div><b>Márka</b><span>ki gyártja</span><code>product_brand</code></div>' +
      '<div><b>Attribútum</b><span>milyen változat</span><code>pa_iz · pa_nikotin · pa_kiszereles · pa_puff · pa_kompatibilitas · pa_szin</code></div>' +
      '<div><b>Termékadat</b><span>értékesítés és logisztika</span><code>ár · akciós ár · készlet · státusz · SKU · EAN · súly</code></div></div></section>' +
      '<section class="sec"><h2>Oldalak és WordPress megfelelőjük</h2><div class="tbl-wrap"><table class="proto-tbl"><thead><tr><th scope="col">Oldal</th><th scope="col">Megvalósítás a WordPress témában</th></tr></thead><tbody>' +
      rows.map(function (r) { return '<tr><td><a href="' + r[1] + '">' + esc(r[0]) + '</a></td><td>' + esc(r[2]) + '</td></tr>'; }).join('') + '</tbody></table></div></section>' +
      '<section class="sec"><h2>Mit érdemes kipróbálni</h2><ul class="try">' +
      '<li>Írd a fejléc keresőjébe: <a href="#/kereses/Elfbar%2040000">Elfbar 40000</a>, <a href="#/kereses/40k">40k</a>, <a href="#/kereses/40%20000">40 000</a>, <a href="#/kereses/mango">mango</a> vagy <a href="#/kereses/xros">xros</a>.</li>' +
      '<li>Vidd az egeret a főmenü pontjai fölé: mega menü alkategóriákkal, márkákkal és puff gyorslinkekkel.</li>' +
      '<li>Szűrj a kategóriaoldalon több szempont szerint. A darabszámok élőben frissülnek, mobilon a szűrő lenyíló panelben nyílik.</li>' +
      '<li>Nyiss meg egy készüléket (pl. <a href="#/termek/elfa-pro-kit-black">ELFA Pro</a>): alul automatikusan megjelennek a kompatibilis podok.</li>' +
      '<li>Tegyél termékeket a kosárba: a csomag súlya és a DPD díj automatikusan számolódik.</li></ul></section>' +
      '<section class="sec"><h2>CSV import sablon oszlopai</h2><p class="muted">Magyar fejlécek, automatikus leképezés a WooCommerce importálóra. Új termékek és frissítés SKU alapján (ár, készlet).</p><div class="csvcols">' +
      csv.map(function (c) { return '<code>' + esc(c) + '</code>'; }).join('') + '</div></section>' +
      '<section class="sec"><h2>Integrációk (a témán kívül, bővítményekkel)</h2><div class="acc-cards">' +
      '<div class="acc-card">' + I('card') + '<b>Teya</b><span>Online kártyás fizetés, tranzakciókezelés</span></div>' +
      '<div class="acc-card">' + I('receipt') + '<b>SuperFaktúra</b><span>Automatikus számlázás rendeléskor</span></div>' +
      '<div class="acc-card">' + I('truck') + '<b>DPD</b><span>Rendelésátadás, címkegenerálás, 100×150 mm thermal címke</span></div></div></section></div>';
  };
})(window.FV);
