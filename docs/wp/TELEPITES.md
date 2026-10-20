# First Vape – a WordPress-téma telepítése (Laci)

A `firstvape` child téma kész: a jóváhagyott előnézet kinézete és működése WordPress + WooCommerce alatt,
az ügyfél 395 termékével és a feldolgozott képekkel. Ez a leírás a dev / staging / éles telepítés lépései.
A felépítés és a kód: [`DEVELOPER.md`](DEVELOPER.md). A teljes teendőlista: `docs/fejlesztes/FirstVape-WooCommerce-Laci.pdf`.

## Amire szükség van

| Mi | Honnan |
|---|---|
| WordPress 6.5+ (tesztelve: 7.1.2), PHP 8.1+ (tesztelve: 8.4), MySQL / MariaDB | tárhely |
| WooCommerce 9.6+ (a márkák miatt; tesztelve: 11.1.2) + szlovák és francia nyelvi csomag | wordpress.org |
| `iu_theme` 0.2.2 (alap téma) | hlprv repó `themes/iu_theme` (kiadás: `iu_theme-v0.2.2`), `HPV_GITHUB_TOKEN` a wp-config.php-ba |
| `dist/firstvape-tema.zip` | frstvp repó / CRM-feladat melléklete |
| a termékképek: `dist/firstvape-media.zip` (vagy a CRM-ben: `firstvape-termekkepek-1200.zip`) | frstvp repó / CRM |

Más bővítmény a telepítéshez nem kell. Élesítésig jön: Packeta, Teya (fizetési kapu), SuperFaktúra, WP Mail SMTP,
Yoast SEO. **WPML / Polylang nem kell** (lásd lent: két domain).

## Telepítés (dev / staging)

1. WordPress szlovákul (Beállítások → Általános → A webhely nyelve: Slovenčina), a francia nyelvi csomag is
   (Vezérlőpult → Frissítések → Fordítások, vagy `wp language core install fr_FR` és `wp language plugin install woocommerce sk_SK fr_FR`).
2. WooCommerce bekapcsolva (a beállító varázsló kihagyható: a téma telepítője mindent beállít).
3. Megjelenés → Témák → Téma feltöltése: előbb az `iu_theme`, utána a `firstvape-tema.zip`; a **First Vape** témát kapcsold be.
4. A termékképek: a `firstvape-media.zip`-et csomagold ki ide: `wp-content/uploads/firstvape-media/`
   (a zipben `p/<termék>.webp`; a CRM-es zipben `termekkepek/<termék>.webp` – mindkettőt felismeri).
5. Megjelenés → First Vape → **Telepítés indítása** (kb. 5 perc, a 395 terméket 25-ös kötegekben). Vagy WP-CLI-vel:

   ```
   wp firstvape setup --media=firstvape-media.zip
   wp firstvape check
   ```

A telepítő beállítja: EUR, bruttó árak, ÁFA SK 23 % / FR 20 % (a vásárló országa szerint), súly kg-ban, permalinkek,
WooCommerce-oldalak **klasszikus** (shortcode-os) kosárral, pénztárral, fiókkal, szlovák végpontokkal; 7 attribútum,
a 7 főmenüpontos kategóriafa (szlovák név + francia név metában), 12 márka, 395 termék képpel, az ügyfél ajánlásai
(cross-sell), SK és FR jogi oldalak (helyőrző szöveggel), Úvod, Akcie, Značky, Obľúbené, Blog, 4 cikk SK + FR,
szállítási zónák (Slovensko, Francúzsko) minta díjakkal, utánvét.

A második futás nem ír át semmit. Amit az adminban szerkesztettek, azt kihagyja (`⚠ kihagyva`); a `--force` / a
„Felülírás” pipa mindent felülír (az árat és a készletet is).

## Két domain: firstvape.sk és firstvape.fr

Egy WordPress szolgálja ki mindkettőt (Áron döntése, 2026-10-19). **A téma maga kezeli**, nem kell hozzá WPML:

- Megjelenés → First Vape → Adatok → **Szlovák domain**: `firstvape.sk`, **Francia domain**: `firstvape.fr`.
- Mindkét domain ugyanarra a WordPress-telepítésre mutasson (alias / parkolt domain), mindkettőn SSL.
- A `.fr` domainen: francia felület (WordPress és WooCommerce szövegei is), francia ÁFA (20 %), francia szállítási
  zóna, Franciaország az egyetlen választható ország, a CGV / mentions légales. A `.sk` ugyanígy szlovákul.
