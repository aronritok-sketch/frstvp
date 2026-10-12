/*
 * First Vape – prototípus mintaadatok
 *
 * A struktúra 1:1-ben a tervezett WooCommerce adatmodellt követi:
 *   Kategória   = mi a termék           → product_cat (hierarchikus)
 *   Márka       = ki gyártja            → product_brand (WooCommerce Brands taxonómia)
 *   Attribútum  = milyen változat       → pa_iz, pa_nikotin, pa_kiszereles, pa_puff, pa_kompatibilitas, pa_szin
 *   Termékadat  = értékesítés/logisztika→ ár, akciós ár, készlet, státusz, SKU, EAN (global_unique_id), súly
 */
window.FV = window.FV || {};

/* Piacok: Szlovákia és Franciaország, pénznem mindkettőben EUR.
 * A nyelvfüggő mezők { sk: '…', fr: '…' } objektumok; a megjelenítés FV.L()-lel (i18n.js).
 * A terméknevek és márkanevek nem fordítandók (kivéve, ha általános szó van bennük: names). */
FV.currency = '€';

// Képek útvonala; az egyfájlos változat data URI-kat tesz ide
FV.assetMap = FV.assetMap || {};
FV.asset = function (p) { return FV.assetMap[p] || 'assets/' + p; };

/* ---------- Kategóriák (product_cat) ----------
 * Az ügyfél által véglegesített fa (2026-10-12). Az angol nevek (en) a termékimport-fájl kategóriáival való
 * összerendeléshez kellenek: ugyanannak a kategóriának az angol és a szlovák neve ugyanarra a kategóriára mutat
 * (csv/kategoria-osszerendeles.csv). Az en értékeket az ügyfél fájljának pontos neveivel kell egyeztetni.
 */
FV.categories = [
  { slug: 'keszulekek', art: 'kit', color: '#3D4A6B', en: 'Devices / Kits',
    name: { sk: 'Zariadenia / kity', fr: 'Appareils / kits' },
    short: { sk: 'Zariadenia', fr: 'Appareils' },
    desc: { sk: 'Kompletné pod systémy a mod kity: s predplnenými podmi, s plniteľnými podmi aj väčšie mod + tank sady.', fr: 'Systèmes pod complets et kits : à pods préremplis, à pods à remplir et kits box + clearomiseur.' },
    children: [
      { slug: 'eloretoltott-pod-rendszerek', en: 'Prefilled Pod Systems', name: { sk: 'Predplnené pod systémy', fr: 'Systèmes à pods préremplis' },
        desc: { sk: 'Zariadenia, ktoré fungujú s továrensky naplnenými, ochutenými podmi (napr. ELFBAR ELFA, ELFBAR JOIN ONE).', fr: 'Appareils fonctionnant avec des pods préremplis en usine (ex. ELFBAR ELFA, ELFBAR JOIN ONE).' } },
      { slug: 'utantoltheto-pod-rendszerek', en: 'Refillable Pod Systems', name: { sk: 'Plniteľné pod systémy', fr: 'Systèmes à pods à remplir' },
        desc: { sk: 'Zariadenia, ktorých pod alebo cartridge si plníš vlastným liquidom (napr. Geekvape Wenax, Aegis Boost, Vaporesso GTX GO).', fr: 'Appareils dont le pod se remplit avec votre e-liquide (ex. Geekvape Wenax, Aegis Boost, Vaporesso GTX GO).' } },
      { slug: 'mod-tank-kitek', en: 'Mod / Tank Kits', name: { sk: 'Mod / tank kity', fr: 'Kits box / clearomiseur' },
        desc: { sk: 'Väčšie sady mod + tank (napr. Vaporesso GEN MAX, GEN SE, Geekvape Aegis Legend).', fr: 'Kits box + clearomiseur (ex. Vaporesso GEN MAX, GEN SE, Geekvape Aegis Legend).' } }
    ] },
  { slug: 'eloretoltott-podok', art: 'pod', color: '#E83A5A', en: 'Prefilled Pods',
    name: { sk: 'Predplnené pody', fr: 'Pods préremplis' },
    short: { sk: 'Predplnené pody', fr: 'Pods préremplis' },
    desc: { sk: 'Samostatne predávané, továrensky naplnené náhradné pody s príchuťou – napr. ELFA Pro Pod, JOIN ONE Pod, Vaporesso a Drifter pody. Kompletné zariadenia nájdeš v kategórii Zariadenia / kity.', fr: 'Pods de rechange préremplis vendus séparément – ELFA Pro Pod, JOIN ONE Pod, pods Vaporesso et Drifter. Les appareils complets sont dans Appareils / kits.' },
    children: [] },
  { slug: 'e-liquidek', art: 'liquid', color: '#7B3FA0', en: 'E-liquids',
    name: { sk: 'E-liquidy', fr: 'E-liquides' },
    short: { sk: 'E-liquidy', fr: 'E-liquides' },
    desc: { sk: 'Nikotínové boostery, hotové 10 ml liquidy, príchute, shortfill a longfill.', fr: 'Boosters de nicotine, e-liquides prêts 10 ml, arômes, shortfills et longfills.' },
    children: [
      { slug: 'nikotin-booster', en: 'Nicotine Boosters', name: { sk: 'Nikotínové boostery', fr: 'Boosters de nicotine' } },
      { slug: 'kesz-liquidek-10ml', en: 'Ready-made E-liquids 10 ml', name: { sk: 'Hotové liquidy 10 ml', fr: 'E-liquides prêts 10 ml' } },
      { slug: 'aromak', en: 'Flavour Concentrates', name: { sk: 'Príchute (arómy)', fr: 'Arômes concentrés' } },
      { slug: 'shortfill', en: 'Shortfill', name: { sk: 'Shortfill', fr: 'Shortfills' } },
      { slug: 'longfill', en: 'Longfill', name: { sk: 'Longfill', fr: 'Longfills' } }
    ] },
  { slug: 'eldobhato', art: 'disposable', color: '#FF8A1F', en: 'Disposable E-cigarettes',
    name: { sk: 'Jednorazové e-cigarety', fr: 'Cigarettes électroniques jetables' },
    short: { sk: 'Jednorazové', fr: 'Jetables' },
    desc: { sk: 'Zariadenia, ktoré po spotrebovaní vyhodíš celé (napr. ELFBAR 600). Niektoré väčšie modely majú batériu nabíjateľnú cez USB-C.', fr: 'Appareils que l’on jette entièrement après usage (ex. ELFBAR 600). Certains grands modèles ont une batterie rechargeable en USB-C.' },
    children: [] },
  { slug: 'kiegeszitok', art: 'accessory', color: '#19A58A', en: 'Accessories',
    name: { sk: 'Príslušenstvo', fr: 'Accessoires' },
    short: { sk: 'Príslušenstvo', fr: 'Accessoires' },
    desc: { sk: 'Prázdne náhradné pody, žhaviace hlavy, tanky, batérie, nabíjačky a ďalšie príslušenstvo. Predplnené pody s liquidom nájdeš v kategórii Predplnené pody.', fr: 'Pods vides, résistances, clearomiseurs, accus, chargeurs et autres accessoires. Les pods préremplis sont dans Pods préremplis.' },
    children: [
      { slug: 'ures-podok', en: 'Empty Pods / Cartridges', name: { sk: 'Prázdne pody / cartridge', fr: 'Pods vides / cartouches' } },
      { slug: 'porlasztok', en: 'Coils', name: { sk: 'Žhaviace hlavy / coily', fr: 'Résistances' } },
      { slug: 'tankok', en: 'Tanks', name: { sk: 'Tanky', fr: 'Clearomiseurs' } },
      { slug: 'akkuk-toltok', en: 'Batteries / Chargers', name: { sk: 'Batérie / nabíjačky', fr: 'Accus / chargeurs' } },
      { slug: 'egyeb-kiegeszitok', en: 'Other Accessories', name: { sk: 'Ostatné príslušenstvo', fr: 'Autres accessoires' } }
    ] }
];

/* ---------- Márkák (product_brand) ----------
 * Az ELFA és a JOIN ONE az Elfbar termékcsaládja, ezért az Elfbar márka alá tartoznak (a márkaoldalon minden típus látszik). */
