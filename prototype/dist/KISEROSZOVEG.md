**Tárgy:** First Vape – az új webshop kattintható prototípusa

Szia!

Csatoltam az új First Vape webshop kattintható prototípusát. Ez még nem a kész webshop, hanem egy bemutató. Ezen nézzük át együtt a kinézetet, a menüt, a keresőt, a szűrőket és a vásárlás menetét, mielőtt nekiállunk a WordPress / WooCommerce-es építésnek.

A dizájn a mostani firstvape.sk sötét arculatára épül: ugyanazok a színek, a logó és a füstös hangulat, csak modernebb, gyorsabb és mobilon is kényelmes. A háttérben a füst lassan mozog, görgetésre áramlik.

**Hogyan nyisd meg**
- Töltsd le a `firstvape-prototipus.html` fájlt, és nyisd meg böngészőben (Chrome, Safari vagy Edge). Telefonon is működik.
- Ez nem élő oldal: a rendelés, a hírlevél és az üzenetek nem mennek el, nyugodtan kattints végig mindent.
- Jobb felül (telefonon a menü alján) válthatsz a szlovák és a francia változat között. A nyelvvel együtt vált az ÁFA, a szállítás és a jogi oldalak is.

**Amit érdemes kipróbálni**
1. **Menü:** vidd az egeret a főmenü pontjai fölé. Alkategóriák, márkák és slukkszám szerinti gyorslinkek nyílnak.
2. **Kereső:** írd be például: „Elfbar 40000”, „40k” vagy „mango”. Márkára, ízre, slukkszámra, nikotinra és kompatibilitásra is keres, nem csak a terméknévre.
3. **Szűrők:** az eldobható e-cigaretták oldalán szűrj márkára, ízre, slukkszámra, nikotinerősségre vagy árra.
4. **Termékoldal:** nyisd meg például az ELFA Pro Pod Kitet. Látod a színválasztást, a specifikációkat (SKU, EAN, súly), alatta pedig automatikusan a hozzá illő podokat.
5. **Kosár és pénztár:** a szállítási díjat a csomag súlyából számolja. A pénztár tetején a „Vyplniť ukážkové údaje” gombbal kitöltheted mintaadatokkal, és végigviheted a rendelést.

**Ami még helyőrző**
- A termékképek rajzolt illusztrációk, a márkák egyszerű feliratok. A valódi termékfotók és logók a termékfeltöltéskor kerülnek be.
- A termékek, az árak és a készletek mintaadatok.
- A jogi oldalak (ÁSZF, adatvédelem, elállás, cookie) szövege vázlat, a végleges szöveget a ti jogászotok adja.
- A kártyás fizetés (Teya), a számlázás (SuperFaktúra) és a DPD-címkenyomtatás itt csak felületként látszik. Ezeket a webshop építésekor kötjük be.

**Amire szükségünk van tőletek**
- **Visszajelzés a prototípusra:** mi tetszik, és mit változtatnátok. Elég pontokba szedve, akár képernyőképpel.
- **Néhány döntés:**
  - Ugyanaz legyen-e a bruttó ár Szlovákiában és Franciaországban, vagy változzon az ÁFA-kulccsal (SK 23%, FR 20%)?
  - Melyik futárcég szállítson Franciaországba?
  - Tudomásunk szerint Franciaországban 2025 óta tilos az eldobható e-cigaretta forgalmazása, ezért ott valószínűleg el kell rejtenünk ezt a kategóriát. Kérjük, egyeztessétek a jogászotokkal.
  - A szlovák felület tegező, a francia magázó (a francia webshopok szokása szerint). Így jó?
- **Termékadatok a csatolt CSV-sablonokban:**
  - `firstvape-termekimport-sablon.csv`: teljes termékimport;
  - `firstvape-ar-keszlet-frissites.csv`: gyors ár- és készletfrissítés.

**Következő lépés**
Ha jóváhagyod a prototípust, nekiállunk a WordPress / WooCommerce webshop építésének. A következő jóváhagyási pont a tesztoldal lesz, ott már valódi termékekkel és működő fizetéssel.

Ha bármi kérdésed van, írj itt a portálon.

Üdv,
Áron
HelloProVision
