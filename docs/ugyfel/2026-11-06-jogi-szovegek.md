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

**Megerősítve (2026-11-16):**
- Cégnév: **SP & ES s. r. o.** (Johny, portál 2026-11-06; a „John&Jen s.r.o.” a korábbi cég neve volt). Az ORSR kivonata
  (Okresný súd Banská Bystrica, oddiel Sro, vložka 31298/S, IČO 50 707 191, sídlo Banícka 703/16, 990 01 Veľký Krtíš,
  základné imanie 5 000 EUR) egyezik a témában lévő adatokkal. A név mindenhol átírva (SK és FR jogi oldalak, lábléc,
  kapcsolat, szerkezeti adatok, admin alapérték; a telepítő a régi elmentett alapértéket is átírja), az FR impresszumban
  a törzstőke és a cégjegyzék is.
- Bíróság: Banská Bystrica („a besztercei cégjegyzékben van”, Johny, 2026-11-06).
- Telefonszám +36 20 483 3092: marad („a telefonszám az enyém, de teljesen jó lesz”, Johny, 2026-11-06).
- Teya: az ügyfél az oldalon maradó (beágyazott) fizetést kéri – a szöveg ezért „zabezpečená platobná brána Teya”
  (nem „platobná stránka”); a Teya-bővítmény beállítása élesítéskor.

## Technika

A telepítő beágyazott listát (listaelemen belüli felsorolás) mostantól beágyazott lista-blokként ír (`firstvape_html_to_blocks`).
