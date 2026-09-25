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

FV.currency = '€';

/* ---------- Kategóriák (product_cat) ---------- */
FV.categories = [
  { slug: 'keszulekek', name: 'Készülékek / kitek', short: 'Készülékek', art: 'kit', color: '#3D4A6B',
    desc: 'Újratölthető pod rendszerek és box mod kitek kezdőknek és haladóknak.',
    children: [
      { slug: 'pod-kitek', name: 'Pod kitek' },
      { slug: 'box-mod-kitek', name: 'Box mod kitek' }
    ] },
  { slug: 'eloretoltott-podok', name: 'Előretöltött podok', short: 'Podok', art: 'pod', color: '#E83A5A',
    desc: 'Gyárilag töltött, cserélhető podok ELFA, Lost Mary TAPPO és más rendszerekhez.',
    children: [
      { slug: 'elfa-podok', name: 'ELFA podok' },
      { slug: 'tappo-podok', name: 'Lost Mary TAPPO podok' },
      { slug: 'drifter-podok', name: 'Drifter podok' }
    ] },
  { slug: 'e-liquidek', name: 'E-liquidek', short: 'Liquidek', art: 'liquid', color: '#7B3FA0',
    desc: 'Nikotinsós liquidek, aromák, shortfill és bázis – 10 ml-től 60 ml-ig.',
    children: [
      { slug: 'nikotinsos-liquidek', name: 'Nikotinsós liquidek' },
      { slug: 'aromak', name: 'Aromák (shake & vape)' },
      { slug: 'shortfill', name: 'Shortfill' },
      { slug: 'bazis', name: 'Bázis / nikotin booster' }
    ] },
  { slug: 'eldobhato', name: 'Eldobható e-cigaretták', short: 'Eldobhatók', art: 'disposable', color: '#FF8A1F',
    desc: 'Töltés nélküli, azonnal használható eszközök 600-tól 40 000 puffig.',
    children: [
      { slug: '600-puff', name: '600 puff' },
      { slug: '5000-puff', name: '5000 puff' },
      { slug: '10000-puff', name: '10000 puff' },
      { slug: '20000-puff', name: '20000+ puff' }
    ] },
  { slug: 'kiegeszitok', name: 'Kiegészítők', short: 'Kiegészítők', art: 'accessory', color: '#19A58A',
    desc: 'Üres podok, porlasztófejek, töltők, vatta és szerszámok.',
    children: [
      { slug: 'ures-podok', name: 'Üres podok / cartridge' },
      { slug: 'porlasztofejek', name: 'Porlasztófejek' },
      { slug: 'toltok', name: 'Töltők és kábelek' },
      { slug: 'vatta', name: 'Vatta' },
      { slug: 'szerszamok', name: 'Szerszámok' }
    ] }
];

/* ---------- Márkák (product_brand) ---------- */
FV.brands = [
  { slug: 'elfbar', name: 'Elfbar', color: '#111111', style: 'heavy',
    desc: 'A világ egyik legismertebb eldobható e-cigaretta gyártója. Kompakt eszközök, intenzív ízek, 600-tól 40 000 puffig.' },
  { slug: 'elfa', name: 'ELFA', color: '#1C5BD9', style: 'wide',
    desc: 'Az Elfbar újratölthető pod rendszere. Egy akkumulátor, cserélhető előretöltött podok több tucat ízben.' },
  { slug: 'lost-mary', name: 'Lost Mary', color: '#C0265B', style: 'script',
    desc: 'Színes, ergonomikus eszközök és a TAPPO előretöltött pod rendszer.' },
  { slug: 'vaporesso', name: 'Vaporesso', color: '#0B7A75', style: 'wide',
    desc: 'Prémium pod és box mod kitek. A XROS sorozat az egyik legnépszerűbb MTL pod rendszer.' },
  { slug: 'drifter', name: 'Drifter', color: '#5B3FD6', style: 'italic',
    desc: 'Nagy kapacitású eldobható eszközök és kétfázisú, cserélhető podok.' },
  { slug: 'geekvape', name: 'Geekvape', color: '#E4572E', style: 'heavy',
    desc: 'Strapabíró, vízálló kitek (Aegis sorozat) és megbízható porlasztófejek.' },
  { slug: 'nasty-juice', name: 'Nasty Juice', color: '#D81E5B', style: 'heavy',
    desc: 'Malajziai liquid gyártó, merész gyümölcsös és mentolos ízekkel.' },
  { slug: 'vampire-vape', name: 'Vampire Vape', color: '#8B1E2D', style: 'italic',
    desc: 'Angol prémium liquidek, a legendás Heisenberg ízzel.' },
  { slug: 'twelve-monkeys', name: 'Twelve Monkeys', color: '#2F6B3A', style: 'wide',
    desc: 'Kanadai kézműves liquidek, egyedi gyümölcskeverékek.' },
  { slug: 'french-liquide', name: 'French Liquide', color: '#2B3A8C', style: 'italic',
    desc: 'Francia gyártású aromák és liquidek, gasztronómiai ízvilág.' },
  { slug: 'innokin', name: 'Innokin', color: '#222F3E', style: 'wide',
    desc: 'Kezdőbarát MTL eszközök és hosszú élettartamú porlasztók.' },
  { slug: 'cotton-clouds', name: 'Cotton Clouds', color: '#4A8FB8', style: 'script',
    desc: 'Organikus vatta újratekerhető porlasztókhoz.' }
];

