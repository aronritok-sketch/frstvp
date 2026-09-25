# First Vape – WooCommerce frontend prototípus (HTML)

A Joomla/VirtueMart alapú First Vape webshop új frontendjének kattintható HTML prototípusa.
Jóváhagyás után ebből készül a WordPress / WooCommerce téma.

## Megnyitás

Build lépés nincs. Nyisd meg az `index.html` fájlt böngészőben, vagy indíts helyi szervert:

```bash
cd prototype
python3 -m http.server 8000
# http://localhost:8000
```

A prototípus egyetlen oldalas alkalmazás, hash alapú útvonalakkal (`#/kategoria/eldobhato`, `#/termek/...`).
A WordPress témában ezek valódi permalinkek lesznek.

## Oldalak

| Oldal | Útvonal | WordPress / WooCommerce megfelelő |
|---|---|---|
| Főoldal | `#/` | `front-page.php` |
| Kategória + szűrők | `#/kategoria/eldobhato` | `taxonomy-product_cat.php`, layered nav (`filter_pa_*`) |
| Szűrt lista | `#/kategoria/eldobhato?puff=40000` | szűrt archív URL |
| Márkaoldal | `#/marka/elfbar` | `taxonomy-product_brand.php` (WooCommerce Brands) |
| Márkák A–Z | `#/markak` | oldal sablon |
| Akciók | `#/akciok` | `wc_get_product_ids_on_sale()` |
| Keresés | `#/kereses/Elfbar%2040000` | kiterjesztett termékkereső |
| Termékoldal | `#/termek/<slug>` | `single-product.php` |
| Kosár / pénztár | `#/kosar`, `#/penztar` | WooCommerce cart / checkout |
| Fiók | `#/fiok`, `#/fiok/rendelesek`, `#/fiok/kedvencek` | My Account |
| Információs oldalak | `#/oldal/<slug>` | WordPress oldalak |
| Fejlesztői áttekintés | `#/prototipus` | – |

## Adatmodell (a brief alapelve szerint)

- **Kategória = mi a termék** → `product_cat` (hierarchikus, több kategória termékenként)
- **Márka = ki gyártja** → `product_brand` (WooCommerce beépített Brands taxonómia)
- **Attribútum = milyen változat** → `pa_iz`, `pa_nikotin`, `pa_kiszereles`, `pa_puff`, `pa_kompatibilitas`, `pa_szin`
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
- Pénztár: DPD házhoz / Pickup, Teya kártyás fizetés, utánvét, cégadatok (IČO/DIČ), 18+ megerősítés
- 18+ korellenőrző ablak, hírlevél, lábléc a brief szerinti blokkokkal

## Ami szándékosan helyőrző

- A termékképek vektoros illusztrációk (típus és ízszín alapján). A témában a WooCommerce termékképek kerülnek a helyükre.
- A márkalogók tipográfiai feliratok. A témában a márka taxonómia képmezője adja őket.
- A jogi oldalak szövege vázlat; a végleges szöveget az ügyfél adja.
- A Teya, SuperFaktúra és DPD integrációk bővítményekkel működnek majd, a prototípusban csak a felületük látszik.
