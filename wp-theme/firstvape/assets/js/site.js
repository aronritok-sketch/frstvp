/*
 * First Vape – a webshop interakciói (az előnézet app.js-ének megfelelője, WordPress / WooCommerce alatt).
 * Minden funkció JS nélkül is működik (linkek, GET-űrlapok, a WooCommerce saját kosárba tétele); a JS gyorsít:
 * mega menü, élő kereső, AJAX kosár és kosár-fiók, kedvencek, szűrés újratöltés nélkül, 18+ kapu, űrlapok,
 * pénztár mezőnkénti hibaüzenettel.
 * Indítás DOMContentLoaded-re (a deferred szkript az „interactive” állapotban is futhat – Slugshop tanulsága).
 */
(function () {
  'use strict';
  var C = window.FIRSTVAPE || {}, T = C.i18n || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- sütik, tároló ---------- */
  function cookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }
  function setCookie(name, value, days) {
    document.cookie = name + '=' + encodeURIComponent(value) + '; path=' + (C.cookiePath || '/') + '; max-age=' + Math.round(days * 86400) + '; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
  }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('fv_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('fv_' + k, JSON.stringify(v)); } catch (e) { /* privát mód */ } }
  };
  function fmt(s, vars) { return String(s || '').replace(/\{(\w+)\}/g, function (m, k) { return vars && k in vars ? vars[k] : m; }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var ICO = {
    check: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>',
    heart: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9Z"/></svg>',
    mail: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>'
  };

  /* ---------- üzenetsáv ---------- */
  var toastTimer;
  function toast(html) {
    var t = $('[data-toast]');
    if (!t) return;
    t.innerHTML = html;
    t.hidden = false;
    t.classList.remove('in'); void t.offsetWidth; t.classList.add('in');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 3200);
  }

  /* ---------- fiókok (mobilmenü, kosár) ---------- */
  function openDrawer(name) {
    closeAll();
    var d = $('[data-drawer="' + name + '"]');
    if (!d) return false;
    d.hidden = false;
    document.body.classList.add('lock');
    var btn = $('.drawer-panel .icon-btn', d);
    if (btn) btn.focus();
    return true;
  }
  function closeAll() {
    $$('[data-drawer]').forEach(function (d) { d.hidden = true; });
    var f = $('[data-filters]');
    if (f) f.classList.remove('open');
    var ag = $('[data-agegate]');
    document.body.classList.toggle('lock', !!(ag && !ag.hidden));
    $$('.nav-item.open').forEach(function (li) { li.classList.remove('open'); });
    var drop = $('.hs-drop');
    if (drop) drop.hidden = true;
  }

  /* ---------- WooCommerce: fragmentek, kosárba tétel ---------- */
  function applyFragments(fr) {
    if (!fr) return;
    Object.keys(fr).forEach(function (sel) {
      $$(sel).forEach(function (el) {
        var tmp = document.createElement('div');
        tmp.innerHTML = fr[sel];
        if (tmp.firstElementChild) el.replaceWith(tmp.firstElementChild);
      });
    });
    if (window.jQuery) window.jQuery(document.body).trigger('wc_fragments_refreshed');
  }
  function post(url, data) {
    var body = new URLSearchParams();
    Object.keys(data).forEach(function (k) { body.append(k, data[k]); });
    return fetch(url, { method: 'POST', body: body, credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } }).then(function (r) { return r.json(); });
  }
  function addToCart(id, qty, name, btn) {
    if (!C.wcAjax) return false;
    if (btn) btn.classList.add('loading');
    post(C.wcAjax.replace('%%endpoint%%', 'add_to_cart'), { product_id: id, quantity: qty }).then(function (r) {
      if (btn) btn.classList.remove('loading');
      if (!r || r.error) { if (r && r.product_url) location.href = r.product_url; else toast(esc(T.error)); return; }
      applyFragments(r.fragments);
      toast(ICO.check + '<span>' + fmt(T.addedToCart, { x: esc((qty > 1 ? qty + ' × ' : '') + name) }) + '</span><button type="button" class="linkbtn" data-act="cart-open">' + esc(T.cart) + '</button>');
      if (btn) { btn.classList.add('added'); setTimeout(function () { btn.classList.remove('added'); }, 900); }
      if (window.jQuery) window.jQuery(document.body).trigger('added_to_cart', [r.fragments, r.cart_hash]);
    }).catch(function () { if (btn) btn.classList.remove('loading'); toast(esc(T.error)); });
    return true;
  }
  function cartLine(key, d, remove) {
    var data = { action: 'firstvape_cart', nonce: C.nonce, key: key, d: d || 0 };
    if (remove) data.remove = 1;
    post(C.ajax, data).then(function (r) {
      applyFragments(r && r.fragments);
      if (document.body.classList.contains('woocommerce-cart') || document.body.classList.contains('woocommerce-checkout')) location.reload();
    });
  }

  /* ---------- kedvencek (fv_wish süti; bejelentkezve a fiókba is) ---------- */
  function wishIds() { return cookie('fv_wish').split(',').filter(Boolean).map(Number); }
  function paintWish() {
    var ids = wishIds();
    $$('[data-act="wish"]').forEach(function (b) { var on = ids.indexOf(+b.dataset.id) !== -1; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    $$('[data-wish-count]').forEach(function (e) { e.textContent = ids.length; e.hidden = !ids.length; });
  }
  function toggleWish(id) {
    var ids = wishIds(), i = ids.indexOf(id);
    if (i === -1) ids.push(id); else ids.splice(i, 1);
    setCookie('fv_wish', ids.join(','), 365);
    paintWish();
    if (C.loggedIn) post(C.ajax, { action: 'firstvape_wish', nonce: C.nonce, ids: ids.join(',') });
    return i === -1;
  }

  /* ---------- terméklista: szűrés újratöltés nélkül ---------- */
  function shopUrl(form) {
    var url = new URL(form.action, location.href), q = new URLSearchParams();
    var multi = {};
    $$('input[data-f]:checked', form).forEach(function (i) { (multi[i.dataset.f] = multi[i.dataset.f] || []).push(i.value); });
    Object.keys(multi).forEach(function (k) { q.set(k, multi[k].join(',')); });
    var box = $('[data-price-f]', form);
    if (box) {
      var lo = +$('[data-pr="min"]', box).value, hi = +$('[data-pr="max"]', box).value;
      if (lo > hi) { var t = lo; lo = hi; hi = t; }
      if (lo > +box.dataset.lo) q.set('min', lo);
      if (hi < +box.dataset.hi) q.set('max', hi);
    }
    var ak = $('[data-f-akcio]', form);
    if (ak && ak.checked) q.set('akcio', '1');
    var s = $('[data-sort]', form);
    if (s && s.value !== 'pop') q.set('rend', s.value);
    var srch = $('input[name="s"]', form);
    if (srch) { q.set('s', srch.value); q.set('post_type', 'product'); }
    var qs = q.toString();
    return url.origin + url.pathname + (qs ? '?' + qs : '');
  }
  var shopReq = 0;
  function loadShop(url, push, scroll) {
    var cur = $('[data-shop]');
    if (!cur) { location.href = url; return; }
    var wasOpen = $('[data-filters]', cur) && $('[data-filters]', cur).classList.contains('open');
    var my = ++shopReq;
    cur.classList.add('is-loading');
    fetch(url, { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (html) {
      if (my !== shopReq) return;
      var doc = new DOMParser().parseFromString(html, 'text/html'), next = $('[data-shop]', doc);
      if (!next) { location.href = url; return; }
      cur.replaceWith(next);
      if (wasOpen) { $('[data-filters]').classList.add('open'); }
      if (push) history.pushState({ shop: 1 }, '', url);
      restoreFacets();
      paintPrice();
      paintWish();
      if (scroll) { var r = $('.results'); if (r) r.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }).catch(function () { location.href = url; });
  }
  function restoreFacets() {
    var closed = store.get('facets_closed', {});
    $$('details[data-facet]').forEach(function (d) { if (closed[d.dataset.facet]) d.open = false; });
  }
  function paintPrice() {
    var box = $('[data-price-f]');
    if (!box) return;
    var lo = +box.dataset.lo, hi = +box.dataset.hi, a = +$('[data-pr="min"]', box).value, b = +$('[data-pr="max"]', box).value;
    var fill = $('[data-pr-fill]', box);
    if (fill) { fill.style.left = ((Math.min(a, b) - lo) / (hi - lo || 1) * 100) + '%'; fill.style.right = (100 - (Math.max(a, b) - lo) / (hi - lo || 1) * 100) + '%'; }
    var money = function (n) { return n.toFixed(2).replace('.', ',') + ' €'; };
    $('[data-pr-lo]', box).textContent = money(Math.min(a, b));
    $('[data-pr-hi]', box).textContent = money(Math.max(a, b));
  }

  /* ---------- kattintások (delegálva) ---------- */
  document.addEventListener('click', function (e) {
    var shopLink = e.target.closest('a[data-shop-link]');
    if (shopLink && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      loadShop(shopLink.href, true, shopLink.hasAttribute('data-page'));
      return;
    }
    var a = e.target.closest('[data-act]');
    if (!a) {
      if (!e.target.closest('.hsearch')) { var dd = $('.hs-drop'); if (dd) dd.hidden = true; }
      return;
    }
    var act = a.dataset.act;
    switch (act) {
      case 'menu-open': openDrawer('menu'); break;
      case 'cart-open':
        if (document.body.classList.contains('woocommerce-cart')) break; // a kosár oldalon a link marad
        if (openDrawer('cart')) e.preventDefault();
        break;
      case 'drawer-close': if (!a.matches('[type="submit"]')) closeAll(); break;
      case 'add': {
        var card = a.closest('.pcard'), name = card ? ($('.pc-name', card) || {}).textContent : '';
        if (addToCart(+a.dataset.id, 1, name, a)) e.preventDefault();
        break;
      }
      case 'wish': {
        e.preventDefault();
        var on = toggleWish(+a.dataset.id);
        toast(ICO.heart + '<span>' + esc(on ? T.wishAdded : T.wishRemoved) + '</span>');
        break;
      }
      case 'line-qty': cartLine(a.dataset.key, +a.dataset.d); break;
      case 'line-remove': cartLine(a.dataset.key, 0, true); break;
      case 'qty': {
        var inp = $('#buy-qty');
        inp.value = Math.max(1, Math.min(+inp.max || 99, (+inp.value || 1) + (+a.dataset.d)));
        break;
      }
      case 'sticky-add': {
        var f = $('[data-buy]');
        if (f) { if (f.requestSubmit) f.requestSubmit(); else f.submit(); }
        break;
      }
      case 'gview': {
        var main = $('[data-g-main] img');
        if (main && a.dataset.src) { main.src = a.dataset.src; main.removeAttribute('srcset'); }
        $$('.g-th').forEach(function (b) { b.classList.toggle('on', b === a); });
        break;
      }
      case 'ptab': {
        $$('.ptabs .tab').forEach(function (b) { var on2 = b === a; b.classList.toggle('on', on2); b.setAttribute('aria-selected', on2); });
        $$('.ptabs .tabpane').forEach(function (p) { p.hidden = p.dataset.pane !== a.dataset.t; });
        break;
      }
      case 'home-tab': {
        $$('[data-act="home-tab"]').forEach(function (b) { var on3 = b === a; b.classList.toggle('on', on3); b.setAttribute('aria-selected', on3); });
        $$('[data-home-pane]').forEach(function (p) { p.hidden = p.dataset.homePane !== a.dataset.tab; });
        paintWish();
        break;
      }
      case 'filters-open': $('[data-filters]').classList.add('open'); document.body.classList.add('lock'); break;
      case 'filters-close':
        if (a.type !== 'submit') { $('[data-filters]').classList.remove('open'); document.body.classList.remove('lock'); }
        else { e.preventDefault(); $('[data-filters]').classList.remove('open'); document.body.classList.remove('lock'); }
        break;
      case 'age-yes': {
        setCookie('fv_age', '1', 365);
        var g = $('[data-agegate]');
        if (g) g.remove();
        document.body.classList.remove('lock');
        break;
      }
      case 'age-no': $('.ag-no').hidden = false; break;
    }
  });

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.matches('[data-variant-select]')) { location.href = t.value; return; }
    var form = t.closest('[data-shop]');
    if (form && (t.matches('[data-f]') || t.matches('[data-f-akcio]') || t.matches('[data-sort]') || t.matches('[data-pr]'))) {
      loadShop(shopUrl(form), true, false);
      return;
    }
    // pénztár: cégként vásárlás → a cégmezők; fizetési mód → az összesítő (utánvét díja)
    if (t.id === 'fv_company_toggle') companyFields();
    if (t.name === 'payment_method' && window.jQuery) window.jQuery(document.body).trigger('update_checkout');
    if (t.name === 'fv_pickup') { var pe = $('[data-pickup-err]'); if (pe) pe.hidden = true; var pk = $('[data-pickup]'); if (pk) pk.classList.remove('err'); }
  });

  document.addEventListener('toggle', function (e) {
    var d = e.target;
    if (d.matches && d.matches('details[data-facet]')) {
      var c = store.get('facets_closed', {});
      c[d.dataset.facet] = !d.open;
      store.set('facets_closed', c);
    }
  }, true);

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.matches('[data-shop]')) { e.preventDefault(); loadShop(shopUrl(f), true, false); return; }
    if (f.matches('[data-buy]')) {
      var qty = Math.max(1, +($('#buy-qty', f) || {}).value || 1), h1 = $('.pinfo h1');
      if (addToCart(+f.dataset.id, qty, h1 ? h1.textContent : '', $('.buy-btn', f))) e.preventDefault();
      return;
    }
    if (f.matches('[data-form]')) { e.preventDefault(); sendForm(f); }
  });

  /* ---------- űrlapok (REST: firstvape/v1/form/<fajta>) ---------- */
  function sendForm(f) {
    var kind = f.dataset.form, msg = $('[data-form-msg]', f), fd = new FormData(f);
    fd.append('lang', C.lang || 'sk');
    $$('.fld.err, .err', f).forEach(function (x) { x.classList.remove('err'); });
    var bad = $$('[required]', f).filter(function (i) { return i.type === 'checkbox' ? !i.checked : !i.value.trim() || (i.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value.trim())); });
    if (bad.length) {
      bad.forEach(function (i) { (i.closest('.fld') || i.parentNode).classList.add('err'); });
      if (msg) { msg.textContent = bad[0].type === 'email' ? T.errEmail : bad[0].type === 'checkbox' ? T.errCheck : T.errField; msg.hidden = false; msg.classList.add('is-err'); }
      bad[0].focus();
      return;
    }
    var btn = $('[type="submit"]', f);
    if (btn) btn.disabled = true;
    fetch(C.rest + 'form/' + kind, { method: 'POST', body: fd, credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (r) {
      if (btn) btn.disabled = false;
      if (r && r.ok) {
        if (kind === 'newsletter') { toast(ICO.mail + '<span>' + esc(T.nlDone) + '</span>'); f.reset(); if (msg) msg.hidden = true; return; }
        if (msg) { msg.classList.remove('is-err'); msg.textContent = msg.dataset.ok || msg.textContent; msg.hidden = false; }
        $$('input:not([type=hidden]), textarea', f).forEach(function (i) { if (i.type !== 'checkbox') i.value = ''; });
        return;
      }
      var errs = (r && r.errors) || {}, first = Object.keys(errs)[0];
      Object.keys(errs).forEach(function (k) { var i = f.querySelector('[name="' + k + '"]'); if (i) (i.closest('.fld') || i.parentNode).classList.add('err'); });
      if (msg) { msg.textContent = errs[first] || T.error; msg.hidden = false; msg.classList.add('is-err'); }
    }).catch(function () { if (btn) btn.disabled = false; if (msg) { msg.textContent = T.error; msg.hidden = false; } });
  }
  // a siker-üzenet szövege megmarad (a hiba felülírná)
  function keepOkText() { $$('[data-form-msg]').forEach(function (m) { if (!m.dataset.ok) m.dataset.ok = m.textContent; }); }

  /* ---------- élő kereső ---------- */
  var lsTimer, lsReq = 0;
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.matches('[data-pr]')) paintPrice();
    if (t.matches('[data-live-search]')) {
      clearTimeout(lsTimer);
      lsTimer = setTimeout(function () {
        var drop = t.parentNode.querySelector('.hs-drop'), q = t.value.trim(), my = ++lsReq;
        if (q.length < 2) { drop.hidden = true; return; }
        fetch(C.rest + 'search?q=' + encodeURIComponent(q) + '&lang=' + (C.lang || 'sk')).then(function (r) { return r.json(); }).then(function (r) {
          if (my !== lsReq) return;
          drop.innerHTML = r.html || '';
          drop.hidden = !r.html;
        });
      }, 150);
    }
    // Packeta minta: az átvételi pontok szűrése
    if (t.matches('[data-pickup-q]')) {
      var q2 = t.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      $$('[data-pp-list] .pp-item').forEach(function (it) { it.hidden = q2 && it.textContent.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').indexOf(q2) === -1; });
    }
    // pénztár: az első beküldés után gépelés közben eltűnik a hiba
    var row = t.closest && t.closest('.form-row.fv-has-err');
    if (row) checkField(t, true);
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
  window.addEventListener('popstate', function () { if ($('[data-shop]')) loadShop(location.href, false, false); });

  /* ---------- mega menü: hover + kattintás / billentyűzet ---------- */
  function initMega() {
    $$('.nav-item.has-mega').forEach(function (li) {
      var tm, link = li.firstElementChild;
      li.addEventListener('mouseenter', function () { clearTimeout(tm); tm = setTimeout(function () { $$('.nav-item.open').forEach(function (x) { if (x !== li) x.classList.remove('open'); }); li.classList.add('open'); link.setAttribute('aria-expanded', 'true'); }, 90); });
      li.addEventListener('mouseleave', function () { clearTimeout(tm); tm = setTimeout(function () { li.classList.remove('open'); link.setAttribute('aria-expanded', 'false'); }, 160); });
      li.addEventListener('focusin', function () { li.classList.add('open'); });
      li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) li.classList.remove('open'); });
      // érintőképernyőn az első koppintás a panelt nyitja
      link.addEventListener('click', function (e) {
        if (window.matchMedia('(hover: none)').matches && !li.classList.contains('open')) { e.preventDefault(); li.classList.add('open'); }
      });
    });
  }

  /* ---------- nyitóoldal: slukkszám-kereső ---------- */
  function initPuffFinder() {
    var box = $('[data-pufffinder]'), r = $('[data-pf-range]');
    if (!box || !r) return;
    var steps = JSON.parse(box.dataset.steps || '[]');
    function upd() {
      var s = steps[+r.value];
      if (!s) return;
      $('#pf-out').textContent = s.label;
      $('[data-pf-count]').textContent = s.n;
      $('[data-pf-go]').href = s.url;
      r.style.setProperty('--p', (r.value / (steps.length - 1 || 1) * 100) + '%');
    }
    r.addEventListener('input', upd);
    upd();
  }

  /* ---------- termékoldal: ragadó kosárba sáv ---------- */
  function initProduct() {
    var sb = $('[data-sticky-buy]'), form = $('[data-buy]');
    if (sb && form && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { sb.classList.toggle('show', !e[0].isIntersecting && e[0].boundingClientRect.top < 0); }).observe(form);
    }
  }

  /* ---------- pénztár: cégmezők, mezőnkénti hibaüzenet, Packeta widget ---------- */
  function companyFields() {
    var on = !!($('#fv_company_toggle') || {}).checked;
    $$('.fv-company').forEach(function (r) { r.hidden = !on; });
  }
  var ZIP = new RegExp(C.zip || '^\\d{3}\\s?\\d{2}$');
  function fieldError(i) {
    if (i.type === 'checkbox') return i.checked ? '' : T.errCheck;
    var v = (i.value || '').trim();
    if (!v) return T.errField;
    if (i.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return T.errEmail;
    if (i.type === 'tel' && v.replace(/\D/g, '').length < 9) return T.errPhone;
    if (/_postcode$/.test(i.id) && !ZIP.test(v)) return T.errZip;
    return '';
  }
  function showError(row, msg) {
    if (!row) return;
    row.classList.toggle('fv-has-err', !!msg);
    row.classList.toggle('woocommerce-invalid', !!msg);
    // a WooCommerce (9+) saját mező alatti üzenete, ha van; különben a miénk
    var m = $('.checkout-inline-error-message', row) || $('.err-msg', row);
    if (!m && msg) { m = document.createElement('p'); m.className = 'err-msg'; m.setAttribute('role', 'alert'); row.appendChild(m); }
    if (m) { m.textContent = msg || ''; m.hidden = !msg; }
    var inp = $('input, select, textarea', row);
    if (inp) inp.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function checkField(i, live) {
    var row = i.closest('.form-row');
    if (!row || row.closest('[hidden]') || (row.closest('.shipping_address') && !($('#ship-to-different-address-checkbox') || {}).checked)) return '';
    var required = row.classList.contains('validate-required') || (row.classList.contains('fv-company') && /billing_(company|fv_id)$/.test(i.id) && ($('#fv_company_toggle') || {}).checked);
    var msg = required || i.value ? fieldError(i) : '';
    if (!required && !i.value) msg = '';
    if (live && !msg) showError(row, '');
    else if (!live) showError(row, msg);
    return msg;
  }
  function initCheckout() {
    var form = $('form.checkout');
    if (!form) return;
    companyFields();
    form.addEventListener('blur', function (e) {
      var i = e.target;
      if (i.matches && i.matches('input:not([type=hidden]):not([type=checkbox]), select, textarea') && i.closest('.form-row')) checkField(i, false);
    }, true);
    if (!window.jQuery) return;
    var jq = window.jQuery;
    // a WooCommerce hibalistája (li[data-id]) → a mező alá, röviden; fölül egy összefoglaló
    jq(document.body).on('checkout_error', function () {
      var grp = $('.woocommerce-NoticeGroup-checkout');
      if (!grp) return;
      var first = null, rest = [];
      $$('li', grp).forEach(function (li) {
        var id = li.getAttribute('data-id'), el = id ? document.getElementById(id) : null, row = el && el.closest('.form-row');
        if (id === 'fv_pickup') { var pk = $('[data-pickup]'), pe = $('[data-pickup-err]'); if (pk) pk.classList.add('err'); if (pe) pe.hidden = false; first = first || pk; return; }
        if (row) { showError(row, li.textContent.trim()); first = first || row; } else rest.push(li.outerHTML);
      });
      grp.innerHTML = '<div class="co-err" role="alert">' + esc(T.errSummary) + '</div>' + (rest.length ? '<ul class="woocommerce-error" role="alert">' + rest.join('') + '</ul>' : '');
      if (first) setTimeout(function () { first.scrollIntoView({ block: 'center' }); var f = $('input, select, textarea', first); if (f) f.focus({ preventScroll: true }); }, 50);
    });
    // az összesítő újrarajzolásakor (AJAX) a kiválasztott átvételi pont megmarad
    var pickup = '';
    document.addEventListener('change', function (e) { if (e.target.name === 'fv_pickup') pickup = e.target.value; });
    jq(document.body).on('updated_checkout', function () {
      companyFields();
      if (!pickup) return;
      $$('input[name="fv_pickup"]').forEach(function (r) { if (r.type === 'radio') r.checked = r.value === pickup; else if (!r.value) r.value = pickup; });
      var c = $('[data-pp-chosen]'); if (c && !c.textContent) c.textContent = pickup;
    });
  }
  // Packeta widget (ha az API-kulcs meg van adva): az átvételi pont neve és azonosítója a rejtett mezőbe
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-packeta]');
    if (!b || !window.Packeta || !window.Packeta.Widget) return;
    e.preventDefault();
    window.Packeta.Widget.pick(b.dataset.key, function (point) {
      if (!point) return;
      var label = (point.name || '') + (point.id ? ' (' + point.id + ')' : '');
      var v = $('[data-pickup-value]'), c = $('[data-pp-chosen]');
      if (v) { v.value = label; v.dispatchEvent(new Event('change', { bubbles: true })); }
      if (c) c.textContent = label;
      var pe = $('[data-pickup-err]'); if (pe) pe.hidden = true;
    }, { country: b.dataset.country, language: b.dataset.lang });
  });

  /* ---------- indítás ---------- */
  /* ---------- kosár oldal: a mennyiség változására magától frissül (nincs „Aktualizovať košík” gomb) ---------- */
  var cartTimer;
  document.addEventListener('change', function (e) {
    if (!e.target.matches('.woocommerce-cart-form input.qty')) return;
    clearTimeout(cartTimer);
    cartTimer = setTimeout(function () {
      var b = $('.woocommerce-cart-form [name="update_cart"]');
      if (b) { b.disabled = false; b.removeAttribute('aria-disabled'); b.click(); }
    }, 450);
  });

  function boot() {
    document.documentElement.classList.add('fv-js');
    var ag = $('[data-agegate]');
    if (ag && !cookie('fv_age') && !/bot|crawl|spider|lighthouse/i.test(navigator.userAgent)) { ag.hidden = false; document.body.classList.add('lock'); }
    else if (ag) ag.remove();
    if (C.wish && C.wish.length) {
      var merged = wishIds().concat(C.wish).filter(function (v, i, a) { return a.indexOf(v) === i; });
      setCookie('fv_wish', merged.join(','), 365);
    }
    paintWish();
    initMega();
    initPuffFinder();
    initProduct();
    initCheckout();
    restoreFacets();
    paintPrice();
    keepOkText();
    if (location.hash && location.hash.length > 1) { var t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(function () { t.scrollIntoView(); }, 60); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
