/*
 * First Vape – korellenőrzés a pénztárban (inc/ageverify.php), teszt módban (Adulto-kulcs nélkül).
 *   BASE=http://localhost:8892 WP="wp --allow-root --path=…" WPUSER=admin WPPASS=admin node tests/wp/ageverify.mjs
 * A teszt idejére bekapcsolja a teszt módot (SK), utána visszaállítja a korábbi beállítást.
 * Ellenőrzi: nikotinos termékkel ellenőrzés nélkül nem zárható le a rendelés; teszt-ellenőrzéssel igen, és a rendelésnél
 * ott az azonosító, időpont, mód, eredmény + megjegyzés; nikotin nélküli kosárnál és a FR piacon nincs doboz; admin:
 * oszlop a rendeléslistában, keresés az azonosítóra, CSV-export.
 */
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';

const BASE = process.env.BASE || 'http://localhost:8892';
const WP = process.env.WP || 'wp --allow-root';
const wp = (cmd) => execSync(`${WP} ${cmd}`, { encoding: 'utf8' }).trim();
let fails = 0, oks = 0;
const ok = (cond, msg) => { if (cond) { oks++; console.log('✔ ' + msg); } else { fails++; console.log('✘ ' + msg); } };

const before = (() => { try { return wp('option get firstvape_av --format=json'); } catch { return ''; } })();
wp(`option update firstvape_av '{"markets":["sk"],"test":1,"age":18,"scope":"nicotine"}' --format=json`);

const b = await chromium.launch();
const fill = async (p) => {
  for (const [s, v] of [['#billing_email', 'av@example.com'], ['#billing_phone', '+421 905 123 456'], ['#billing_first_name', 'Test'], ['#billing_last_name', 'Overenie'], ['#billing_postcode', '945 01'], ['#billing_city', 'Komárno'], ['#billing_address_1', 'Hlavná 1']]) await p.fill(s, v);
  await p.waitForTimeout(1500);
  await p.locator('input[name="fv_pickup"]').first().check();
  await p.check('#fv_age_confirm');
  await p.check('#terms');
};
const add = async (p, slug, q = '') => {
  await p.goto(BASE + '/produkt/' + slug + '/' + q, { waitUntil: 'networkidle' });
  await p.click('.buy-btn');
  await p.waitForSelector('[data-toast]:not([hidden])');
};
let orderId = 0, avId = '';

try {
  // nikotinos termék (SK): ellenőrzés nélkül nem megy, teszt-ellenőrzéssel igen
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addCookies([{ name: 'fv_age', value: '1', url: BASE }]);
    const p = await ctx.newPage();
    await add(p, 'elfbar-elfa-pro-pod-pi-20');
    await p.goto(BASE + '/pokladna/', { waitUntil: 'networkidle' });
    ok(await p.isVisible('#fv_av_field'), 'nikotinos termék: a pénztárban ott a korellenőrzés doboza');
    await fill(p);
    await p.click('#place_order');
    await p.waitForTimeout(4000);
    const err = await p.textContent('.woocommerce-NoticeGroup, .woocommerce-error, .co-err').catch(() => '');
    ok(!/objednavka-prijata/.test(p.url()) && /over vek|Pred dokončením/i.test(err || ''), 'ellenőrzés nélkül nem zárható le: ' + (err || '').trim().slice(0, 80));
    await p.click('[data-fv-av-test]');
    ok(await p.isVisible('.fv-av-ok'), 'teszt-ellenőrzés: „Vek je overený.”');
    await p.click('#place_order');
    await p.waitForURL(/objednavka-prijata/, { timeout: 20000 }).catch(() => {});
    ok(/objednavka-prijata/.test(p.url()), 'ellenőrzéssel a rendelés lezárul');
    orderId = Number((p.url().match(/objednavka-prijata\/(\d+)/) || [])[1] || 0);
    await ctx.close();
  }
  if (orderId) {
    const meta = JSON.parse(wp(`eval 'echo wp_json_encode(array_map(fn($k) => wc_get_order(${orderId})->get_meta($k), ["req" => "_fv_av_required", "res" => "_fv_av_result", "id" => "_fv_av_id", "time" => "_fv_av_time", "method" => "_fv_av_method", "provider" => "_fv_av_provider"]));'`));
    avId = meta.id;
    ok(meta.req === 'yes' && meta.res === 'ok' && /^TEST-/.test(meta.id) && meta.time && meta.method === 'test', `a rendelésnél: ${JSON.stringify(meta)}`);
    const notes = wp(`eval 'foreach (wc_get_order_notes(["order_id" => ${orderId}]) as $n) echo $n->content, "\\n";'`);
    ok(/Overenie veku: OK/.test(notes), 'rendelési megjegyzés: ' + (notes.split('\n').find((l) => /Overenie/.test(l)) || ''));
  }

  // nikotin nélkül nincs doboz; FR piacon (kikapcsolva) sincs
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addCookies([{ name: 'fv_age', value: '1', url: BASE }]);
    const p = await ctx.newPage();
    await add(p, 'elfbar-elfa-turbo-black');
    await p.goto(BASE + '/pokladna/', { waitUntil: 'networkidle' });
    ok(!(await p.locator('#fv_av_field').count()), 'nikotin nélküli kosár: nincs korellenőrzés');
    await add(p, 'elfbar-elfa-pro-pod-pi-20', '?lang=fr');
    await p.goto(BASE + '/pokladna/?lang=fr', { waitUntil: 'networkidle' });
    ok(!(await p.locator('#fv_av_field').count()), 'FR piac (nincs bekapcsolva): nincs korellenőrzés');
    await p.goto(BASE + '/?lang=sk', { waitUntil: 'networkidle' });
    await ctx.close();
  }

  // admin: oszlop, keresés, export
  if (orderId) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
    const p = await ctx.newPage();
    await p.goto(BASE + '/wp-login.php', { waitUntil: 'networkidle' });
    await p.fill('#user_login', process.env.WPUSER || 'admin');
    await p.fill('#user_pass', process.env.WPPASS || 'admin');
    await p.click('#wp-submit');
    await p.waitForLoadState('networkidle');
    await p.goto(BASE + '/wp-admin/admin.php?page=wc-orders&s=' + encodeURIComponent(avId), { waitUntil: 'networkidle' });
    let rows = await p.locator('#the-list tr').count();
    if (!rows) {
      await p.goto(BASE + '/wp-admin/edit.php?post_type=shop_order&s=' + encodeURIComponent(avId), { waitUntil: 'networkidle' });
      rows = await p.locator('#the-list tr').count();
    }
    const head = await p.textContent('thead');
    ok(/Korellenőrzés/.test(head || ''), 'rendeléslista: „Korellenőrzés” oszlop');
    ok(rows === 1 && new RegExp('#?' + orderId).test(await p.textContent('#the-list')), `keresés az azonosítóra (${avId}): 1 rendelés`);
    await p.goto(BASE + '/wp-admin/themes.php?page=firstvape&tab=age', { waitUntil: 'networkidle' });
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('form[action*="admin-post"] button')]);
    const csv = await (await import('node:fs')).promises.readFile(await dl.path(), 'utf8');
    ok(csv.includes(avId) && /ID overenia/.test(csv), 'CSV-export: fejléc és a rendelés azonosítója benne');
    await ctx.close();
  }
} finally {
  await b.close();
  if (before) wp(`option update firstvape_av '${before}' --format=json`); else wp('option delete firstvape_av');
}
console.log(`\n${oks} rendben, ${fails} hiba`);
process.exit(fails ? 1 : 0);