- A WordPress a második domainen minden linket, képet, CSS-t és JS-t a látogató domainjére ír át (a betűk CORS miatt).
- Közös: termékek, készlet, kategóriák, márkák, kosár / pénztár / fiók oldalak, rendelések (egy rendeléslista,
  a rendelésnél `_fv_lang` = sk / fr – a későbbi levelek is ezen a nyelven mennek).
- A kosár és a belépés sütije domainenként külön van (a két piacon más az ÁFA és a szállítás – ez így helyes).
- `hreflang` a két domain megfelelő oldala között (ugyanaz az útvonal), a jogi oldalaknál a párjukra (fv_pair).
- Search Console: két tulajdon (mindkét domain), két sitemap.
- Dev / staging (egy domain): a francia piac `?lang=fr`-rel érhető el (süti), vissza `?lang=sk`.
- Ha mégis WPML kerül fel, a téma a WPML nyelvét használja, és a domain-kezelést átadja neki.

## Élesítés előtt (a teendőlista 08–09. fázisa és az Élesítés 1/4–4/4)

- **Packeta** bővítmény (API-kulcs az ügyféltől, a portálon): a szállítási módjai a zónákba; a téma minta módját
  („First Vape – Packeta (minta)”) a zónákban kapcsold ki. Addig a minta mód súlysávos díjjal és átvételi pont
  választóval működik (API-kulccsal a Packeta widgettel: Adatok → Packeta API-kulcs).
- A díjak a kérdőívből → utána Adatok → „A díjak véglegesek” pipa (eltűnik az „orientačné” megjegyzés).
- **Teya** fizetési kapu (teszt, majd éles kulcs), **SuperFaktúra** (számla a rendelés nyelvén, IČO / DIČ / IČ DPH:
  `_billing_fv_id`, `_billing_fv_vat` a rendelés metájában – a bővítmény mezőihez kötni).
- Utánvét díja piaconként: Adatok (üresen a minta 1,50 €).
- Jogi szövegek (ügyfél jogásza): az oldalak szerkeszthető blokkok, a `legal-ph` bekezdést töröld.
- Súly: most kategóriánkénti becslés (`_fv_weight_estimated` = yes) – az ügyfél adataiból felülírni.
- A 26 gyenge termékkép (`prototype/csv/termekkepek-minoseg.csv`) és a 3 kép nélküli ELFBAR 600 – ha az ügyfél küld újat.
- `wp firstvape check` / Megjelenés → First Vape → Élesítési ellenőrzés: mi hiányzik még.

## Termékek frissítése (az ügyfél javított fájljából)

```
python3 prototype/tools/client_import.py                    # az ügyfél CSV-jéből (csv/ugyfel/) → products.js + import CSV + hibalista
node tools/wp/build_data.mjs                                # → wp-theme/firstvape/setup/data/*.json
python3 tools/wp/build_theme.py                             # → dist/firstvape-tema.zip (új zip a tárhelyre)
wp firstvape setup --step=products                          # új termékek + a nem szerkesztett nevek / leírások
wp firstvape setup --step=products --force && wp firstvape setup --step=cross   # árak és készlet is
```

A WooCommerce saját CSV-importere (`prototype/csv/firstvape-woocommerce-import.csv`) **nem** ajánlott a meglévő
termékekre: az „Images” oszlopban fájlnév van (nem URL), ezért a sorok hibával megállnak, és a kategória is elveszhet
(tesztelve, 2026-10-20). Új termékhez, kép nélkül, működik; az attribútumok (Príchuť, Nikotín …) a téma globális
attribútumaira kerülnek.

## Ellenőrzés (helyben, ahogy a téma készült)

```
tools/wp/dev-wp.sh /tmp/wp ../hlprv dist/firstvape-media.zip      # teszt-WordPress (MariaDB, WP-CLI)
(cd /tmp/wp && PHP_CLI_SERVER_WORKERS=6 php -S localhost:8891 -t /tmp/wp /tmp/fv-router.php)
BASE=http://localhost:8891 node tests/wp/e2e.mjs                    # 65 ellenőrzés
BASE=http://localhost:8891 WP="wp --allow-root --path=/tmp/wp" WPUSER=admin WPPASS=admin node tests/wp/editor-check.mjs
```
