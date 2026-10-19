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
 * Az ügyfél által véglegesített fa (2026-10-15). Az angol nevek (en) az ügyfél termékfájljának pontos kategórianevei
 * (2026-10-19; a DISPOSABLE E-CIGARETTES és a BATTERIES / CHARGERS javaslat, a fájlban nincs ilyen) – lásd csv/kategoria-osszerendeles.csv.
 */
FV.categories = [
  { slug: 'keszulekek', art: 'kit', color: '#3D4A6B', en: 'DEVICES / KITS',
    name: { sk: 'Zariadenia / kity', fr: 'Appareils / kits' },
    short: { sk: 'Zariadenia', fr: 'Appareils' },
    desc: { sk: 'Kompletné pod systémy a mod kity: s predplnenými podmi, s plniteľnými podmi aj väčšie mod + tank sady.', fr: 'Systèmes pod complets et kits : à pods préremplis, à pods à remplir et kits box + clearomiseur.' },
    children: [
      { slug: 'eloretoltott-pod-rendszerek', en: 'PREFILLED POD KITS', name: { sk: 'Predplnené pod systémy', fr: 'Systèmes à pods préremplis' },
        desc: { sk: 'Zariadenia, ktoré fungujú s továrensky naplnenými, ochutenými podmi (napr. ELFBAR ELFA, ELFBAR JOIN ONE).', fr: 'Appareils fonctionnant avec des pods préremplis en usine (ex. ELFBAR ELFA, ELFBAR JOIN ONE).' } },
      { slug: 'utantoltheto-pod-rendszerek', en: 'REFILLABLE POD KITS', name: { sk: 'Plniteľné pod systémy', fr: 'Systèmes à pods à remplir' },
        desc: { sk: 'Zariadenia, ktorých pod alebo cartridge si plníš vlastným liquidom (napr. Geekvape Wenax, Aegis Boost, Vaporesso GTX GO).', fr: 'Appareils dont le pod se remplit avec votre e-liquide (ex. Geekvape Wenax, Aegis Boost, Vaporesso GTX GO).' } },
      { slug: 'mod-tank-kitek', en: 'MOD & TANK KITS', name: { sk: 'Mod / tank kity', fr: 'Kits box / clearomiseur' },
        desc: { sk: 'Väčšie sady mod + tank (napr. Vaporesso GEN MAX, GEN SE, Geekvape Aegis Legend).', fr: 'Kits box + clearomiseur (ex. Vaporesso GEN MAX, GEN SE, Geekvape Aegis Legend).' } }
    ] },
  { slug: 'eloretoltott-podok', art: 'pod', color: '#E83A5A', en: 'PREFILLED PODS',
    name: { sk: 'Predplnené pody', fr: 'Pods préremplis' },
    short: { sk: 'Predplnené pody', fr: 'Pods préremplis' },
    desc: { sk: 'Samostatne predávané, továrensky naplnené náhradné pody s príchuťou – napr. ELFA Pro Pod, JOIN ONE Pod, Vaporesso a Drifter pody. Kompletné zariadenia nájdeš v kategórii Zariadenia / kity.', fr: 'Pods de rechange préremplis vendus séparément – ELFA Pro Pod, JOIN ONE Pod, pods Vaporesso et Drifter. Les appareils complets sont dans Appareils / kits.' },
    children: [] },
  { slug: 'e-liquidek', art: 'liquid', color: '#7B3FA0', en: 'E-LIQUIDS',
    name: { sk: 'E-liquidy', fr: 'E-liquides' },
    short: { sk: 'E-liquidy', fr: 'E-liquides' },
    desc: { sk: 'Nikotínové boostery, hotové 10 ml liquidy, príchute, shortfill a longfill.', fr: 'Boosters de nicotine, e-liquides prêts 10 ml, arômes, shortfills et longfills.' },
    children: [
      { slug: 'nikotin-booster', en: 'NICOTINE BOOSTER', name: { sk: 'Nikotínové boostery', fr: 'Boosters de nicotine' } },
      { slug: 'kesz-liquidek-10ml', en: '10ML LIQUIDS', name: { sk: 'Hotové liquidy 10 ml', fr: 'E-liquides prêts 10 ml' } },
      { slug: 'aromak', en: 'AROMA', name: { sk: 'Príchute (arómy)', fr: 'Arômes concentrés' } },
      { slug: 'shortfill', en: 'SHORTFILL', name: { sk: 'Shortfill', fr: 'Shortfills' } },
      { slug: 'longfill', en: 'LONGFILL', name: { sk: 'Longfill', fr: 'Longfills' } }
    ] },
  { slug: 'eldobhato', art: 'disposable', color: '#FF8A1F', en: 'DISPOSABLE E-CIGARETTES',
    name: { sk: 'Jednorazové e-cigarety', fr: 'Cigarettes électroniques jetables' },
    short: { sk: 'Jednorazové', fr: 'Jetables' },
    desc: { sk: 'Zariadenia, ktoré po spotrebovaní vyhodíš celé (napr. ELFBAR 600). Niektoré väčšie modely majú batériu nabíjateľnú cez USB-C.', fr: 'Appareils que l’on jette entièrement après usage (ex. ELFBAR 600). Certains grands modèles ont une batterie rechargeable en USB-C.' },
    children: [] },
  { slug: 'kiegeszitok', art: 'accessory', color: '#19A58A', en: 'ACCESSORIES',
    name: { sk: 'Príslušenstvo', fr: 'Accessoires' },
    short: { sk: 'Príslušenstvo', fr: 'Accessoires' },
    desc: { sk: 'Prázdne náhradné pody, žhaviace hlavy, tanky, batérie, nabíjačky a ďalšie príslušenstvo. Predplnené pody s liquidom nájdeš v kategórii Predplnené pody.', fr: 'Pods vides, résistances, clearomiseurs, accus, chargeurs et autres accessoires. Les pods préremplis sont dans Pods préremplis.' },
    children: [
      { slug: 'ures-podok', en: 'REPLACEMENT PODS / CARTRIDGES', name: { sk: 'Prázdne pody / cartridge', fr: 'Pods vides / cartouches' } },
      { slug: 'porlasztok', en: 'COILS', name: { sk: 'Žhaviace hlavy / coily', fr: 'Résistances' } },
      { slug: 'tankok', en: 'TANK', name: { sk: 'Tanky', fr: 'Clearomiseurs' } },
      { slug: 'akkuk-toltok', en: 'BATTERIES / CHARGERS', name: { sk: 'Batérie / nabíjačky', fr: 'Accus / chargeurs' } },
      { slug: 'egyeb-kiegeszitok', en: 'OTHER ACCESSORIES', name: { sk: 'Ostatné príslušenstvo', fr: 'Autres accessoires' } }
    ] }
];

