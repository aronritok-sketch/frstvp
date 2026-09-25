/*
 * First Vape – prototípus: útválasztó és interakciók
 * A hash alapú útvonalak a WordPress permalinkeket modellezik:
 *   #/kategoria/<slug>  → /termekkategoria/<slug>/
 *   #/marka/<slug>      → /marka/<slug>/
 *   #/termek/<slug>     → /termek/<slug>/
 *   #/kereses/<q>       → /?s=<q>&post_type=product
 */
(function (FV) {
  'use strict';
  var $ = FV.$, $$ = FV.$$;

  function parseHash() {
    var h = location.hash.replace(/^#\/?/, ''), q = {}, qs = '';
    var i = h.indexOf('?');
    if (i !== -1) { qs = h.slice(i + 1); h = h.slice(0, i); }
    qs.split('&').forEach(function (kv) {
      if (!kv) return;
      var p = kv.split('=');
      q[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
    });
    return { parts: h.split('/').filter(Boolean).map(decodeURIComponent), q: q };
  }

  var titles = { home: 'First Vape – e-cigaretták, podok, liquidek' };

  function route() {
    var r = parseHash(), p = r.parts, html, title = '', after = null, view = p[0] || '';
    FV.shopState = null;
    switch (view) {
      case '':
        html = FV.views.home(); after = initHome; title = titles.home; break;
      case 'kategoria':
        html = FV.views.shop({ type: 'cat', slug: p[1] }, r.q); after = FV.renderShop; title = (FV.cat(p[1]) || {}).name; break;
      case 'marka':
        html = FV.views.shop({ type: 'brand', slug: p[1] }, r.q); after = FV.renderShop; title = (FV.brand(p[1]) || {}).name; break;
      case 'akciok':
        html = FV.views.shop({ type: 'sale' }, r.q); after = FV.renderShop; title = 'Akciók'; break;
      case 'kereses':
        html = FV.views.shop({ type: 'search', q: p.slice(1).join('/') }, r.q); after = FV.renderShop; title = 'Keresés: ' + p[1]; break;
      case 'markak':
        html = FV.views.brands(); title = 'Márkák'; break;
      case 'termek':
        html = FV.views.product(p[1]); after = initProduct; title = (FV.product(p[1]) || {}).name; break;
      case 'kosar':
        html = FV.views.cart(); after = FV.renderCartPage; title = 'Kosár'; break;
      case 'penztar':
        html = FV.views.checkout(); after = FV.renderCheckoutSide; title = 'Pénztár'; break;
      case 'koszonjuk':
        html = FV.views.thanks(); title = 'Köszönjük a rendelést'; break;
      case 'fiok':
        html = FV.views.account(p[1]); title = 'Fiókom'; break;
      case 'oldal':
        html = FV.views.page(p[1]); title = FV.pages[p[1]]; break;
      case 'prototipus':
        html = FV.views.proto(); title = 'Prototípus áttekintés'; break;
      default:
        html = FV.views.notfound(); title = 'Nem található';
    }
    var main = $('#main');
    main.innerHTML = html;
    main.dataset.view = view || 'home';
    document.title = view ? (title ? title + ' | ' : '') + 'First Vape' : titles.home;
    if (after) after();
    closeAll();
    setActiveNav(view, p[1]);
    if (!route.keepScroll) window.scrollTo(0, 0);
    route.keepScroll = false;
  }

  function setActiveNav(view, slug) {
    $$('.nav-item').forEach(function (li) { li.classList.remove('on'); });
    var idx = -1;
    if (view === 'kategoria' && slug) {
      var c = FV.cat(slug), root = c && (c.parent || c.slug);
      FV.menu.forEach(function (m, i) { if (m.cat === root) idx = i; });
    } else if (view === 'marka' || view === 'markak') {
      FV.menu.forEach(function (m, i) { if (m.brands) idx = i; });
    } else if (view === 'akciok') {
      FV.menu.forEach(function (m, i) { if (m.sale) idx = i; });
    }
    if (idx !== -1) { var li = $('[data-nav="' + idx + '"]'); if (li) li.classList.add('on'); }
  }

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(html) {
    var t = $('[data-toast]');
    t.innerHTML = html;
    t.hidden = false;
    t.classList.remove('in'); void t.offsetWidth; t.classList.add('in');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 3200);
  }
  FV.toast = toast;

  /* ---------- Drawers ---------- */
  function openDrawer(name) {
    closeAll();
    var d = $('[data-drawer="' + name + '"]');
    if (!d) return;
    d.hidden = false;
    document.body.classList.add('lock');
    var btn = d.querySelector('.drawer-panel .icon-btn');
    if (btn) btn.focus();
  }
  function closeAll() {
    $$('[data-drawer]').forEach(function (d) { d.hidden = true; });
    var f = $('[data-filters]');
    if (f) f.classList.remove('open');
    document.body.classList.toggle('lock', !!$('[data-agegate]'));
    $$('.nav-item.open').forEach(function (li) { li.classList.remove('open'); });
    var drop = $('.hs-drop');
    if (drop) drop.hidden = true;
  }

  /* ---------- Főoldal ---------- */
  function initHome() {
    var r = $('[data-pf-range]');
    if (!r) return;
    function upd() {
      var n = FV.PUFF_STEPS[+r.value];
      var cnt = FV.products.filter(function (p) { return FV.inCat(p, 'eldobhato') && (p.attrs.puff || []).indexOf(n) !== -1 && p.stock !== 'discontinued'; }).length;
      $('#pf-out').textContent = FV.num(n);
      $('[data-pf-count]').textContent = cnt;
      $('[data-pf-go]').href = '#/kategoria/eldobhato?puff=' + n;
      r.style.setProperty('--p', (r.value / (FV.PUFF_STEPS.length - 1) * 100) + '%');
    }
    r.addEventListener('input', upd);
    upd();
  }

  /* ---------- Termékoldal ---------- */
  function initProduct() {
    var sb = $('[data-sticky-buy]'), form = $('[data-buy]');
    if (sb && form && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { sb.classList.toggle('show', !e[0].isIntersecting && e[0].boundingClientRect.top < 0); }).observe(form);
    }
  }

  /* ---------- Események (delegálva) ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-act]');
    if (!a) {
      // külső kattintás bezárja a kereső lenyílót
      if (!e.target.closest('.hsearch')) { var dd = $('.hs-drop'); if (dd) dd.hidden = true; }
      return;
    }
    var act = a.dataset.act, id = +a.dataset.id;
    switch (act) {
      case 'menu-open': openDrawer('menu'); break;
      case 'cart-open': FV.renderMiniCart(); openDrawer('cart'); break;
      case 'drawer-close': closeAll(); break;
      case 'add': {
        FV.cart.add(id, 1, {});
        var p = FV.product(id);
        toast(FV.icon('check') + '<span><b>' + FV.esc(p.name) + '</b> a kosárba került.</span><button type="button" class="linkbtn" data-act="cart-open">Kosár</button>');
        a.classList.add('added'); setTimeout(function () { a.classList.remove('added'); }, 900);
        break;
      }
      case 'wish': {
        var on = FV.wish.toggle(id);
        $$('[data-act="wish"][data-id="' + id + '"]').forEach(function (b) { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
        toast(FV.icon('heart') + '<span>' + (on ? 'Hozzáadva a kedvencekhez.' : 'Eltávolítva a kedvencek közül.') + '</span>');
        break;
      }
      case 'line-qty': {
        var items = FV.cart.items(), i = +a.dataset.i;
        FV.cart.setQty(i, items[i].qty + (+a.dataset.d));
        break;
      }
      case 'line-remove': FV.cart.setQty(+a.dataset.i, 0); break;
      case 'qty': {
        var inp = $('#buy-qty');
        inp.value = Math.max(1, Math.min(+inp.max || 99, (+inp.value || 1) + (+a.dataset.d)));
        break;
      }
      case 'sticky-add': {
        var f = $('[data-buy]');
        if (f) f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { cancelable: true }));
        break;
      }
      case 'gview': {
        var pr = FV.product(id);
        $('[data-g-main]').firstChild.outerHTML = FV.art(pr, { view: +a.dataset.v });
        $$('.g-th').forEach(function (b) { b.classList.toggle('on', b === a); });
        break;
      }
      case 'ptab': {
        $$('.ptabs .tab').forEach(function (b) { var on = b === a; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
        $$('.ptabs .tabpane').forEach(function (p) { p.hidden = p.dataset.pane !== a.dataset.t; });
        break;
      }
      case 'home-tab': {
        $$('.tabs [data-act="home-tab"]').forEach(function (b) { var on = b === a; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
        $('[data-home-tab]').innerHTML = FV.views.popular(a.dataset.tab);
        break;
      }
      case 'scroll': {
        e.preventDefault();
        var t = document.getElementById(a.dataset.t);
        if (t) t.scrollIntoView({ behavior: 'smooth' });
        break;
      }
      case 'az': {
        e.preventDefault();
        var g = document.getElementById('az-' + a.dataset.l);
        if (g) g.scrollIntoView({ behavior: 'smooth' });
        break;
      }
      case 'filters-open': $('[data-filters]').classList.add('open'); document.body.classList.add('lock'); break;
      case 'filters-close': $('[data-filters]').classList.remove('open'); document.body.classList.remove('lock'); break;
      case 'f-remove': {
        var s = FV.shopState;
        if (a.dataset.k === 'ar') { delete s.f.min; delete s.f.max; }
        else s.f[a.dataset.k] = s.f[a.dataset.k].filter(function (v) { return v !== a.dataset.v; });
        s.f.oldal = 1;
        FV.renderShop();
        break;
      }
      case 'f-clear': {
        var st = FV.shopState;
        FV.facetDefs.forEach(function (d) { st.f[d.key] = []; });
        delete st.f.min; delete st.f.max; st.f.akcio = false; st.f.oldal = 1;
        FV.renderShop();
        break;
      }
      case 'page': {
        FV.shopState.f.oldal = +a.dataset.p;
        FV.renderShop(true);
        $('.results').scrollIntoView({ behavior: 'smooth' });
        break;
      }
      case 'age-yes': FV.store.set('age_ok', true); $('[data-agegate]').remove(); document.body.classList.remove('lock'); break;
      case 'age-no': $('.ag-no').hidden = false; break;
      case 'co-fill': fillCheckout(); break;
      case 'skip': e.preventDefault(); $('#main').focus(); break;
    }
  });

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.matches('[data-f]')) {
      var s = FV.shopState, k = t.dataset.f, arr = s.f[k] || [];
      if (t.checked) arr.push(t.value); else arr = arr.filter(function (v) { return v !== t.value; });
      s.f[k] = arr; s.f.oldal = 1;
      FV.renderShop(true);
    } else if (t.matches('[data-f-akcio]')) {
      FV.shopState.f.akcio = t.checked; FV.shopState.f.oldal = 1; FV.renderShop(true);
    } else if (t.matches('[data-pr]')) {
      var mn = $('[data-pr="min"]'), mx = $('[data-pr="max"]'), box = $('[data-price-f]');
      var lo = +mn.value, hi = +mx.value;
      if (lo > hi) { var tmp = lo; lo = hi; hi = tmp; }
      var st = FV.shopState;
      st.f.min = lo > +box.dataset.lo ? lo : undefined;
      st.f.max = hi < +box.dataset.hi ? hi : undefined;
      if (st.f.min == null) delete st.f.min;
      if (st.f.max == null) delete st.f.max;
      st.f.oldal = 1;
      FV.renderShop(true);
    } else if (t.matches('[data-sort]')) {
      FV.shopState.f.rend = t.value; FV.renderShop(true);
    } else if (t.matches('[data-ship]')) {
      FV.store.set('ship', t.value);
      FV.renderCartPage(); FV.renderCheckoutSide();
    } else if (t.matches('[name="pay"]')) {
      FV.renderCheckoutSide();
    } else if (t.id === 'co-company') {
      $('[data-company]').hidden = !t.checked;
    } else if (t.matches('[data-opt]')) {
      $('[data-opt-val="' + t.dataset.opt + '"]').textContent = t.value;
      $('[data-buy-err]').hidden = true;
    }
  });

  document.addEventListener('toggle', function (e) {
    var d = e.target;
    if (d.matches && d.matches('details[data-facet]')) {
      var c = FV.store.get('facets_closed', {});
      c[d.dataset.facet] = !d.open;
      FV.store.set('facets_closed', c);
    }
  }, true);

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.matches('[data-pr]')) FV.paintPrice();
    if (t.matches('[data-live-search]')) liveSearch(t);
  });

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.matches('[data-search-form]')) {
      e.preventDefault();
      var q = f.q.value.trim();
      if (q) location.hash = '#/kereses/' + encodeURIComponent(q);
      f.q.blur();
    } else if (f.matches('[data-buy]')) {
      e.preventDefault();
      var v = {}, missing = [];
      $$('.opt', f).forEach(function (fs) {
        var ch = $('input:checked', fs);
        var k = $('input', fs).dataset.opt;
        if (ch) v[k] = ch.value; else missing.push(fs.querySelector('legend').firstChild.textContent.replace(':', '').trim());
      });
      if (missing.length) {
        var err = $('[data-buy-err]');
        err.textContent = 'Válaszd ki: ' + missing.join(', ').toLowerCase() + '.';
        err.hidden = false;
        f.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      var p = FV.product(+f.dataset.id), qty = Math.max(1, +$('#buy-qty').value || 1);
      FV.cart.add(p.id, qty, v);
      toast(FV.icon('check') + '<span><b>' + qty + ' × ' + FV.esc(p.name) + '</b> a kosárba került.</span><button type="button" class="linkbtn" data-act="cart-open">Kosár</button>');
    } else if (f.matches('[data-notify]') || f.matches('[data-fake-form]')) {
      e.preventDefault();
      var ok = $('.ok-msg', f);
      if (ok) ok.hidden = false;
    } else if (f.matches('[data-newsletter]')) {
      e.preventDefault();
      toast(FV.icon('mail') + '<span>Feliratkoztál. Megerősítő e-mailt küldtünk.</span>');
      f.reset();
    } else if (f.matches('[data-coupon]')) {
      e.preventDefault();
      $('[data-cp-msg]').textContent = 'A kuponkezelés a WooCommerce kuponokkal működik; a prototípusban nincs érvényes kód.';
    } else if (f.matches('[data-checkout]')) {
      e.preventDefault();
      var bad = $$('[required]', f).filter(function (i) { return i.type === 'checkbox' ? !i.checked : !i.value.trim(); });
      $$('.fld.err', f).forEach(function (x) { x.classList.remove('err'); });
      bad.forEach(function (i) { var fl = i.closest('.fld'); if (fl) fl.classList.add('err'); });
      var ce = $('[data-co-err]');
      if (bad.length) {
        ce.textContent = 'Töltsd ki a kötelező mezőket' + (bad.some(function (i) { return i.type === 'checkbox'; }) ? ', és fogadd el a feltételeket' : '') + '.';
        ce.hidden = false;
        bad[0].focus();
        return;
      }
      var t = FV.cart.totals(), ship = FV.shippingCost(FV.store.get('ship', 'dpd-home'), t.weight, t.sub), pay = $('#pay-cod').checked ? 'cod' : 'teya';
      FV.store.set('last_order', { no: 'FV-2026-' + (10500 + Math.floor(Math.random() * 400)), total: t.sub + ship + (pay === 'cod' ? 1.5 : 0), email: $('#co-email').value, pay: pay });
      FV.cart.save([]);
      location.hash = '#/koszonjuk';
    }
  });

  function fillCheckout() {
    var d = { 'co-email': 'anna.kovacs@example.com', 'co-phone': '+421 905 123 456', 'co-first': 'Anna', 'co-last': 'Kovács', 'co-zip': '945 01', 'co-city': 'Komárno', 'co-street': 'Hlavná 12' };
    Object.keys(d).forEach(function (k) { var el = document.getElementById(k); if (el) el.value = d[k]; });
    $('#co-18').checked = true; $('#co-terms').checked = true;
  }

  /* ---------- Élő keresés ---------- */
  var lsTimer;
  function liveSearch(inp) {
    clearTimeout(lsTimer);
    lsTimer = setTimeout(function () {
      var drop = inp.parentNode.querySelector('.hs-drop'), q = inp.value.trim();
      if (q.length < 2) { drop.hidden = true; return; }
      drop.innerHTML = FV.renderLiveSearch(q);
      drop.hidden = false;
    }, 120);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });

  /* ---------- Mega menü: hover + kattintás/billentyűzet ---------- */
  function initMega() {
    $$('.nav-item.has-mega').forEach(function (li) {
      var t;
      li.addEventListener('mouseenter', function () { clearTimeout(t); t = setTimeout(function () { $$('.nav-item.open').forEach(function (x) { if (x !== li) x.classList.remove('open'); }); li.classList.add('open'); li.firstChild.setAttribute('aria-expanded', 'true'); }, 90); });
      li.addEventListener('mouseleave', function () { clearTimeout(t); t = setTimeout(function () { li.classList.remove('open'); li.firstChild.setAttribute('aria-expanded', 'false'); }, 160); });
      li.addEventListener('focusin', function () { li.classList.add('open'); });
      li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) li.classList.remove('open'); });
      // érintőképernyőn az első koppintás a panelt nyitja
      li.firstChild.addEventListener('click', function (e) {
        if (window.matchMedia('(hover: none)').matches && !li.classList.contains('open')) { e.preventDefault(); li.classList.add('open'); }
      });
    });
  }

  /* ---------- Indítás ---------- */
  function boot() {
    $('#site-header').innerHTML = FV.renderHeader();
    $('#site-footer').innerHTML = FV.renderFooter();
    var ag = FV.renderAgeGate();
    if (ag) { document.body.insertAdjacentHTML('beforeend', ag); document.body.classList.add('lock'); }
    initMega();
    FV.renderMiniCart();
    FV.on('cart', function () { FV.renderMiniCart(); FV.renderCartPage(); FV.renderCheckoutSide(); });
    FV.on('wish', function () {
      FV.renderMiniCart();
      var r = parseHash();
      if (r.parts[0] === 'fiok') { route.keepScroll = true; route(); }
    });
    window.addEventListener('hashchange', route);
    route();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.FV);
