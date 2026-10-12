# First Vape – WooCommerce frontend prototípus (HTML)

A Joomla/VirtueMart alapú First Vape webshop új frontendjének kattintható HTML prototípusa.
Jóváhagyás után ebből készül a WordPress / WooCommerce oldal: **Infinite Unity (`iu_theme`) + `firstvape` child téma**.

## Piacok, nyelvek, ÁFA

| Piac | Nyelv | Pénznem | ÁFA (áraink bruttók) | Szállítás | Fizetés |
|---|---|---|---|---|---|
| **Szlovákia (SK)** | szlovák (alapértelmezett) | EUR | **23% DPH** | DPD házhoz, DPD Pickup / Box, súlyalapú díj, ingyenes 50 € felett | Teya (kártya, Apple Pay, Google Pay), dobierka (+1,50 €) |
| **Franciaország (FR)** | francia | EUR | **20% TVA** | **szállító még nincs kiválasztva** (DPD France / Colissimo / Mondial Relay?), a díjtábla MINTA | Teya, utánvét csak ha a szállító támogatja |

- Magyar piac nincs: a felület szlovák és francia. A nyelv és a piac együtt vált (SK = szlovák felület + SK ÁFA + SK szállítás; FR = francia felület + FR ÁFA + FR szállítás).
- **Az ÁFA-kulcsokat élesítés előtt a könyvelőnek ellenőriznie kell** (OSS-bejelentés, a termékek besorolása, e-cigaretta jövedéki adó piaconként). A prototípus 23%-kal és 20%-kal számol.
- Ármodell: a `data.js` árai szlovák bruttó árak. A WooCommerce alapbeállítása (az árak ÁFÁ-val megadva, a bolt alaphelye SK) a nettó árat tartja állandónak, így a francia vevő `ár / 1,23 × 1,20` bruttót lát (pl. 5,90 € → 5,76 €). Ha minden piacon ugyanaz a bruttó ár kell, a child témában `add_filter( 'woocommerce_adjust_non_base_location_prices', '__return_false' )`. Ezt az ügyféllel el kell dönteni.
- Megszólítás: szlovákul tegező (a márka laza hangneme), franciául magázó (`vous`, a francia webshopok szokása). Ügyféllel egyeztetendő.
- A francia kötelező nikotin-figyelmeztetés és a szlovák megfelelője a TPD szerinti hivatalos szöveg (lábléc, termékoldal).
- **Jogi oldalak piaconként, HELYŐRZŐ szöveggel** (sárga keretes jelölés az oldalon; a végleges szöveget és a cégadatokat az ügyfél jogásza adja):
  - SK: Doprava a platba, **Obchodné podmienky**, **Ochrana osobných údajov**, **Odstúpenie od zmluvy**, Súbory cookie, Kontakt
  - FR: Livraison et paiement, **CGV (Conditions générales de vente)**, **Politique de confidentialité**, **Droit de rétractation**, **Mentions légales**, Cookies, Contact
- 18+ korkapu mindkét nyelven, benne nyelvválasztó (első látogatáskor itt lehet nyelvet váltani).
- **Nyitott jogi kérdés – Franciaország:** Franciaországban 2025 februárja óta tilos az eldobható e-cigaretta („puff”) forgalmazása (loi n° 2025-173). A prototípus FR nézete még mutatja az „Eldobható” kategóriát; élesítés előtt jogásszal egyeztetni kell, és valószínűleg el kell rejteni a francia piacon. A szlovák szabályokat (ízesítés, jövedéki adó, reklám) szintén ellenőrizni kell.

### Nyelvi réteg a prototípusban

- `assets/js/i18n.js`: szótár (`FV.I18N.sk`, `FV.I18N.fr`), `FV.t()`, `FV.L()`, többes szám (`FV.pl()`: szlovákul 1 / 2–4 / 5+), piacok (`FV.mkt()`, `FV.ship()`, `FV.gross()`), jogi oldalak (`FV.PAGES`).
- A `data.js` nyelvfüggő mezői `{ sk, fr }` objektumok (kategória, márkaleírás, termék rövid leírás; a terméknevek és márkák nem fordítandók, csak ha általános szó van bennük, pl. „(2 ks)” / „(lot de 2)”).
- A választott nyelv az `FV.store`-ban marad meg (`localStorage` `fv_lang`, try/catch-csel; privát módban memóriában).
- Váltás: fejléc SK / FR gombjai, mobilon a menü alján, első látogatáskor a 18+ ablakban. Angol (EN) nyelv később egy harmadik szótárral hozzáadható.
- A `#/prototipus` fejlesztői átadó oldal szándékosan magyar (belső).

