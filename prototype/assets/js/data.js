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

/* ---------- Kategóriák (product_cat) ---------- */
FV.categories = [
  { slug: 'keszulekek', art: 'kit', color: '#3D4A6B',
    name: { sk: 'Zariadenia a kity', fr: 'Kits et appareils' },
    short: { sk: 'Zariadenia', fr: 'Kits' },
    desc: { sk: 'Znovu nabíjateľné pod systémy a box mod kity pre začiatočníkov aj pokročilých.', fr: 'Systèmes pod rechargeables et kits box mod, pour débuter comme pour les vapoteurs confirmés.' },
    children: [
      { slug: 'pod-kitek', name: { sk: 'Pod kity', fr: 'Kits pod' } },
      { slug: 'box-mod-kitek', name: { sk: 'Box mod kity', fr: 'Kits box mod' } }
    ] },
  { slug: 'eloretoltott-podok', art: 'pod', color: '#E83A5A',
    name: { sk: 'Predplnené pody', fr: 'Pods préremplis' },
    short: { sk: 'Pody', fr: 'Pods' },
    desc: { sk: 'Továrensky naplnené vymeniteľné pody pre ELFA, Lost Mary TAPPO a ďalšie systémy.', fr: 'Pods remplis en usine et interchangeables pour ELFA, Lost Mary TAPPO et d’autres systèmes.' },
    children: [
      { slug: 'elfa-podok', name: { sk: 'Pody ELFA', fr: 'Pods ELFA' } },
      { slug: 'tappo-podok', name: { sk: 'Pody Lost Mary TAPPO', fr: 'Pods Lost Mary TAPPO' } },
      { slug: 'drifter-podok', name: { sk: 'Pody Drifter', fr: 'Pods Drifter' } }
    ] },
  { slug: 'e-liquidek', art: 'liquid', color: '#7B3FA0',
    name: { sk: 'E-liquidy', fr: 'E-liquides' },
    short: { sk: 'E-liquidy', fr: 'E-liquides' },
    desc: { sk: 'Liquidy s nikotínovou soľou, príchute, shortfill a bázy – od 10 ml do 60 ml.', fr: 'E-liquides aux sels de nicotine, arômes, shortfills et bases – de 10 ml à 60 ml.' },
    children: [
      { slug: 'nikotinsos-liquidek', name: { sk: 'Liquidy s nikotínovou soľou', fr: 'E-liquides aux sels de nicotine' } },
      { slug: 'aromak', name: { sk: 'Príchute (shake & vape)', fr: 'Arômes (shake & vape)' } },
      { slug: 'shortfill', name: { sk: 'Shortfill', fr: 'Shortfills' } },
      { slug: 'bazis', name: { sk: 'Báza / nikotínový booster', fr: 'Bases et boosters de nicotine' } }
    ] },
  { slug: 'eldobhato', art: 'disposable', color: '#FF8A1F',
    name: { sk: 'Jednorazové e-cigarety', fr: 'Cigarettes électroniques jetables' },
    short: { sk: 'Jednorazové', fr: 'Jetables' },
    desc: { sk: 'Bez nabíjania a plnenia, pripravené na okamžité použitie – od 600 do 40 000 potiahnutí.', fr: 'Prêtes à l’emploi, sans recharge ni remplissage – de 600 à 40 000 bouffées.' },
    children: [
      { slug: '600-puff', name: { sk: '600 potiahnutí', fr: '600 bouffées' } },
      { slug: '5000-puff', name: { sk: '5000 potiahnutí', fr: '5000 bouffées' } },
      { slug: '10000-puff', name: { sk: '10 000 potiahnutí', fr: '10 000 bouffées' } },
      { slug: '20000-puff', name: { sk: '20 000+ potiahnutí', fr: '20 000+ bouffées' } }
    ] },
  { slug: 'kiegeszitok', art: 'accessory', color: '#19A58A',
    name: { sk: 'Príslušenstvo', fr: 'Accessoires' },
    short: { sk: 'Príslušenstvo', fr: 'Accessoires' },
    desc: { sk: 'Prázdne pody, žhaviace hlavy, nabíjačky, vata a náradie.', fr: 'Pods vides, résistances, chargeurs, coton et outils.' },
    children: [
      { slug: 'ures-podok', name: { sk: 'Prázdne pody / cartridge', fr: 'Pods vides / cartouches' } },
      { slug: 'porlasztofejek', name: { sk: 'Žhaviace hlavy', fr: 'Résistances' } },
      { slug: 'toltok', name: { sk: 'Nabíjačky a káble', fr: 'Chargeurs et câbles' } },
      { slug: 'vatta', name: { sk: 'Vata', fr: 'Coton' } },
      { slug: 'szerszamok', name: { sk: 'Náradie', fr: 'Outils' } }
    ] }
];

