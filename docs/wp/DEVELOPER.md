# First Vape – fejlesztői leírás (WordPress-téma)

`wp-theme/firstvape` – az `iu_theme` child témája. A kinézet és a szövegek a jóváhagyott előnézeté (`prototype/`):
ugyanaz a CSS (`assets/css/site.css` = `prototype/assets/css/style.css`), ugyanaz a HTML-szerkezet, ugyanaz a szótár
(SK / FR) és ugyanaz a katalóguslogika (kereső, szűrők, kapcsolódó termékek) – PHP-ben, WooCommerce-adatokkal.
Telepítés: [`TELEPITES.md`](TELEPITES.md).

## Felépítés

```
wp-theme/firstvape/
├── functions.php          betöltő (inc/ alatt NINCS „blocks” mappa: azt az iu_theme block.json-os blokknak nézné)
├── inc/
│   ├── lang.php           egy webshop két domainnel: nyelv (domain / WPML / ?lang=), a WordPress címe a látogató
│   │                      domainjén, nyelvváltó URL, piachoz kötött oldalak átirányítása, locale (WP + WooCommerce)
│   ├── helpers.php        szótár (firstvape_t, többes szám), piac (ÁFA, szállítás), pénz, ikonok, útvonalak
│   │                      (az előnézet #/… útvonalai → URL), morzsamenü, attribútum-feliratok (nikotin, slukkszám)
│   ├── catalog.php        termékindex (firstvape_index opció), kategóriák (fv_key), márkák, ár piaconként,
│   │                      készlet, kereső + javaslatok, szűrők darabszámmal, rendezés, kapcsolódó termékek
│   ├── theme.php          CSS/JS, iu alap-CSS csere (Mandala/Slugshop-minta), body osztályok, cím, a lap alja
│   ├── blocks.php         saját blokkok (iucb_add_block, ha nincs: register_block_type + assets/js/editor.js)
│   ├── parts/chrome.php   felső sáv, fejléc + mega menü, mobilmenü, kosár-fiók, lábléc, 18+ kapu, élő kereső
│   ├── parts/home.php     nyitóoldal szekciói (nyitókép + slukkszám-kereső, csempék, kompatibilitás, fülek …)
│   ├── parts/catalog.php  termékkártya, terméklista + szűrőpanel + lapozó, márkák A–Z, termékoldal, kedvencek
│   ├── parts/pages.php    oldal (jogi oldalak oldalsó menüvel), kapcsolat, blog, cikk, 404, rendelési lépések
│   ├── shop.php           WooCommerce: piac (ország, ÁFA), pénztár mezői, cégadatok, 18+, utánvét díja, lépések,
│   │                      fragmentek, fiók (Kedvencek), súly elrejtve, kifutott termék, levelek a rendelés nyelvén
│   ├── shipping.php       „First Vape – Packeta (minta)” szállítási mód: súlysáv, ingyenes küszöb, átvételi pont
│   ├── ageverify.php      korellenőrzés a pénztárban (Adulto): nikotinos kosárnál kötelező, eredmény a rendeléshez,
│   │                      admin oszlop / keresés / CSV-export (SOI), teszt mód
│   ├── ajax.php           REST firstvape/v1/search (élő kereső), admin-ajax: kosár-fiók mennyiség, kedvencek
│   ├── forms.php          kapcsolat, hírlevél, „Upozorniť ma” (REST firstvape/v1/form/…), Beküldések CPT
│   ├── seo.php            meta leírás, hreflang, canonical, noindex a szűrt listákon, JSON-LD Product / Store / Breadcrumb
│   ├── setup.php          telepítő lépései (idempotens)
│   ├── admin.php          Megjelenés → First Vape (telepítés, adatok, élesítési ellenőrzés)
│   └── cli.php            wp firstvape setup | check | reindex
├── assets/css             fonts.css → site.css (előnézet) → wp.css (iu keret + WooCommerce klasszikus oldalak)
├── assets/js              site.js (minden interakció), editor.js (blokk-helyőrzők a szerkesztőben)
├── setup/data/*.json      i18n, catalog, products (GENERÁLT: tools/wp/build_data.mjs az előnézetből)
└── templates/*.html       iu_theme sablonok: egy teljes szélességű iu/section, benne a téma önzáró blokkja
```

## Adatmodell

