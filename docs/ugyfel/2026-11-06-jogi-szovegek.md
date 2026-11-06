# Jogi szövegek a régi webshopból (2026-11-06)

**Kérés:** Johny, portál üzenet 2026-11-04 10:47: „Örülnék ha a jogi szövegek és ászf a régi webshopból lenne importálva az
újra a céges dolgokat kellene csak átírni benne és kicsit kozmetikázni a fizetés szálltás résznél, esetleg beleírni az
adultót hogy a termékeink nikotintartalma miatt a jogszabály előírja a kor ellenérzést”.

**Forrás:** a régi firstvape.sk (Joomla) szlovák oldalai, letöltve 2026-11-06:
`/sk/vseobecne-podmienky`, `/sk/oznamenie-o-ochrane-osobnych-udajov`, `/sk/platba-a-dorucenie`,
`/sk/informacie-o-suboroch-cookie`, `/sk/odtlacok`.

## Mi került a témába (`prototype/assets/js/i18n.js` → `wp-theme/firstvape/setup/data/i18n.json`)

- **Obchodné podmienky** – a régi ÁSZF szerkezete és szövege (Kto sme, uzatvorenie zmluvy, odstúpenie, reklamácia,
  prechod vlastníctva, 18+, riešenie sporov, orgán dozoru), a mostani cégadatokkal. Új pont: **3. Ceny, platba a
  doručenie** (Teya kártya / dobierka, Packeta, hivatkozás a Doprava a platba oldalra). A 7. pontban az **Adulto
  korellenőrzés** a 89/2016 Z. z. alapján. A régi „regisztráció kötelező” feltétel helyett: 18+ és nikotinos terméknél
  sikeres korellenőrzés. A régi számozási hiba (nincs 5. pont) javítva.
- **Odstúpenie od zmluvy** – a régi ÁSZF 3. pontja, a § 7 ods. 6 písm. e) zákona č. 102/2014 Z. z. kivétel (bontott
  e-liquid, pod) és a mintaformulár.
- **Ochrana osobných údajov** – a régi GDPR-tájékoztató a mostani cégadatokkal; új cél: **overenie veku (Adulto)**;
  a címzettek közt Packeta, Teya, SuperFaktúra, Adulto.
- A „Zástupný text” jelölés lekerült a három szlovák oldalról.

**Nem vettük át:**
- A régi cookie-oldalt: magyar nyelvű, más cégtől (Naturpont) átmásolt szöveg. A mostani szlovák cookie-oldal maradt.
- A régi „Platba a doručenie” szöveget: marketingszöveg 3–5 napos szállítással és 500 € feletti ingyenes szállítással,
  ami nem egyezik a mostani bolttal. A mostani Doprava a platba oldal maradt (a Packeta-díjak az árlistából jönnek).
- A francia oldalakat: a régi oldalon nincs francia jogi szöveg, a francia oldalak helyőrzők maradtak.

**Megerősítendő (az ügyféllel):**
- A cégadatok az ügyfél 10-20-i adatai (IČO 50707191, DIČ 2120427342, IČ DPH SK2120427342, Sro 31298/S). A régi oldalon
  a korábbi cég szerepel: John&Jen s.r.o., IČO 54 596 793, vložka 43717/S. A cégnév („John&Jen s.r.o.”) az új cégnél nincs
  megerősítve.
- A bíróság: „Okresný súd Banská Bystrica”, a régi cég bejegyzése és a /S végű betétszám alapján. Nincs megerősítve.
- A telefonszám (+36 20 483 3092) a régi oldalról van.

## Technika

A telepítő beágyazott listát (listaelemen belüli felsorolás) mostantól beágyazott lista-blokként ír (`firstvape_html_to_blocks`).