/* ---------- Márkák (product_brand) ---------- */
FV.brands = [
  { slug: 'elfbar', name: 'Elfbar', color: '#111111', style: 'heavy',
    desc: { sk: 'Jeden z najznámejších výrobcov jednorazových e-cigariet. Kompaktné zariadenia, výrazné príchute, od 600 do 40 000 potiahnutí.', fr: 'L’un des fabricants de cigarettes électroniques jetables les plus connus. Appareils compacts, saveurs intenses, de 600 à 40 000 bouffées.' } },
  { slug: 'elfa', name: 'ELFA', color: '#1C5BD9', style: 'wide',
    desc: { sk: 'Znovu nabíjateľný pod systém od Elfbaru. Jedna batéria a vymeniteľné predplnené pody v desiatkach príchutí.', fr: 'Le système pod rechargeable d’Elfbar : une batterie et des pods préremplis interchangeables, dans des dizaines de saveurs.' } },
  { slug: 'lost-mary', name: 'Lost Mary', color: '#C0265B', style: 'script',
    desc: { sk: 'Farebné, ergonomické zariadenia a predplnený pod systém TAPPO.', fr: 'Des appareils colorés et ergonomiques, et le système de pods préremplis TAPPO.' } },
  { slug: 'vaporesso', name: 'Vaporesso', color: '#0B7A75', style: 'wide',
    desc: { sk: 'Prémiové pod a box mod kity. Séria XROS patrí medzi najobľúbenejšie MTL pod systémy.', fr: 'Kits pod et box mod haut de gamme. La gamme XROS compte parmi les systèmes pod MTL les plus populaires.' } },
  { slug: 'drifter', name: 'Drifter', color: '#5B3FD6', style: 'italic',
    desc: { sk: 'Jednorazové zariadenia s veľkou kapacitou a dvojdielne vymeniteľné pody.', fr: 'Des jetables grande capacité et des pods interchangeables en deux parties.' } },
  { slug: 'geekvape', name: 'Geekvape', color: '#E4572E', style: 'heavy',
    desc: { sk: 'Odolné, vodotesné kity (séria Aegis) a spoľahlivé žhaviace hlavy.', fr: 'Des kits robustes et étanches (gamme Aegis) et des résistances fiables.' } },
  { slug: 'nasty-juice', name: 'Nasty Juice', color: '#D81E5B', style: 'heavy',
    desc: { sk: 'Malajzijský výrobca liquidov s odvážnymi ovocnými a mentolovými príchuťami.', fr: 'Fabricant malaisien d’e-liquides aux saveurs fruitées et mentholées audacieuses.' } },
  { slug: 'vampire-vape', name: 'Vampire Vape', color: '#8B1E2D', style: 'italic',
    desc: { sk: 'Prémiové anglické liquidy s legendárnou príchuťou Heisenberg.', fr: 'E-liquides anglais haut de gamme, avec le légendaire Heisenberg.' } },
  { slug: 'twelve-monkeys', name: 'Twelve Monkeys', color: '#2F6B3A', style: 'wide',
    desc: { sk: 'Kanadské remeselné liquidy s originálnymi ovocnými zmesami.', fr: 'E-liquides artisanaux canadiens aux mélanges de fruits originaux.' } },
  { slug: 'french-liquide', name: 'French Liquide', color: '#2B3A8C', style: 'italic',
    desc: { sk: 'Príchute a liquidy vyrábané vo Francúzsku, inšpirované gastronómiou.', fr: 'Arômes et e-liquides fabriqués en France, inspirés de la gastronomie.' } },
  { slug: 'innokin', name: 'Innokin', color: '#222F3E', style: 'wide',
    desc: { sk: 'MTL zariadenia vhodné pre začiatočníkov a clearomizéry s dlhou životnosťou.', fr: 'Appareils MTL faciles à prendre en main et clearomiseurs durables.' } },
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
  { key: 'szin', tax: 'pa_szin', lk: 'a_szin' }
];