| Mi | WooCommerce | Megjegyzés |
|---|---|---|
| kategória | `product_cat` | a fa a `catalog.json`-ból; stabil kulcs: `fv_key` term meta (pl. `eloretoltott-podok`); a slug szlovák (`predplnene-pody`); FR név / rövid név / leírás: `fv_name_fr`, `fv_short_fr`, `fv_desc_fr`; az ügyfél angol neve: `fv_en_name` |
| márka | `product_brand` (WooCommerce 9.6+) | `fv_color`, `fv_style` (betűs logó), `fv_desc_fr` |
| attribútum | `pa_prichut`, `pa_nikotin`, `pa_objem`, `pa_pocet-potiahnuti`, `pa_system`, `pa_farba`, `pa_odpor` | globális, a szűrők ezekből; a slug a szlovák felirat (az import CSV ugyanígy nevezi) |
| termék | SIMPLE | `_fv_group` testvérek, `_fv_art` típus (ha nincs: a fő kategóriából), `_fv_color` ízszín, `_fv_pop` népszerűség, `_fv_short_fr`, `_fv_desc_fr`, `_fv_swatch`, `_fv_discontinued`, `_fv_weight_estimated`; cross-sell = az ügyfél ajánlásai |
| oldal / cikk | `page`, `post` | `fv_lang` (sk / fr / –), `fv_page` (shipping, terms …), `fv_pair` (a másik nyelvű pár), `fv_title_key` (a közös oldalak címe a szótárból) |
| rendelés | | `_fv_lang`, `_fv_pickup_point`, `_billing_fv_id`, `_billing_fv_vat`, `_fv_age_confirmed`; korellenőrzés: `_fv_av_required`, `_fv_av_provider`, `_fv_av_id`, `_fv_av_time`, `_fv_av_method`, `_fv_av_result`, `_fv_av_raw` |

A termékindex (`firstvape_index` opció, autoload nélkül) minden termék, kategória és márka mentésekor újraépül;
kézzel: `wp firstvape reindex`. A listák, a szűrők, a kereső és a mega menü ebből dolgoznak (400 terméknél gyors).

## Nyelv és piac

`firstvape_lang()`: WPML nyelve → a domain (ha két domain van beállítva) → `?lang=` / `fv_lang` süti → `sk`.
A locale ehhez igazodik (`sk_SK` / `fr_FR`), az alap textdomain a `.fr`-en újratöltődik. A felület szövegei a
szótárból (`setup/data/i18n.json`, az előnézet `i18n.js`-éből) jönnek – új szöveg: `prototype/assets/js/i18n.js`,
utána `node tools/wp/build_data.mjs`. Az ár: alap = szlovák bruttó, a francia bruttó = ár / 1,23 × 1,20 (WooCommerce
alap: a nettó állandó) – a listákban `firstvape_gross()`, a kosárban a WooCommerce adómotorja (ugyanaz az eredmény).

## Sablonok, blokkok, CSS

- Minden sablon egy `iu/section.fv-full`, benne egy önzáró `firstvape/*` blokk (header, footer, shop, product,
  page, blog, post, not-found). A nyitóoldal tartalma az „Úvod” oldal: 9 `firstvape/home-*` blokk (átrendezhető).
- Az iu_theme `<body>`-ja csak „front-page” osztályt kap: a WordPress / WooCommerce osztályait (woocommerce-cart …)
  a `wp_body_open` egy kis szkripttel teszi fel (szűrve: a „page” osztály ütközne az előnézet `.page` dobozával).
- Az iu_theme alap-CSS-e helyett csak a `variables.css` (Mandala-minta), a blokkok szerkezeti CSS-e kivéve.
- A jogi oldalak és cikkek tartalma core blokk (heading, paragraph, list) – a szerkesztő kanonikus alakjában:
  az iu_theme a mentett HTML-be `iu-text`, `iu-heading`, `iu-list`, `iu-list-item` osztályt tesz (enélkül „érvénytelen”).
- A `firstvape/page`, `post`, `product` blokk csak a látogatói oldalon, a megfelelő lekérdezésnél renderel (a
  szerkesztőben / REST-ben a sablon önmagát renderelné – végtelen ciklus).

## Szűrők és lista

GET-paraméterek (az előnézet szerint): `typ, kat, marka, kompat, iz, puff, nikotin, ml, szin, ohm, keszlet` (vesszős
lista), `min`, `max`, `akcio`, `rend` (pop, uj, ar_n, ar_cs, puff), `oldal` (12 / oldal). Főkategóriánként csak a
`catalog.json → catFacets` szerinti szűrők. JS-sel a `[data-shop]` űrlap tartalma cserélődik (fetch + pushState),
JS nélkül sima GET-űrlap. A szűrt / rendezett / lapozott lista `noindex,follow`, a canonical a szűretlen cím.

