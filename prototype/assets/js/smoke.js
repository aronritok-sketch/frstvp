/*
 * First Vape – prototípus: élő füst háttér (WebGL)
 *
 * Az eredeti firstvape.sk füstös képeit váltja ki: piros–lila–kék füst kavarog az oldal mögött.
 * - folyamatosan, lassan áramlik (idő),
 * - görgetéskor a füst felfelé úszik a tartalommal (parallaxis),
 * - gyors görgetésnél jobban örvénylik, aztán lecsillapodik.
 * A közepe halványabb, hogy a szöveg mindig olvasható maradjon.
 *
 * Takarékos: fél felbontáson renderel, rejtett fülön megáll; „csökkentett mozgás” beállításnál egy álló képkocka.
 * Ha nincs WebGL, a CSS a régi statikus füstképet (smoke.jpg) mutatja.
 * WordPress megfelelő: a child téma assets/js/smoke.js-e, wp_enqueue_script-tel a láblécben.
 */
(function () {
  'use strict';

  var canvas = document.createElement('canvas');
  canvas.className = 'fx-smoke';
  canvas.setAttribute('aria-hidden', 'true');
  var gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
  if (!gl) return;

  var VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
  var FRAG = [
    'precision mediump float;',
    'uniform vec2 uRes; uniform float uTime; uniform float uScroll; uniform float uStir;',
    'float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }',
    'float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }',
    'float fbm(vec2 p){ float v = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);',
    '  for (int i = 0; i < 5; i++){ v += a * noise(p); p = m * p; a *= 0.5; } return v; }',
    'mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }',
    'void main(){',
    '  vec2 uv = gl_FragCoord.xy / uRes.y;',
    '  float asp = uRes.x / uRes.y;',
    '  float t = uTime * 0.06;',
    // a füst a görgetéssel felfelé úszik (lassabban, mint a tartalom), a gyors görgetés megcsavarja
    '  vec2 p = uv * 1.7 + vec2(0.0, -uScroll * 0.85);',
    '  p = rot(uStir * 0.35) * (p - vec2(asp * 0.85, 0.5)) + vec2(asp * 0.85, 0.5);',
    '  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.8));',
    '  vec2 r = vec2(fbm(p + 3.2 * q + vec2(1.7, 9.2) + t * 1.4 + uStir * 0.6), fbm(p + 3.2 * q + vec2(8.3, 2.8) - t * 1.1));',
    '  float f = fbm(p + 3.0 * r);',
    '  vec3 pink = vec3(0.93, 0.18, 0.33);',
    '  vec3 violet = vec3(0.50, 0.22, 0.78);',
    '  vec3 blue = vec3(0.20, 0.42, 0.92);',
    '  vec3 col = mix(pink, violet, smoothstep(0.15, 0.85, r.x));',
    '  col = mix(col, blue, smoothstep(0.45, 0.95, q.y + uv.x / asp * 0.35));',
    '  float d = smoothstep(0.42, 1.05, f * 1.15 + length(q) * 0.25);',
    // szélein sűrűbb, középen halványabb – olvashatóság
    '  float x = uv.x / asp;',
    '  float edge = 0.28 + 0.72 * pow(abs(x - 0.5) * 2.0, 1.4);',
    '  vec3 base = vec3(0.082, 0.063, 0.090);',
    '  vec3 c = base + col * d * edge * 0.62;',
    '  c += col * pow(d, 3.0) * edge * 0.25;',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'
  ].join('\n');

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var uRes = gl.getUniformLocation(prog, 'uRes'), uTime = gl.getUniformLocation(prog, 'uTime'),
    uScroll = gl.getUniformLocation(prog, 'uScroll'), uStir = gl.getUniformLocation(prog, 'uStir');

  document.body.insertBefore(canvas, document.body.firstChild);
  document.documentElement.classList.add('has-fx-smoke');

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scale = window.innerWidth < 760 ? 0.4 : 0.5; // fél felbontás: a füst puha, így nem látszik, de sokkal olcsóbb
  function resize() {
    var w = Math.max(1, Math.round(window.innerWidth * scale)), h = Math.max(1, Math.round(window.innerHeight * scale));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    gl.uniform2f(uRes, w, h);
  }
  window.addEventListener('resize', function () { resize(); if (reduce) draw(0); });
  resize();

  var scrollY = window.scrollY, smooth = scrollY, stir = 0, last = performance.now(), t0 = last, running = true;
  window.addEventListener('scroll', function () { scrollY = window.scrollY; }, { passive: true });

  function draw(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    var prev = smooth;
    smooth += (scrollY - smooth) * Math.min(1, dt * 6);
    // görgetési sebesség → kavarás, ami lassan lecseng
    stir += (smooth - prev) * 0.004 - stir * 3.6 * dt;
    stir = Math.max(-1.6, Math.min(1.6, stir));
    gl.uniform1f(uTime, reduce ? 12.0 : (now - t0) / 1000);
    gl.uniform1f(uScroll, smooth / window.innerHeight); // képernyőnyi egységben: a füst félsebességgel úszik a tartalommal
    gl.uniform1f(uStir, stir);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  var frameBudget = 1000 / 40, acc = 0;
  function loop(now) {
    if (!running) return;
    // ~40 fps elég a lassú füsthöz, kíméli az akkut
    if (now - acc >= frameBudget) { acc = now; draw(now); }
    requestAnimationFrame(loop);
  }

  if (reduce) { draw(performance.now()); return; }
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) { last = performance.now(); requestAnimationFrame(loop); }
  });
  requestAnimationFrame(loop);
})();