## Megnyitás

Build lépés nincs. Nyisd meg az `index.html` fájlt böngészőben, vagy indíts helyi szervert:

```bash
cd prototype
python3 -m http.server 8000
# http://localhost:8000
```

A prototípus egyetlen oldalas alkalmazás, hash alapú útvonalakkal (`#/kategoria/eldobhato`, `#/termek/...`).
A WordPressben ezek valódi, nyelvenként fordított permalinkek lesznek (pl. `/sk/…`, `/fr/…`).

## Oldalak

| Oldal | Útvonal | Megfelelő az iu_theme + `firstvape` child témában |
|---|---|---|
| Főoldal | `#/` | `templates/front_page_content.html` |
| Kategória + szűrők | `#/kategoria/eldobhato` | `templates/tax_product_cat_content.html`: `[products class="mainquery"]` + `iu-woocommerce/filter` |
| Szűrt lista | `#/kategoria/eldobhato?puff=40000` | szűrt archív URL |
| Márkaoldal | `#/marka/elfbar` | `templates/tax_product_brand_content.html` (WooCommerce Brands) |
| Márkák A–Z | `#/markak` | oldal sablon |
| Akciók | `#/akciok` | `wc_get_product_ids_on_sale()` |
| Keresés | `#/kereses/Elfbar%2040000` | kiterjesztett termékkereső |
| Termékoldal | `#/termek/<slug>` | `templates/single_product_content.html` (iu-woocommerce blokkok) |
| Kosár / pénztár | `#/kosar`, `#/penztar` | klasszikus (shortcode-os) WooCommerce kosár és pénztár |
| Fiók | `#/fiok`, `#/fiok/rendelesek`, `#/fiok/kedvencek` | My Account |
| Információs és jogi oldalak | `#/oldal/shipping`, `#/oldal/terms` … | WordPress oldalak piaconként (`inc/setup.php`) |
| Blog | `#/blog`, `#/blog/<slug>` | WordPress bejegyzések |
| Fejlesztői áttekintés | `#/prototipus` | – |

## Adatmodell (a brief alapelve szerint)

- **Kategória = mi a termék** → `product_cat` (hierarchikus, több kategória termékenként)
- **Márka = ki gyártja** → `product_brand` (WooCommerce beépített Brands taxonómia)
- **Attribútum = milyen változat** → `pa_iz`, `pa_nikotin`, `pa_kiszereles`, `pa_puff`, `pa_kompatibilitas`, `pa_szin`
  (a slugok nyelvfüggetlenek, a WPML / Polylang csak a címkéket fordítja; a mostani magyar slugok helyett érdemes angolt választani, pl. `pa_flavor` – egyeztetendő. A `pa_kompatibilitas` értéke a rendszer neve, pl. `ELFA`; a „Kompatibilné s …” / „Compatible …” felirat a megjelenítéskor kerül elé.)
- **Termékadat** → normál ár, akciós ár, készlet, státusz (raktáron / készlethiányos / kifutott), SKU, EAN (`global_unique_id`), súly

A mintaadatok az `assets/js/data.js` fájlban vannak, pontosan ebben a szerkezetben.

## Megvalósított funkciók

- Mega menü: alkategóriák darabszámmal, kategórián belüli márkák, puff gyorslinkek, kiemelt termék; mobilon lenyíló menü
- Kereső: terméknév, márka, íz, puff, nikotin, kompatibilitás, kategória, SKU és EAN alapján; részleges egyezés;
  számnormalizálás (`40000` = `40 000` = `40k`); élő javaslatok márkára, kategóriára, puffra és ízre