/* ---------- Márkák (product_brand) ----------
 * Az ügyfél termékfájljából (products.js, generátor: tools/client_import.py). */
FV.brands = FV.clientBrands || [];

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
  var id = 100;
  function p(o) {
    id++;
    o.id = id;
    o.ean = o.ean || ''; // az ügyfél fájljában nincs EAN – nem találunk ki
    o.attrs = o.attrs || {};
    o.stock = o.stock || 'instock';
    o.qty = o.qty == null ? (o.stock === 'instock' ? 12 + (id * 7) % 60 : 0) : o.qty;
    o.pop = o.pop || (id * 13) % 100;
    o.date = o.date || ('2026-0' + (1 + id % 9) + '-1' + (id % 9));
    o.gallery = o.img ? 1 : (o.gallery || 3);
    return o;
  }

  /* Minden termék SIMPLE termék, ahogy az ügyfél CSV-jében (a szín-, íz- és nikotinváltozatok külön termékek, saját SKU-val).
   * A termékek az ügyfél fájljából jönnek (products.js, generátor: tools/client_import.py), a képek feldolgozva
   * (tools/product_images.py: átlátszó háttér, FIRSTVAPE logó). A „group” a testvértermékeket köti össze (_fv_group meta). */
  FV.products = (FV.clientProducts || []).map(p);
  // a színminták a termékfájl színneveiből (pl. „Aurora Gold”)
  FV.products.forEach(function (o) { if (o.swatch && o.attrs.szin) FV.colorSwatches[o.attrs.szin[0]] = o.swatch; });
})();

/* ---------- Menü (iu/menu, mega menü: saját blokk a child témában) ---------- */
FV.menu = [
  { cat: 'keszulekek', puffLinks: true },
  { cat: 'eloretoltott-podok', puffLinks: true },
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
    body: { sk: ['Jednorazové aj znovu nabíjateľné zariadenia Elfbar sa stali populárnymi za krátky čas. Tajomstvo je v jednoduchosti: rozbalíš a môžeš začať.', 'Od jednorazového ELFBAR 600 až po pod kit JOIN ONE s predplnenými podmi na 40 000 potiahnutí (odhad výrobcu) – vyberie si každý. Ak hľadáš zariadenie na dlhšie, skús pod systém ELFA: jedna batéria a vymeniteľné pody v desiatkach príchutí.'],
      fr: ['Les appareils jetables et rechargeables Elfbar sont devenus populaires en peu de temps. Le secret : la simplicité. Vous déballez, et c’est prêt.', 'Du jetable ELFBAR 600 au kit pod JOIN ONE avec pods préremplis de 40 000 bouffées (estimation du fabricant), il y en a pour tous. Pour un usage durable, essayez le système pod ELFA : une batterie, des pods interchangeables dans des dizaines de saveurs.'] } },
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