/* ---------- Attribútumok (pa_*) ---------- */
FV.attributes = [
  { key: 'iz', tax: 'pa_iz', name: 'Íz' },
  { key: 'nikotin', tax: 'pa_nikotin', name: 'Nikotinerősség' },
  { key: 'ml', tax: 'pa_kiszereles', name: 'Kiszerelés' },
  { key: 'puff', tax: 'pa_puff', name: 'Puff / slukkszám' },
  { key: 'kompat', tax: 'pa_kompatibilitas', name: 'Kompatibilitás' },
  { key: 'szin', tax: 'pa_szin', name: 'Szín' }
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
      short: 'Két üzemmódú, kijelzős eldobható eszköz 40 000 puff kapacitással, jeges áfonya ízben.', pop: 99, featured: true }),
    p({ slug: 'elfbar-bc40000-mango-ice', name: 'Elfbar BC40000 Mango Ice', art: 'disposable', color: '#FFC94D',
      cats: ['eldobhato', '20000-puff'], brand: 'elfbar', price: 24.9, sku: 'FV-ELF-BC40K-MGI', weight: 118,
      attrs: { iz: ['Mango Ice'], nikotin: ['20 mg'], ml: ['18 ml'], puff: [40000] },
      short: 'Két üzemmódú, kijelzős eldobható eszköz 40 000 puff kapacitással, jeges mangó ízben.', pop: 95 }),
    p({ slug: 'elfbar-bc40000-watermelon-ice', name: 'Elfbar BC40000 Watermelon Ice', art: 'disposable', color: '#F57A93',
      cats: ['eldobhato', '20000-puff'], brand: 'elfbar', price: 24.9, sku: 'FV-ELF-BC40K-WMI', weight: 118, stock: 'outofstock',
      attrs: { iz: ['Watermelon Ice'], nikotin: ['20 mg'], ml: ['18 ml'], puff: [40000] },
      short: 'Két üzemmódú, kijelzős eldobható eszköz 40 000 puff kapacitással, jeges görögdinnye ízben.', pop: 90 }),
    p({ slug: 'lost-mary-mo20000-pro-strawberry-kiwi', name: 'Lost Mary MO20000 Pro Strawberry Kiwi', art: 'disposable', color: '#E5566E',
      cats: ['eldobhato', '20000-puff'], brand: 'lost-mary', price: 21.9, sale: 17.5, sku: 'FV-LM-MO20K-SK', weight: 96,
      attrs: { iz: ['Strawberry Kiwi'], nikotin: ['20 mg'], ml: ['16 ml'], puff: [20000] },
      short: 'Állítható légáramlás, okos kijelző, 20 000 puff eper-kivi ízben.', pop: 88 }),
    p({ slug: 'drifter-bar-30000-cola', name: 'Drifter Bar 30000 Cola', art: 'disposable', color: '#6B3A2A',
      cats: ['eldobhato', '20000-puff'], brand: 'drifter', price: 22.9, sku: 'FV-DRF-30K-COL', weight: 104,
      attrs: { iz: ['Cola'], nikotin: ['20 mg'], ml: ['17 ml'], puff: [30000] },
      short: 'Nagy kapacitású eldobható eszköz, klasszikus kóla ízzel, 30 000 puff.', pop: 70 }),
    p({ slug: 'drifter-bar-30000-grape', name: 'Drifter Bar 30000 Grape', art: 'disposable', color: '#7B3FA0',
      cats: ['eldobhato', '20000-puff'], brand: 'drifter', price: 22.9, sku: 'FV-DRF-30K-GRP', weight: 104, stock: 'discontinued',
      attrs: { iz: ['Grape'], nikotin: ['20 mg'], ml: ['17 ml'], puff: [30000] },
      short: 'Nagy kapacitású eldobható eszköz szőlő ízben. A gyártó kivezette a terméket.', pop: 40 }),
    /* Eldobható – 10000 */
    p({ slug: 'elfbar-600-v2-peach-ice-10000', name: 'Elfbar Raya D1 10000 Peach Ice', art: 'disposable', color: '#FFB38F',
      cats: ['eldobhato', '10000-puff'], brand: 'elfbar', price: 16.9, sku: 'FV-ELF-RD1-PCI', weight: 72,
      attrs: { iz: ['Peach Ice'], nikotin: ['20 mg'], ml: ['13 ml'], puff: [10000] },
      short: 'Hálós porlasztó, stabil íz a végéig: 10 000 puff jeges barack ízben.', pop: 76 }),
    p({ slug: 'lost-mary-bm10000-triple-mango', name: 'Lost Mary BM10000 Triple Mango', art: 'disposable', color: '#FF9F1C',
      cats: ['eldobhato', '10000-puff'], brand: 'lost-mary', price: 15.9, sku: 'FV-LM-BM10K-TM', weight: 70,
      attrs: { iz: ['Triple Mango'], nikotin: ['20 mg'], ml: ['14 ml'], puff: [10000] },
      short: 'Háromféle mangó egyensúlya, újratölthető akkumulátorral, 10 000 puff.', pop: 81 }),
    /* 5000 */
    p({ slug: 'elfbar-bc5000-strawberry', name: 'Elfbar BC5000 Strawberry', art: 'disposable', color: '#E83A5A',
      cats: ['eldobhato', '5000-puff'], brand: 'elfbar', price: 12.9, sale: 9.9, sku: 'FV-ELF-BC5K-STR', weight: 58,
      attrs: { iz: ['Strawberry'], nikotin: ['20 mg'], ml: ['13 ml'], puff: [5000] },
      short: 'Az egyik legkeresettebb Elfbar modell édes eper ízben, 5000 puff.', pop: 84 }),
    p({ slug: 'elfbar-bc5000-menthol', name: 'Elfbar BC5000 Menthol', art: 'disposable', color: '#2EC4B6',
      cats: ['eldobhato', '5000-puff'], brand: 'elfbar', price: 12.9, sku: 'FV-ELF-BC5K-MEN', weight: 58,
      attrs: { iz: ['Menthol'], nikotin: ['20 mg', '0 mg'], ml: ['13 ml'], puff: [5000] },
      short: 'Tiszta, hűsítő mentol. Nikotinmentes változatban is.', pop: 66 }),
    /* 600 */
    p({ slug: 'elfbar-600-blueberry', name: 'Elfbar 600 Blueberry', art: 'disposable', color: '#4B5BD6',
      cats: ['eldobhato', '600-puff'], brand: 'elfbar', price: 5.9, sku: 'FV-ELF-600-BLB', weight: 28,
      attrs: { iz: ['Blueberry'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600] },
      short: 'TPD-kompatibilis 2 ml-es eldobható, áfonya ízben, kb. 600 puff.', pop: 92, featured: true }),
    p({ slug: 'elfbar-600-cola', name: 'Elfbar 600 Cola', art: 'disposable', color: '#6B3A2A',
      cats: ['eldobhato', '600-puff'], brand: 'elfbar', price: 5.9, sale: 4.5, sku: 'FV-ELF-600-COL', weight: 28,
      attrs: { iz: ['Cola'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600] },
      short: 'TPD-kompatibilis 2 ml-es eldobható, kóla ízben, kb. 600 puff.', pop: 74 }),
    p({ slug: 'elfbar-600-nikotinmentes-watermelon', name: 'Elfbar 600 Watermelon – nikotinmentes', art: 'disposable', color: '#F0506E',
      cats: ['eldobhato', '600-puff'], brand: 'elfbar', price: 5.5, sku: 'FV-ELF-600-WM0', weight: 28,
      attrs: { iz: ['Watermelon'], nikotin: ['0 mg'], ml: ['2 ml'], puff: [600] },
      short: 'Nikotin nélkül, ugyanazzal az ízélménnyel. Görögdinnye, 600 puff.', pop: 62 }),
    p({ slug: 'lost-mary-bm600-pink-lemonade', name: 'Lost Mary BM600 Pink Lemonade', art: 'disposable', color: '#F48FB1',
      cats: ['eldobhato', '600-puff'], brand: 'lost-mary', price: 5.9, sku: 'FV-LM-BM600-PL', weight: 30,
      attrs: { iz: ['Pink Lemonade'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600] },
      short: 'Pezsgő pink limonádé, kerek Lost Mary formában.', pop: 71 }),

    /* Előretöltött podok */
    p({ slug: 'elfa-pod-blueberry', name: 'ELFA Pod Blueberry (2 db)', art: 'pod', color: '#4B5BD6',
      cats: ['eloretoltott-podok', 'elfa-podok'], brand: 'elfa', price: 7.9, sale: 6.5, sku: 'FV-ELFA-POD-BLB', weight: 24,
      attrs: { iz: ['Blueberry'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600], kompat: ['ELFA kompatibilis'] },
      short: 'Előretöltött pod az ELFA akkumulátorhoz. 2 db / csomag, csomagonként kb. 1200 puff.', pop: 89, featured: true }),
    p({ slug: 'elfa-pod-strawberry-kiwi', name: 'ELFA Pod Strawberry Kiwi (2 db)', art: 'pod', color: '#E5566E',
      cats: ['eloretoltott-podok', 'elfa-podok'], brand: 'elfa', price: 7.9, sku: 'FV-ELFA-POD-SK', weight: 24,
      attrs: { iz: ['Strawberry Kiwi'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600], kompat: ['ELFA kompatibilis'] },
      short: 'Előretöltött pod az ELFA akkumulátorhoz, eper-kivi ízben. 2 db / csomag.', pop: 80 }),
    p({ slug: 'elfa-pod-spearmint', name: 'ELFA Pod Spearmint (2 db)', art: 'pod', color: '#23B58A',
      cats: ['eloretoltott-podok', 'elfa-podok'], brand: 'elfa', price: 7.9, sku: 'FV-ELFA-POD-SPM', weight: 24,
      attrs: { iz: ['Spearmint'], nikotin: ['20 mg', '10 mg'], ml: ['2 ml'], puff: [600], kompat: ['ELFA kompatibilis'] },
      short: 'Fodormenta az ELFA rendszerhez, 10 és 20 mg erősségben.', pop: 68 }),
    p({ slug: 'lost-mary-tappo-pod-cherry', name: 'Lost Mary TAPPO Pod Cherry', art: 'pod', color: '#B0133A',
      cats: ['eloretoltott-podok', 'tappo-podok'], brand: 'lost-mary', price: 6.9, sku: 'FV-LM-TAP-CHR', weight: 20,
      attrs: { iz: ['Cherry'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [600], kompat: ['Lost Mary TAPPO kompatibilis'] },
      short: 'Előretöltött TAPPO pod, érett cseresznye íz.', pop: 58 }),
    p({ slug: 'drifter-pod-kiwi-passion', name: 'Drifter Pod Kiwi Passion', art: 'pod', color: '#8FBF3F',
      cats: ['eloretoltott-podok', 'drifter-podok'], brand: 'drifter', price: 6.5, sku: 'FV-DRF-POD-KP', weight: 20, stock: 'outofstock',
      attrs: { iz: ['Kiwi Passion'], nikotin: ['20 mg'], ml: ['2 ml'], puff: [800], kompat: ['Drifter kompatibilis'] },
      short: 'Kivi és maracuja, Drifter pod akkumulátorhoz.', pop: 45 }),

    /* Készülékek */
    p({ slug: 'elfa-pro-kit-black', name: 'ELFA Pro Pod Kit', art: 'kit', color: '#1B1B1F',
      cats: ['keszulekek', 'pod-kitek'], brand: 'elfa', price: 14.9, sku: 'FV-ELFA-PRO-KIT', weight: 62,
      attrs: { szin: ['Black', 'Silver', 'Blue'], kompat: ['ELFA kompatibilis'] },
      short: 'Az ELFA pod rendszer akkumulátora 500 mAh-val, USB-C töltéssel. Egy ELFA poddal.', pop: 94, featured: true, variable: true }),
    p({ slug: 'lost-mary-tappo-kit', name: 'Lost Mary TAPPO Pod Kit', art: 'kit', color: '#E27BA5',
      cats: ['keszulekek', 'pod-kitek'], brand: 'lost-mary', price: 13.9, sale: 11.9, sku: 'FV-LM-TAP-KIT', weight: 55,
      attrs: { szin: ['Pink', 'Black'], kompat: ['Lost Mary TAPPO kompatibilis'] },
      short: 'Kompakt TAPPO akkumulátor rezgő töltésjelzővel, egy előretöltött poddal.', pop: 72, variable: true }),
    p({ slug: 'vaporesso-xros-4-mini', name: 'Vaporesso XROS 4 Mini Pod Kit', art: 'kit', color: '#2D5BD7',
      cats: ['keszulekek', 'pod-kitek'], brand: 'vaporesso', price: 26.9, sku: 'FV-VAP-XROS4M', weight: 68,
      attrs: { szin: ['Blue', 'Black', 'Silver'], kompat: ['Vaporesso XROS kompatibilis'] },
      short: 'Újratölthető MTL pod rendszer, 1000 mAh, állítható légáramlás. XROS podokkal kompatibilis.', pop: 86, variable: true }),
    p({ slug: 'drifter-pod-kit', name: 'Drifter Pod Kit', art: 'kit', color: '#5B3FD6',
      cats: ['keszulekek', 'pod-kitek'], brand: 'drifter', price: 12.9, sku: 'FV-DRF-KIT', weight: 50,
      attrs: { szin: ['Black'], kompat: ['Drifter kompatibilis'] },
      short: 'Drifter akkumulátor LED-es töltöttségjelzővel, Drifter podokhoz.', pop: 50 }),
    p({ slug: 'geekvape-aegis-legend-3', name: 'Geekvape Aegis Legend 3 Kit', art: 'kit', color: '#4A4F58',
      cats: ['keszulekek', 'box-mod-kitek'], brand: 'geekvape', price: 69.9, sale: 59.9, sku: 'FV-GV-AL3-KIT', weight: 310,
      attrs: { szin: ['Gunmetal', 'Black'], kompat: ['Geekvape Z coil kompatibilis'] },
      short: 'IP68 védett, két 18650 akkumulátoros box mod Z Sub-Ohm tankkal.', pop: 60, variable: true }),
    p({ slug: 'innokin-endura-t18-2', name: 'Innokin Endura T18 II Kit', art: 'kit', color: '#B8BCC4',
      cats: ['keszulekek', 'box-mod-kitek'], brand: 'innokin', price: 29.9, sku: 'FV-INN-T18II', weight: 140, stock: 'discontinued',
      attrs: { szin: ['Silver'], kompat: [] },
      short: 'Klasszikus kezdő MTL kit, 1300 mAh akkumulátor. Kifutott modell.', pop: 30 }),

    /* E-liquidek */
    p({ slug: 'nasty-juice-trap-queen', name: 'Nasty Juice Trap Queen 10 ml', art: 'liquid', color: '#E83A5A',
      cats: ['e-liquidek', 'nikotinsos-liquidek'], brand: 'nasty-juice', price: 5.9, sku: 'FV-NJ-TQ-10', weight: 34,
      attrs: { iz: ['Strawberry'], nikotin: ['10 mg', '20 mg'], ml: ['10 ml'] },
      short: 'Nikotinsós liquid friss eperrel és jeges utóízzel.', pop: 78, variable: true }),
    p({ slug: 'nasty-juice-cushman-mango', name: 'Nasty Juice Cushman Mango 10 ml', art: 'liquid', color: '#FFB020',
      cats: ['e-liquidek', 'nikotinsos-liquidek'], brand: 'nasty-juice', price: 5.9, sale: 4.9, sku: 'FV-NJ-CM-10', weight: 34,
      attrs: { iz: ['Mango'], nikotin: ['10 mg', '20 mg'], ml: ['10 ml'] },
      short: 'Érett mangó enyhe hűsítéssel, nikotinsós változatban.', pop: 69, variable: true }),
    p({ slug: 'vampire-vape-heisenberg', name: 'Vampire Vape Heisenberg 10 ml', art: 'liquid', color: '#36A9E0',
      cats: ['e-liquidek', 'nikotinsos-liquidek'], brand: 'vampire-vape', price: 5.5, sku: 'FV-VV-HEIS-10', weight: 34,
      attrs: { iz: ['Energy'], nikotin: ['10 mg', '20 mg'], ml: ['10 ml'] },
      short: 'A legendás Heisenberg: bogyós gyümölcsök, ánizs és mentol.', pop: 83, variable: true }),
    p({ slug: 'twelve-monkeys-kanzi-aroma', name: 'Twelve Monkeys Kanzi aroma 20 ml', art: 'liquid', color: '#F48FB1',
      cats: ['e-liquidek', 'aromak'], brand: 'twelve-monkeys', price: 11.9, sku: 'FV-12M-KANZI-20', weight: 62,
      attrs: { iz: ['Strawberry Kiwi'], nikotin: ['0 mg'], ml: ['20 ml'] },
      short: 'Shake & vape aroma: eper, kivi és görögdinnye. 60 ml-es palackban.', pop: 54 }),
    p({ slug: 'french-liquide-jackfruit-pear', name: 'French Liquide Fruiitopia Jackfruit Pear 10 ml', art: 'liquid', color: '#C7C45A',
      cats: ['e-liquidek', 'aromak'], brand: 'french-liquide', price: 6.9, sku: 'FV-FL-FJP-10', weight: 30,
      attrs: { iz: ['Jackfruit Pear'], nikotin: ['0 mg'], ml: ['10 ml'] },
      short: 'Jackfruit, körte és guava: egzotikus aroma saját keveréshez.', pop: 35 }),
    p({ slug: 'vampire-vape-pinkman-shortfill', name: 'Vampire Vape Pinkman 50 ml shortfill', art: 'liquid', color: '#F06292',
      cats: ['e-liquidek', 'shortfill'], brand: 'vampire-vape', price: 16.9, sale: 13.9, sku: 'FV-VV-PINK-50', weight: 95,
      attrs: { iz: ['Pink Lemonade'], nikotin: ['0 mg'], ml: ['50 ml'] },
      short: '50 ml nikotinmentes liquid 60 ml-es palackban, egy booster hozzáadásához.', pop: 57 }),
    p({ slug: 'nikotin-booster-20mg', name: 'Nikotin booster 20 mg 10 ml', art: 'liquid', color: '#BFC4CC',
      cats: ['e-liquidek', 'bazis'], brand: 'vampire-vape', price: 2.5, sku: 'FV-BOOST-20-10', weight: 30,
      attrs: { iz: ['Unflavored'], nikotin: ['20 mg'], ml: ['10 ml'] },
      short: 'Ízesítetlen 50/50 nikotin booster shortfill liquidekhez.', pop: 65 }),

    /* Kiegészítők */
    p({ slug: 'vaporesso-xros-ures-pod-2ml', name: 'Vaporesso XROS üres pod 0,8 Ω (4 db)', art: 'accessory', acc: 'cartridge', color: '#2D5BD7',
      cats: ['kiegeszitok', 'ures-podok'], brand: 'vaporesso', price: 10.9, sku: 'FV-VAP-XROS-POD08', weight: 22,
      attrs: { ml: ['2 ml'], kompat: ['Vaporesso XROS kompatibilis'] },
      short: 'Utántölthető XROS pod 0,8 ohmos hálós fejjel, 4 db / csomag.', pop: 77 }),
    p({ slug: 'geekvape-z-coil-02', name: 'Geekvape Z coil 0,2 Ω (5 db)', art: 'accessory', acc: 'coil', color: '#4A4F58',
      cats: ['kiegeszitok', 'porlasztofejek'], brand: 'geekvape', price: 14.9, sku: 'FV-GV-ZCOIL-02', weight: 26,
      attrs: { kompat: ['Geekvape Z coil kompatibilis'] },
      short: 'Hálós porlasztófej a Z Sub-Ohm tankhoz, 5 db / csomag.', pop: 52 }),
    p({ slug: 'usb-c-toltokabel', name: 'USB-C töltőkábel 1 m', art: 'accessory', acc: 'cable', color: '#1B1B1F',
      cats: ['kiegeszitok', 'toltok'], brand: 'vaporesso', price: 3.9, sku: 'FV-CBL-USBC-1M', weight: 30,
      attrs: { kompat: ['ELFA kompatibilis', 'Vaporesso XROS kompatibilis', 'Lost Mary TAPPO kompatibilis'] },
      short: 'Gyorstöltésre alkalmas USB-C kábel a legtöbb pod rendszerhez.', pop: 48 }),
    p({ slug: 'cotton-clouds-organic', name: 'Cotton Clouds organikus vatta', art: 'accessory', acc: 'cotton', color: '#4A8FB8',
      cats: ['kiegeszitok', 'vatta'], brand: 'cotton-clouds', price: 4.9, sku: 'FV-CC-ORG', weight: 18,
      attrs: {},
      short: 'Előre szálazott organikus vatta újratekerhető porlasztókhoz.', pop: 20 }),
    p({ slug: 'geekvape-tool-kit', name: 'Geekvape szerszámkészlet', art: 'accessory', acc: 'tool', color: '#E4572E',
      cats: ['kiegeszitok', 'szerszamok'], brand: 'geekvape', price: 12.9, sku: 'FV-GV-TOOLKIT', weight: 180, stock: 'outofstock',
      attrs: {},
      short: 'Csipesz, kerámia csipesz, csavarhúzók és tekercselő rúd egy tokban.', pop: 25 })
  ];

  // Az „Akciók” oldal nem külön kategória: minden akciós árral rendelkező termék automatikusan megjelenik (WooCommerce on_sale lekérdezés).
})();

