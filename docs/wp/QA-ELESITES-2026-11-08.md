# First Vape – élesítés előtti adat-QA (2026-11-08)

Csak olvasás/ellenőrzés az élesítés előtt. Az éles CRM-hez és az éles webshophoz nem nyúltunk.
Vizsgált: `prototype/csv/firstvape-woocommerce-import.csv` (392 sor) és a téma generált adatai
(`wp-theme/firstvape/setup/data/catalog.json`, `products.json`, `i18n.json`).

## Eredmény: ZÖLD

- **392 termék**, mind `simple`. Egyedi SKU, nincs duplikátum, nincs üres SKU.
- **Ár:** minden sor ára > 0, és **pontosan egyezik** az ügyfél okt. 20-i forrásfájljával
  (`prototype/csv/ugyfel/WooCommerce-CSV-2026-10-20.csv`): 0 eltérés a 392 közös SKU-n.
- **Kép:** minden sornak van `Images` értéke (0 kép nélküli termék).
- **Kategória / márka / cross-sell:** minden kategória-útvonal és márka létezik a `catalog.json`-ban;
  minden cross-sell valós SKU-ra mutat (0 lógó hivatkozás).
- **Nov. 1-i 6 új termék** benne van: `A&L-SUCUBES-30` (A&L Sucube V2 30 ml) + 5 OBVIOUS nikotin booster.
- **Nyelv:** mind a 392 termék SK **és** FR rövid és hosszú leírása kitöltve (0 üres). Felületi i18n:
  `sk` és `fr` egyaránt 349 kulcs.
- **Attribútum-taxonómiák konzisztensek:** a téma (`FIRSTVAPE_ATTRS` a `inc/catalog.php`-ban, és az
  `inc/setup.php` attribútum-regisztráló) és az import CSV végig a **szlovák** slugot használja
  (`pa_prichut`, `pa_nikotin`, `pa_objem`, `pa_pocet-potiahnuti`, `pa_system`, `pa_farba`, `pa_odpor`),
  így a WooCommerce-import nem hoz létre dupla attribútumot, és a szűrők találnak.

## Megerősítésre vár (ügyfél / Áron dönti – nem adat-hiba)

1. **3 eldobható kimaradt** (`ELFBAR600-BRL`, `ELFBAR600-PL`, `ELFBAR600-BSR`), kategória nélkül. Az
   „Eldobható e-cigaretták” kategóriát okt. 20-án kivettük a fából. Szándékos (vélhetően FR jogi ok:
   Franciaország tiltja az eldobható vape-et)? A .sk piacon kellenek-e?
2. **2 terméknév még francia:** „Fiole Vide Chubby 120ml / 180ml” (`FIOLE-VIDE-CHUBBY-120/180`).
   Javasolt SK név: „Prázdna fľaša Chubby 120 / 180 ml” (állapotjelentés, 2026-10-23, 14. pont) –
   ügyfél-jóváhagyásra vár, ezért nem írtuk át.
3. **Készlet:** minden termék `In stock? = 1`. A valódi készlet / „rendelésre” / „elfogyott” az ügyfél
   adata (állapotjelentés 11. pont).

## Jegyzet (nem bug)

- A `catalog.json` `attributes[].tax` magyar slugokat tartalmaz (`pa_szin`, `pa_ellenallas`…), mert a
  prototípus `data.js`-éből másolódik. A **WP-téma ezt nem olvassa** (saját SK-map a `catalog.php`-ban),
  csak a prototípus használja, ezért nem írjuk át (a prototípus törne, a WP-nek semmit nem adna).

## Élesítési blokkolók (külső, nem repó-munka)

- **ELIN tűzfal:** a külföldi IP-ket kitiltja a kosárból/pénztárból → SK/FR vásárló nem tud rendelni
  (Laci + ELIN országszűrés). Fő blokkoló.
- ELIN tárhely/domain hozzáférés (firstvape.sk/.fr), Packeta/Teya/SuperFaktúra/Adulto **éles** kulcsok,
  jogi szövegek + 3 cégadat megerősítése (cégnév, cégbíróság, telefon).
- **Packeta nov. 4-i árlisták:** a valódi díjak élesítéskor a **Packeta pluginba** kerülnek, a téma
  „minta” szállítási módja kikapcsol (`docs/wp/TELEPITES.md`) – nem a téma kódjába.