FV.brands = [
  { slug: 'elfbar', name: 'Elfbar', color: '#111111', style: 'heavy',
    desc: { sk: 'Jednorazové e-cigarety, pod systémy ELFA a JOIN ONE, predplnené pody, liquidy Elfliq a príslušenstvo.', fr: 'Jetables, systèmes pod ELFA et JOIN ONE, pods préremplis, e-liquides Elfliq et accessoires.' } },
  { slug: 'lost-mary', name: 'Lost Mary', color: '#C0265B', style: 'script',
    desc: { sk: 'Farebné, ergonomické jednorazové zariadenia a predplnený pod systém TAPPO.', fr: 'Des jetables colorés et ergonomiques, et le système de pods préremplis TAPPO.' } },
  { slug: 'vaporesso', name: 'Vaporesso', color: '#0B7A75', style: 'wide',
    desc: { sk: 'Pod systémy XROS a GTX GO, mod kity GEN, predplnené pody, tanky a žhaviace hlavy.', fr: 'Systèmes pod XROS et GTX GO, kits GEN, pods préremplis, clearomiseurs et résistances.' } },
  { slug: 'drifter', name: 'Drifter', color: '#5B3FD6', style: 'italic',
    desc: { sk: 'Jednorazové zariadenia s veľkou kapacitou, pod systém a predplnené pody Drifter.', fr: 'Jetables grande capacité, système pod et pods préremplis Drifter.' } },
  { slug: 'geekvape', name: 'Geekvape', color: '#E4572E', style: 'heavy',
    desc: { sk: 'Pod systémy Wenax a Aegis Boost, mod kity Aegis, Q pody, tanky a žhaviace hlavy.', fr: 'Systèmes pod Wenax et Aegis Boost, kits Aegis, pods Q, clearomiseurs et résistances.' } },
  { slug: 'nasty-juice', name: 'Nasty Juice', color: '#D81E5B', style: 'heavy',
    desc: { sk: 'Malajzijský výrobca liquidov s odvážnymi ovocnými a mentolovými príchuťami.', fr: 'Fabricant malaisien d’e-liquides aux saveurs fruitées et mentholées audacieuses.' } },
  { slug: 'vampire-vape', name: 'Vampire Vape', color: '#8B1E2D', style: 'italic',
    desc: { sk: 'Prémiové anglické liquidy s legendárnou príchuťou Heisenberg.', fr: 'E-liquides anglais haut de gamme, avec le légendaire Heisenberg.' } },
  { slug: 'twelve-monkeys', name: 'Twelve Monkeys', color: '#2F6B3A', style: 'wide',
    desc: { sk: 'Kanadské remeselné liquidy s originálnymi ovocnými zmesami.', fr: 'E-liquides artisanaux canadiens aux mélanges de fruits originaux.' } },
  { slug: 'french-liquide', name: 'French Liquide', color: '#2B3A8C', style: 'italic',
    desc: { sk: 'Príchute a liquidy vyrábané vo Francúzsku, inšpirované gastronómiou.', fr: 'Arômes et e-liquides fabriqués en France, inspirés de la gastronomie.' } },
  { slug: 'innokin', name: 'Innokin', color: '#222F3E', style: 'wide',
    desc: { sk: 'MTL zariadenia pre začiatočníkov.', fr: 'Appareils MTL faciles à prendre en main.' } },
  { slug: 'cotton-clouds', name: 'Cotton Clouds', color: '#4A8FB8', style: 'script',
    desc: { sk: 'Organická vata do prebaliteľných (RBA) atomizérov.', fr: 'Coton bio pour atomiseurs reconstructibles.' } }
];

/* ---------- Attribútumok (pa_*) ----------
 * A slugok nyelvfüggetlenek (a WPML / Polylang csak a címkét fordítja). A címkék az i18n.js-ben vannak (a_*).
 * A pa_kompatibilitas értéke a rendszer neve (pl. „ELFA”); a „Kompatibilné s …” / „Compatible …” felirat a megjelenítéskor kerül elé.
 */
FV.attributes = [
  { key: 'iz', tax: 'pa_iz', lk: 'a_iz' },
  { key: 'nikotin', tax: 'pa_nikotin', lk: 'a_nikotin' },
  { key: 'ml', tax: 'pa_kiszereles', lk: 'a_ml' },
  { key: 'puff', tax: 'pa_puff', lk: 'a_puff' },
  { key: 'kompat', tax: 'pa_kompatibilitas', lk: 'a_kompat' },
  { key: 'szin', tax: 'pa_szin', lk: 'a_szin' },
  { key: 'ohm', tax: 'pa_ellenallas', lk: 'a_ohm' }
];

FV.flavorColors = {
  'Blueberry': '#4B5BD6', 'Blueberry Ice': '#5C7CFA', 'Mango': '#FFB020', 'Mango Ice': '#FFC94D',
  'Strawberry': '#E83A5A', 'Strawberry Kiwi': '#E5566E', 'Cola': '#6B3A2A', 'Watermelon': '#F0506E',
  'Watermelon Ice': '#F57A93', 'Menthol': '#2EC4B6', 'Grape': '#7B3FA0', 'Peach': '#FF9A6B',
  'Peach Ice': '#FFB38F', 'Apple': '#7FB734', 'Lemon': '#F2C94C', 'Tobacco': '#A0785A',
  'Cherry': '#B0133A', 'Pineapple': '#F2B705', 'Energy': '#36A9E0', 'Vanilla Custard': '#D9BF8C',
  'Pink Lemonade': '#F48FB1', 'Cranberry Grape': '#8E2F5C', 'Triple Mango': '#FF9F1C',
  'Spearmint': '#23B58A', 'Kiwi Passion': '#8FBF3F', 'Banana Ice': '#F5D547', 'Red Apple': '#D64541',
  'Jackfruit Pear': '#C7C45A', 'Unflavored': '#BFC4CC', 'Blackcurrant': '#5B2A6E'
};

FV.colorSwatches = {
  'Black': '#1B1B1F', 'Silver': '#B8BCC4', 'Blue': '#2D5BD7', 'Green': '#2F8F5B', 'Pink': '#E27BA5', 'Gunmetal': '#4A4F58'
};