- Szűrők: márka, kategória, puff, íz, nikotin, kiszerelés, kompatibilitás, szín, elérhetőség és ár;
  élő darabszámok, aktív szűrő chipek, a szűrők az URL-ben; mobilon oldalsó panel
- Termékoldal: kiemelt specifikációk, változatválasztó, készletállapot, visszatérési értesítő, kifutott termék kezelése,
  specifikációs táblázat (SKU, EAN, súly), nikotin figyelmeztetés, JSON-LD strukturált adat
- Automatikus kapcsolódó termékek a `pa_kompatibilitas` alapján (készülék → podok, pod → készülék, alternatívák)
- Kosár súlyalapú DPD díjszámítással, ingyenes szállítási küszöbbel
- Pénztár piaconként: SK DPD házhoz / Pickup, FR házhoz / point relais (szállító TBD); Teya, utánvét, cégadatok (SK: IČO, DIČ / IČ DPH; FR: SIRET, TVA-szám), 18+ megerősítés, „Objednať s povinnosťou platby” / „Commander avec obligation de paiement” gomb, ÁFA-sor az összesítőben
- 18+ korellenőrző ablak nyelvválasztóval, hírlevél, lábléc a brief szerinti blokkokkal
- SK / FR nyelv- és piacváltó (felület, árak ÁFÁ-val, szállítás, fizetés, jogi oldalak)

## Arculat

A jelenlegi firstvape.sk sötét témáját követi, modernizálva (a színek az élő oldal `custom.css`-éből):

- alap `#151017`, kártyák `#231B26`
- fő színátmenet `#EC2F4B → #1F2250` (45°): gombok, aktív elemek, kosár
- fejléc `#002460 → #38203F` (90°), mint az eredeti felső sáv
- betű: Barlow Semi Condensed (címek, nagybetűs menü), Barlow (szöveg)
- eredeti logó (`assets/img/first-vape-logo.png`), favicon és füstös háttér (`assets/img/smoke.jpg`)
- **mozgó füst** (`assets/js/smoke.js`): az eredeti oldal saját füstfotói (`assets/img/smoke-a.png`, `smoke-b.png`) úsznak az oldal
  szélein. Lassan sodródnak és forognak, görgetéskor eltérő sebességgel úsznak felfelé, gyors görgetésnél kicsit megpördülnek.
  A főoldali fejlécsáv füstképe (`smoke.jpg`) lassan mozog. „Csökkentett mozgás” beállításnál a füst áll.
  A WordPress témában ugyanez a fájl kerül a child témába (`wp_enqueue_script`, láblécben).
- a főoldal az eredeti szerkezetét követi: füstös hero, termékválaszték, „Miért vape?”, „A First Vape a legjobb vape!”, blog, partnerek, hírlevél

A régi oldal egészségügyi állításai („egészségesebb”, „40 káros anyag”) nem kerültek át, mert az EU-s TPD tiltja az e-cigaretta ilyen reklámozását.

## CSV sablonok (brief 11. pont)

- `csv/firstvape-termekimport-sablon.csv` – teljes termékimport magyar fejlécekkel, a prototípus összes termékével mintaként
  (szlovák termékszövegekkel). Frissítésre is jó: a WooCommerce importáló SKU alapján frissíti a meglévő terméket.
- `csv/firstvape-ar-keszlet-frissites.csv` – csak ár és készlet (SKU, Normál ár, Akciós ár, Készlet, Státusz).
- Formátum: UTF-8, vessző elválasztó; több érték vesszővel egy cellában; alkategória `Szülő > Gyerek`; súly kg-ban;
  státusz: Aktív / Készlethiányos / Kifutott. A kép URL-ek mintaértékek. A fejlécek nyelvét az ügyféllel egyeztetni kell.

## Ami szándékosan helyőrző

- A termékképek vektoros illusztrációk (típus és ízszín alapján). A témában a WooCommerce termékképek kerülnek a helyükre.
- A márkalogók tipográfiai feliratok. A témában a márka taxonómia képmezője adja őket.
- A jogi oldalak szövege HELYŐRZŐ, piaconként; a végleges szöveget és a cégadatokat az ügyfél (jogász) adja.
- A francia szállítási díjtábla, a francia utánvét és a point relais címek mintaadatok.
- A Teya, SuperFaktúra és DPD integrációk bővítményekkel működnek majd, a prototípusban csak a felületük látszik.