FV.flavorColors = {
  'Blueberry': '#4B5BD6', 'Blueberry Ice': '#5C7CFA', 'Mango': '#FFB020', 'Mango Ice': '#FFC94D',
  'Strawberry': '#E83A5A', 'Strawberry Kiwi': '#E5566E', 'Cola': '#6B3A2A', 'Watermelon': '#F0506E',
  'Watermelon Ice': '#F57A93', 'Menthol': '#2EC4B6', 'Grape': '#7B3FA0', 'Peach': '#FF9A6B',
  'Peach Ice': '#FFB38F', 'Apple': '#7FB734', 'Lemon': '#F2C94C', 'Tobacco': '#A0785A',
  'Cherry': '#B0133A', 'Pineapple': '#F2B705', 'Energy': '#36A9E0', 'Vanilla Custard': '#D9BF8C',
  'Pink Lemonade': '#F48FB1', 'Cranberry Grape': '#8E2F5C', 'Triple Mango': '#FF9F1C',
  'Spearmint': '#23B58A', 'Kiwi Passion': '#8FBF3F', 'Banana Ice': '#F5D547', 'Red Apple': '#D64541',
  'Jackfruit Pear': '#C7C45A', 'Unflavored': '#BFC4CC'
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

  FV.products = [
    /* Eldobható – 20000+ puff */
    p({ slug: 'elfbar-bc40000-blueberry-ice', name: 'Elfbar BC40000 Blueberry Ice', art: 'disposable', color: '#5C7CFA',
      cats: ['eldobhato', '20000-puff'], brand: 'elfbar', price: 24.9, sale: 19.9, sku: 'FV-ELF-BC40K-BBI', weight: 118,
      attrs: { iz: ['Blueberry Ice'], nikotin: ['20 mg'], ml: ['18 ml'], puff: [40000], kompat: [], szin: [] },
      short: { sk: 'Jednorazová e-cigareta s dvoma režimami a displejom, kapacita 40 000 potiahnutí, príchuť ľadová čučoriedka.', fr: 'Jetable à deux modes avec écran, jusqu’à 40 000 bouffées, saveur myrtille glacée.' }, pop: 99, featured: true }),
    p({ slug: 'elfbar-bc40000-mango-ice', name: 'Elfbar BC40000 Mango Ice', art: 'disposable', color: '#FFC94D',
      cats: ['eldobhato', '20000-puff'], brand: 'elfbar', price: 24.9, sku: 'FV-ELF-BC40K-MGI', weight: 118,
      attrs: { iz: ['Mango Ice'], nikotin: ['20 mg'], ml: ['18 ml'], puff: [40000] },
      short: { sk: 'Jednorazová e-cigareta s dvoma režimami a displejom, kapacita 40 000 potiahnutí, príchuť ľadové mango.', fr: 'Jetable à deux modes avec écran, jusqu’à 40 000 bouffées, saveur mangue glacée.' }, pop: 95 }),
    p({ slug: 'elfbar-bc40000-watermelon-ice', name: 'Elfbar BC40000 Watermelon Ice', art: 'disposable', color: '#F57A93',
      cats: ['eldobhato', '20000-puff'], brand: 'elfbar', price: 24.9, sku: 'FV-ELF-BC40K-WMI', weight: 118, stock: 'outofstock',
      attrs: { iz: ['Watermelon Ice'], nikotin: ['20 mg'], ml: ['18 ml'], puff: [40000] },
      short: { sk: 'Jednorazová e-cigareta s dvoma režimami a displejom, kapacita 40 000 potiahnutí, príchuť ľadový melón.', fr: 'Jetable à deux modes avec écran, jusqu’à 40 000 bouffées, saveur pastèque glacée.' }, pop: 90 }),
    p({ slug: 'lost-mary-mo20000-pro-strawberry-kiwi', name: 'Lost Mary MO20000 Pro Strawberry Kiwi', art: 'disposable', color: '#E5566E',
      cats: ['eldobhato', '20000-puff'], brand: 'lost-mary', price: 21.9, sale: 17.5, sku: 'FV-LM-MO20K-SK', weight: 96,
      attrs: { iz: ['Strawberry Kiwi'], nikotin: ['20 mg'], ml: ['16 ml'], puff: [20000] },
      short: { sk: 'Nastaviteľný ťah, inteligentný displej a 20 000 potiahnutí s príchuťou jahoda-kiwi.', fr: 'Airflow réglable, écran intelligent, 20 000 bouffées saveur fraise-kiwi.' }, pop: 88 }),
    p({ slug: 'drifter-bar-30000-cola', name: 'Drifter Bar 30000 Cola', art: 'disposable', color: '#6B3A2A',
      cats: ['eldobhato', '20000-puff'], brand: 'drifter', price: 22.9, sku: 'FV-DRF-30K-COL', weight: 104,
      attrs: { iz: ['Cola'], nikotin: ['20 mg'], ml: ['17 ml'], puff: [30000] },
      short: { sk: 'Jednorazová e-cigareta s veľkou kapacitou a klasickou príchuťou koly, 30 000 potiahnutí.', fr: 'Jetable grande capacité au goût de cola classique, 30 000 bouffées.' }, pop: 70 }),
    p({ slug: 'drifter-bar-30000-grape', name: 'Drifter Bar 30000 Grape', art: 'disposable', color: '#7B3FA0',
      cats: ['eldobhato', '20000-puff'], brand: 'drifter', price: 22.9, sku: 'FV-DRF-30K-GRP', weight: 104, stock: 'discontinued',
      attrs: { iz: ['Grape'], nikotin: ['20 mg'], ml: ['17 ml'], puff: [30000] },
      short: { sk: 'Jednorazová e-cigareta s veľkou kapacitou, príchuť hrozno. Výrobca produkt stiahol z predaja.', fr: 'Jetable grande capacité saveur raisin. Le fabricant a arrêté ce produit.' }, pop: 40 }),
    /* Eldobható – 10000 */
    p({ slug: 'elfbar-600-v2-peach-ice-10000', name: 'Elfbar Raya D1 10000 Peach Ice', art: 'disposable', color: '#FFB38F',
      cats: ['eldobhato', '10000-puff'], brand: 'elfbar', price: 16.9, sku: 'FV-ELF-RD1-PCI', weight: 72,
      attrs: { iz: ['Peach Ice'], nikotin: ['20 mg'], ml: ['13 ml'], puff: [10000] },
      short: { sk: 'Mesh žhaviaca hlava a stabilná chuť až do konca: 10 000 potiahnutí s príchuťou ľadová broskyňa.', fr: 'Résistance mesh, saveur constante jusqu’au bout : 10 000 bouffées saveur pêche glacée.' }, pop: 76 }),
    p({ slug: 'lost-mary-bm10000-triple-mango', name: 'Lost Mary BM10000 Triple Mango', art: 'disposable', color: '#FF9F1C',
      cats: ['eldobhato', '10000-puff'], brand: 'lost-mary', price: 15.9, sku: 'FV-LM-BM10K-TM', weight: 70,
      attrs: { iz: ['Triple Mango'], nikotin: ['20 mg'], ml: ['14 ml'], puff: [10000] },
      short: { sk: 'Vyvážená kombinácia troch druhov manga, nabíjateľná batéria, 10 000 potiahnutí.', fr: 'L’équilibre de trois mangues, batterie rechargeable, 10 000 bouffées.' }, pop: 81 }),
    /* 5000 */
    p({ slug: 'elfbar-bc5000-strawberry', name: 'Elfbar BC5000 Strawberry', art: 'disposable', color: '#E83A5A',
      cats: ['eldobhato', '5000-puff'], brand: 'elfbar', price: 12.9, sale: 9.9, sku: 'FV-ELF-BC5K-STR', weight: 58,
      attrs: { iz: ['Strawberry'], nikotin: ['20 mg'], ml: ['13 ml'], puff: [5000] },
      short: { sk: 'Jeden z najžiadanejších modelov Elfbar so sladkou jahodovou príchuťou, 5000 potiahnutí.', fr: 'L’un des modèles Elfbar les plus demandés, saveur fraise sucrée, 5000 bouffées.' }, pop: 84 }),
    p({ slug: 'elfbar-bc5000-menthol', name: 'Elfbar BC5000 Menthol', art: 'disposable', color: '#2EC4B6',
      cats: ['eldobhato', '5000-puff'], brand: 'elfbar', price: 12.9, sku: 'FV-ELF-BC5K-MEN', weight: 58,
      attrs: { iz: ['Menthol'], nikotin: ['20 mg', '0 mg'], ml: ['13 ml'], puff: [5000] },
      short: { sk: 'Čistý, osviežujúci mentol. Aj v beznikotínovej verzii.', fr: 'Un menthol pur et rafraîchissant. Existe aussi sans nicotine.' }, pop: 66 }),
    /* 600 */
    p({ slug: 'elfbar-600-blueberry', name: 'Elfbar 600 Blueberry', art: 'disposable', color: '#4B5BD6',
      cats: ['eldobhato', '600-puff'], brand: 'elfbar', price: 5.9, sku: 'FV-ELF-600-BLB', weight: 28,
      attrs: { iz: ['Blueberry'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600] },
      short: { sk: 'Jednorazová e-cigareta s 2 ml v súlade s TPD, príchuť čučoriedka, cca 600 potiahnutí.', fr: 'Jetable 2 ml conforme TPD, saveur myrtille, environ 600 bouffées.' }, pop: 92, featured: true }),
    p({ slug: 'elfbar-600-cola', name: 'Elfbar 600 Cola', art: 'disposable', color: '#6B3A2A',
      cats: ['eldobhato', '600-puff'], brand: 'elfbar', price: 5.9, sale: 4.5, sku: 'FV-ELF-600-COL', weight: 28,
      attrs: { iz: ['Cola'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600] },
      short: { sk: 'Jednorazová e-cigareta s 2 ml v súlade s TPD, príchuť kola, cca 600 potiahnutí.', fr: 'Jetable 2 ml conforme TPD, saveur cola, environ 600 bouffées.' }, pop: 74 }),
    p({ slug: 'elfbar-600-nikotinmentes-watermelon', name: { sk: 'Elfbar 600 Watermelon – bez nikotínu', fr: 'Elfbar 600 Watermelon – sans nicotine' }, art: 'disposable', color: '#F0506E',
      cats: ['eldobhato', '600-puff'], brand: 'elfbar', price: 5.5, sku: 'FV-ELF-600-WM0', weight: 28,
      attrs: { iz: ['Watermelon'], nikotin: ['0 mg'], ml: ['2 ml'], puff: [600] },
      short: { sk: 'Bez nikotínu, s rovnakým chuťovým zážitkom. Melón, 600 potiahnutí.', fr: 'Sans nicotine, avec la même saveur. Pastèque, 600 bouffées.' }, pop: 62 }),
    p({ slug: 'lost-mary-bm600-pink-lemonade', name: 'Lost Mary BM600 Pink Lemonade', art: 'disposable', color: '#F48FB1',
      cats: ['eldobhato', '600-puff'], brand: 'lost-mary', price: 5.9, sku: 'FV-LM-BM600-PL', weight: 30,
      attrs: { iz: ['Pink Lemonade'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600] },
      short: { sk: 'Perlivá ružová limonáda v typickom oblom tvare Lost Mary.', fr: 'Limonade rose pétillante, dans la forme arrondie signature de Lost Mary.' }, pop: 71 }),

    /* Előretöltött podok */
    p({ slug: 'elfa-pod-blueberry', pack: 2, name: { sk: 'ELFA Pod Blueberry (2 ks)', fr: 'ELFA Pod Blueberry (lot de 2)' }, art: 'pod', color: '#4B5BD6',
      cats: ['eloretoltott-podok', 'elfa-podok'], brand: 'elfa', price: 7.9, sale: 6.5, sku: 'FV-ELFA-POD-BLB', weight: 24,
      attrs: { iz: ['Blueberry'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600], kompat: ['ELFA'] },
      short: { sk: 'Predplnený pod pre batériu ELFA. 2 ks v balení, spolu cca 1200 potiahnutí.', fr: 'Pod prérempli pour la batterie ELFA. 2 pods par paquet, environ 1200 bouffées au total.' }, pop: 89, featured: true }),
    p({ slug: 'elfa-pod-strawberry-kiwi', pack: 2, name: { sk: 'ELFA Pod Strawberry Kiwi (2 ks)', fr: 'ELFA Pod Strawberry Kiwi (lot de 2)' }, art: 'pod', color: '#E5566E',
      cats: ['eloretoltott-podok', 'elfa-podok'], brand: 'elfa', price: 7.9, sku: 'FV-ELFA-POD-SK', weight: 24,
      attrs: { iz: ['Strawberry Kiwi'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600], kompat: ['ELFA'] },
      short: { sk: 'Predplnený pod pre batériu ELFA s príchuťou jahoda-kiwi. 2 ks v balení.', fr: 'Pod prérempli pour la batterie ELFA, saveur fraise-kiwi. 2 pods par paquet.' }, pop: 80 }),
    p({ slug: 'elfa-pod-spearmint', pack: 2, name: { sk: 'ELFA Pod Spearmint (2 ks)', fr: 'ELFA Pod Spearmint (lot de 2)' }, art: 'pod', color: '#23B58A',
      cats: ['eloretoltott-podok', 'elfa-podok'], brand: 'elfa', price: 7.9, sku: 'FV-ELFA-POD-SPM', weight: 24,
      attrs: { iz: ['Spearmint'], nikotin: ['20 mg', '10 mg'], ml: ['2 ml'], puff: [600], kompat: ['ELFA'] },
      short: { sk: 'Mäta klasnatá pre systém ELFA, v sile 10 a 20 mg.', fr: 'Menthe verte pour le système ELFA, en 10 et 20 mg.' }, pop: 68 }),
    p({ slug: 'lost-mary-tappo-pod-cherry', name: 'Lost Mary TAPPO Pod Cherry', art: 'pod', color: '#B0133A',
      cats: ['eloretoltott-podok', 'tappo-podok'], brand: 'lost-mary', price: 6.9, sku: 'FV-LM-TAP-CHR', weight: 20,
      attrs: { iz: ['Cherry'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600], kompat: ['Lost Mary TAPPO'] },
      short: { sk: 'Predplnený pod TAPPO s príchuťou zrelej čerešne.', fr: 'Pod TAPPO prérempli, saveur cerise mûre.' }, pop: 58 }),
    p({ slug: 'drifter-pod-kiwi-passion', name: 'Drifter Pod Kiwi Passion', art: 'pod', color: '#8FBF3F',
      cats: ['eloretoltott-podok', 'drifter-podok'], brand: 'drifter', price: 6.5, sku: 'FV-DRF-POD-KP', weight: 20, stock: 'outofstock',
      attrs: { iz: ['Kiwi Passion'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [800], kompat: ['Drifter'] },
      short: { sk: 'Kiwi a maracuja, pre batériu Drifter.', fr: 'Kiwi et fruit de la passion, pour la batterie Drifter.' }, pop: 45 }),

    /* Készülékek */
    p({ slug: 'elfa-pro-kit-black', name: 'ELFA Pro Pod Kit', art: 'kit', color: '#1B1B1F',
      cats: ['keszulekek', 'pod-kitek'], brand: 'elfa', price: 14.9, sku: 'FV-ELFA-PRO-KIT', weight: 62,
      attrs: { szin: ['Black', 'Silver', 'Blue'], kompat: ['ELFA'] },
      short: { sk: 'Batéria pod systému ELFA s kapacitou 500 mAh a nabíjaním cez USB-C. S jedným podom ELFA.', fr: 'La batterie du système pod ELFA, 500 mAh, recharge USB-C. Livrée avec un pod ELFA.' }, pop: 94, featured: true, variable: true }),
    p({ slug: 'lost-mary-tappo-kit', name: 'Lost Mary TAPPO Pod Kit', art: 'kit', color: '#E27BA5',
      cats: ['keszulekek', 'pod-kitek'], brand: 'lost-mary', price: 13.9, sale: 11.9, sku: 'FV-LM-TAP-KIT', weight: 55,
      attrs: { szin: ['Pink', 'Black'], kompat: ['Lost Mary TAPPO'] },
      short: { sk: 'Kompaktná batéria TAPPO s vibračným indikátorom nabitia a jedným predplneným podom.', fr: 'Batterie TAPPO compacte avec indicateur de charge à vibration, livrée avec un pod prérempli.' }, pop: 72, variable: true }),
    p({ slug: 'vaporesso-xros-4-mini', name: 'Vaporesso XROS 4 Mini Pod Kit', art: 'kit', color: '#2D5BD7',
      cats: ['keszulekek', 'pod-kitek'], brand: 'vaporesso', price: 26.9, sku: 'FV-VAP-XROS4M', weight: 68,
      attrs: { szin: ['Blue', 'Black', 'Silver'], kompat: ['Vaporesso XROS'] },
      short: { sk: 'Znovu plniteľný MTL pod systém, 1000 mAh, nastaviteľný ťah. Kompatibilný s podmi XROS.', fr: 'Système pod MTL rechargeable, 1000 mAh, airflow réglable. Compatible avec les pods XROS.' }, pop: 86, variable: true }),
    p({ slug: 'drifter-pod-kit', name: 'Drifter Pod Kit', art: 'kit', color: '#5B3FD6',
      cats: ['keszulekek', 'pod-kitek'], brand: 'drifter', price: 12.9, sku: 'FV-DRF-KIT', weight: 50,
      attrs: { szin: ['Black'], kompat: ['Drifter'] },
      short: { sk: 'Batéria Drifter s LED indikátorom nabitia, pre pody Drifter.', fr: 'Batterie Drifter avec indicateur de charge LED, pour pods Drifter.' }, pop: 50 }),
    p({ slug: 'geekvape-aegis-legend-3', name: 'Geekvape Aegis Legend 3 Kit', art: 'kit', color: '#4A4F58',
      cats: ['keszulekek', 'box-mod-kitek'], brand: 'geekvape', price: 69.9, sale: 59.9, sku: 'FV-GV-AL3-KIT', weight: 310,
      attrs: { szin: ['Gunmetal', 'Black'], kompat: ['Geekvape Z coil'] },
      short: { sk: 'Box mod s ochranou IP68 na dve batérie 18650, s tankom Z Sub-Ohm.', fr: 'Box mod IP68 à double accu 18650, avec clearomiseur Z Sub-Ohm.' }, pop: 60, variable: true }),
    p({ slug: 'innokin-endura-t18-2', name: 'Innokin Endura T18 II Kit', art: 'kit', color: '#B8BCC4',
      cats: ['keszulekek', 'box-mod-kitek'], brand: 'innokin', price: 29.9, sku: 'FV-INN-T18II', weight: 140, stock: 'discontinued',
      attrs: { szin: ['Silver'], kompat: [] },
      short: { sk: 'Klasický MTL kit pre začiatočníkov, batéria 1300 mAh. Model s ukončeným predajom.', fr: 'Kit MTL classique pour débuter, batterie 1300 mAh. Modèle arrêté.' }, pop: 30 }),

    /* E-liquidek */
    p({ slug: 'nasty-juice-trap-queen', name: 'Nasty Juice Trap Queen 10 ml', art: 'liquid', color: '#E83A5A',
      cats: ['e-liquidek', 'nikotinsos-liquidek'], brand: 'nasty-juice', price: 5.9, sku: 'FV-NJ-TQ-10', weight: 34,
      attrs: { iz: ['Strawberry'], nikotin: ['10 mg', '20 mg'], ml: ['10 ml'] },
      short: { sk: 'Liquid s nikotínovou soľou, čerstvými jahodami a ľadovou dochuťou.', fr: 'E-liquide aux sels de nicotine, fraise fraîche et finale glacée.' }, pop: 78, variable: true }),
    p({ slug: 'nasty-juice-cushman-mango', name: 'Nasty Juice Cushman Mango 10 ml', art: 'liquid', color: '#FFB020',
      cats: ['e-liquidek', 'nikotinsos-liquidek'], brand: 'nasty-juice', price: 5.9, sale: 4.9, sku: 'FV-NJ-CM-10', weight: 34,
      attrs: { iz: ['Mango'], nikotin: ['10 mg', '20 mg'], ml: ['10 ml'] },
      short: { sk: 'Zrelé mango s jemným chladivým efektom, s nikotínovou soľou.', fr: 'Mangue mûre légèrement rafraîchissante, aux sels de nicotine.' }, pop: 69, variable: true }),
    p({ slug: 'vampire-vape-heisenberg', name: 'Vampire Vape Heisenberg 10 ml', art: 'liquid', color: '#36A9E0',
      cats: ['e-liquidek', 'nikotinsos-liquidek'], brand: 'vampire-vape', price: 5.5, sku: 'FV-VV-HEIS-10', weight: 34,
      attrs: { iz: ['Energy'], nikotin: ['10 mg', '20 mg'], ml: ['10 ml'] },
      short: { sk: 'Legendárny Heisenberg: lesné plody, aníz a mentol.', fr: 'Le légendaire Heisenberg : fruits rouges, anis et menthol.' }, pop: 83, variable: true }),
    p({ slug: 'twelve-monkeys-kanzi-aroma', name: { sk: 'Twelve Monkeys Kanzi príchuť 20 ml', fr: 'Twelve Monkeys Kanzi arôme 20 ml' }, art: 'liquid', color: '#F48FB1',
      cats: ['e-liquidek', 'aromak'], brand: 'twelve-monkeys', price: 11.9, sku: 'FV-12M-KANZI-20', weight: 62,
      attrs: { iz: ['Strawberry Kiwi'], nikotin: ['0 mg'], ml: ['20 ml'] },
      short: { sk: 'Príchuť shake & vape: jahoda, kiwi a melón. V 60 ml fľaške.', fr: 'Arôme shake & vape : fraise, kiwi et pastèque. En flacon de 60 ml.' }, pop: 54 }),
    p({ slug: 'french-liquide-jackfruit-pear', name: 'French Liquide Fruiitopia Jackfruit Pear 10 ml', art: 'liquid', color: '#C7C45A',
      cats: ['e-liquidek', 'aromak'], brand: 'french-liquide', price: 6.9, sku: 'FV-FL-FJP-10', weight: 30,
      attrs: { iz: ['Jackfruit Pear'], nikotin: ['0 mg'], ml: ['10 ml'] },
      short: { sk: 'Jackfruit, hruška a guava: exotická príchuť na vlastné miešanie.', fr: 'Jacquier, poire et goyave : un arôme exotique pour vos propres mélanges.' }, pop: 35 }),
    p({ slug: 'vampire-vape-pinkman-shortfill', name: 'Vampire Vape Pinkman 50 ml shortfill', art: 'liquid', color: '#F06292',
      cats: ['e-liquidek', 'shortfill'], brand: 'vampire-vape', price: 16.9, sale: 13.9, sku: 'FV-VV-PINK-50', weight: 95,
      attrs: { iz: ['Pink Lemonade'], nikotin: ['0 mg'], ml: ['50 ml'] },
      short: { sk: '50 ml beznikotínového liquidu v 60 ml fľaške, s miestom na jeden booster.', fr: '50 ml d’e-liquide sans nicotine dans un flacon de 60 ml, prêt pour un booster.' }, pop: 57 }),
    p({ slug: 'nikotin-booster-20mg', name: { sk: 'Nikotínový booster 20 mg 10 ml', fr: 'Booster de nicotine 20 mg 10 ml' }, art: 'liquid', color: '#BFC4CC',
      cats: ['e-liquidek', 'bazis'], brand: 'vampire-vape', price: 2.5, sku: 'FV-BOOST-20-10', weight: 30,
      attrs: { iz: ['Unflavored'], nikotin: ['20 mg'], ml: ['10 ml'] },
      short: { sk: 'Neochutený nikotínový booster 50/50 do shortfill liquidov.', fr: 'Booster de nicotine 50/50 sans arôme, pour e-liquides shortfill.' }, pop: 65 }),

    /* Kiegészítők */
    p({ slug: 'vaporesso-xros-ures-pod-2ml', name: { sk: 'Vaporesso XROS prázdny pod 0,8 Ω (4 ks)', fr: 'Vaporesso XROS pod vide 0,8 Ω (lot de 4)' }, art: 'accessory', acc: 'cartridge', color: '#2D5BD7',
      cats: ['kiegeszitok', 'ures-podok'], brand: 'vaporesso', price: 10.9, sku: 'FV-VAP-XROS-POD08', weight: 22,
      attrs: { ml: ['2 ml'], kompat: ['Vaporesso XROS'] },
      short: { sk: 'Plniteľný pod XROS s mesh hlavou 0,8 Ω, 4 ks v balení.', fr: 'Pod XROS rechargeable avec résistance mesh 0,8 Ω, lot de 4.' }, pop: 77 }),
    p({ slug: 'geekvape-z-coil-02', name: { sk: 'Geekvape Z coil 0,2 Ω (5 ks)', fr: 'Geekvape résistance Z 0,2 Ω (lot de 5)' }, art: 'accessory', acc: 'coil', color: '#4A4F58',
      cats: ['kiegeszitok', 'porlasztofejek'], brand: 'geekvape', price: 14.9, sku: 'FV-GV-ZCOIL-02', weight: 26,
      attrs: { kompat: ['Geekvape Z coil'] },
      short: { sk: 'Mesh žhaviaca hlava pre tank Z Sub-Ohm, 5 ks v balení.', fr: 'Résistance mesh pour le clearomiseur Z Sub-Ohm, lot de 5.' }, pop: 52 }),
    p({ slug: 'usb-c-toltokabel', name: { sk: 'Nabíjací kábel USB-C 1 m', fr: 'Câble de charge USB-C 1 m' }, art: 'accessory', acc: 'cable', color: '#1B1B1F',
      cats: ['kiegeszitok', 'toltok'], brand: 'vaporesso', price: 3.9, sku: 'FV-CBL-USBC-1M', weight: 30,
      attrs: { kompat: ['ELFA', 'Vaporesso XROS', 'Lost Mary TAPPO'] },
      short: { sk: 'USB-C kábel s podporou rýchleho nabíjania pre väčšinu pod systémov.', fr: 'Câble USB-C compatible charge rapide, pour la plupart des systèmes pod.' }, pop: 48 }),
    p({ slug: 'cotton-clouds-organic', name: { sk: 'Cotton Clouds organická vata', fr: 'Cotton Clouds coton bio' }, art: 'accessory', acc: 'cotton', color: '#4A8FB8',
      cats: ['kiegeszitok', 'vatta'], brand: 'cotton-clouds', price: 4.9, sku: 'FV-CC-ORG', weight: 18,
      attrs: {},
      short: { sk: 'Organická vata s pripravenými vláknami do prebaliteľných atomizérov.', fr: 'Coton bio pré-effiloché pour atomiseurs reconstructibles.' }, pop: 20 }),
    p({ slug: 'geekvape-tool-kit', name: { sk: 'Geekvape sada náradia', fr: 'Geekvape kit d’outils' }, art: 'accessory', acc: 'tool', color: '#E4572E',
      cats: ['kiegeszitok', 'szerszamok'], brand: 'geekvape', price: 12.9, sku: 'FV-GV-TOOLKIT', weight: 180, stock: 'outofstock',
      attrs: {},
      short: { sk: 'Pinzeta, keramická pinzeta, skrutkovače a navíjacia tyčinka v jednom puzdre.', fr: 'Pince, pince céramique, tournevis et outil de montage de résistances dans un étui.' }, pop: 25 })
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
    pickupLabel: 'Výdajné miesto DPD Pickup',
    pickupPoints: ['DPD Pickup – Bratislava, Obchodná 12', 'DPD Pickup – Košice, Hlavná 55', 'DPD Box – Nitra, Štefánikova 3'],
    carrier: 'DPD',
    shipping: {
      freeOver: 50,
      methods: [
        { id: 'dpd-home', name: 'DPD doručenie domov', short: 'DPD domov', eta: '1–2 pracovné dni',
          tiers: [ { max: 1000, price: 3.9 }, { max: 3000, price: 4.9 }, { max: 10000, price: 6.9 }, { max: 31500, price: 9.9 } ] },
        { id: 'dpd-pickup', name: 'DPD Pickup miesto / DPD Box', short: 'DPD Pickup', eta: '1–3 pracovné dni', pickup: true,
          tiers: [ { max: 1000, price: 2.9 }, { max: 3000, price: 3.5 }, { max: 10000, price: 4.9 }, { max: 20000, price: 6.9 } ] }
      ]
    },
    demo: { first: 'Anna', last: 'Kováčová', email: 'anna.kovacova@example.com', phone: '+421 905 123 456', zip: '945 01', city: 'Komárno', street: 'Hlavná 12' }
  },
  fr: {
    code: 'FR', lang: 'fr', locale: 'fr-FR', country: 'France', vat: 0.20, vatLabel: '20 %',
    phonePh: '+33 6 xx xx xx xx', zipPh: '75011',
    companyIds: ['SIRET', 'N° de TVA intracommunautaire'],
    codFee: 1.5, // MINTA – a francia utánvét elérhetősége és díja a szállítótól függ
    pickupLabel: 'Point relais',
    pickupPoints: ['Point relais – Paris 11e, 45 rue de la Roquette (exemple)', 'Point relais – Lyon 3e, 12 cours Gambetta (exemple)', 'Point relais – Lille, 8 rue Nationale (exemple)'],
    carrier: null, // a francia szállító még nincs kiválasztva (DPD France / Colissimo / Mondial Relay …)
    shipping: {
      freeOver: 50, // MINTA
      sample: true,
      methods: [
        { id: 'fr-home', name: 'Livraison à domicile', short: 'Domicile', eta: 'transporteur et délai à confirmer',
          tiers: [ { max: 1000, price: 3.9 }, { max: 3000, price: 4.9 }, { max: 10000, price: 6.9 }, { max: 31500, price: 9.9 } ] },
        { id: 'fr-relay', name: 'Point relais', short: 'Point relais', eta: 'transporteur et délai à confirmer', pickup: true,
          tiers: [ { max: 1000, price: 2.9 }, { max: 3000, price: 3.5 }, { max: 10000, price: 4.9 }, { max: 20000, price: 6.9 } ] }
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
    body: { sk: ['E-cigareta namiesto dymu vytvára paru, preto po nej nezostáva nepríjemný zápach. Ponuka sa neustále rozširuje: jednorazové, pod systémy aj box mody.', 'Začiatočníkom odporúčame jednorazové zariadenia alebo jednoduchý pod kit, pokročilým box mody a vlastné miešanie liquidov.'],
      fr: ['La cigarette électronique produit de la vapeur au lieu de la fumée et ne laisse donc pas d’odeur désagréable. L’offre ne cesse de s’élargir : jetables, systèmes pod et box mods.', 'Aux débutants, nous conseillons les jetables ou un kit pod simple ; aux vapoteurs confirmés, les box mods et les mélanges maison.'] } },
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
