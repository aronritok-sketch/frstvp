/*
 * First Vape – WordPress-téma végponttól végpontig (Playwright, futó teszt-WordPress kell: tools/wp/dev-wp.sh).
 *   BASE=http://localhost:8891 node tests/wp/e2e.mjs
 * Ellenőrzi: minden fő oldal 200 / 404, egy H1, nincs vízszintes görgetés (1440 és 390 px), nincs JS-hiba; francia piac
 * (?lang=fr: francia felület, 20 % ÁFA-s ár); 18+ kapu; mega menü; élő kereső; szűrés újratöltés nélkül;
 * kedvencek; kosár-fiók; teljes rendelés Packeta-ponttal és utánvéttel, mezőnkénti hibaüzenettel; űrlapok.
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:8891';
let fails = 0, oks = 0;
const ok = (cond, msg) => { if (cond) { oks++; console.log('✔ ' + msg); } else { fails++; console.log('✘ ' + msg); } };

const PAGES = [
  ['/', 200], ['/kategoria/zariadenia-kity/', 200], ['/kategoria/zariadenia-kity/predplnene-pod-systemy/', 200], ['/kategoria/e-liquidy/', 200],
  ['/kategoria/jednorazove-e-cigarety/', 200], ['/kategoria/prislusenstvo/', 200], ['/kategoria/predplnene-pody/?kompat=ELFA', 200],
  ['/znacka/elfbar/', 200], ['/znacky/', 200], ['/produkty/?puff=20000%2B', 200], ['/akcie/', 200], ['/oblubene/', 200],
  ['/produkt/elfbar-elfa-turbo-black/', 200], ['/produkt/elfbar-elfa-pro-pod-pi-20/', 200], ['/?s=elfbar+40000&post_type=product', 200],
  ['/doprava-a-platba/', 200], ['/obchodne-podmienky/', 200], ['/kontakt/', 200], ['/blog/', 200], ['/elfbar-nova-generacia/', 200],
  ['/kosik/', 200], ['/moj-ucet/', 200], ['/nincs-ilyen-oldal/', 404],
];

const b = await chromium.launch();
for (const w of [1440, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addCookies([{ name: 'fv_age', value: '1', url: BASE }]);
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource: the server responded with a status of 404/.test(m.text())) errs.push(m.text()); });
  for (const [u, code] of PAGES) {
    const r = await p.goto(BASE + u, { waitUntil: 'networkidle' });
    const info = await p.evaluate(() => ({ h1: document.querySelectorAll('h1').length, sx: document.documentElement.scrollWidth > innerWidth + 1 }));
    ok(r.status() === code && info.h1 === 1 && !info.sx && !errs.length, `${w}px ${u} → ${r.status()}, H1: ${info.h1}${info.sx ? ', VÍZSZINTES GÖRGETÉS' : ''}${errs.length ? ', JS: ' + errs.join(' | ') : ''}`);
    errs.length = 0;
  }
  await ctx.close();
}

// 18+ kapu, nyelvváltás, francia piac
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  ok(await p.isVisible('[data-agegate]'), '18+ kapu látszik az első látogatáskor');
  await p.click('[data-act="age-yes"]');
  ok(!(await p.isVisible('[data-agegate]')) && (await ctx.cookies()).some((c) => c.name === 'fv_age'), '18+ elfogadva, süti beállítva');
  await p.reload({ waitUntil: 'networkidle' });
  ok(!(await p.locator('[data-agegate]').count()), 'újratöltés után nincs kapu');
  await p.goto(BASE + '/produkt/elfbar-elfa-turbo-black/?lang=fr', { waitUntil: 'networkidle' });
  const fr = await p.evaluate(() => ({ lang: document.documentElement.lang, price: document.querySelector('.pi-price').textContent, vat: document.querySelector('.pi-vat').textContent, btn: document.querySelector('.buy-btn').textContent }));
  ok(fr.lang === 'fr' && /8,78/.test(fr.price) && /TVA 20/.test(fr.vat) && /Ajouter au panier/.test(fr.btn), `francia piac: lang=${fr.lang}, ár ${fr.price.trim()} (9,00 € / 1,23 × 1,20), „${fr.vat.trim()}”`);
  await p.goto(BASE + '/obchodne-podmienky/', { waitUntil: 'networkidle' });
  ok(/\/cgv\/?/.test(p.url()), 'a szlovák ÁSZF a francia piacon a CGV-re irányít: ' + p.url());
  await p.goto(BASE + '/?lang=sk', { waitUntil: 'networkidle' });
  ok((await p.evaluate(() => document.documentElement.lang)) === 'sk', 'vissza szlovákra');
  await ctx.close();
}

// mega menü, élő kereső, szűrés, kedvencek, kosár-fiók
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{ name: 'fv_age', value: '1', url: BASE }]);
  const p = await ctx.newPage();
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.hover('.nav-item.has-mega >> nth=0');
  await p.waitForTimeout(400);
  ok(await p.isVisible('.nav-item.open .mega'), 'mega menü nyílik (hover)');
  ok(await p.locator('.nav-item.has-mega >> nth=1').locator('.puff-chip').count() > 0, 'mega menü: slukkszám-sávok az előretöltött podoknál');
  await p.fill('#hsearch-q', 'elfa 20');
  await p.waitForSelector('.hs-drop:not([hidden]) .hs-res li', { timeout: 5000 }).catch(() => {});
  ok(await p.locator('.hs-drop .hs-res li').count() > 0, 'élő kereső: találatok a lenyílóban');
  await p.goto(BASE + '/kategoria/zariadenia-kity/', { waitUntil: 'networkidle' });
  const before = await p.textContent('[data-rcount]');
  await p.check('input[data-f="marka"][value="vaporesso"]', { force: true });
  await p.waitForFunction((b0) => document.querySelector('[data-rcount]').textContent !== b0, before, { timeout: 8000 }).catch(() => {});
  const after = await p.textContent('[data-rcount]');
  ok(before !== after && /marka=vaporesso/.test(p.url()), `szűrés újratöltés nélkül: ${before.trim()} → ${after.trim()}, URL: ${p.url().replace(BASE, '')}`);
  await p.click('.pc-wish >> nth=0');
  ok((await p.textContent('[data-wish-count]')).trim() === '1', 'kedvencekbe téve (számláló 1)');
  await p.goto(BASE + '/oblubene/', { waitUntil: 'networkidle' });
  ok(await p.locator('.pcard').count() === 1, 'a Kedvencek oldalon 1 termék');
  await p.goto(BASE + '/produkt/elfbar-elfa-pro-pod-pi-20/', { waitUntil: 'networkidle' });
  ok(await p.locator('[data-variant-select] option').count() > 12, 'sok testvértermék: választólista');
  ok(await p.locator('#rel-groups .sec').count() > 0, 'kapcsolódó termékek (rendszer / alternatívák)');
  const max = +(await p.getAttribute('#buy-qty', 'max')), want = Math.min(2, max);
  await p.fill('#buy-qty', String(want));
  await p.click('.buy-btn');
  await p.waitForSelector('[data-toast]:not([hidden])');
  ok((await p.textContent('[data-cart-count]')).trim() === String(want), `kosárba ${want} db a termékoldalról (AJAX)`);
  await p.click('[data-act="cart-open"]');
  await p.click('[data-drawer="cart"] [data-act="line-remove"]');
  await p.waitForTimeout(1200);
  ok(await p.locator('[data-drawer="cart"] .empty').count() === 1, 'törlés a kosár-fiókból');
  await ctx.close();
}

// rendelés: hibaüzenetek, Packeta-pont, utánvét
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 860 } });
  await ctx.addCookies([{ name: 'fv_age', value: '1', url: BASE }]);
  const p = await ctx.newPage();
  await p.goto(BASE + '/produkt/elfbar-elfa-turbo-black/', { waitUntil: 'networkidle' });
  await p.click('.buy-btn');
  await p.waitForSelector('[data-toast]:not([hidden])');
  await p.goto(BASE + '/pokladna/', { waitUntil: 'networkidle' });
  await p.click('#place_order');
  await p.waitForSelector('.co-err', { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(600); // a JS az első hibás mezőre teszi a fókuszt – utána gépelünk
  ok(await p.locator('.form-row .checkout-inline-error-message:visible, .form-row .err-msg:visible').count() >= 6, 'üres pénztár: mezőnkénti hibaüzenetek + összefoglaló');
  for (const [s, v] of [['#billing_email', 'test@example.com'], ['#billing_phone', '+421 905 123 456'], ['#billing_first_name', 'Test'], ['#billing_last_name', 'Zákazník'], ['#billing_postcode', '945 01'], ['#billing_city', 'Komárno'], ['#billing_address_1', 'Hlavná 1']]) await p.fill(s, v);
  await p.waitForTimeout(1500);
  await p.locator('input[name="fv_pickup"]').first().check();
  await p.check('#fv_age_confirm');
  await p.check('#terms');
  await p.click('#place_order');
  await p.waitForURL(/objednavka-prijata/, { timeout: 20000 }).catch(() => {});
  const txt = await p.textContent('main');
  ok(/objednavka-prijata/.test(p.url()) && /Z-BOX Komárno/.test(txt) && /1,50/.test(txt), 'rendelés: köszönő oldal, átvételi pont és utánvét díja (1,50 €) a rendelésben');
  await ctx.close();
}

// űrlapok
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{ name: 'fv_age', value: '1', url: BASE }]);
  const p = await ctx.newPage();
  await p.goto(BASE + '/kontakt/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3200); // csapda: legalább 3 mp
  await p.fill('#ct-name', 'Test'); await p.fill('#ct-mail', 'test@example.com'); await p.fill('#ct-msg', 'Ahoj, test.');
  await p.click('[data-form="contact"] [type="submit"]');
  await p.waitForSelector('[data-form="contact"] [data-form-msg]:not([hidden])', { timeout: 8000 }).catch(() => {});
  ok(/Ďakujeme/.test(await p.textContent('[data-form="contact"] [data-form-msg]')), 'kapcsolati űrlap elküldve');
  await ctx.close();
}

await b.close();
console.log(`\n${oks} rendben, ${fails} hiba`);
process.exit(fails ? 1 : 0);
