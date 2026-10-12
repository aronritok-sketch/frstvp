/*
 * First Vape – prototípus: mozgó füst háttér
 *
 * Az eredeti firstvape.sk saját, áttetsző füstfotói (smoke-a.png, smoke-b.png) úsznak az oldal mögött:
 * - folyamatosan, lassan sodródnak, forognak és „lélegeznek” (CSS animáció),
 * - görgetéskor eltérő sebességgel úsznak felfelé (parallaxis), alul folyamatosan újak jönnek be,
 * - gyors görgetésnél kicsit megpördülnek, aztán megnyugszanak.
 * A füstfelhők főleg a széleken vannak, hogy a tartalom olvasható maradjon.
 * „Csökkentett mozgás” beállításnál a füst áll.
 * WordPress megfelelő: a child téma assets/js/smoke.js-e, wp_enqueue_script-tel a láblécben.
 */
(function (FV) {
  'use strict';

  var img = function (p) { return FV && FV.asset ? FV.asset(p) : 'assets/' + p; };
  var A = img('img/smoke-a.png'), B = img('img/smoke-b.png');

  // x, y: kiinduló hely (a képernyő %-ában), w: szélesség (vw), f: görgetési sebesség, o: átlátszóság,
  // d: sodródás ideje (s), flip: tükrözés, r: alapforgatás (fok)
  var PUFFS = [
    { src: A, x: -18, y: -10, w: 60, f: 0.22, o: 1, d: 38, r: -8 },
    { src: B, x: 68, y: 14, w: 48, f: 0.38, o: 0.95, d: 46, flip: true, r: 12 },
    { src: B, x: -14, y: 60, w: 44, f: 0.55, o: 0.9, d: 52, r: 24 },
    { src: A, x: 64, y: 84, w: 56, f: 0.30, o: 0.95, d: 60, flip: true, r: -18 },
    { src: B, x: 26, y: 128, w: 42, f: 0.46, o: 0.7, d: 56, r: 150 },
    { src: A, x: 76, y: 150, w: 40, f: 0.62, o: 0.85, d: 44, r: 40 }
  ];

  var layer = document.createElement('div');
  layer.className = 'fx-smoke';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = PUFFS.map(function (p, i) {
    return '<span class="fx-puff" style="left:' + p.x + 'vw;width:' + p.w + 'vw;--o:' + p.o + ';--r:' + p.r + 'deg">' +
      '<i style="background-image:url(\'' + p.src + '\');animation-duration:' + p.d + 's,' + Math.round(p.d * 0.6) + 's;animation-delay:-' + (i * 7) + 's,-' + (i * 5) + 's' +
      (p.flip ? ';--sx:-1' : '') + '"></i></span>';
  }).join('');
  document.body.insertBefore(layer, document.body.firstChild);
  document.documentElement.classList.add('has-fx-smoke');

  var els = Array.prototype.slice.call(layer.children);
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vh = window.innerHeight, target = window.scrollY, smooth = target, spin = 0, last = performance.now(), running = true;

  function place() {
    var vw = window.innerWidth;
    els.forEach(function (el, i) {
      var p = PUFFS[i], h = p.w / 100 * vw * 0.95, span = vh + h * 2;
      // a görgetéssel felfelé úszik; ha kiment felül, alul jön vissza (a képernyőn kívül vált, így nem látszik)
      var y = p.y / 100 * vh - smooth * p.f;
      y = ((y + h) % span + span) % span - h;
      el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0) rotate(' + (p.r + spin * (i % 2 ? -1 : 1) * (6 + i)).toFixed(2) + 'deg)';
    });
  }

  function tick(now) {
    if (!running) return;
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    var prev = smooth;
    smooth += (target - smooth) * Math.min(1, dt * 5);
    // görgetési sebesség → enyhe pördülés, ami lassan lecseng
    spin += (smooth - prev) * 0.02 - spin * dt * 2.5;
    spin = Math.max(-3, Math.min(3, spin));
    place();
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function () { vh = window.innerHeight; place(); });
  place();
  if (reduce) return;
  window.addEventListener('scroll', function () { target = window.scrollY; }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) { last = performance.now(); requestAnimationFrame(tick); }
  });
  requestAnimationFrame(tick);
})(window.FV);