/* ---------- Menü (Megjelenés → Menük, mega menü oszlopokkal) ---------- */
FV.menu = [
  { label: 'Készülékek / kitek', cat: 'keszulekek' },
  { label: 'Előretöltött podok', cat: 'eloretoltott-podok' },
  { label: 'E-liquidek', cat: 'e-liquidek' },
  { label: 'Eldobható e-cigaretták', cat: 'eldobhato', puffLinks: true },
  { label: 'Kiegészítők', cat: 'kiegeszitok' },
  { label: 'Márkák', brands: true },
  { label: 'Akciók', href: '#/akciok', sale: true }
];

FV.pages = {
  'szallitas-es-fizetes': 'Szállítás és fizetés',
  'aszf': 'Általános Szerződési Feltételek',
  'adatvedelem': 'Adatvédelmi tájékoztató',
  'elallas': 'Elállási információk',
  'cookie': 'Cookie tájékoztató',
  'kapcsolat': 'Kapcsolat'
};

/* DPD súlyalapú díjtáblázat (WooCommerce szállítási zóna: Table Rate / súly szerint) */
FV.shipping = {
  freeOver: 50,
  methods: [
    { id: 'dpd-home', name: 'DPD házhozszállítás', eta: '1–2 munkanap',
      tiers: [ { max: 1000, price: 3.9 }, { max: 3000, price: 4.9 }, { max: 10000, price: 6.9 }, { max: 31500, price: 9.9 } ] },
    { id: 'dpd-pickup', name: 'DPD Pickup pont / csomagautomata', eta: '1–3 munkanap',
      tiers: [ { max: 1000, price: 2.9 }, { max: 3000, price: 3.5 }, { max: 10000, price: 4.9 }, { max: 20000, price: 6.9 } ] }
  ]
};
