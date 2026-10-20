#!/usr/bin/env node
/*
 * A WordPress-téma adatai a jóváhagyott előnézetből (prototype/assets/js): a téma ugyanazokból az adatokból és
 * szövegekből dolgozik, mint az előnézet.
 *   node tools/wp/build_data.mjs
 * Kimenet: wp-theme/firstvape/setup/data/
 *   i18n.json      felületi szövegek SK / FR (FV.I18N), színnevek, jogi oldalak helyőrző szövege
 *   catalog.json   kategóriafa, márkák, attribútumok, ízszínek, piacok (ÁFA, szállítás), menü, cikkek
 *   products.json  az ügyfél termékei (products.js – a client_import.py generálja az ügyfél fájljából)
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const JS = path.join(ROOT, 'prototype/assets/js');
const OUT = path.join(ROOT, 'wp-theme/firstvape/setup/data');

const doc = { documentElement: {}, readyState: 'complete', addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; } };
const ctx = { window: {}, document: doc, console, localStorage: null };
ctx.window = ctx;
vm.createContext(ctx);
const run = (f) => vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), ctx, { filename: f });

run('products.js');
run('data.js');
const FV = ctx.FV;
// a nyers (nyelvenkénti) adatok, mielőtt az i18n.js getterré alakítja őket
const clone = (o) => JSON.parse(JSON.stringify(o));
const categories = clone(FV.categories);
const brands = clone(FV.brands);
const posts = clone(FV.posts);
const products = clone(FV.clientProducts);
run('core.js');
run('i18n.js');

const pages = {};
for (const lang of Object.keys(FV.PAGES)) {
  pages[lang] = {};
  for (const [k, fn] of Object.entries(FV.PAGES[lang])) pages[lang][k] = fn();
}

fs.mkdirSync(OUT, { recursive: true });
const write = (name, data) => {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 1) + '\n');
  console.log(path.relative(ROOT, path.join(OUT, name)), (fs.statSync(path.join(OUT, name)).size / 1024).toFixed(1) + ' kB');
};

write('i18n.json', { sk: FV.I18N.sk, fr: FV.I18N.fr, colors: FV.COLOR_NAMES, pages });
write('catalog.json', {
  categories, brands, posts,
  attributes: FV.attributes, flavorColors: FV.flavorColors, colorSwatches: FV.colorSwatches,
  markets: FV.markets, baseVat: FV.baseVat, menu: FV.menu, pageKeys: FV.pageKeys,
  puffBuckets: FV.PUFF_BUCKETS.map((b) => ({ id: b.id, min: b.min, max: b.max === Infinity ? null : b.max, tick: b.tick })),
  catFacets: FV.catFacets, lowStock: FV.LOW_STOCK,
});
write('products.json', products);
