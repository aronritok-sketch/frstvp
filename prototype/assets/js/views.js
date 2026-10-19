/*
 * First Vape – prototípus: oldalnézetek
 * Minden nézet egy WooCommerce sablonnak felel meg (lásd #/prototipus oldal).
 */
(function (FV) {
  'use strict';
  var esc = FV.esc, I = FV.icon, money = FV.money, t = FV.t;
  FV.views = {};

  function crumbs(list) {
    return '<nav class="crumbs" aria-label="' + esc(t('crumbsAria')) + '"><ol><li><a href="#/">' + t('home') + '</a></li>' +
      list.map(function (c, i) {
        return '<li>' + (c.href && i < list.length - 1 ? '<a href="' + c.href + '">' + esc(c.label) + '</a>' : '<span aria-current="page">' + esc(c.label) + '</span>') + '</li>';
      }).join('') + '</ol></nav>';
  }

  // A kártyán az adott terméktípusnál értelmezhető fő adatok (rendszer, íz, nikotin, slukkszám, kiszerelés, ellenállás)
  function specsLine(p) {
    var a = p.attrs, out = [], sys = (a.kompat || [])[0];
    if (p.art === 'kit') {
      if (sys) out.push(t('sysShort', { x: sys }));
      (a.szin || []).forEach(function (x) { out.push(FV.colorName(x)); });
    } else if (p.art === 'pod') {
      if (sys) out.push(t('sysShort', { x: sys }));
      (a.nikotin || []).forEach(function (x) { out.push(FV.nicLabel(x)); });
      (a.puff || []).forEach(function (x) { out.push(FV.puffApprox(x)); });
    } else if (p.art === 'disposable') {
      (a.puff || []).forEach(function (x) { out.push(FV.puffApprox(x)); });
      (a.nikotin || []).forEach(function (x) { out.push(FV.nicLabel(x)); });
    } else if (p.art === 'liquid') {
      (a.ml || []).forEach(function (x) { out.push(x); });
      (a.nikotin || []).forEach(function (x) { out.push(FV.nicLabel(x)); });
    } else {
      if (sys) out.push(t('sysShort', { x: sys }));
      (a.ohm || []).forEach(function (x) { out.push(x); });
    }
    return out.slice(0, 3);
  }

  function priceHtml(p, big) {
    return '<span class="price' + (big ? ' price-big' : '') + '">' +
      (p.sale ? '<ins class="num">' + money(FV.salePrice(p)) + '</ins><del class="num">' + money(FV.regular(p)) + '</del>' : '<b class="num">' + money(FV.regular(p)) + '</b>') + '</span>';
  }
  FV.priceHtml = priceHtml;

  // Minden termék SIMPLE termék: a gomb mindig a tényleges műveletet írja (kosárba / értesítés / helyettesítő)
  FV.card = function (p, opt) {
    var st = FV.stockInfo(p), d = FV.discount(p), b = FV.brand(p.brand), wished = FV.wish.has(p.id);
    var badges = (d ? '<span class="bdg bdg-sale">−' + d + '%</span>' : '') +
      (p.stock === 'discontinued' ? '<span class="bdg bdg-disc">' + t('stDiscShort') + '</span>' : '') +
      (p.stock === 'outofstock' ? '<span class="bdg bdg-out">' + t('stOutShort') + '</span>' : '');
    var action;
    if (p.stock === 'instock') {
      action = '<button class="pc-add" type="button" data-act="add" data-id="' + p.id + '" aria-label="' + esc(t('addToCartAria', { x: p.name })) + '">' + I('bag') + '<span>' + t('toCart') + '</span></button>';
    } else if (p.stock === 'outofstock') {
      action = '<a class="pc-add pc-notify" href="#/termek/' + p.slug + '">' + I('bell') + '<span>' + t('notifyShort') + '</span></a>';
    } else {
      action = '<a class="pc-add pc-notify" href="#/termek/' + p.slug + '?to=rel-groups">' + I('swap') + '<span>' + t('substitute') + '</span></a>';
    }
    var sys = opt && opt.sys && (p.attrs.kompat || [])[0];
    return '<article class="pcard' + (p.stock !== 'instock' ? ' is-' + p.stock : '') + '">' +
      '<a class="pc-media" href="#/termek/' + p.slug + '" style="--tint:' + FV.tint(p) + '" tabindex="-1" aria-hidden="true">' + FV.art(p) + '</a>' +
      '<div class="pc-badges">' + badges + (sys ? '<span class="bdg bdg-sys">' + esc(t('sysShort', { x: (p.attrs.kompat || []).join(' / ') })) + '</span>' : '') + '</div>' +
      '<button class="pc-wish' + (wished ? ' on' : '') + '" type="button" data-act="wish" data-id="' + p.id + '" aria-pressed="' + wished + '" aria-label="' + esc(t('wishAria', { x: p.name })) + '">' + I('heart') + '</button>' +
      '<div class="pc-body"><a class="pc-brand" href="#/marka/' + b.slug + '">' + esc(b.name) + '</a>' +
      '<h3 class="pc-name"><a href="#/termek/' + p.slug + '">' + esc(p.name) + '</a></h3>' +
      '<ul class="pc-specs">' + specsLine(p).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
      '<div class="pc-foot"><div class="pc-price">' + priceHtml(p) + '</div><span class="stock ' + st.cls + '">' + esc(st.short) + '</span>' + action + '</div></div></article>';
  };

  function grid(list, cls, opt) {
    return '<div class="pgrid ' + (cls || '') + '">' + list.map(function (p) { return FV.card(p, opt); }).join('') + '</div>';
  }

  function sectionHead(title, link, linkLabel, eyebrow) {
    return '<div class="sec-head"><div>' + (eyebrow ? '<p class="eyebrow">' + esc(eyebrow) + '</p>' : '') + '<h2>' + esc(title) + '</h2></div>' +
      (link ? '<a class="more" href="' + link + '">' + esc(linkLabel) + I('chev') + '</a>' : '') + '</div>';
  }

  /* ================= FŐOLDAL ================= */
  var PUFF_STEPS = FV.PUFF_BUCKETS.map(function (b) { return b.id; });

  FV.views.home = function () {
    var sale = FV.products.filter(function (p) { return p.sale && p.stock === 'instock'; }).sort(function (a, b) { return FV.discount(b) - FV.discount(a); }).slice(0, 4);
    var elfaKit = FV.product('elfbar-elfa-turbo-black');
    var elfaAll = FV.products.filter(function (p) { return FV.inCat(p, 'eloretoltott-podok') && (p.attrs.kompat || []).indexOf('ELFA') !== -1 && FV.isActive(p); });
    var seenIz = {};
    var elfaPods = elfaAll.filter(function (p) { var k = (p.attrs.iz || [''])[0]; if (seenIz[k]) return false; seenIz[k] = 1; return true; });
    var elfaFlavors = elfaPods.length;
    elfaPods = elfaPods.slice(0, 8);
    var brands = FV.visibleBrands(), active = FV.products.filter(FV.isActive);
    var tabs = ['eloretoltott-podok', 'keszulekek', 'e-liquidek', 'kiegeszitok'];

    return '<section class="hero"><div class="hero-smoke" aria-hidden="true"></div><div class="wrap hero-in">' +
      '<div class="hero-copy"><p class="eyebrow">' + t('heroEyebrow') + '</p>' +
      '<h1>' + t('heroH1') + '</h1>' +
      '<p class="lead">' + t('heroLead') + '</p>' +
      '<div class="hero-cta"><a class="btn btn-primary btn-lg" href="#/produkty">' + t('heroCta1') + '</a><a class="btn btn-ghost btn-lg" href="#/markak">' + t('heroCta2') + '</a></div>' +
      '<ul class="hero-facts"><li><b class="num">' + active.length + '</b> ' + FV.pl('wProducts', active.length) + '</li><li><b class="num">' + brands.length + '</b> ' + FV.pl('wBrands', brands.length) + '</li>' + (FV.lang === 'sk' ? '<li><b class="num">1–2</b> dni doručenie</li>' : '<li><b class="num">100 %</b> authentiques</li>') + '</ul></div>' +
      '<div class="pufffinder" data-pufffinder><p class="pf-label">' + t('pfLabel') + '</p>' +
      '<p class="pf-q">' + t('pfQ') + '</p>' +
      '<output class="pf-val num" id="pf-out" for="pf-range"></output><span class="pf-unit">' + t('puffUnit') + '</span>' +
      '<label class="sr" for="pf-range">' + t('a_puffF') + '</label>' +
      '<input id="pf-range" class="pf-range" type="range" min="0" max="' + (PUFF_STEPS.length - 1) + '" step="1" value="2" data-pf-range>' +
      '<div class="pf-ticks" aria-hidden="true">' + FV.PUFF_BUCKETS.map(function (b) { return '<span>' + esc(b.tick) + '</span>'; }).join('') + '</div>' +
      '<p class="pf-note">' + t('puffNote') + '</p>' +
      '<a class="btn btn-primary pf-go" href="#/produkty" data-pf-go><span>' + t('pfGo', { n: '<span data-pf-count>0</span>' }) + '</span></a></div>' +
      '</div></section>' +

      '<section class="wrap sec">' + sectionHead(t('rangeTitle'), null, null, t('rangeEyebrow')) + '<div class="catgrid">' + FV.categories.filter(function (c) { return FV.catHasProducts(c.slug); }).map(function (c) {
        var rep = FV.productsInCat(c.slug).filter(FV.isActive).sort(function (a, b) { return b.pop - a.pop; })[0], kids = FV.visibleChildren(c).length;
        return '<a class="cattile" href="#/kategoria/' + c.slug + '" style="--tint:' + c.color + '">' +
          '<span class="ct-art">' + (rep ? FV.art(rep) : '') + '</span>' +
          '<span class="ct-txt"><b>' + esc(c.name) + '</b><small>' + FV.nw('wProducts', FV.productsInCat(c.slug).filter(FV.isActive).length) + (kids ? ' · ' + FV.nw('wSubcats', kids) : '') + '</small></span>' + I('chev', 'ct-go') + '</a>';
      }).join('') + '</div></section>' +

      '<section class="sec why"><div class="wrap"><div class="why-head"><p class="eyebrow">' + t('whyEyebrow') + '</p><h2>' + t('whyTitle') + '</h2></div><div class="why-grid">' +
      t('whyItems').map(function (w) { return '<div class="why-item"><span class="why-ico">' + I(w[0]) + '</span><b>' + esc(w[1]) + '</b><p>' + esc(w[2]) + '</p></div>'; }).join('') +
      '</div></div></section>' +

      '<section class="sec system"><div class="wrap sys-in"><div class="sys-copy"><p class="eyebrow">' + t('a_kompat') + '</p>' +
      '<h2>' + t('sysTitle', { n: elfaFlavors, w: FV.pl('wFlavors', elfaFlavors) }) + '</h2>' +
      '<p>' + t('sysText') + '</p>' +
      '<div class="sys-tags">' + [['eloretoltott-podok', 'ELFA'], ['eloretoltott-podok', 'JOIN ONE'], ['eloretoltott-podok', 'DOJO BLAST'], ['eloretoltott-podok', 'DRIFTER BAR']].map(function (x) {
        return '<a class="tag" href="#/kategoria/' + x[0] + '?kompat=' + encodeURIComponent(x[1]) + '">' + esc(FV.compatLabel(x[1])) + '</a>';
      }).join('') + '</div></div>' +
      '<div class="sys-combo"><div class="sys-kit">' + (elfaKit ? FV.card(elfaKit) : '') + '</div><span class="sys-plus" aria-hidden="true">' + I('plus') + '</span><div class="sys-pods">' +
      elfaPods.map(function (p) { return '<a class="mini" href="#/termek/' + p.slug + '" style="--tint:' + FV.tint(p) + '"><span>' + FV.art(p) + '</span><b>' + esc(p.attrs.iz[0]) + '</b><small class="num">' + money(FV.price(p)) + '</small></a>'; }).join('') +
      '</div></div></div></section>' +

      '<section class="wrap sec">' + sectionHead(t('bestsellers'), null, null, t('custFav')) +
      '<div class="tabs" role="tablist" aria-label="' + esc(t('popCats')) + '">' + tabs.map(function (c, i) {
        return '<button class="tab' + (i ? '' : ' on') + '" type="button" role="tab" aria-selected="' + (i ? 'false' : 'true') + '" data-act="home-tab" data-tab="' + c + '">' + esc(FV.cat(c).node.short) + '</button>';
      }).join('') + '</div><div data-home-tab>' + popular(tabs[0]) + '</div></section>' +

      (sale.length ? '<section class="wrap sec sec-sale">' + sectionHead(t('weeklyDeals'), '#/akciok', t('allDeals')) + grid(sale) + '</section>' : '') +

      '<section class="sec best"><div class="wrap best-in"><div class="best-copy"><p class="eyebrow">First Vape</p><h2>' + t('bestTitle') + '</h2>' +
      '<p>' + t('bestText') + '</p><a class="btn btn-ghost" href="#/oldal/shipping">' + esc(FV.pageTitle('shipping')) + '</a></div><ul class="best-list">' +
      t('bestItems').map(function (x) { return '<li>' + I('check') + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul></div></section>' +

      '<section class="wrap sec">' + sectionHead(t('blogTitle'), '#/blog', t('moreArticles'), t('blog')) + blogCards(FV.posts.slice(0, 3)) + '</section>' +

      '<section class="wrap sec">' + sectionHead(t('partnersTitle'), '#/markak', t('allBrands'), t('brands')) + '<div class="brandstrip">' +
      brands.map(function (b) { return '<a class="brand-tile" href="#/marka/' + b.slug + '">' + FV.wordmark(b) + '<small>' + FV.nw('wProducts', FV.productsOfBrand(b.slug).filter(FV.isActive).length) + '</small></a>'; }).join('') + '</div></section>';
  };

  function blogCards(list) {
    return '<div class="blog-grid">' + list.map(function (b) {
      return '<a class="post-card" href="#/blog/' + b.slug + '"><span class="post-img" style="--tint:' + b.color + '"></span>' +
        '<span class="post-body"><small>' + esc(FV.fmtDate(b.date)) + ' · ' + esc(b.tag) + '</small><b>' + esc(b.title) + '</b><p>' + esc(b.excerpt) + '</p><em>' + t('readMore') + ' ' + I('chev') + '</em></span></a>';
    }).join('') + '</div>';
  }

  FV.views.blog = function (slug) {
    if (slug) {
      var b = FV.posts.filter(function (x) { return x.slug === slug; })[0];
      if (!b) return FV.views.notfound();
      return '<div class="wrap">' + crumbs([{ label: t('blog'), href: '#/blog' }, { label: b.title }]) +
        '<article class="prose page post"><span class="post-img lg" style="--tint:' + b.color + '"></span><small class="muted">' + esc(FV.fmtDate(b.date)) + ' · ' + esc(b.tag) + '</small><h1>' + esc(b.title) + '</h1>' +
        b.body.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</article>' +
        '<section class="sec">' + sectionHead(t('moreArticles')) + blogCards(FV.posts.filter(function (x) { return x !== b; }).slice(0, 3)) + '</section></div>';
    }
    return '<div class="wrap">' + crumbs([{ label: t('blog') }]) + '<div class="shop-title"><h1>' + t('blogTitle') + '</h1><p>' + t('blogIntro') + '</p></div>' + blogCards(FV.posts) + '</div>';
  };

  function usp(ic, t, d) { return '<div class="usp-item">' + I(ic) + '<div><b>' + esc(t) + '</b><p>' + esc(d) + '</p></div></div>'; }

  function popular(cat) {
    // egy csoportból (pl. színváltozatok) csak egy termék kerüljön a kiemelt sávba
    var seen = {};
    return grid(FV.productsInCat(cat).filter(FV.isActive).sort(function (a, b) { return b.pop - a.pop; }).filter(function (p) {
      if (!p.group) return true; if (seen[p.group]) return false; seen[p.group] = 1; return true;
    }).slice(0, 4));
  }
  FV.views.popular = popular;
  FV.PUFF_STEPS = PUFF_STEPS;

  /* ================= TERMÉKLISTA (kategória / márka / akció / keresés) ================= */
  FV.shopState = null;

  FV.views.shop = function (ctx, query) {
    var base, title, desc = '', head = '', bc = [], subnav = '', allowed = null;
    if (ctx.type === 'cat') {
      var c = FV.cat(ctx.slug);
      if (!c) return FV.views.notfound();
      base = FV.productsInCat(c.slug);
      title = c.name;
      var parent = c.parent ? FV.cat(c.parent) : null;
      var root = parent ? parent.node : c.node;
      desc = c.node.desc || root.desc;
      allowed = FV.catFacets[root.slug] || null;
      if (parent) bc.push({ label: parent.name, href: '#/kategoria/' + parent.slug });
      bc.push({ label: c.name });
      var kids = FV.visibleChildren(root);
      subnav = kids.length ? '<div class="subnav" role="list">' +
        '<a role="listitem" class="chip' + (!parent ? ' on' : '') + '" href="#/kategoria/' + root.slug + '">' + t('all') + ' <span class="cnt">' + FV.productsInCat(root.slug).length + '</span></a>' +
        kids.map(function (ch) {
          return '<a role="listitem" class="chip' + (ch.slug === c.slug ? ' on' : '') + '" href="#/kategoria/' + ch.slug + '">' + esc(ch.name) + ' <span class="cnt">' + FV.productsInCat(ch.slug).length + '</span></a>';
        }).join('') + '</div>' : '';
    } else if (ctx.type === 'brand') {
      var b = FV.brand(ctx.slug);
      if (!b) return FV.views.notfound();
      base = FV.productsOfBrand(b.slug);
      title = b.name;
      bc.push({ label: t('brands'), href: '#/markak' }, { label: b.name });
      var cats = {};
      base.forEach(function (p) { var pc = FV.primaryCat(p); cats[pc.slug] = (cats[pc.slug] || 0) + 1; });
      head = '<div class="brandhead"><div class="bh-mark">' + FV.wordmark(b, 'xl') + '</div><div><p>' + esc(b.desc) + '</p>' +
        '<div class="subnav">' + Object.keys(cats).map(function (k) {
          return '<a class="chip" href="#/kategoria/' + k + '?marka=' + b.slug + '">' + esc(FV.cat(k).name) + ' <span class="cnt">' + cats[k] + '</span></a>';
        }).join('') + '</div></div></div>';
    } else if (ctx.type === 'all') {
      base = FV.products.slice();
      title = t('allProducts');
      allowed = FV.catFacets.all;
      bc.push({ label: t('allProducts') });
    } else if (ctx.type === 'sale') {
      base = FV.products.filter(function (p) { return p.sale; });
      title = t('sale');
      desc = t('saleDesc');
      bc.push({ label: t('sale') });
    } else {
      base = FV.search(ctx.q);
      title = t('searchTitle');
      bc.push({ label: t('searchCrumb', { q: ctx.q }) });
      head = searchHead(ctx.q, base.length);
    }

    var f = parseFilters(query);
    FV.shopState = { ctx: ctx, base: base, f: f, allowed: allowed };

    var h1 = ctx.type === 'search' ? '' : '<div class="shop-title"><h1>' + esc(title) + '</h1>' + (desc ? '<p>' + esc(desc) + '</p>' : '') + '</div>';

    return '<div class="wrap">' + crumbs(bc) + h1 + head + subnav +
      '<div class="shop">' +
      '<aside class="filters" data-filters aria-label="' + esc(t('filters')) + '"><div class="f-head"><p class="f-title">' + I('filter') + ' ' + t('filters') + '</p>' +
      '<button class="icon-btn f-close" type="button" data-act="filters-close" aria-label="' + esc(t('closeFilters')) + '">' + I('close') + '</button></div>' +
      '<div class="f-body" data-facets></div>' +
      '<div class="f-apply"><button class="btn btn-primary" type="button" data-act="filters-close" data-f-apply>' + t('showProducts') + '</button></div></aside>' +
      '<div class="results"><div class="toolbar">' +
      '<button class="btn btn-ghost f-open" type="button" data-act="filters-open">' + I('filter') + ' ' + t('filters') + ' <span class="badge" data-fcount hidden>0</span></button>' +
      '<p class="rcount" data-rcount></p>' +
      '<label class="sort"><span>' + t('sort') + '</span><select id="sort-sel" data-sort>' + Object.keys(FV.sorters).map(function (k) {
        return '<option value="' + k + '"' + (f.rend === k ? ' selected' : '') + '>' + t(FV.sorters[k].lk) + '</option>';
      }).join('') + '</select></label></div>' +
      '<div class="active-f" data-active></div>' +
      '<div data-results></div><nav class="pager" data-pager aria-label="' + esc(t('pagination')) + '"></nav></div></div></div>';
  };

  function searchHead(q, n) {
    var nq = FV.norm(q).split(' '), chips = [];
    FV.brands.forEach(function (b) { if (nq.indexOf(FV.norm(b.name)) !== -1) chips.push(t('a_marka') + ': ' + b.name); });
    nq.forEach(function (x) { if (/^\d{3,}$/.test(x)) chips.push(t('sPuff') + ': ≈ ' + FV.num(x)); });
    nq.forEach(function (x) { if (/^\d+mg$/.test(x)) chips.push(t('a_nikotinShort') + ': ' + x.replace('mg', ' mg')); });
    return '<div class="srchead"><h1>' + t('srHead', { n: n, w: FV.pl('wResults', n), q: esc(q) }) + '</h1>' +
      (chips.length ? '<p class="sr-understood">' + t('understood') + ' ' + chips.map(function (c) { return '<span class="tag">' + esc(c) + '</span>'; }).join('') + '</p>' : '') +
      (n ? '' : '<div class="empty"><p>' + t('srEmpty', { a1: '<a href="#/kereses/Elfbar">Elfbar</a>', a2: '<a href="#/kereses/mango">mango</a>', a3: '<a href="#/kereses/40000">40000</a>' }) + '</p></div>') + '</div>';
  }

  var FKEYS = ['typ', 'marka', 'kat', 'puff', 'iz', 'nikotin', 'ml', 'kompat', 'szin', 'ohm', 'keszlet'];
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
      '<div class="empty"><p>' + t('noFilterResults') + '</p><button class="btn" type="button" data-act="f-clear">' + t('clearFilters') + '</button></div>';
    FV.$('[data-rcount]').innerHTML = '<b class="num">' + list.length + '</b> ' + FV.pl('wProducts', list.length);

    var pager = FV.$('[data-pager]');
    // lapozó: első, utolsó és az aktuális ±1, közte „…” (sok oldalnál sem lóg ki)
    var nums = [];
    for (var n = 1; n <= pages; n++) if (n === 1 || n === pages || Math.abs(n - f.oldal) <= 1) nums.push(n);
    pager.innerHTML = pages > 1 ? nums.map(function (n, i) {
      var gap = i && n - nums[i - 1] > 1 ? '<span class="pg-gap" aria-hidden="true">…</span>' : '';
      return gap + '<button type="button" class="pg' + (n === f.oldal ? ' on' : '') + '" data-act="page" data-p="' + n + '"' + (n === f.oldal ? ' aria-current="page"' : '') + '>' + n + '</button>';
    }).join('') : '';

    // aktív szűrő chipek
    var chips = [];
    FV.facetDefs.forEach(function (d) {
      (f[d.key] || []).forEach(function (v) { chips.push('<button type="button" class="chip on" data-act="f-remove" data-k="' + d.key + '" data-v="' + esc(v) + '">' + esc(t(d.lk)) + ': ' + esc(d.name(v)) + I('close') + '</button>'); });
    });
    if (f.min != null || f.max != null) chips.push('<button type="button" class="chip on" data-act="f-remove" data-k="ar">' + t('price') + ': ' + money(f.min || 0) + ' – ' + money(f.max || priceBounds(s.base)[1]) + I('close') + '</button>');
    FV.$('[data-active]').innerHTML = chips.length ? chips.join('') + '<button type="button" class="linkbtn" data-act="f-clear">' + t('clearAll') + '</button>' : '';
    var fc = FV.$('[data-fcount]');
    fc.textContent = chips.length; fc.hidden = !chips.length;
    var ap = FV.$('[data-f-apply]');
    if (ap) ap.textContent = t('showN', { n: list.length });

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
    var s = FV.shopState, fcs = FV.facets(s.base, s.f, s.allowed), pb = priceBounds(s.base);
    var hide = s.ctx.type === 'brand' ? 'marka' : '';
    var open = FV.store.get('facets_closed', {});
    var html = fcs.filter(function (fc) { return fc.def.key !== hide; }).map(function (fc) {
      return '<details class="facet" data-facet="' + fc.def.key + '"' + (open[fc.def.key] ? '' : ' open') + '><summary>' + esc(t(fc.def.lk)) + I('down') + '</summary>' + (fc.def.note ? '<p class="f-note">' + t(fc.def.note) + '</p>' : '') + facetList(fc) + '</details>';
    }).join('');
    var lo = s.f.min != null ? s.f.min : pb[0], hi = s.f.max != null ? s.f.max : pb[1];
    html += '<details class="facet" open><summary>' + t('price') + I('down') + '</summary><div class="price-f" data-price-f data-lo="' + pb[0] + '" data-hi="' + pb[1] + '">' +
      '<div class="pr-track"><i data-pr-fill></i><label class="sr" for="pr-min">' + t('minPrice') + '</label><input id="pr-min" type="range" min="' + pb[0] + '" max="' + pb[1] + '" step="1" value="' + lo + '" data-pr="min">' +
      '<label class="sr" for="pr-max">' + t('maxPrice') + '</label><input id="pr-max" type="range" min="' + pb[0] + '" max="' + pb[1] + '" step="1" value="' + hi + '" data-pr="max"></div>' +
      '<p class="pr-vals num"><span data-pr-lo>' + money(lo) + '</span><span data-pr-hi>' + money(hi) + '</span></p></div></details>';
    html += '<label class="f-toggle"><input type="checkbox" id="f-akcio" data-f-akcio' + (s.f.akcio ? ' checked' : '') + '><span>' + t('onlySale') + '</span></label>';
    FV.$('[data-facets]').innerHTML = html;
    paintPrice();
  }

  function updateFacetCounts() {
    var s = FV.shopState, fcs = FV.facets(s.base, s.f, s.allowed);
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
    FV.brands.slice().sort(function (a, b) { return a.name.localeCompare(b.name, FV.lang); }).forEach(function (b) {
      var L = b.name[0].toUpperCase();
      (groups[L] = groups[L] || []).push(b);
    });
    return '<div class="wrap">' + crumbs([{ label: t('brands') }]) +
      '<div class="shop-title"><h1>' + t('brands') + '</h1><p>' + t('brandsIntro', { n: FV.brands.length, w: FV.pl('wBrands', FV.brands.length) }) + '</p></div>' +
      '<nav class="az" aria-label="' + esc(t('azAria')) + '">' + Object.keys(groups).map(function (L) { return '<a href="#/markak" data-act="az" data-l="' + L + '">' + L + '</a>'; }).join('') + '</nav>' +
      Object.keys(groups).map(function (L) {
        return '<section class="az-group" id="az-' + L + '"><h2 class="az-l">' + L + '</h2><div class="brand-grid lg">' + groups[L].map(function (b) {
          var n = FV.productsOfBrand(b.slug).length;
          return '<a class="brand-card" href="#/marka/' + b.slug + '">' + FV.wordmark(b, 'lg') + '<p>' + esc(b.desc) + '</p><small>' + FV.nw('wProducts', n) + ' ' + I('chev') + '</small></a>';
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

    // Változatok: minden változat külön SIMPLE termék (saját SKU); a testvértermékek linkként jelennek meg
    var sibs = p.group ? FV.products.filter(function (x) { return x.group === p.group; }) : [];
    var diffKeys = ['szin', 'iz', 'nikotin', 'ohm', 'ml'].filter(function (k) {
      var vals = {}; sibs.forEach(function (x) { vals[(x.attrs[k] || []).join('/')] = 1; }); return Object.keys(vals).length > 1;
    });
    var diffKey = diffKeys[0];
    var vLabel = function (x) {
      return diffKeys.map(function (k) {
        var v = (x.attrs[k] || [])[0];
        return v == null ? '' : k === 'szin' ? FV.colorName(v) : k === 'nikotin' ? FV.nicLabel(v) : String(v);
      }).filter(Boolean).join(' · ');
    };
    var vHead = diffKeys.map(function (k) { return t({ szin: 'a_szin', nikotin: 'a_nikotinShort', ohm: 'a_ohm', iz: 'a_iz', ml: 'a_ml' }[k]); }).join(' · ');
    var optHtml = '';
    if (sibs.length > 1 && diffKey && sibs.length > 12) {
      // sok testvértermék (pl. 49 ízű ELFA pod): választólista, ami a kiválasztott termékoldalra visz
      optHtml = '<div class="variants"><label class="variants-h" for="var-sel">' + esc(vHead) + ':</label>' +
        '<select id="var-sel" class="var-sel" data-variant-select>' + sibs.slice().sort(function (a, b) { return vLabel(a).localeCompare(vLabel(b)); }).map(function (x) {
          return '<option value="' + x.slug + '"' + (x.id === p.id ? ' selected' : '') + '>' + esc(vLabel(x)) + (x.stock !== 'instock' ? ' – ' + esc(FV.stockInfo(x).short) : '') + '</option>';
        }).join('') + '</select><p class="muted small">' + t('variantsCount', { n: sibs.length }) + '</p></div>';
    } else if (sibs.length > 1 && diffKey) {
      optHtml = '<div class="variants"><p class="variants-h">' + esc(vHead) + ':</p><div class="opt-row">' +
        sibs.map(function (x) {
          var v = (x.attrs.szin || [])[0];
          var sw = diffKey === 'szin' ? '<i class="sw" style="background:' + (FV.colorSwatches[v] || '#ccc') + '"></i>' : '';
          return '<a class="opt-chip' + (x.id === p.id ? ' on' : '') + (x.stock !== 'instock' ? ' na' : '') + '" href="#/termek/' + x.slug + '"' + (x.id === p.id ? ' aria-current="true"' : '') + '>' + sw + '<span>' + esc(vLabel(x)) + '</span></a>';
        }).join('') + '</div></div>';
    }

    var buy;
    if (p.stock === 'instock') {
      buy = '<form class="buy" data-buy data-id="' + p.id + '">' +
        '<div class="buy-row"><span class="qty"><button type="button" data-act="qty" data-d="-1" aria-label="' + esc(t('decrease')) + '">' + I('minus') + '</button>' +
        '<label class="sr" for="buy-qty">' + t('qty') + '</label><input id="buy-qty" class="num" type="number" min="1" max="' + p.qty + '" value="1" inputmode="numeric">' +
        '<button type="button" data-act="qty" data-d="1" aria-label="' + esc(t('increase')) + '">' + I('plus') + '</button></span>' +
        '<button class="btn btn-primary btn-lg buy-btn" type="submit">' + I('bag') + ' ' + t('addToCartBig') + '</button>' +
        '<button class="icon-btn wish-lg' + (FV.wish.has(p.id) ? ' on' : '') + '" type="button" data-act="wish" data-id="' + p.id + '" aria-pressed="' + FV.wish.has(p.id) + '" aria-label="' + esc(t('toWish')) + '">' + I('heart') + '</button></div>' +
        '<p class="buy-err" data-buy-err hidden></p></form>';
    } else if (p.stock === 'outofstock') {
      buy = '<form class="notify" data-notify novalidate><p>' + t('notifyText') + '</p>' +
        '<div class="nl-row"><label class="sr" for="notify-mail">' + t('email') + '</label><input id="notify-mail" type="email" required placeholder="' + esc(t('emailPh')) + '"><button class="btn btn-primary" type="submit">' + I('bell') + ' ' + t('notifyMe') + '</button></div>' +
        '<p class="ok-msg" hidden>' + t('notifyOk') + '</p></form>';
    } else {
      buy = '<div class="notice-disc">' + I('info') + '<div><b>' + t('discTitle') + '</b><p>' + t('discText') + '</p><a class="btn btn-primary" href="#alternativak" data-act="scroll" data-t="rel-groups">' + t('substitutes') + '</a></div></div>';
    }

    var sysLinks = (a.kompat || []).map(function (k) { return '<a href="#/kereses/' + encodeURIComponent(k) + '">' + esc(t('sysShort', { x: k })) + '</a>'; }).join(', ');
    var specs = [
      [t('a_marka'), '<a href="#/marka/' + b.slug + '">' + esc(b.name) + '</a>'],
      [t('a_iz'), esc((a.iz || []).join(', '))],
      [t('a_nikotin'), esc((a.nikotin || []).map(FV.nicLabel).join(', '))],
      [t('a_ml'), esc((a.ml || []).join(', '))],
      [t('a_puffF'), esc((a.puff || []).map(FV.puffApprox).join(', '))],
      [t('a_kompat'), sysLinks],
      [t('a_ohm'), esc((a.ohm || []).join(', '))],
      [t('a_szin'), esc((a.szin || []).map(FV.colorName).join(', '))],
      [t('sku'), '<span class="num">' + esc(p.sku) + '</span>'],
      ['EAN', p.ean ? '<span class="num">' + esc(p.ean) + '</span>' : '']
    ].filter(function (r) { return r[1]; });

    // Íz, szín, kiszerelés, nikotin: mindig jól látható, akkor is, ha nincs a névben
    var keySpecs = [
      a.iz && a.iz.length ? [t('a_iz'), a.iz.join(', ')] : null,
      a.szin && a.szin.length ? [t('a_szin'), a.szin.map(FV.colorName).join(', ')] : null,
      a.nikotin && a.nikotin.length ? [t('a_nikotinShort'), a.nikotin.map(FV.nicLabel).join(', ')] : null,
      a.ml && a.ml.length ? [t('a_ml'), a.ml.join(', ')] : null,
      a.kompat && a.kompat.length ? [t('system'), a.kompat.join(', ')] : null,
      a.ohm && a.ohm.length ? [t('a_ohm'), a.ohm.join(', ')] : null,
      a.puff && a.puff.length ? [t('puffEst'), FV.puffApprox(a.puff[0])] : null
    ].filter(Boolean);

    var views = p.gallery > 1 ? [0, 1, 2] : [];
    var related = FV.related(p);
    var cats = p.cats.map(function (c) { return FV.cat(c) ? '<a href="#/kategoria/' + c + '">' + esc(FV.cat(c).name) + '</a>' : ''; }).join(', ');
    var hasNic = (a.nikotin || []).some(function (x) { return x !== '0 mg'; });

    var ld = { '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.sku, gtin13: p.ean || undefined, image: p.img ? FV.asset(p.img) : undefined, brand: { '@type': 'Brand', name: b.name },
      description: p.short,
      offers: { '@type': 'Offer', priceCurrency: 'EUR', price: FV.price(p).toFixed(2), availability: 'https://schema.org/' + (p.stock === 'instock' ? 'InStock' : p.stock === 'outofstock' ? 'OutOfStock' : 'Discontinued') } };

    return '<div class="wrap">' + crumbs(bc) +
      '<div class="pdp">' +
      '<div class="gallery"><div class="g-main" style="--tint:' + FV.tint(p) + '" data-g-main>' + FV.art(p) +
      '<div class="pc-badges">' + (FV.discount(p) ? '<span class="bdg bdg-sale">−' + FV.discount(p) + '%</span>' : '') + (p.stock === 'discontinued' ? '<span class="bdg bdg-disc">' + t('stDiscShort') + '</span>' : '') + '</div></div>' +
      (views.length ? '<div class="g-thumbs" role="list">' : '') + views.map(function (v) {
        return '<button role="listitem" type="button" class="g-th' + (v ? '' : ' on') + '" data-act="gview" data-v="' + v + '" data-id="' + p.id + '" style="--tint:' + FV.tint(p) + '" aria-label="' + esc(t('img', { n: v + 1 })) + '">' + FV.art(p, { view: v }) + '</button>';
      }).join('') + (views.length ? '</div>' : '') + '</div>' +

      '<div class="pinfo"><a class="pi-brand" href="#/marka/' + b.slug + '">' + FV.wordmark(b, 'sm') + '</a>' +
      '<h1>' + esc(p.name) + '</h1>' +
      '<p class="pi-short">' + esc(p.short) + '</p>' + optHtml +
      (keySpecs.length ? '<dl class="keyspecs">' + keySpecs.map(function (k) { return '<div><dt>' + k[0] + '</dt><dd class="num">' + esc(k[1]) + '</dd></div>'; }).join('') + '</dl>' : '') +
      '<div class="pi-price">' + priceHtml(p, true) + (p.sale ? '<span class="save">' + t('save', { x: money(FV.regular(p) - FV.salePrice(p)) }) + '</span>' : '') + '</div>' +
      '<p class="pi-vat muted small">' + t('priceVat', { r: FV.mkt().vatLabel }) + '</p>' +
      '<p class="stock-lg ' + st.cls + '"><i></i>' + esc(st.label) + '</p>' +
      buy +
      '<ul class="pi-perks"><li>' + I('truck') + '<span>' + t('perkShip') + '</span></li>' +
      '<li>' + I('receipt') + '<span>' + t('perkInvoice') + '</span></li>' +
      '<li>' + I('shield') + '<span>' + t('perkReturn') + '</span></li></ul>' +
      '<p class="pi-cats">' + t('catsLabel') + ' ' + cats + (p.sale ? ', <a href="#/akciok">' + t('onSaleCat') + '</a>' : '') + '</p>' +
      (hasNic ? '<p class="nic-warn">' + t('nicWarn') + '</p>' : '') +
      '</div></div>' +

      '<div class="ptabs"><div class="tabs" role="tablist">' +
      '<button class="tab on" type="button" role="tab" aria-selected="true" data-act="ptab" data-t="leiras">' + t('tabDesc') + '</button>' +
      '<button class="tab" type="button" role="tab" aria-selected="false" data-act="ptab" data-t="spec">' + t('tabSpec') + '</button>' +
      '<button class="tab" type="button" role="tab" aria-selected="false" data-act="ptab" data-t="szall">' + t('tabShip') + '</button></div>' +
      '<div class="tabpane" data-pane="leiras">' + longDesc(p) + '</div>' +
      '<div class="tabpane" data-pane="spec" hidden><div class="tbl-wrap"><table class="spec-tbl"><tbody>' + specs.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
      '<div class="tabpane" data-pane="szall" hidden><div class="prose"><p>' + t('shipPane', { free: money(FV.ship().freeOver) }) + '</p>' + shipTable() +
      '<p>' + t('returnText', { link: '<a href="#/oldal/withdrawal">' + esc(FV.pageTitle('withdrawal')) + '</a>' }) + '</p></div></div>' +
      '</div>' +

      '<div id="rel-groups">' + related.map(function (g) {
        return '<section class="sec">' + sectionHead(g.title) + grid(g.items, '', { sys: g.sys }) + '</section>';
      }).join('') + '</div>' +
      '</div>' +
      (p.stock === 'instock' ? '<div class="sticky-buy" data-sticky-buy><div class="wrap sb-in"><span class="sb-name">' + esc(p.name) + '</span>' + priceHtml(p) + '<button class="btn btn-primary" type="button" data-act="sticky-add">' + t('toCart') + '</button></div></div>' : '') +
      // Tanulság: JS-sztringben a lezáró script-tag mindig <\/script> (különben beágyazva / egy fájlba fűzve eltörik)
      '<script type="application/ld+json">' + JSON.stringify(ld).replace(/</g, '\\u003c') + '<\/script>';
  };

  function longDesc(p) {
    var a = p.attrs, b = FV.brand(p.brand), parts = ['<div class="prose"><p>' + esc(p.short) + '</p>'];
    if (p.art === 'disposable') {
      parts.push('<p>' + t('dispText', { b: esc(b.name) }) +
        (a.puff[0] >= 10000 ? t('dispBig', { p: FV.puffLabel(a.puff[0]) }) : t('dispSmall')) + '</p>');
      parts.push('<h3>' + t('inBox') + '</h3><ul><li>1× ' + esc(p.name) + '</li><li>' + t('manual') + '</li></ul>');
    } else if (p.art === 'pod') {
      parts.push('<p>' + t('podText', { k: esc((a.kompat || []).join(', ')) }) + '</p>');
    } else if (p.art === 'kit') {
      parts.push('<p>' + t('kitText') + '</p><h3>' + t('inBox') + '</h3><ul>' + t('kitBox').map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>');
    } else if (p.art === 'liquid') {
      parts.push('<p>' + t('liquidText') + '</p>');
    }
    parts.push('</div>');
    return parts.join('');
  }

  // Szállítási díjak szállítási módonként (a csomag súlyát a vásárlói felületen nem mutatjuk; a díjszámítás a háttérben súlyalapú)
  function shipTable() {
    var sh = FV.ship();
    return '<div class="tbl-wrap"><table class="ship-tbl"><thead><tr><th scope="col">' + t('shipMethod') + '</th><th scope="col">' + t('deliveryTime') + '</th><th scope="col">' + t('priceFrom') + '</th></tr></thead><tbody>' +
      sh.methods.map(function (m) {
        return '<tr><td>' + esc(m.name) + '</td><td>' + esc(m.eta) + '</td><td class="num">' + money(m.tiers[0].price) + '</td></tr>';
      }).join('') + '<tr class="free"><td colspan="2">' + t('overX', { x: money(sh.freeOver) }) + '</td><td>' + t('free') + '</td></tr></tbody></table></div>' +
      (sh.sample ? '<p class="muted small">' + t('shipSample') + '</p>' : '');
  }
  FV.shipTable = shipTable;

  /* ================= KOSÁR ================= */
  FV.views.cart = function () {
    return '<div class="wrap">' + crumbs([{ label: t('cart') }]) + steps(1) + '<div data-cartpage></div></div>';
  };

  function steps(n) {
    var s = t('steps');
    return '<ol class="steps" aria-label="' + esc(t('orderSteps')) + '">' + s.map(function (x, i) {
      return '<li class="' + (i + 1 < n ? 'done' : i + 1 === n ? 'on' : '') + '"' + (i + 1 === n ? ' aria-current="step"' : '') + '><span class="num">' + (i + 1) + '</span><b>' + x + '</b></li>';
    }).join('') + '</ol>';
  }

  FV.renderCartPage = function () {
    var el = FV.$('[data-cartpage]');
    if (!el) return;
    var tt = FV.cart.totals();
    if (!tt.lines.length) {
      el.innerHTML = '<div class="empty big">' + I('bag', 'empty-ico') + '<h1>' + t('cartEmptyH') + '</h1><p>' + t('cartEmptyP') + '</p><a class="btn btn-primary" href="#/kategoria/eldobhato">' + esc(FV.cat('eldobhato').node.short) + '</a></div>';
      return;
    }
    var method = FV.shipMethod();
    var ship = FV.shippingCost(method, tt.weight, tt.sub);
    el.innerHTML = '<div class="cartgrid"><div><h1 class="h-page">' + t('cart') + ' <span class="muted num">(' + FV.nw('wItems', tt.count) + ')</span></h1>' +
      '<ul class="cart-lines">' + tt.lines.map(function (l, i) {
        return '<li class="cl"><a class="cl-art" href="#/termek/' + l.p.slug + '" style="--tint:' + FV.tint(l.p) + '">' + FV.art(l.p) + '</a>' +
          '<div class="cl-info"><a class="cl-name" href="#/termek/' + l.p.slug + '">' + esc(l.p.name) + '</a>' + FV.variantText(l.v) +
          '<small class="muted">' + t('skuShort') + ' <span class="num">' + esc(l.p.sku) + '</span></small>' +
          '<div class="cl-unit">' + priceHtml(l.p) + '</div></div>' +
          '<div class="cl-qty">' + FV.qtyCtl(i, l.qty) + '<button type="button" class="cl-remove" data-act="line-remove" data-i="' + i + '" aria-label="' + esc(t('removeAria', { x: l.p.name })) + '">' + I('trash') + '<span>' + t('remove') + '</span></button></div>' +
          '<b class="cl-total num">' + money(l.total) + '</b></li>';
      }).join('') + '</ul>' +
      '<form class="coupon" data-coupon><label for="cp">' + t('coupon') + '</label><div class="nl-row"><input id="cp" type="text" placeholder="' + esc(t('couponPh')) + '"><button class="btn btn-ghost" type="submit">' + t('apply') + '</button></div><p class="muted" data-cp-msg></p></form></div>' +
      summary(tt, method, ship, true) + '</div>';
  };

  function vatNote(total) {
    return '<p class="vat-note">' + t('vatLine', { r: FV.mkt().vatLabel }) + ': <span class="num">' + money(FV.vatOf(total)) + '</span> · ' + t('pricesInclVat', { r: FV.mkt().vatLabel }) + '</p>';
  }

  function summary(tt, method, ship, withCta) {
    var sh = FV.ship();
    return '<aside class="summary"><h2>' + t('summaryH') + '</h2>' +
      '<dl class="sum"><div><dt>' + t('subtotal') + '</dt><dd class="num">' + money(tt.sub) + '</dd></div>' +
      (tt.save ? '<div class="sum-save"><dt>' + t('discount') + '</dt><dd class="num">−' + money(tt.save) + '</dd></div>' : '') + '</dl>' +
      '<fieldset class="shipsel"><legend>' + t('shipping') + '</legend>' + sh.methods.map(function (m) {
        var c = FV.shippingCost(m.id, tt.weight, tt.sub);
        return '<label class="radio-card"><input type="radio" name="ship" id="ship-' + m.id + '" value="' + m.id + '" data-ship' + (m.id === method ? ' checked' : '') + '>' +
          '<span><b>' + esc(m.name) + '</b><small>' + esc(m.eta) + '</small></span><em class="num">' + (c === 0 ? t('free') : c == null ? '–' : money(c)) + '</em></label>';
      }).join('') + '</fieldset>' +
      (tt.sub < sh.freeOver ? '<p class="freehint">' + t('freeLeft', { x: '<span class="num">' + money(sh.freeOver - tt.sub) + '</span>' }) + '</p>' : '') +
      '<dl class="sum total"><div><dt>' + t('total') + '</dt><dd class="num">' + money(tt.sub + (ship || 0)) + '</dd></div></dl>' + vatNote(tt.sub + (ship || 0)) +
      (withCta ? '<a class="btn btn-primary btn-lg btn-block" href="#/penztar">' + t('toCheckout') + '</a>' : '') + '</aside>';
  }
  FV.summary = summary;

  /* ================= PÉNZTÁR ================= */
  FV.views.checkout = function () {
    var tt = FV.cart.totals(), mk = FV.mkt();
    if (!tt.lines.length) return '<div class="wrap">' + crumbs([{ label: t('titleCheckout') }]) + '<div class="empty big"><h1>' + t('cartEmptyH') + '</h1><a class="btn btn-primary" href="#/">' + t('backHome') + '</a></div></div>';
    // data-v: ellenőrzés típusa (email / phone / zip); a hibaüzenet a mező alatt jelenik meg (data-err)
    function fld(id, label, type, ph, extra, auto, v, req) {
      return '<div class="fld ' + (extra || '') + '"><label for="' + id + '">' + label + '</label><input id="' + id + '" name="' + id + '" type="' + (type || 'text') + '" placeholder="' + esc(ph || '') + '"' + (auto ? ' autocomplete="' + auto + '"' : '') + (v ? ' data-v="' + v + '"' : '') + (req === false ? ' data-req' : ' required') + ' aria-describedby="' + id + '-err"><p class="err-msg" id="' + id + '-err" data-err hidden></p></div>';
    }
    return '<div class="wrap">' + crumbs([{ label: t('cart'), href: '#/kosar' }, { label: t('titleCheckout') }]) + steps(2) +
      '<form class="checkout" data-checkout novalidate><div class="co-main">' +
      '<p class="co-err" data-co-err role="alert" hidden></p>' +
      '<section class="co-sec"><h2>' + t('coContact') + '</h2><div class="fgrid">' + fld('co-email', t('email'), 'email', t('emailPh'), '', 'email', 'email') + fld('co-phone', t('phone'), 'tel', mk.phonePh, '', 'tel', 'phone') + '</div></section>' +
      '<section class="co-sec"><h2>' + t('billing') + '</h2><div class="fgrid">' + fld('co-first', t('first'), '', '', 'half', 'given-name') + fld('co-last', t('last'), '', '', 'half', 'family-name') +
      '<label class="f-toggle span2"><input type="checkbox" id="co-company"><span>' + t('buyAsCompany') + '</span></label>' +
      '<div class="span2 co-company" data-company hidden><div class="fgrid">' + fld('co-cname', t('companyName'), '', '', 'span2', 'organization', '', false) + fld('co-ico', mk.companyIds[0], '', '', '', '', '', false) +
      '<div class="fld"><label for="co-dic">' + mk.companyIds[1] + '</label><input id="co-dic" type="text"></div></div></div>' +
      '<div class="fld"><label for="co-country">' + t('country') + '</label><select id="co-country" autocomplete="country"><option value="' + mk.code + '">' + mk.country + '</option></select></div>' +
      fld('co-zip', t('zip'), 'text', mk.zipPh, 'half', 'postal-code', 'zip') + fld('co-city', t('city'), '', '', 'half', 'address-level2') + fld('co-street', t('street'), 'text', '', 'span2', 'street-address') + '</div></section>' +
      '<section class="co-sec"><h2>' + t('shipMethod') + '</h2><div class="shipsel" data-co-ship></div>' +
      // Packeta átvételi pont / Z-BOX választó (az éles oldalon a Packeta widget)
      '<div class="pickup" data-pickup hidden><p class="pickup-h">' + esc(mk.pickupLabel) + '</p>' +
      '<label class="sr" for="co-pickup-q">' + t('pickupSearch') + '</label><input class="pickup-q" id="co-pickup-q" type="search" placeholder="' + esc(t('pickupSearch')) + '" data-pickup-q>' +
      '<div class="pp-list" role="radiogroup" aria-label="' + esc(mk.pickupLabel) + '" data-pp-list>' + mk.pickupPoints.map(function (x, i) {
        return '<label class="pp-item"><input type="radio" name="pickup" id="pp-' + i + '" value="' + esc(x) + '"' + (FV.store.get('pickup', '') === x ? ' checked' : '') + '><span>' + esc(x) + '</span></label>';
      }).join('') + '</div><p class="err-msg" data-pickup-err hidden>' + t('errPickup') + '</p></div>' +
      // eltérő szállítási cím (csak házhozszállításnál)
      '<div data-shipdiff-wrap><label class="f-toggle"><input type="checkbox" id="co-shipdiff"><span>' + t('shipDiff') + '</span></label>' +
      '<div class="co-company" data-shipdiff hidden><div class="fgrid">' + fld('co-s-first', t('first'), '', '', 'half', 'shipping given-name', '', false) + fld('co-s-last', t('last'), '', '', 'half', 'shipping family-name', '', false) +
      fld('co-s-zip', t('zip'), 'text', mk.zipPh, 'half', 'shipping postal-code', 'zip', false) + fld('co-s-city', t('city'), '', '', 'half', 'shipping address-level2', '', false) + fld('co-s-street', t('street'), 'text', '', 'span2', 'shipping street-address', '', false) + '</div></div></div></section>' +
      '<section class="co-sec"><h2>' + t('payment') + '</h2><div class="paysel">' +
      '<label class="radio-card"><input type="radio" name="pay" id="pay-teya" value="teya" checked><span><b>' + t('payCard') + '</b><small>' + t('payCardNote') + '</small></span><em class="paylogos"><i>VISA</i><i>MC</i><i>Teya</i></em></label>' +
      '<label class="radio-card"><input type="radio" name="pay" id="pay-cod" value="cod"><span><b>' + t('cod') + '</b><small>' + t('codNote') + '</small></span><em class="num">+' + money(mk.codFee) + '</em></label></div></section>' +
      '<section class="co-sec"><h2>' + t('note') + '</h2><div class="fld"><label class="sr" for="co-note">' + t('noteLabel') + '</label><textarea id="co-note" rows="2" placeholder="' + esc(t('notePh')) + '"></textarea></div>' +
      '<div class="fld fld-check"><label class="f-toggle"><input type="checkbox" id="co-18" required aria-describedby="co-18-err"><span>' + t('confirm18') + '</span></label><p class="err-msg" id="co-18-err" data-err hidden></p></div>' +
      '<div class="fld fld-check"><label class="f-toggle"><input type="checkbox" id="co-terms" required aria-describedby="co-terms-err"><span>' + t('terms') + '</span></label><p class="err-msg" id="co-terms-err" data-err hidden></p></div>' +
      '</section></div>' +
      '<div class="co-side" data-co-summary></div></form></div>';
  };

  FV.renderCheckoutSide = function () {
    var box = FV.$('[data-co-summary]');
    if (!box) return;
    var tt = FV.cart.totals(), method = FV.shipMethod(), sh = FV.ship();
    var ship = FV.shippingCost(method, tt.weight, tt.sub), cod = (FV.$('#pay-cod') || {}).checked ? FV.mkt().codFee : 0;
    var cur = sh.methods.filter(function (m) { return m.id === method; })[0];
    FV.$('[data-co-ship]').innerHTML = sh.methods.map(function (m) {
      var c = FV.shippingCost(m.id, tt.weight, tt.sub);
      return '<label class="radio-card"><input type="radio" name="coship" id="coship-' + m.id + '" value="' + m.id + '" data-ship' + (m.id === method ? ' checked' : '') + '><span><b>' + esc(m.name) + '</b><small>' + esc(m.eta) + '</small></span><em class="num">' + (c === 0 ? t('free') : money(c)) + '</em></label>';
    }).join('');
    FV.$('[data-pickup]').hidden = !cur.pickup;
    FV.$('[data-shipdiff-wrap]').hidden = !!cur.pickup;
    var total = tt.sub + ship + cod;
    box.innerHTML = '<aside class="summary"><h2>' + t('yourOrder') + '</h2><ul class="co-lines">' + tt.lines.map(function (l) {
      return '<li><span class="co-art" style="--tint:' + FV.tint(l.p) + '">' + FV.art(l.p) + '<em class="num">' + l.qty + '</em></span><span class="co-n">' + esc(l.p.name) + FV.variantText(l.v) + '</span><b class="num">' + money(l.total) + '</b></li>';
    }).join('') + '</ul><dl class="sum"><div><dt>' + t('subtotal') + '</dt><dd class="num">' + money(tt.sub) + '</dd></div>' +
      '<div><dt>' + t('shipping') + ' (' + esc(cur.short) + ')</dt><dd class="num">' + (ship === 0 ? t('free') : money(ship)) + '</dd></div>' +
      (cod ? '<div><dt>' + t('codFee') + '</dt><dd class="num">' + money(cod) + '</dd></div>' : '') + '</dl>' +
      '<dl class="sum total"><div><dt>' + t('total') + '</dt><dd class="num">' + money(total) + '</dd></div></dl>' + vatNote(total) +
      '<button class="btn btn-primary btn-lg btn-block" type="submit">' + t('placeOrder') + '</button>' +
      '<p class="muted small center">' + I('shield') + ' ' + t('cardNote') + '</p></aside>';
    if (FV.fitSummary) FV.fitSummary();
  };

  FV.views.thanks = function () {
    var o = FV.store.get('last_order', null);
    if (!o) return FV.views.notfound();
    return '<div class="wrap">' + steps(4) + '<div class="thanks"><span class="thanks-ico">' + I('check') + '</span>' +
      '<h1>' + t('thanksH') + '</h1><p>' + t('orderNo') + ' <b class="num">' + o.no + '</b> · ' + t('amount') + ' <b class="num">' + money(o.total) + '</b></p>' +
      '<ol class="timeline"><li class="done"><b>' + t('tl1') + '</b><small>' + t('tl1s', { x: esc(o.email) }) + '</small></li>' +
      '<li class="done"><b>' + (o.pay === 'cod' ? t('tlCod') : t('tlPaid')) + '</b><small>' + (o.pay === 'cod' ? t('tlCodS') : t('tlPaidS')) + '</small></li>' +
      '<li class="done"><b>' + t('tlInv') + '</b><small>' + t('tlInvS') + '</small></li>' +
      '<li><b>' + t('tlShip') + '</b><small>' + t('tlShipS') + '</small></li></ol>' +
      '<div class="hero-cta center"><a class="btn btn-primary" href="#/fiok/rendelesek">' + t('myOrders') + '</a><a class="btn btn-ghost" href="#/">' + t('backHome') + '</a></div></div></div>';
  };

  /* ================= FIÓK ================= */
  var ORDERS = [
    { no: 'FV-2026-10482', date: '2026-09-21', st: 'stShipped', cls: 'st-low', total: 64.3, track: 'Z4827301956' },
    { no: 'FV-2026-10217', date: '2026-08-30', st: 'stDelivered', cls: 'st-in', total: 31.6, track: 'Z4827113580' },
    { no: 'FV-2026-09874', date: '2026-07-12', st: 'stDelivered', cls: 'st-in', total: 19.9, track: 'Z4826690241' }
  ];
  FV.views.account = function (tab) {
    tab = tab || 'attekintes';
    var tabs = { attekintes: t('overview'), rendelesek: t('orders'), kedvencek: t('wishlist'), cimek: t('addresses'), adatok: t('accountDetails') };
    var d = FV.mkt().demo, addr = esc(d.first + ' ' + d.last) + '<br>' + esc(d.street) + '<br>' + esc(d.zip + ' ' + d.city) + '<br>' + esc(FV.mkt().country);
    var body;
    if (tab === 'rendelesek') {
      body = '<h2>' + t('orders') + '</h2>' + ordersTable(ORDERS);
    } else if (tab === 'kedvencek') {
      var w = FV.wish.ids().map(FV.product).filter(Boolean);
      body = '<h2>' + t('wishlist') + ' <span class="muted num">(' + w.length + ')</span></h2>' + (w.length ? grid(w) : '<div class="empty"><p>' + t('wishEmpty') + '</p><a class="btn" href="#/kategoria/eldobhato">' + t('browse') + '</a></div>');
    } else if (tab === 'cimek') {
      body = '<h2>' + t('addresses') + '</h2><div class="addr-grid"><div class="addr"><h3>' + t('billingAddr') + '</h3><p>' + addr + '</p><button class="linkbtn" type="button">' + t('edit') + '</button></div>' +
        '<div class="addr"><h3>' + t('shipAddr') + '</h3><p>' + addr + '</p><button class="linkbtn" type="button">' + t('edit') + '</button></div></div>';
    } else if (tab === 'adatok') {
      body = '<h2>' + t('accountDetails') + '</h2><form class="fgrid narrow" data-fake-form><div class="fld"><label for="ac-first">' + t('first') + '</label><input id="ac-first" value="' + esc(d.first) + '"></div><div class="fld"><label for="ac-last">' + t('last') + '</label><input id="ac-last" value="' + esc(d.last) + '"></div><div class="fld span2"><label for="ac-mail">' + t('email') + '</label><input id="ac-mail" type="email" value="' + esc(d.email) + '"></div><div class="fld span2"><button class="btn btn-primary" type="submit">' + t('saveBtn') + '</button><p class="ok-msg" hidden>' + t('saved') + '</p></div></form>';
    } else {
      var nw = FV.wish.ids().length;
      body = '<h2>' + t('hello', { n: esc(d.first) }) + '</h2><p class="muted">' + t('accIntro') + '</p>' +
        '<div class="acc-cards"><a href="#/fiok/rendelesek" class="acc-card">' + I('box') + '<b class="num">' + ORDERS.length + '</b><span>' + FV.pl('wOrders', ORDERS.length) + '</span></a>' +
        '<a href="#/fiok/kedvencek" class="acc-card">' + I('heart') + '<b class="num">' + nw + '</b><span>' + FV.pl('wFav', nw) + '</span></a>' +
        '<a href="#/fiok/cimek" class="acc-card">' + I('pin') + '<b class="num">2</b><span>' + FV.pl('wAddr', 2) + '</span></a></div>' +
        '<h3>' + t('lastOrder') + '</h3>' + ordersTable(ORDERS.slice(0, 1));
    }
    return '<div class="wrap">' + crumbs([{ label: t('myAccount'), href: '#/fiok' }, { label: tabs[tab] }]) +
      '<div class="account"><nav class="acc-nav" aria-label="' + esc(t('accountMenu')) + '">' + Object.keys(tabs).map(function (k) {
        return '<a href="#/fiok' + (k === 'attekintes' ? '' : '/' + k) + '" class="' + (k === tab ? 'on' : '') + '"' + (k === tab ? ' aria-current="page"' : '') + '>' + tabs[k] + '</a>';
      }).join('') + '<a href="#/" class="muted">' + t('logout') + '</a></nav><div class="acc-body">' + body + '</div></div></div>';
  };

  function ordersTable(list) {
    return '<div class="tbl-wrap"><table class="orders"><thead><tr><th scope="col">' + t('order') + '</th><th scope="col">' + t('date') + '</th><th scope="col">' + t('status') + '</th><th scope="col">' + t('amount').replace(':', '').trim() + '</th><th scope="col">' + t('tracking') + '</th><th scope="col">' + t('invoice') + '</th></tr></thead><tbody>' +
      list.map(function (o) {
        return '<tr><td class="num"><b>' + o.no + '</b></td><td>' + FV.fmtDate(o.date) + '</td><td><span class="stock ' + o.cls + '">' + t(o.st) + '</span></td><td class="num">' + money(o.total) + '</td><td class="num">' + o.track + '</td><td><button type="button" class="linkbtn">PDF</button></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ================= TARTALMI ÉS JOGI OLDALAK (piaconként) ================= */
  FV.views.page = function (slug) {
    var keys = FV.pageList();
    if (keys.indexOf(slug) === -1) return FV.views.notfound();
    var title = FV.pageTitle(slug), c;
    if (slug === 'contact') {
      c = '<div class="contact"><div><h2>' + t('contact') + '</h2><ul class="clist"><li>' + I('mail') + '<span>info@firstvape.sk</span></li><li>' + I('phone') + '<span>' + (FV.lang === 'sk' ? 'Zákaznícka linka v pracovné dni 9:00–17:00' : 'Service client du lundi au vendredi, 9 h – 17 h') + '</span></li><li>' + I('pin') + '<span>John&amp;Jen s.r.o., ' + (FV.lang === 'sk' ? 'Slovensko' : 'Slovaquie') + '</span></li></ul></div>' +
        '<form class="fgrid" data-fake-form><div class="fld"><label for="ct-name">' + t('contactName') + '</label><input id="ct-name" required autocomplete="name"></div><div class="fld"><label for="ct-mail">' + t('email') + '</label><input id="ct-mail" type="email" required autocomplete="email"></div><div class="fld span2"><label for="ct-order">' + t('orderNoOpt') + '</label><input id="ct-order" placeholder="FV-2026-…"></div><div class="fld span2"><label for="ct-msg">' + t('message') + '</label><textarea id="ct-msg" rows="5" required></textarea></div><div class="fld span2"><button class="btn btn-primary" type="submit">' + t('send') + '</button><p class="ok-msg" hidden>' + t('contactOk') + '</p></div></form></div>';
    } else {
      c = FV.PAGES[FV.lang][slug]().replace('{shipTable}', shipTable()).replace('{cod}', money(FV.mkt().codFee));
    }
    return '<div class="wrap">' + crumbs([{ label: title }]) + '<div class="pagegrid"><nav class="side-nav" aria-label="' + esc(t('info')) + '">' +
      keys.map(function (k) { return '<a href="#/oldal/' + k + '" class="' + (k === slug ? 'on' : '') + '">' + esc(FV.pageTitle(k)) + '</a>'; }).join('') +
      '</nav><article class="prose page"><h1>' + esc(title) + '</h1>' + c + '</article></div></div>';
  };

  FV.views.notfound = function () {
    return '<div class="wrap"><div class="empty big"><h1>' + t('nfH') + '</h1><p>' + t('nfP') + '</p><a class="btn btn-primary" href="#/">' + t('home') + '</a></div></div>';
  };

  /* ================= PROTOTÍPUS / FEJLESZTŐI ÁTADÁS =================
   * Ez az oldal szándékosan magyar: belső átadó oldal a csapatnak és az ügyfélnek, nem része a boltnak.
   */
  FV.views.proto = function () {
    var rows = [
      ['Főoldal', '#/', 'front_page_content.html – iu/section blokkok; kategória csempék, akciók (on_sale), kompatibilitás blokk, márkák, népszerű termékek; puff kereső: saját blokk (iucb_add_block)'],
      ['Kategória oldal + szűrők', '#/kategoria/eloretoltott-podok', 'tax_product_cat_content.html – [products class="mainquery"] + iu-woocommerce/filter (pa_* layered nav, márka, ár), AJAX frissítés'],
      ['Összes termék, szűrt URL', '#/produkty?puff=20000%2B', 'Slukkszám-szűrő tartományokra (pa_puff értékek → sávok), a szám gyártói becslés; szűrt URL-ek: canonical / noindex szabály a child témában (SEO)'],
      ['Márkaoldal', '#/marka/elfbar', 'tax_product_brand_content.html (WooCommerce Brands) – leírás, logó, szűrhető lista; a márka-archívum template_include javítása a child témában'],
      ['Márkák A–Z', '#/markak', 'Főmenüpont; saját blokk: csak azok a product_brand kifejezések, amelyekhez van aktív termék'],
      ['Akciók', '#/akciok', 'Oldal: [products on_sale="true" class="mainquery"]'],
      ['Keresés', '#/kereses/Elfbar%2040000', 'search_content.html + kiterjesztett termékkereső (név, márka, pa_*, kategória, SKU, EAN, számnormalizálás) a child témában'],
      ['Termékoldal', '#/termek/elfbar-kit-joinone-40k-ci', 'single_product_content.html – iu-woocommerce blokkok (images, price, add-to-cart, stock, product-brand, product-attributes), nikotin-figyelmeztetés, JSON-LD Product'],
      ['Testvértermékek (SIMPLE)', '#/termek/geekvape-kit-wenax-q2-ra', 'Minden szín / íz / ellenállás külön SIMPLE termék (a CSV szerint); a termékoldal a csoport többi tagjára linkel (_fv_group meta)'],
      ['Kompatibilitás', '#/termek/elfbar-elfa-turbo-black', 'pa_kompatibilitas alapján: kompatibilis podok / patronok és készülékek, rendszermegjelöléssel'],
      ['Sok testvértermék', '#/termek/elfbar-elfa-pro-pod-pi-20', '12-nél több változatnál (pl. 49 ELFA Pro pod íz × nikotin) választólista a linkek helyett'],
      ['Készlethiányos / kifutott termék', '', 'Készlet státusz: outofstock + visszatérési értesítő; egyedi „discontinued” – oldal marad, helyettesítők. A valódi termékfájlban most nincs ilyen termék, a funkció kész.'],
      ['Kosár', '#/kosar', 'Klasszikus [woocommerce_cart] – eltávolítás gomb, ingyenes szállítási küszöb, ÁFA-sor piaconként; a súly csak a háttérben (díjszámítás, Packeta)'],
      ['Pénztár', '#/penztar', 'Klasszikus [woocommerce_checkout] – Packeta: výdajné miesto / Z-BOX (Packeta widget) és házhoz szállítás, eltérő szállítási cím, mezőnkénti hibaüzenet; Teya, utánvét, cégadatok (IČO/DIČ, SIRET/TVA), 18+ megerősítés'],
      ['Fiók', '#/fiok', 'My Account – rendelések követési számmal, számla letöltés, kedvencek (saját kód, wishlist-plugin nélkül)'],
      ['Információs és jogi oldalak', '#/oldal/shipping', 'Piaconként külön oldalak (SK: Obchodné podmienky …, FR: CGV, mentions légales …), inc/setup.php hozza létre; a szöveg HELYŐRZŐ']
    ];
    var csv = ['Terméknév', 'SKU', 'EAN', 'Kategória', 'Márka', 'Íz', 'Nikotin', 'ML', 'Puff', 'Kompatibilitás', 'Szín', 'Ellenállás (Ω)', 'Normál ár', 'Akciós ár', 'Készlet', 'Státusz', 'Súly (kg)', 'Rövid leírás', 'Hosszú leírás', 'Kép URL-ek'];
    return '<div class="wrap" lang="hu">' + crumbs([{ label: 'Prototípus áttekintés' }]) +
      '<div class="shop-title"><h1>Prototípus áttekintés</h1><p>A First Vape új WooCommerce frontendjének kattintható HTML prototípusa. Piacok: <b>Szlovákia (SK)</b> és <b>Franciaország (FR)</b>, pénznem EUR. Jóváhagyás után ebből készül az <b>iu_theme + firstvape child téma</b>. Ez az átadó oldal szándékosan magyar, a bolt felülete szlovák és francia.</p></div>' +
      '<section class="sec"><h2>Piacok és nyelvek</h2><div class="model">' +
      '<div><b>SK · slovenčina</b><span>alapértelmezett nyelv</span><code>DPH 23 % · Packeta · Teya · dobierka</code></div>' +
      '<div><b>FR · français</b><span>második nyelv</span><code>TVA 20 % · Packeta (díjak TBD) · Teya · utánvét?</code></div>' +
      '<div><b>Ár</b><span>alap: szlovák bruttó ár</span><code>FR bruttó = ár / 1,23 × 1,20 (WooCommerce alap)</code></div>' +
      '<div><b>Nyitott</b><span>jogász, könyvelő</span><code>ÁFA-kulcsok, jogi szövegek, FR eldobható-tilalom (2025. febr.)</code></div></div>' +
      '<p class="muted">Váltás: a fejléc SK / FR gombjai (mobilon a menüben, első látogatáskor a 18+ ablakban). A választás a böngészőben marad (FV.store).</p></section>' +
      '<section class="sec"><h2>Az adatmodell alapelve</h2><div class="model">' +
      '<div><b>Kategória</b><span>mi a termék</span><code>product_cat</code></div>' +
      '<div><b>Márka</b><span>ki gyártja</span><code>product_brand</code></div>' +
      '<div><b>Attribútum</b><span>tulajdonság (szűrő)</span><code>pa_iz · pa_nikotin · pa_kiszereles · pa_puff · pa_kompatibilitas · pa_szin · pa_ellenallas</code></div>' +
      '<div><b>Termékadat</b><span>értékesítés és logisztika</span><code>ár · akciós ár · készlet · státusz · SKU · EAN · súly</code></div></div></section>' +
      '<section class="sec"><h2>Oldalak és megfelelőjük (iu_theme + firstvape child téma)</h2><div class="tbl-wrap"><table class="proto-tbl"><thead><tr><th scope="col">Oldal</th><th scope="col">Megvalósítás</th></tr></thead><tbody>' +
      rows.map(function (r) { return '<tr><td>' + (r[1] ? '<a href="' + r[1] + '">' + esc(r[0]) + '</a>' : esc(r[0])) + '</td><td>' + esc(r[2]) + '</td></tr>'; }).join('') + '</tbody></table></div></section>' +
      '<section class="sec"><h2>Mit érdemes kipróbálni</h2><ul class="try">' +
      '<li>Válts nyelvet a fejléc SK / FR gombjával: a felület, az árak (23% ↔ 20% ÁFA), a szállítás, a fizetés és a jogi oldalak is váltanak.</li>' +
      '<li>Írd a fejléc keresőjébe: <a href="#/kereses/Elfbar%2040000">Elfbar 40000</a>, <a href="#/kereses/40k">40k</a>, <a href="#/kereses/40%20000">40 000</a>, <a href="#/kereses/mango">mango</a> vagy <a href="#/kereses/wenax">wenax</a>.</li>' +
      '<li>Vidd az egeret a főmenü pontjai fölé: mega menü alkategóriákkal, márkákkal és slukkszám-sávokkal. Csak a termékkel rendelkező kategóriák és márkák jelennek meg.</li>' +
      '<li>Szűrj a kategóriaoldalon: minden főkategória csak a rá értelmezhető szűrőket mutatja (pl. e-liquideknél íz, nikotin, kiszerelés; kiegészítőknél ellenállás). Mobilon a szűrő lenyíló panelben nyílik.</li>' +
      '<li>Nyiss meg egy készüléket (pl. <a href="#/termek/elfbar-elfa-turbo-black">ELFA TURBO</a>): alul az ügyfél ajánlásai (cross-sell), majd a kompatibilis podok, rendszermegjelöléssel.</li>' +
      '<li>Tegyél termékeket a kosárba, majd a pénztárban válassz Packeta átvételi pontot vagy házhoz szállítást. Hiányzó adatnál a mező alatt rövid hibaüzenet jelenik meg.</li></ul></section>' +
      '<section class="sec"><h2>CSV import sablon</h2><p class="muted">Automatikus leképezés a WooCommerce importálóra. Ugyanazzal a sablonnal lehet új termékeket feltölteni és meglévőket frissíteni (SKU alapján); az ár- és készletfrissítéshez elég az öt oszlopos rövid sablon. Minden termék SIMPLE. A kategória a fájl angol nevével is megadható, a webshop a szlovák kategóriához rendeli (<code>prototype/csv/kategoria-osszerendeles.csv</code>), így nem jön létre dupla kategória. Alkategória „Szülő &gt; Gyerek” formában. A súly csak a szállítási díjhoz kell, a vásárló nem látja. A fejlécek nyelvét az ügyféllel egyeztetni kell (a csapat nyelve). Sablonfájlok a repóban: <code>prototype/csv/firstvape-termekimport-sablon.csv</code>, <code>prototype/csv/firstvape-ar-keszlet-frissites.csv</code>.</p><div class="csvcols">' +
      csv.map(function (c) { return '<code>' + esc(c) + '</code>'; }).join('') + '</div></section>' +
      '<section class="sec"><h2>Integrációk (bővítményekkel)</h2><div class="acc-cards">' +
      '<div class="acc-card">' + I('card') + '<b>Teya</b><span>Online kártyás fizetés (fizetési kapu bővítmény)</span></div>' +
      '<div class="acc-card">' + I('receipt') + '<b>SuperFaktúra</b><span>Automatikus számlázás rendeléskor</span></div>' +
      '<div class="acc-card">' + I('truck') + '<b>Packeta (SK, FR)</b><span>Átvételi pont / Z-BOX választó, házhoz szállítás, címke a Packeta bővítménnyel; díjak élesítés előtt tesztelve</span></div></div></section></div>';
  };
})(window.FV);