## WordPress terv (iu_theme + `firstvape` child téma)

A HelloProVision szabálya szerint kivétel nélkül:

1. **Téma:** `iu_theme` (Infinite Unity) + `firstvape` child téma (`style.css`: `Template: iu_theme`), a design a child téma `vars.css`-ében és a `theme.json` palettában (a prototípus `:root` tokenjei). A keretrendszerhez nem nyúlunk. **Nincs page builder, űrlap-, slider- és wishlist-plugin.**
2. **WooCommerce** klasszikus (shortcode-os) kosárral, pénztárral és fiókkal. Sablonok a child téma `templates/` mappájában: `global_header.html`, `global_footer.html`, `front_page_content.html`, `tax_product_cat_content.html`, `tax_product_brand_content.html`, `single_product_content.html`, `search_content.html`, `404_content.html`, `single_page_content.html`. Termékkártya: „Loop Product” `iu_pattern`.
3. **Egyedi blokkok** (`iucb_add_block`, `inc/blocks/…`): mega menü, puff kereső, kompatibilitás blokk (pod ↔ készülék a `pa_kompatibilitas` alapján), márkák A–Z, készletfigyelő („értesítést kérek”), kifutott termék + helyettesítők, kedvencek (saját kód user meta-ban, wishlist-plugin nélkül), 18+ korkapu.
4. **Többnyelvűség:** **WPML (WooCommerce Multilingual)** vagy **Polylang for WooCommerce**, nyelvenként saját URL-lel (`/sk/`, `/fr/`). **Élesítés előtt ki kell próbálni az `iu_theme`-mel** (a sablonok `iu_template` / fájl alapúak, a blokk-attribútumokban lévő szövegek és az `iu_pattern`-ek fordítása, a menük és az iu-woocommerce blokkok nyelvi kezelése). A felületi szövegek a child téma `.po` / `.mo` fájljaiban (text domain `firstvape`), az `iu_theme` magyar alapértelmezett feliratait az attribútumokban át kell írni.
5. **Piacok:** WooCommerce adóbeállítás (SK 23%, FR 20% – könyvelő ellenőrzi, OSS), szállítási zónák piaconként (SK: DPD bővítmény súlyalapú díjjal, Pickup pontok; FR: szállító TBD), a nyelv és a számlázási/szállítási ország összehangolása.
6. **Integrációk bővítménnyel** (fizetési kapu és szállító megengedett): Teya, SuperFaktúra, DPD (100×150 mm thermal címke); FR szállító bővítménye a választás után.
7. **Űrlapok** (kapcsolat, készletfigyelő, hírlevél): `iu/form` blokk, űrlap-plugin nélkül; a küldést a child téma `iu_form_submit_{formId}` szűrője végzi (keretrendszer-hiba miatt), és ugyanitt kerülnek az érdeklődők a HelloProVision CRM-be a leads hídon (`hpv_leads_map()` → `hpv_leads_send()`).
8. **SEO:** JSON-LD `Product` (a prototípusban már megvan: SKU, GTIN, márka, EUR ár) és `Organization` / `OnlineStore` a child témában, `hreflang` a nyelvi változatok között, a szűrt URL-ek canonical / noindex szabálya.
9. **Telepítés kódként** (`inc/setup.php`, verziózott lépések): oldalak piaconként (jogi oldalak helyőrzővel), menük, WooCommerce beállítások.
10. **Migráció:** VirtueMart termékek, képek, vásárlók importja (CSV sablon: `#/prototipus`), 301-es átirányítások a régi Joomla URL-ekről.

## Fejlesztői tanulság

JS-sztringben a lezáró script-taget mindig escape-elni kell: `'<\/script>'` (a termékoldal JSON-LD sablonja így készül, `views.js`). Különben ha a kód egy `<script>` blokkba kerül (egyfájlos változat, beágyazás, WordPress inline script), a böngésző ott lezárja a scriptet, és az oldal eltörik.