/* ---------- Termékek ---------- */
(function () {
  function ean(seed) {
    var base = ('690' + String(seed).padStart(9, '0')).slice(0, 12);
    var sum = 0;
    for (var i = 0; i < 12; i++) sum += (+base[i]) * (i % 2 ? 3 : 1);
    return base + ((10 - (sum % 10)) % 10);
  }
  var id = 100;
  function p(o) {
    id++;
    o.id = id;
    o.ean = o.ean || ean(4400000 + id * 37);
    o.attrs = o.attrs || {};
    o.stock = o.stock || 'instock';
    o.qty = o.qty == null ? (o.stock === 'instock' ? 12 + (id * 7) % 60 : 0) : o.qty;
    o.pop = o.pop || (id * 13) % 100;
    o.date = o.date || ('2026-0' + (1 + id % 9) + '-1' + (id % 9));
    o.gallery = o.gallery || 3;
    return o;
  }

  /* Minden termék SIMPLE termék, ahogy az ügyfél CSV-jében (a szín- és nikotinváltozatok külön termékek, saját SKU-val).
   * A „group” csak a megjelenítést segíti: a termékoldalon a testvértermékek (más szín / más nikotinerősség) linkként látszanak.
   * A mintaadatok helyére az ügyfél fájljának valódi termékei, fotói, árai és készletei kerülnek. */
  var D = function (sk, fr) { return { sk: sk, fr: fr }; };
  FV.products = [
    /* ===== Zariadenia / kity – predplnené pod systémy ===== */
    p({ slug: 'elfbar-elfa-pro-kit-black', group: 'elfa-pro-kit', name: 'Elfbar ELFA Pro Pod Kit Black', art: 'kit', color: '#1B1B1F',
      cats: ['keszulekek', 'eloretoltott-pod-rendszerek'], brand: 'elfbar', price: 14.9, sku: 'FV-ELFA-PRO-KIT-BLK', weight: 62,
      attrs: { szin: ['Black'], kompat: ['ELFA'] },
      short: D('Batéria pod systému ELFA, 500 mAh, nabíjanie cez USB-C. V balení jeden predplnený pod ELFA.', 'Batterie du système pod ELFA, 500 mAh, recharge USB-C. Livrée avec un pod ELFA prérempli.'), pop: 94, featured: true }),
    p({ slug: 'elfbar-elfa-pro-kit-silver', group: 'elfa-pro-kit', name: 'Elfbar ELFA Pro Pod Kit Silver', art: 'kit', color: '#B8BCC4',
      cats: ['keszulekek', 'eloretoltott-pod-rendszerek'], brand: 'elfbar', price: 14.9, sku: 'FV-ELFA-PRO-KIT-SLV', weight: 62,
      attrs: { szin: ['Silver'], kompat: ['ELFA'] },
      short: D('Batéria pod systému ELFA, 500 mAh, nabíjanie cez USB-C. V balení jeden predplnený pod ELFA.', 'Batterie du système pod ELFA, 500 mAh, recharge USB-C. Livrée avec un pod ELFA prérempli.'), pop: 80 }),
    p({ slug: 'elfbar-elfa-pro-kit-blue', group: 'elfa-pro-kit', name: 'Elfbar ELFA Pro Pod Kit Blue', art: 'kit', color: '#2D5BD7',
      cats: ['keszulekek', 'eloretoltott-pod-rendszerek'], brand: 'elfbar', price: 14.9, sku: 'FV-ELFA-PRO-KIT-BLU', weight: 62, stock: 'outofstock',
      attrs: { szin: ['Blue'], kompat: ['ELFA'] },
      short: D('Batéria pod systému ELFA, 500 mAh, nabíjanie cez USB-C. V balení jeden predplnený pod ELFA.', 'Batterie du système pod ELFA, 500 mAh, recharge USB-C. Livrée avec un pod ELFA prérempli.'), pop: 70 }),
    p({ slug: 'elfbar-join-one-kit-black', name: 'Elfbar JOIN ONE Pod Kit Black', art: 'kit', color: '#1B1B1F',
      cats: ['keszulekek', 'eloretoltott-pod-rendszerek'], brand: 'elfbar', price: 12.9, sku: 'FV-ELF-JOIN1-KIT-BLK', weight: 58,
      attrs: { szin: ['Black'], kompat: ['JOIN ONE'] },
      short: D('Kompaktná batéria pre predplnené pody JOIN ONE, nabíjanie cez USB-C.', 'Batterie compacte pour les pods préremplis JOIN ONE, recharge USB-C.'), pop: 78 }),
    p({ slug: 'lost-mary-tappo-kit-pink', name: 'Lost Mary TAPPO Pod Kit Pink', art: 'kit', color: '#E27BA5',
      cats: ['keszulekek', 'eloretoltott-pod-rendszerek'], brand: 'lost-mary', price: 13.9, sku: 'FV-LM-TAP-KIT-PNK', weight: 55,
      attrs: { szin: ['Pink'], kompat: ['Lost Mary TAPPO'] },
      short: D('Kompaktná batéria TAPPO s vibračným indikátorom nabitia a jedným predplneným podom.', 'Batterie TAPPO compacte avec indicateur de charge à vibration, livrée avec un pod prérempli.'), pop: 72 }),
    p({ slug: 'drifter-pod-kit-black', name: 'Drifter Pod Kit Black', art: 'kit', color: '#5B3FD6',
      cats: ['keszulekek', 'eloretoltott-pod-rendszerek'], brand: 'drifter', price: 12.9, sku: 'FV-DRF-KIT-BLK', weight: 50,
      attrs: { szin: ['Black'], kompat: ['Drifter'] },
      short: D('Batéria Drifter s LED indikátorom nabitia pre predplnené pody Drifter.', 'Batterie Drifter avec indicateur LED, pour les pods préremplis Drifter.'), pop: 50 }),

    /* ===== Zariadenia / kity – plniteľné pod systémy ===== */
    p({ slug: 'geekvape-wenax-q-black', name: 'Geekvape Wenax Q Pod Kit Black', art: 'kit', color: '#1B1B1F',
      cats: ['keszulekek', 'utantoltheto-pod-rendszerek'], brand: 'geekvape', price: 22.9, sku: 'FV-GV-WENQ-BLK', weight: 70,
      attrs: { szin: ['Black'], kompat: ['Geekvape Q'], ohm: ['0,6 Ω', '0,8 Ω'] },
      short: D('Plniteľný MTL pod systém, 1000 mAh. V balení dva Q pody 0,6 Ω a 0,8 Ω.', 'Système pod MTL à remplir, 1000 mAh. Livré avec deux pods Q 0,6 Ω et 0,8 Ω.'), pop: 74 }),
    p({ slug: 'geekvape-aegis-boost-2-gunmetal', name: 'Geekvape Aegis Boost 2 Kit Gunmetal', art: 'kit', color: '#4A4F58',
      cats: ['keszulekek', 'utantoltheto-pod-rendszerek'], brand: 'geekvape', price: 39.9, sku: 'FV-GV-AB2-GUN', weight: 160,
      attrs: { szin: ['Gunmetal'], kompat: ['Geekvape B'], ohm: ['0,4 Ω'] },
      short: D('Odolný pod mod s ochranou IP68 pre žhaviace hlavy série B, výkon do 60 W.', 'Pod mod robuste IP68 pour résistances série B, jusqu’à 60 W.'), pop: 61 }),
    p({ slug: 'vaporesso-xros-4-mini-blue', group: 'xros-4-mini', name: 'Vaporesso XROS 4 Mini Pod Kit Blue', art: 'kit', color: '#2D5BD7',
      cats: ['keszulekek', 'utantoltheto-pod-rendszerek'], brand: 'vaporesso', price: 26.9, sku: 'FV-VAP-XROS4M-BLU', weight: 68,
      attrs: { szin: ['Blue'], kompat: ['Vaporesso XROS'], ohm: ['0,6 Ω', '1,0 Ω'] },
      short: D('Plniteľný MTL pod systém, 1000 mAh, nastaviteľný ťah. Pre prázdne pody XROS.', 'Système pod MTL à remplir, 1000 mAh, airflow réglable. Pour pods vides XROS.'), pop: 86 }),
    p({ slug: 'vaporesso-xros-4-mini-black', group: 'xros-4-mini', name: 'Vaporesso XROS 4 Mini Pod Kit Black', art: 'kit', color: '#1B1B1F',
      cats: ['keszulekek', 'utantoltheto-pod-rendszerek'], brand: 'vaporesso', price: 26.9, sku: 'FV-VAP-XROS4M-BLK', weight: 68,
      attrs: { szin: ['Black'], kompat: ['Vaporesso XROS'], ohm: ['0,6 Ω', '1,0 Ω'] },
      short: D('Plniteľný MTL pod systém, 1000 mAh, nastaviteľný ťah. Pre prázdne pody XROS.', 'Système pod MTL à remplir, 1000 mAh, airflow réglable. Pour pods vides XROS.'), pop: 79 }),
    p({ slug: 'vaporesso-gtx-go-40-silver', name: 'Vaporesso GTX GO 40 Kit Silver', art: 'kit', color: '#B8BCC4',
      cats: ['keszulekek', 'utantoltheto-pod-rendszerek'], brand: 'vaporesso', price: 29.9, sku: 'FV-VAP-GTXGO40-SLV', weight: 95,
      attrs: { szin: ['Silver'], kompat: ['Vaporesso GTX'], ohm: ['0,6 Ω', '0,8 Ω'] },
      short: D('Plniteľný pod systém pre žhaviace hlavy GTX, batéria 1500 mAh.', 'Système pod à remplir pour résistances GTX, batterie 1500 mAh.'), pop: 58 }),

    /* ===== Zariadenia / kity – mod / tank kity ===== */
    p({ slug: 'vaporesso-gen-max-black', name: 'Vaporesso GEN MAX Kit Black', art: 'kit', color: '#1B1B1F',
      cats: ['keszulekek', 'mod-tank-kitek'], brand: 'vaporesso', price: 74.9, sku: 'FV-VAP-GENMAX-BLK', weight: 330,
      attrs: { szin: ['Black'], kompat: ['Vaporesso GTi'], ohm: ['0,2 Ω', '0,4 Ω'] },
      short: D('Mod na dve batérie 18650 s tankom iTank M pre žhaviace hlavy GTi.', 'Box double accu 18650 avec clearomiseur iTank M pour résistances GTi.'), pop: 57 }),
    p({ slug: 'vaporesso-gen-se-blue', name: 'Vaporesso GEN SE Kit Blue', art: 'kit', color: '#2D5BD7',
      cats: ['keszulekek', 'mod-tank-kitek'], brand: 'vaporesso', price: 44.9, sku: 'FV-VAP-GENSE-BLU', weight: 210,
      attrs: { szin: ['Blue'], kompat: ['Vaporesso GTi'], ohm: ['0,4 Ω'] },
      short: D('Kompaktný mod na jednu batériu 18650 s tankom iTank 2 pre žhaviace hlavy GTi.', 'Box compact simple accu 18650 avec iTank 2 pour résistances GTi.'), pop: 53 }),
    p({ slug: 'geekvape-aegis-legend-3-gunmetal', name: 'Geekvape Aegis Legend 3 Kit Gunmetal', art: 'kit', color: '#4A4F58',
      cats: ['keszulekek', 'mod-tank-kitek'], brand: 'geekvape', price: 69.9, sale: 59.9, sku: 'FV-GV-AL3-GUN', weight: 310,
      attrs: { szin: ['Gunmetal'], kompat: ['Geekvape Z'], ohm: ['0,2 Ω'] },
      short: D('Mod s ochranou IP68 na dve batérie 18650, s tankom Z Sub-Ohm.', 'Box IP68 double accu 18650, avec clearomiseur Z Sub-Ohm.'), pop: 60 }),
    p({ slug: 'innokin-endura-t18-2', name: 'Innokin Endura T18 II Kit Silver', art: 'kit', color: '#B8BCC4',
      cats: ['keszulekek', 'mod-tank-kitek'], brand: 'innokin', price: 29.9, sku: 'FV-INN-T18II', weight: 140, stock: 'discontinued',
      attrs: { szin: ['Silver'] },
      short: D('Klasický MTL kit pre začiatočníkov. Predaj tohto modelu bol ukončený.', 'Kit MTL classique pour débuter. Modèle arrêté.'), pop: 30 }),

    /* ===== Predplnené pody ===== */
    p({ slug: 'elfbar-elfa-pro-pod-blueberry', pack: 2, name: D('Elfbar ELFA Pro Pod Blueberry (2 ks)', 'Elfbar ELFA Pro Pod Blueberry (lot de 2)'), art: 'pod', color: '#4B5BD6',
      cats: ['eloretoltott-podok'], brand: 'elfbar', price: 7.9, sku: 'FV-ELFA-POD-BLB-20', weight: 24,
      attrs: { iz: ['Blueberry'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600], kompat: ['ELFA'] },
      short: D('Predplnený pod pre batériu ELFA, 2 ks v balení.', 'Pod prérempli pour la batterie ELFA, lot de 2.'), pop: 89, featured: true }),
    p({ slug: 'elfbar-elfa-pro-pod-strawberry-kiwi', pack: 2, name: D('Elfbar ELFA Pro Pod Strawberry Kiwi (2 ks)', 'Elfbar ELFA Pro Pod Strawberry Kiwi (lot de 2)'), art: 'pod', color: '#E5566E',
      cats: ['eloretoltott-podok'], brand: 'elfbar', price: 7.9, sku: 'FV-ELFA-POD-SK-20', weight: 24,
      attrs: { iz: ['Strawberry Kiwi'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600], kompat: ['ELFA'] },
      short: D('Predplnený pod pre batériu ELFA s príchuťou jahoda-kiwi, 2 ks v balení.', 'Pod prérempli pour la batterie ELFA, saveur fraise-kiwi, lot de 2.'), pop: 80 }),
    p({ slug: 'elfbar-elfa-pro-pod-spearmint-20', group: 'elfa-spearmint', pack: 2, name: D('Elfbar ELFA Pro Pod Spearmint 20 mg (2 ks)', 'Elfbar ELFA Pro Pod Spearmint 20 mg (lot de 2)'), art: 'pod', color: '#23B58A',
      cats: ['eloretoltott-podok'], brand: 'elfbar', price: 7.9, sku: 'FV-ELFA-POD-SPM-20', weight: 24,
      attrs: { iz: ['Spearmint'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600], kompat: ['ELFA'] },
      short: D('Mäta klasnatá pre systém ELFA, 2 ks v balení.', 'Menthe verte pour le système ELFA, lot de 2.'), pop: 68 }),
    p({ slug: 'elfbar-elfa-pro-pod-spearmint-10', group: 'elfa-spearmint', pack: 2, name: D('Elfbar ELFA Pro Pod Spearmint 10 mg (2 ks)', 'Elfbar ELFA Pro Pod Spearmint 10 mg (lot de 2)'), art: 'pod', color: '#23B58A',
      cats: ['eloretoltott-podok'], brand: 'elfbar', price: 7.9, sku: 'FV-ELFA-POD-SPM-10', weight: 24,
      attrs: { iz: ['Spearmint'], nikotin: ['10 mg'], ml: ['2 ml'], puff: [600], kompat: ['ELFA'] },
      short: D('Mäta klasnatá pre systém ELFA v nižšej sile, 2 ks v balení.', 'Menthe verte pour le système ELFA, taux réduit, lot de 2.'), pop: 55 }),
    p({ slug: 'elfbar-join-one-pod-watermelon', pack: 2, name: D('Elfbar JOIN ONE Pod Watermelon (2 ks)', 'Elfbar JOIN ONE Pod Watermelon (lot de 2)'), art: 'pod', color: '#F0506E',
      cats: ['eloretoltott-podok'], brand: 'elfbar', price: 6.9, sku: 'FV-ELF-JOIN1-POD-WM', weight: 22,
      attrs: { iz: ['Watermelon'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600], kompat: ['JOIN ONE'] },
      short: D('Predplnený pod pre batériu JOIN ONE, 2 ks v balení.', 'Pod prérempli pour la batterie JOIN ONE, lot de 2.'), pop: 66 }),
    p({ slug: 'vaporesso-xros-predplneny-pod-mango-ice', pack: 2, name: D('Vaporesso XROS predplnený pod Mango Ice (2 ks)', 'Vaporesso XROS pod prérempli Mango Ice (lot de 2)'), art: 'pod', color: '#FFC94D',
      cats: ['eloretoltott-podok'], brand: 'vaporesso', price: 7.5, sku: 'FV-VAP-XROS-PF-MGI', weight: 22,
      attrs: { iz: ['Mango Ice'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [700], kompat: ['Vaporesso XROS'] },
      short: D('Továrensky naplnený pod pre zariadenia XROS, 2 ks v balení.', 'Pod prérempli pour les appareils XROS, lot de 2.'), pop: 59 }),
    p({ slug: 'lost-mary-tappo-pod-cherry', name: 'Lost Mary TAPPO Pod Cherry', art: 'pod', color: '#B0133A',
      cats: ['eloretoltott-podok'], brand: 'lost-mary', price: 6.9, sku: 'FV-LM-TAP-CHR', weight: 20,
      attrs: { iz: ['Cherry'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600], kompat: ['Lost Mary TAPPO'] },
      short: D('Predplnený pod TAPPO s príchuťou zrelej čerešne.', 'Pod TAPPO prérempli, saveur cerise mûre.'), pop: 58 }),
    p({ slug: 'drifter-pod-kiwi-passion', name: 'Drifter Pod Kiwi Passion', art: 'pod', color: '#8FBF3F',
      cats: ['eloretoltott-podok'], brand: 'drifter', price: 6.5, sku: 'FV-DRF-POD-KP', weight: 20, stock: 'outofstock',
      attrs: { iz: ['Kiwi Passion'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [800], kompat: ['Drifter'] },
      short: D('Kiwi a maracuja, predplnený pod pre batériu Drifter.', 'Kiwi et fruit de la passion, pod prérempli pour la batterie Drifter.'), pop: 45 }),

    /* ===== E-liquidy ===== */
    p({ slug: 'nikotinovy-booster-20', name: D('Nikotínový booster 20 mg/ml 10 ml', 'Booster de nicotine 20 mg/ml 10 ml'), art: 'liquid', color: '#BFC4CC',
      cats: ['e-liquidek', 'nikotin-booster'], brand: 'vampire-vape', price: 2.5, sku: 'FV-BOOST-20-10', weight: 30,
      attrs: { iz: ['Unflavored'], nikotin: ['20 mg'], ml: ['10 ml'] },
      short: D('Neochutený nikotínový booster 50/50 do shortfill a longfill liquidov.', 'Booster de nicotine 50/50 sans arôme, pour shortfills et longfills.'), pop: 65 }),
    p({ slug: 'nasty-juice-trap-queen-10', group: 'trap-queen', name: 'Nasty Juice Trap Queen 10 ml 10 mg', art: 'liquid', color: '#E83A5A',
      cats: ['e-liquidek', 'kesz-liquidek-10ml'], brand: 'nasty-juice', price: 5.9, sku: 'FV-NJ-TQ-10-10', weight: 34,
      attrs: { iz: ['Strawberry'], nikotin: ['10 mg'], ml: ['10 ml'] },
      short: D('Hotový liquid s nikotínovou soľou, čerstvé jahody a ľadová dochuť.', 'E-liquide prêt aux sels de nicotine, fraise fraîche et finale glacée.'), pop: 70 }),
    p({ slug: 'nasty-juice-trap-queen-20', group: 'trap-queen', name: 'Nasty Juice Trap Queen 10 ml 20 mg', art: 'liquid', color: '#E83A5A',
      cats: ['e-liquidek', 'kesz-liquidek-10ml'], brand: 'nasty-juice', price: 5.9, sku: 'FV-NJ-TQ-10-20', weight: 34,
      attrs: { iz: ['Strawberry'], nikotin: ['20 mg'], ml: ['10 ml'] },
      short: D('Hotový liquid s nikotínovou soľou, čerstvé jahody a ľadová dochuť.', 'E-liquide prêt aux sels de nicotine, fraise fraîche et finale glacée.'), pop: 78 }),
    p({ slug: 'nasty-juice-cushman-mango-20', name: 'Nasty Juice Cushman Mango 10 ml 20 mg', art: 'liquid', color: '#FFB020',
      cats: ['e-liquidek', 'kesz-liquidek-10ml'], brand: 'nasty-juice', price: 5.9, sku: 'FV-NJ-CM-10-20', weight: 34,
      attrs: { iz: ['Mango'], nikotin: ['20 mg'], ml: ['10 ml'] },
      short: D('Zrelé mango s jemným chladivým efektom, s nikotínovou soľou.', 'Mangue mûre légèrement rafraîchissante, aux sels de nicotine.'), pop: 69 }),
    p({ slug: 'vampire-vape-heisenberg-20', name: 'Vampire Vape Heisenberg 10 ml 20 mg', art: 'liquid', color: '#36A9E0',
      cats: ['e-liquidek', 'kesz-liquidek-10ml'], brand: 'vampire-vape', price: 5.5, sku: 'FV-VV-HEIS-10-20', weight: 34,
      attrs: { iz: ['Energy'], nikotin: ['20 mg'], ml: ['10 ml'] },
      short: D('Legendárny Heisenberg: lesné plody, aníz a mentol.', 'Le légendaire Heisenberg : fruits rouges, anis et menthol.'), pop: 83 }),
    p({ slug: 'elfbar-elfliq-blueberry-20', name: 'Elfbar Elfliq Blueberry 10 ml 20 mg', art: 'liquid', color: '#4B5BD6',
      cats: ['e-liquidek', 'kesz-liquidek-10ml'], brand: 'elfbar', price: 4.9, sku: 'FV-ELF-ELFLIQ-BLB-20', weight: 32,
      attrs: { iz: ['Blueberry'], nikotin: ['20 mg'], ml: ['10 ml'] },
      short: D('Liquid s nikotínovou soľou od Elfbaru, s chuťou ako jednorazové Elfbar.', 'E-liquide aux sels de nicotine signé Elfbar, au goût des jetables Elfbar.'), pop: 72 }),
    p({ slug: 'twelve-monkeys-kanzi-aroma', name: D('Twelve Monkeys Kanzi aróma 20 ml', 'Twelve Monkeys Kanzi arôme 20 ml'), art: 'liquid', color: '#F48FB1',
      cats: ['e-liquidek', 'aromak'], brand: 'twelve-monkeys', price: 11.9, sku: 'FV-12M-KANZI-20', weight: 62,
      attrs: { iz: ['Strawberry Kiwi'], nikotin: ['0 mg'], ml: ['20 ml'] },
      short: D('Koncentrovaná aróma na riedenie bázou: jahoda, kiwi a melón.', 'Arôme concentré à diluer : fraise, kiwi et pastèque.'), pop: 54 }),
    p({ slug: 'french-liquide-jackfruit-pear', name: D('French Liquide Fruiitopia Jackfruit Pear aróma 10 ml', 'French Liquide Fruiitopia Jackfruit Pear arôme 10 ml'), art: 'liquid', color: '#C7C45A',
      cats: ['e-liquidek', 'aromak'], brand: 'french-liquide', price: 6.9, sku: 'FV-FL-FJP-10', weight: 30,
      attrs: { iz: ['Jackfruit Pear'], nikotin: ['0 mg'], ml: ['10 ml'] },
      short: D('Jackfruit, hruška a guava: exotická aróma na vlastné miešanie.', 'Jacquier, poire et goyave : un arôme exotique pour vos mélanges.'), pop: 35 }),
    p({ slug: 'vampire-vape-pinkman-shortfill', name: 'Vampire Vape Pinkman 50 ml shortfill', art: 'liquid', color: '#F06292',
      cats: ['e-liquidek', 'shortfill'], brand: 'vampire-vape', price: 16.9, sku: 'FV-VV-PINK-50', weight: 95,
      attrs: { iz: ['Pink Lemonade'], nikotin: ['0 mg'], ml: ['50 ml'] },
      short: D('50 ml beznikotínového liquidu v 60 ml fľaške, s miestom na jeden booster.', '50 ml sans nicotine en flacon de 60 ml, prêt pour un booster.'), pop: 57 }),
    p({ slug: 'nasty-juice-bad-blood-longfill', name: 'Nasty Juice Bad Blood 20 ml longfill', art: 'liquid', color: '#5B2A6E',
      cats: ['e-liquidek', 'longfill'], brand: 'nasty-juice', price: 13.9, sku: 'FV-NJ-BB-LF20', weight: 80,
      attrs: { iz: ['Blackcurrant'], nikotin: ['0 mg'], ml: ['20 ml'] },
      short: D('20 ml koncentrovaného liquidu v 60 ml fľaške: doplníš bázou a boosterom.', '20 ml d’e-liquide concentré en flacon de 60 ml, à compléter avec base et booster.'), pop: 44 }),

    /* ===== Jednorazové e-cigarety ===== */
    p({ slug: 'elfbar-bc40000-blueberry-ice', name: 'Elfbar BC40000 Blueberry Ice', art: 'disposable', color: '#5C7CFA',
      cats: ['eldobhato'], brand: 'elfbar', price: 24.9, sku: 'FV-ELF-BC40K-BBI', weight: 118,
      attrs: { iz: ['Blueberry Ice'], nikotin: ['20 mg'], ml: ['18 ml'], puff: [40000] },
      short: D('Jednorazová e-cigareta s displejom a dvoma režimami, batéria nabíjateľná cez USB-C.', 'Jetable à écran et deux modes, batterie rechargeable en USB-C.'), pop: 99, featured: true }),
    p({ slug: 'elfbar-bc40000-mango-ice', name: 'Elfbar BC40000 Mango Ice', art: 'disposable', color: '#FFC94D',
      cats: ['eldobhato'], brand: 'elfbar', price: 24.9, sku: 'FV-ELF-BC40K-MGI', weight: 118,
      attrs: { iz: ['Mango Ice'], nikotin: ['20 mg'], ml: ['18 ml'], puff: [40000] },
      short: D('Jednorazová e-cigareta s displejom a dvoma režimami, batéria nabíjateľná cez USB-C.', 'Jetable à écran et deux modes, batterie rechargeable en USB-C.'), pop: 95 }),
    p({ slug: 'elfbar-bc40000-watermelon-ice', name: 'Elfbar BC40000 Watermelon Ice', art: 'disposable', color: '#F57A93',
      cats: ['eldobhato'], brand: 'elfbar', price: 24.9, sku: 'FV-ELF-BC40K-WMI', weight: 118, stock: 'outofstock',
      attrs: { iz: ['Watermelon Ice'], nikotin: ['20 mg'], ml: ['18 ml'], puff: [40000] },
      short: D('Jednorazová e-cigareta s displejom a dvoma režimami, batéria nabíjateľná cez USB-C.', 'Jetable à écran et deux modes, batterie rechargeable en USB-C.'), pop: 90 }),
    p({ slug: 'lost-mary-mo20000-pro-strawberry-kiwi', name: 'Lost Mary MO20000 Pro Strawberry Kiwi', art: 'disposable', color: '#E5566E',
      cats: ['eldobhato'], brand: 'lost-mary', price: 21.9, sale: 17.5, sku: 'FV-LM-MO20K-SK', weight: 96,
      attrs: { iz: ['Strawberry Kiwi'], nikotin: ['20 mg'], ml: ['16 ml'], puff: [20000] },
      short: D('Nastaviteľný ťah a displej, batéria nabíjateľná cez USB-C.', 'Airflow réglable et écran, batterie rechargeable en USB-C.'), pop: 88 }),
    p({ slug: 'drifter-bar-30000-cola', name: 'Drifter Bar 30000 Cola', art: 'disposable', color: '#6B3A2A',
      cats: ['eldobhato'], brand: 'drifter', price: 22.9, sku: 'FV-DRF-30K-COL', weight: 104,
      attrs: { iz: ['Cola'], nikotin: ['20 mg'], ml: ['17 ml'], puff: [30000] },
      short: D('Jednorazová e-cigareta s veľkou kapacitou a klasickou príchuťou koly.', 'Jetable grande capacité au goût de cola classique.'), pop: 70 }),
    p({ slug: 'drifter-bar-30000-grape', name: 'Drifter Bar 30000 Grape', art: 'disposable', color: '#7B3FA0',
      cats: ['eldobhato'], brand: 'drifter', price: 22.9, sku: 'FV-DRF-30K-GRP', weight: 104, stock: 'discontinued',
      attrs: { iz: ['Grape'], nikotin: ['20 mg'], ml: ['17 ml'], puff: [30000] },
      short: D('Jednorazová e-cigareta, príchuť hrozno. Výrobca produkt stiahol z predaja.', 'Jetable saveur raisin. Le fabricant a arrêté ce produit.'), pop: 40 }),
    p({ slug: 'elfbar-raya-d1-peach-ice', name: 'Elfbar Raya D1 10000 Peach Ice', art: 'disposable', color: '#FFB38F',
      cats: ['eldobhato'], brand: 'elfbar', price: 16.9, sku: 'FV-ELF-RD1-PCI', weight: 72,
      attrs: { iz: ['Peach Ice'], nikotin: ['20 mg'], ml: ['13 ml'], puff: [10000] },
      short: D('Mesh žhaviaca hlava a stabilná chuť až do konca, nabíjanie cez USB-C.', 'Résistance mesh, saveur constante jusqu’au bout, recharge USB-C.'), pop: 76 }),
    p({ slug: 'lost-mary-bm10000-triple-mango', name: 'Lost Mary BM10000 Triple Mango', art: 'disposable', color: '#FF9F1C',
      cats: ['eldobhato'], brand: 'lost-mary', price: 15.9, sku: 'FV-LM-BM10K-TM', weight: 70,
      attrs: { iz: ['Triple Mango'], nikotin: ['20 mg'], ml: ['14 ml'], puff: [10000] },
      short: D('Vyvážená kombinácia troch druhov manga, nabíjateľná batéria.', 'L’équilibre de trois mangues, batterie rechargeable.'), pop: 81 }),
    p({ slug: 'elfbar-bc5000-strawberry', name: 'Elfbar BC5000 Strawberry', art: 'disposable', color: '#E83A5A',
      cats: ['eldobhato'], brand: 'elfbar', price: 12.9, sku: 'FV-ELF-BC5K-STR', weight: 58,
      attrs: { iz: ['Strawberry'], nikotin: ['20 mg'], ml: ['13 ml'], puff: [5000] },
      short: D('Obľúbený model Elfbar so sladkou jahodovou príchuťou, nabíjanie cez USB-C.', 'Modèle Elfbar populaire, saveur fraise sucrée, recharge USB-C.'), pop: 84 }),
    p({ slug: 'elfbar-bc5000-menthol-20', group: 'bc5000-menthol', name: 'Elfbar BC5000 Menthol 20 mg', art: 'disposable', color: '#2EC4B6',
      cats: ['eldobhato'], brand: 'elfbar', price: 12.9, sku: 'FV-ELF-BC5K-MEN-20', weight: 58,
      attrs: { iz: ['Menthol'], nikotin: ['20 mg'], ml: ['13 ml'], puff: [5000] },
      short: D('Čistý, osviežujúci mentol.', 'Un menthol pur et rafraîchissant.'), pop: 66 }),
    p({ slug: 'elfbar-bc5000-menthol-0', group: 'bc5000-menthol', name: D('Elfbar BC5000 Menthol – bez nikotínu', 'Elfbar BC5000 Menthol – sans nicotine'), art: 'disposable', color: '#2EC4B6',
      cats: ['eldobhato'], brand: 'elfbar', price: 12.5, sku: 'FV-ELF-BC5K-MEN-0', weight: 58,
      attrs: { iz: ['Menthol'], nikotin: ['0 mg'], ml: ['13 ml'], puff: [5000] },
      short: D('Čistý, osviežujúci mentol bez nikotínu.', 'Un menthol pur et rafraîchissant, sans nicotine.'), pop: 50 }),
    p({ slug: 'elfbar-600-blueberry', name: 'Elfbar 600 Blueberry', art: 'disposable', color: '#4B5BD6',
      cats: ['eldobhato'], brand: 'elfbar', price: 5.9, sku: 'FV-ELF-600-BLB', weight: 28,
      attrs: { iz: ['Blueberry'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600] },
      short: D('Jednorazová e-cigareta s 2 ml v súlade s TPD, bez nabíjania.', 'Jetable 2 ml conforme TPD, sans recharge.'), pop: 92, featured: true }),
    p({ slug: 'elfbar-600-cola', name: 'Elfbar 600 Cola', art: 'disposable', color: '#6B3A2A',
      cats: ['eldobhato'], brand: 'elfbar', price: 5.9, sale: 4.5, sku: 'FV-ELF-600-COL', weight: 28,
      attrs: { iz: ['Cola'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600] },
      short: D('Jednorazová e-cigareta s 2 ml v súlade s TPD, bez nabíjania.', 'Jetable 2 ml conforme TPD, sans recharge.'), pop: 74 }),
    p({ slug: 'elfbar-600-watermelon-0', name: D('Elfbar 600 Watermelon – bez nikotínu', 'Elfbar 600 Watermelon – sans nicotine'), art: 'disposable', color: '#F0506E',
      cats: ['eldobhato'], brand: 'elfbar', price: 5.5, sku: 'FV-ELF-600-WM0', weight: 28,
      attrs: { iz: ['Watermelon'], nikotin: ['0 mg'], ml: ['2 ml'], puff: [600] },
      short: D('Bez nikotínu, s rovnakým chuťovým zážitkom.', 'Sans nicotine, avec la même saveur.'), pop: 62 }),
    p({ slug: 'lost-mary-bm600-pink-lemonade', name: 'Lost Mary BM600 Pink Lemonade', art: 'disposable', color: '#F48FB1',
      cats: ['eldobhato'], brand: 'lost-mary', price: 5.9, sku: 'FV-LM-BM600-PL', weight: 30,
      attrs: { iz: ['Pink Lemonade'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600] },
      short: D('Perlivá ružová limonáda v typickom oblom tvare Lost Mary.', 'Limonade rose pétillante, dans la forme arrondie de Lost Mary.'), pop: 71 }),

    /* ===== Príslušenstvo ===== */
    p({ slug: 'geekvape-q-pod-04', group: 'q-pod', pack: 2, name: D('Geekvape Q prázdny pod 0,4 Ω (2 ks)', 'Geekvape pod vide Q 0,4 Ω (lot de 2)'), art: 'accessory', acc: 'cartridge', color: '#E4572E',
      cats: ['kiegeszitok', 'ures-podok'], brand: 'geekvape', price: 7.9, sku: 'FV-GV-QPOD-04', weight: 18,
      attrs: { ml: ['2 ml'], kompat: ['Geekvape Q'], ohm: ['0,4 Ω'] },
      short: D('Plniteľný pod so zabudovanou mesh hlavou 0,4 Ω pre zariadenia Wenax Q a Aegis Q.', 'Pod à remplir avec résistance mesh 0,4 Ω intégrée, pour Wenax Q et Aegis Q.'), pop: 64 }),
    p({ slug: 'geekvape-q-pod-06', group: 'q-pod', pack: 2, name: D('Geekvape Q prázdny pod 0,6 Ω (2 ks)', 'Geekvape pod vide Q 0,6 Ω (lot de 2)'), art: 'accessory', acc: 'cartridge', color: '#E4572E',
      cats: ['kiegeszitok', 'ures-podok'], brand: 'geekvape', price: 7.9, sku: 'FV-GV-QPOD-06', weight: 18,
      attrs: { ml: ['2 ml'], kompat: ['Geekvape Q'], ohm: ['0,6 Ω'] },
      short: D('Plniteľný pod so zabudovanou mesh hlavou 0,6 Ω pre zariadenia Wenax Q a Aegis Q.', 'Pod à remplir avec résistance mesh 0,6 Ω intégrée, pour Wenax Q et Aegis Q.'), pop: 60 }),
    p({ slug: 'geekvape-q-pod-08', group: 'q-pod', pack: 2, name: D('Geekvape Q prázdny pod 0,8 Ω (2 ks)', 'Geekvape pod vide Q 0,8 Ω (lot de 2)'), art: 'accessory', acc: 'cartridge', color: '#E4572E',
      cats: ['kiegeszitok', 'ures-podok'], brand: 'geekvape', price: 7.9, sku: 'FV-GV-QPOD-08', weight: 18,
      attrs: { ml: ['2 ml'], kompat: ['Geekvape Q'], ohm: ['0,8 Ω'] },
      short: D('Plniteľný pod so zabudovanou mesh hlavou 0,8 Ω pre zariadenia Wenax Q a Aegis Q.', 'Pod à remplir avec résistance mesh 0,8 Ω intégrée, pour Wenax Q et Aegis Q.'), pop: 56 }),
    p({ slug: 'vaporesso-xros-prazdny-pod-06', group: 'xros-pod', pack: 4, name: D('Vaporesso XROS prázdny pod 0,6 Ω (4 ks)', 'Vaporesso pod vide XROS 0,6 Ω (lot de 4)'), art: 'accessory', acc: 'cartridge', color: '#2D5BD7',
      cats: ['kiegeszitok', 'ures-podok'], brand: 'vaporesso', price: 10.9, sku: 'FV-VAP-XROS-POD06', weight: 22,
      attrs: { ml: ['2 ml'], kompat: ['Vaporesso XROS'], ohm: ['0,6 Ω'] },
      short: D('Plniteľný pod XROS s mesh hlavou 0,6 Ω, 4 ks v balení.', 'Pod XROS à remplir, résistance mesh 0,6 Ω, lot de 4.'), pop: 77 }),
    p({ slug: 'vaporesso-xros-prazdny-pod-10', group: 'xros-pod', pack: 4, name: D('Vaporesso XROS prázdny pod 1,0 Ω (4 ks)', 'Vaporesso pod vide XROS 1,0 Ω (lot de 4)'), art: 'accessory', acc: 'cartridge', color: '#2D5BD7',
      cats: ['kiegeszitok', 'ures-podok'], brand: 'vaporesso', price: 10.9, sku: 'FV-VAP-XROS-POD10', weight: 22,
      attrs: { ml: ['2 ml'], kompat: ['Vaporesso XROS'], ohm: ['1,0 Ω'] },
      short: D('Plniteľný pod XROS s mesh hlavou 1,0 Ω, 4 ks v balení.', 'Pod XROS à remplir, résistance mesh 1,0 Ω, lot de 4.'), pop: 62 }),
    p({ slug: 'elfbar-elfa-cp-prazdny-pod', pack: 2, name: D('Elfbar ELFA CP prázdny plniteľný pod (2 ks)', 'Elfbar ELFA CP pod vide à remplir (lot de 2)'), art: 'accessory', acc: 'cartridge', color: '#4B5BD6',
      cats: ['kiegeszitok', 'ures-podok'], brand: 'elfbar', price: 5.9, sku: 'FV-ELFA-CP-2', weight: 16,
      attrs: { ml: ['2 ml'], kompat: ['ELFA'], ohm: ['1,0 Ω'] },
      short: D('Prázdny pod pre batériu ELFA, ktorý si naplníš vlastným liquidom.', 'Pod vide pour la batterie ELFA, à remplir avec votre e-liquide.'), pop: 52 }),
    p({ slug: 'geekvape-z-coil-02', name: D('Geekvape Z žhaviaca hlava 0,2 Ω (5 ks)', 'Geekvape résistance Z 0,2 Ω (lot de 5)'), art: 'accessory', acc: 'coil', color: '#4A4F58',
      cats: ['kiegeszitok', 'porlasztok'], brand: 'geekvape', price: 14.9, sku: 'FV-GV-ZCOIL-02', weight: 26,
      attrs: { kompat: ['Geekvape Z'], ohm: ['0,2 Ω'] },
      short: D('Mesh žhaviaca hlava pre tank Z Sub-Ohm, 5 ks v balení.', 'Résistance mesh pour le clearomiseur Z Sub-Ohm, lot de 5.'), pop: 52 }),
    p({ slug: 'geekvape-b-coil-04', name: D('Geekvape B žhaviaca hlava 0,4 Ω (5 ks)', 'Geekvape résistance B 0,4 Ω (lot de 5)'), art: 'accessory', acc: 'coil', color: '#4A4F58',
      cats: ['kiegeszitok', 'porlasztok'], brand: 'geekvape', price: 13.9, sku: 'FV-GV-BCOIL-04', weight: 24,
      attrs: { kompat: ['Geekvape B'], ohm: ['0,4 Ω'] },
      short: D('Žhaviaca hlava série B pre Aegis Boost, 5 ks v balení.', 'Résistance série B pour Aegis Boost, lot de 5.'), pop: 47 }),
    p({ slug: 'vaporesso-gti-coil-04', name: D('Vaporesso GTi žhaviaca hlava 0,4 Ω (5 ks)', 'Vaporesso résistance GTi 0,4 Ω (lot de 5)'), art: 'accessory', acc: 'coil', color: '#0B7A75',
      cats: ['kiegeszitok', 'porlasztok'], brand: 'vaporesso', price: 14.9, sku: 'FV-VAP-GTI-04', weight: 24,
      attrs: { kompat: ['Vaporesso GTi'], ohm: ['0,4 Ω'] },
      short: D('Mesh žhaviaca hlava pre tanky iTank (GEN MAX, GEN SE), 5 ks v balení.', 'Résistance mesh pour iTank (GEN MAX, GEN SE), lot de 5.'), pop: 49 }),
    p({ slug: 'geekvape-z-sub-ohm-tank', name: 'Geekvape Z Sub-Ohm Tank 5 ml', art: 'accessory', acc: 'tank', color: '#4A4F58',
      cats: ['kiegeszitok', 'tankok'], brand: 'geekvape', price: 27.9, sku: 'FV-GV-ZTANK', weight: 90,
      attrs: { ml: ['5 ml'], kompat: ['Geekvape Z'] },
      short: D('Sub-ohm tank pre žhaviace hlavy Z, objem 5 ml.', 'Clearomiseur sub-ohm pour résistances Z, 5 ml.'), pop: 41 }),
    p({ slug: 'vaporesso-itank-m', name: 'Vaporesso iTank M 3 ml', art: 'accessory', acc: 'tank', color: '#0B7A75',
      cats: ['kiegeszitok', 'tankok'], brand: 'vaporesso', price: 24.9, sku: 'FV-VAP-ITANKM', weight: 80,
      attrs: { ml: ['3 ml'], kompat: ['Vaporesso GTi'] },
      short: D('Tank pre žhaviace hlavy GTi, objem 3 ml (TPD).', 'Clearomiseur pour résistances GTi, 3 ml (TPD).'), pop: 39 }),
    p({ slug: 'usb-c-nabijaci-kabel', name: D('Nabíjací kábel USB-C 1 m', 'Câble de charge USB-C 1 m'), art: 'accessory', acc: 'cable', color: '#1B1B1F',
      cats: ['kiegeszitok', 'akkuk-toltok'], brand: 'vaporesso', price: 3.9, sku: 'FV-CBL-USBC-1M', weight: 30,
      attrs: {},
      short: D('USB-C kábel na nabíjanie pod systémov a jednorazových zariadení s USB-C portom.', 'Câble USB-C pour recharger les systèmes pod et les jetables équipés d’un port USB-C.'), pop: 48 }),
    p({ slug: 'geekvape-18650-3000', name: D('Geekvape batéria 18650 3000 mAh', 'Geekvape accu 18650 3000 mAh'), art: 'accessory', acc: 'battery', color: '#E4572E',
      cats: ['kiegeszitok', 'akkuk-toltok'], brand: 'geekvape', price: 8.9, sku: 'FV-GV-18650-3000', weight: 48,
      attrs: {},
      short: D('Nabíjateľná batéria 18650 pre mody na externé batérie.', 'Accu rechargeable 18650 pour box à accus.'), pop: 43 }),
    p({ slug: 'cotton-clouds-organic', name: D('Cotton Clouds organická vata', 'Cotton Clouds coton bio'), art: 'accessory', acc: 'cotton', color: '#4A8FB8',
      cats: ['kiegeszitok', 'egyeb-kiegeszitok'], brand: 'cotton-clouds', price: 4.9, sku: 'FV-CC-ORG', weight: 18,
      attrs: {},
      short: D('Organická vata s pripravenými vláknami do prebaliteľných atomizérov.', 'Coton bio pré-effiloché pour atomiseurs reconstructibles.'), pop: 20 }),
    p({ slug: 'geekvape-tool-kit', name: D('Geekvape sada náradia', 'Geekvape kit d’outils'), art: 'accessory', acc: 'tool', color: '#E4572E',
      cats: ['kiegeszitok', 'egyeb-kiegeszitok'], brand: 'geekvape', price: 12.9, sku: 'FV-GV-TOOLKIT', weight: 180, stock: 'outofstock',
      attrs: {},
      short: D('Pinzeta, keramická pinzeta, skrutkovače a navíjacia tyčinka v jednom puzdre.', 'Pince, pince céramique, tournevis et outil de montage dans un étui.'), pop: 25 })
  ];

  // Az „Akciók” oldal nem külön kategória: minden akciós árral rendelkező termék automatikusan megjelenik (WooCommerce on_sale lekérdezés).
})();

/* ---------- Menü (iu/menu, mega menü: saját blokk a child témában) ---------- */
FV.menu = [
  { cat: 'keszulekek' },
  { cat: 'eloretoltott-podok' },
  { cat: 'e-liquidek' },
  { cat: 'eldobhato', puffLinks: true },
  { cat: 'kiegeszitok' },
  { lk: 'brands', brands: true },
  { lk: 'sale', href: '#/akciok', sale: true }
];

/* ---------- Piacok ----------
 * A bolt alaphelye Szlovákia. A data.js árai szlovák bruttó árak (23% DPH).
 * WooCommerce alapbeállítással (az árak ÁFÁ-val megadva, a nettó ár marad állandó) a francia vevő
 * ugyanazt a nettó árat látja 20% TVA-val: bruttó = ár / 1,23 × 1,20. Ezt modellezi az FV.gross().
 * Az ÁFA-kulcsokat élesítés előtt a könyvelőnek ellenőriznie kell (OSS, termékkategóriák, jövedéki adó).
 */
FV.baseVat = 0.23;
FV.markets = {
  sk: {
    code: 'SK', lang: 'sk', locale: 'sk-SK', country: 'Slovensko', vat: 0.23, vatLabel: '23 %',
    phonePh: '+421 9xx xxx xxx', zipPh: '945 01',
    companyIds: ['IČO', 'DIČ / IČ DPH'],
    codFee: 1.5,
    // Szállító: Packeta (az ügyfél kérése, 2026-10-12). A díjak MINTA értékek, élesítés előtt az ügyféllel egyeztetendők és tesztelendők.
    pickupLabel: 'Výdajné miesto alebo Z-BOX Packeta',
    pickupPoints: ['Z-BOX Komárno – Tesco, Bratislavská cesta (vzor)', 'Výdajné miesto Packeta – Komárno, Palatínova 12 (vzor)', 'Z-BOX Bratislava – Obchodná 12 (vzor)', 'Výdajné miesto Packeta – Košice, Hlavná 55 (vzor)', 'Z-BOX Nitra – Štefánikova 3 (vzor)'],
    carrier: 'Packeta',
    shipping: {
      freeOver: 50,
      sample: true,
      methods: [
        { id: 'packeta-point', name: 'Packeta – výdajné miesto alebo Z-BOX', short: 'Packeta výdajné miesto', eta: '1–2 pracovné dni', pickup: true,
          tiers: [ { max: 5000, price: 2.9 }, { max: 10000, price: 3.9 }, { max: 15000, price: 4.9 } ] },
        { id: 'packeta-home', name: 'Packeta – doručenie na adresu', short: 'Packeta na adresu', eta: '1–2 pracovné dni',
          tiers: [ { max: 5000, price: 3.9 }, { max: 10000, price: 4.9 }, { max: 30000, price: 6.9 } ] }
      ]
    },
    demo: { first: 'Anna', last: 'Kováčová', email: 'anna.kovacova@example.com', phone: '+421 905 123 456', zip: '945 01', city: 'Komárno', street: 'Hlavná 12' }
  },
  fr: {
    code: 'FR', lang: 'fr', locale: 'fr-FR', country: 'France', vat: 0.20, vatLabel: '20 %',
    phonePh: '+33 6 xx xx xx xx', zipPh: '75011',
    companyIds: ['SIRET', 'N° de TVA intracommunautaire'],
    codFee: 1.5, // MINTA – a francia utánvét elérhetősége és díja a szállítótól függ
    pickupLabel: 'Point relais ou consigne Packeta',
    pickupPoints: ['Point relais – Paris 11e, 45 rue de la Roquette (exemple)', 'Consigne – Lyon 3e, 12 cours Gambetta (exemple)', 'Point relais – Lille, 8 rue Nationale (exemple)'],
    carrier: 'Packeta', // Packeta Franciaországban partnerhálózattal; a pontos szolgáltatás és díj egyeztetendő
    shipping: {
      freeOver: 50, // MINTA
      sample: true,
      methods: [
        { id: 'fr-point', name: 'Packeta – point relais ou consigne', short: 'Point relais', eta: 'délai à confirmer', pickup: true,
          tiers: [ { max: 5000, price: 4.9 }, { max: 10000, price: 5.9 }, { max: 15000, price: 7.9 } ] },
        { id: 'fr-home', name: 'Packeta – livraison à domicile', short: 'Domicile', eta: 'délai à confirmer',
          tiers: [ { max: 5000, price: 6.9 }, { max: 10000, price: 8.9 }, { max: 30000, price: 11.9 } ] }
      ]
    },
    demo: { first: 'Camille', last: 'Martin', email: 'camille.martin@example.com', phone: '+33 6 12 34 56 78', zip: '75011', city: 'Paris', street: '12 rue Oberkampf' }
  }
};

/* ---------- Információs oldalak piaconként (a szöveg az i18n.js-ben) ----------
 * A jogi oldalak HELYŐRZŐK: a végleges szöveget az ügyfél (jogász) adja.
 */
/* Blog (WordPress bejegyzések) – a régi firstvape.sk cikkei alapján */
FV.posts = [
  { slug: 'elfbar-nova-generacia', date: '2026-09-12', color: '#EC2F4B',
    tag: { sk: 'Produkty', fr: 'Produits' },
    title: { sk: 'Elfbar – nová generácia elektronických cigariet', fr: 'Elfbar : la nouvelle génération de cigarettes électroniques' },
    excerpt: { sk: 'Prečo je Elfbar jednou z najžiadanejších značiek a ktorý model je pre koho?', fr: 'Pourquoi Elfbar est-elle l’une des marques les plus demandées, et quel modèle choisir ?' },
    body: { sk: ['Jednorazové aj znovu nabíjateľné zariadenia Elfbar sa stali populárnymi za krátky čas. Tajomstvo je v jednoduchosti: rozbalíš a môžeš začať.', 'Od 600-potiahnutiových modelov v súlade s TPD až po BC40000 s displejom a 40 000 potiahnutiami – vyberie si každý. Ak hľadáš zariadenie na dlhšie, skús pod systém ELFA: jedna batéria a vymeniteľné pody v desiatkach príchutí.'],
      fr: ['Les appareils jetables et rechargeables Elfbar sont devenus populaires en peu de temps. Le secret : la simplicité. Vous déballez, et c’est prêt.', 'Des modèles de 600 bouffées conformes à la TPD jusqu’au BC40000 avec écran et 40 000 bouffées, il y en a pour tous. Pour un usage durable, essayez le système pod ELFA : une batterie, des pods interchangeables dans des dizaines de saveurs.'] } },
  { slug: 'popularita-e-cigariet', date: '2026-08-28', color: '#3C82E6',
    tag: { sk: 'Poradňa', fr: 'Guide' },
    title: { sk: 'Popularita elektronických cigariet', fr: 'La popularité des cigarettes électroniques' },
    excerpt: { sk: 'Čoraz viac ľudí si vyberá alternatívu bez dymu. Pozreli sme sa, čo je za tým.', fr: 'De plus en plus de personnes choisissent une alternative sans fumée. Voici pourquoi.' },
    body: { sk: ['E-cigareta namiesto dymu vytvára paru, ktorá zvyčajne zanecháva výrazne menej zápachu ako cigaretový dym. Ponuka sa neustále rozširuje: jednorazové, pod systémy aj box mody.', 'Začiatočníkom odporúčame jednorazové zariadenia alebo jednoduchý pod kit, pokročilým box mody a vlastné miešanie liquidov.'],
      fr: ['La cigarette électronique produit de la vapeur au lieu de la fumée, qui laisse généralement beaucoup moins d’odeur. L’offre ne cesse de s’élargir : jetables, systèmes pod et box mods.', 'Aux débutants, nous conseillons les jetables ou un kit pod simple ; aux vapoteurs confirmés, les box mods et les mélanges maison.'] } },
  { slug: 'zazitok-z-e-liquidu', date: '2026-08-10', color: '#7B3FA0',
    tag: { sk: 'Liquidy', fr: 'E-liquides' },
    title: { sk: 'Zážitok z e-liquidu: nikotínová soľ, shortfill alebo príchuť?', fr: 'L’expérience e-liquide : sels de nicotine, shortfill ou arôme ?' },
    excerpt: { sk: 'Vysvetľujeme rozdiely a pre koho je ktorý typ vhodný.', fr: 'Nous expliquons les différences et à qui s’adresse chaque type.' },
    body: { sk: ['Liquidy s nikotínovou soľou uvoľňujú nikotín rýchlejšie a jemnejšie, preto sú ideálne do pod systémov. Shortfill liquidy prichádzajú vo väčšom balení bez nikotínu: silu nastavíš pridaním boostera.', 'Z príchutí si s bázou namiešaš vlastnú zmes – presne takú, akú chceš.'],
      fr: ['Les e-liquides aux sels de nicotine délivrent la nicotine plus vite et plus en douceur : parfaits pour les systèmes pod. Les shortfills arrivent en grand format sans nicotine ; vous réglez le taux en ajoutant un booster.', 'Avec un arôme et une base, vous créez votre propre mélange, exactement à votre goût.'] } },
  { slug: 'ako-vybrat-jednorazovu', date: '2026-07-22', color: '#FF8A1F',
    tag: { sk: 'Návod', fr: 'Conseils' },
    title: { sk: 'Ako vybrať jednorazovú e-cigaretu: potiahnutia, nikotín, príchuť', fr: 'Bien choisir sa cigarette électronique jetable : bouffées, nicotine, saveur' },
    excerpt: { sk: 'Podľa počtu potiahnutí, sily nikotínu a príchute rýchlo nájdeš to pravé.', fr: 'Nombre de bouffées, taux de nicotine et saveur : trouvez vite l’appareil qu’il vous faut.' },
    body: { sk: ['Počet potiahnutí ukazuje, na koľko vdýchnutí približne zariadenie vystačí. Na príležitostné použitie stačia modely so 600 potiahnutiami, na každodenné odporúčame zariadenia nad 10 000 potiahnutí s nabíjateľnou batériou.', 'Silu nikotínu uvádzame v mg: 0 mg je bez nikotínu, 10 mg je stredná sila, 20 mg je najvyššia povolená v EÚ.'],
      fr: ['Le nombre de bouffées indique combien d’inhalations l’appareil permet environ. Pour un usage occasionnel, 600 bouffées suffisent ; au quotidien, préférez les appareils de plus de 10 000 bouffées avec batterie rechargeable.', 'Le taux de nicotine est indiqué en mg : 0 mg sans nicotine, 10 mg intermédiaire, 20 mg maximum autorisé dans l’UE.'] } }
];

FV.pageKeys = {
  sk: ['shipping', 'terms', 'privacy', 'withdrawal', 'cookies', 'contact'],
  fr: ['shipping', 'terms', 'privacy', 'withdrawal', 'legal', 'cookies', 'contact']
};
