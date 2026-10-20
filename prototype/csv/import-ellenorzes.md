# Termékimport – ellenőrzés (az ügyfél javított fájlja, 2026-10-20)

Generálta: `prototype/tools/client_import.py`. A tisztított importfájl: `prototype/csv/firstvape-woocommerce-import.csv`.

| | |
|---|---|
| Termék | 392 (mind SIMPLE) |
| Márka | 12 (A&L, CHUBBY, DRIFTER, EFEST, ELFBAR, EXTRAPURE, FIVE PAWNS, GEEKVAPE, LIQUIDEO, OBVIOUS, SAIYEN, VAPORESSO) |
| Kép | 392 termékhez (386 egyedi kép, mind az adns-grossiste.fr nagykereskedő oldaláról) |

## Javítani kell a fájlban (az ügyfél)

**3. Eldobható e-cigaretták – kimaradnak, nincs vele teendő** (az ügyfél kérése, 2026-10-20: az EU 2027-től tiltja; az Eldobható főkategória sincs):

- `ELFBAR600-BRL` – ELFBAR 600 Blue Raspberry Lemonade
- `ELFBAR600-PL` – ELFBAR 600 Pink Lemonade
- `ELFBAR600-BSR` – ELFBAR 600 Blueberry Sour Raspberry

**6. Súly:** egyik terméknél sincs kitöltve (Weight (kg)). A Packeta-díjhoz és a címkéhez kell. Az előnézetben kategóriánként becsült értékkel számolunk.

**7. Készlet:** 392 darab-értékek (10 db: 392 termék) – mintaszámnak tűnnek; élesítés előtt a valódi készlet kell.

**8. Leírások:** a „Description” oszlop a nagykereskedő angol szövege. Ez a webshopba így nem kerül: a szlovák és francia leírást mi írtuk meg (az ügyfél kérése, 2026-10-20) – `csv/leirasok-sk-fr.json`.

**9. Francia terméknév:** `FIOLE-VIDE-CHUBBY-120` (Fiole Vide Chubby 120ml), `FIOLE-VIDE-CHUBBY-180` (Fiole Vide Chubby 180ml) – szlovák / semleges név kell (pl. „Prázdna fľaša Chubby 120 ml”).

## Amit mi rendeztünk az importnál (az ügyfélnek nincs teendője)

- Kategória: a fájl angol kategóriái a szlovák kategóriákhoz kerültek (`kategoria-osszerendeles.csv`), dupla kategória nem jön létre.
- A „PREFILLED PODS > ELFBAR ELFA / VAPORESSO DOJO / ELFBAR JOINONE / DRIFTER BAR” sorok a Predplnené pody rendszer szerinti alkategóriáiba kerültek, a rendszer a „Systém” attribútum is (szűrhető) – ahogy kérted.
- Az EFEST akku és töltők az „Akkumulátorok / töltők” kategóriába kerültek (a fájlban „OTHER ACCESSORIES”): `EFEST-BATTERY-DOUBLE`, `EFEST-PRO-CHARGER`, `EFEST-SLIM-CHARGER`.
- Szóközök: 48 kategória-, 173 attribútum- és 37 név/SKU-értéknél a végén vagy közepén felesleges szóköz volt (pl. „Nicotine ”, „Capacity ”, „Ohm ” attribútumnév – ezek két külön attribútumot hoztak volna létre). Javítva.
- Nikotin: a fájl „0.02” értéke 20 mg/ml (2 %); a webshop így írja ki: „20 mg/ml (2 %)”.
- Ellenállás: a „0.8” → „0,8 Ω”; ahol nincs attribútum, a névből (pl. „0.6ohm”).
- Rendszer (Systém): a terméknévből, a fájl cross-sell kapcsolataival összevetve (ELFA, JOIN ONE, DOJO BLAST, DRIFTER BAR, NIO, RF350, GTX, APEX, AEGIS BOOST, GEEKVAPE J / Q / S, GTI / iTANK T, Z SUBOHM). Ellenőrzésre: az import CSV „Attribute … Systém” oszlopa.
- Ugyanaz a kép több terméknél (3 esetben, pl. pack-of-2-j-cartridges-5ml-geekvape.jpg: GEEKVAPE-J-CARTRIDGE-0.4, GEEKVAPE-J-CARTRIDGE-0.6, GEEKVAPE-J-CARTRIDGE-0.8, GEEKVAPE-J-CARTRIDGE-1.2; pack-of-2-cartridges-2ml-s-geekvape.jpg: GEEKVAPE-S-CARTRIDGE-0.8, GEEKVAPE-S-CARTRIDGE-1.2; pack-of-5-coils-z-boost-xm-geekvape.jpg: GEEKVAPE-XM-COIL-0.15, GEEKVAPE-XM-COIL-0.2, GEEKVAPE-XM-COIL-0.4) – ellenőrizendő, jó-e.