## Pénztár

Klasszikus `[woocommerce_checkout]`. Mezők: e-mail, telefon, név, „cégként” pipa (cégnév, IČO / DIČ – FR: SIRET /
TVA), ország (csak a piacé), PSČ, város, utca; eltérő szállítási cím (WooCommerce), megjegyzés, 18+ pipa (a
megjegyzés alatt – nem az AJAX-szal újrarajzolt összesítőben), ÁSZF-pipa (a piac oldalaira). A hibák a mező alatt
(a WooCommerce 9+ saját üzenete, rövid szöveggel), fölül egy összefoglaló. Átvételi pont: a szállítási mód alatt
(minta lista vagy Packeta widget), kötelező, a rendelés metájába és a levelekbe kerül.

## Korellenőrzés (Adulto)

Szlovákiában a nikotinos termékek távértékesítésénél kötelező az életkor-ellenőrző rendszer (89/2016 Z. z.; az ügyfél
kérése, 2026-10-22). `inc/ageverify.php`: ha a piac be van kapcsolva (alapból SK) és a kosárban nikotinos termék van
(`pa_nikotin` > 0 mg, vagy a terméknél „Korellenőrzés: mindig”), a pénztárban az Adulto widget
(`<div class="adulto-cz" data-sitekey data-adultocz="18" data-lang>` + a szolgáltató szkriptje), a rendeléskor a szerver
lekérdezi az eredményt (`api.result.adulto.cz?secret=…&response=<token>`, a token a form `adultocz-uid` mezőjéből), és
csak `adultocz-verify-adult = true` esetén enged tovább. Beállítás: Megjelenés → First Vape → Korellenőrzés (kulcsok,
szkript címe, mezőnevek, korhatár, termékkör, teszt mód, CSV-export). A szkript címét és a válasz mezőneveit az Adulto
fejlesztői leírásával kell véglegesíteni (a nyers válasz a `_fv_av_raw`-ban). Teszt: `tests/wp/ageverify.mjs` (11 ellenőrzés).

## Fejlesztés

```
node tools/wp/build_data.mjs                  előnézet → setup/data/*.json
python3 tools/wp/build_theme.py [--media <1200 px-es képek mappája>]   dist/firstvape-tema.zip (+ firstvape-media.zip)
tools/wp/dev-wp.sh <wp mappa> [hlprv] [media.zip]                     teszt-WordPress
BASE=http://localhost:8891 node tests/wp/e2e.mjs
BASE=… WP="wp --allow-root --path=…" WPUSER=admin WPPASS=admin node tests/wp/editor-check.mjs
```

## Ellenőrizve (2026-10-20, WordPress 7.1.2, WooCommerce 11.1.2, iu_theme 0.2.2, PHP 8.4, MariaDB 10.11)

- e2e: 69 ellenőrzés hibátlan, a fejlesztői és egy üres WordPressre zipből telepített példányon is – 23 oldal 1440 és
  390 px-en (státusz, egy H1, nincs vízszintes görgetés, nincs JS-hiba), 18+ kapu, francia piac (ár 20 % TVA-val,
  francia felület, a szlovák ÁSZF a CGV-re irányít), mega menü, élő kereső, szűrés újratöltés nélkül, kedvencek,
  kosár-fiók, rendelés mezőnkénti hibaüzenettel, Packeta-ponttal és utánvéttel, kapcsolati űrlap.
- Két domain valódi módban (két host): francia felület, minden link / kép / CSS / JS a második hoston, hreflang, átirányítás.
- Szerkesztő: 28 oldal és cikk + 14 sablonfájl érvényes a valódi blokkszerkesztőben (`editor-check.mjs`: 42 / 42).
- Telepítő: üres WordPressre zipből (téma + médiacsomag), a második futás semmit nem ír át.
- Frissítés (az ügyfél 2. köre): a 2026-10-20 délelőtti témával telepített WordPress az új zippel és `wp firstvape setup`-pal
  (`--force` nélkül): a kikerült termékek kukába, az Eldobható kategória és cikk törölve, pod-alkategóriák, leírások,
  testvércsoportok, ajánlások (227), cserélt képek, ingyenes szállítás 39,99 € – utána az e2e 69 / 69.
