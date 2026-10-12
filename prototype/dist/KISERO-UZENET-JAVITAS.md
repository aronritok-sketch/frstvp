# Kísérőüzenet – First Vape webshop-előnézet, javított változat

**Hova:** ügyfélportál → Tartalom → a meglévő „First Vape – az új webshop előnézete” anyag új verziója → „Zip feltöltése”:
`firstvape-elonezet.zip`. Ha a portál új verziót nem enged, új anyagként, a lenti címmel.
A Fájlok közé kerül (a zipbe a portál nem enged CSV-t): `prototype/csv/kategoria-osszerendeles.csv`,
`prototype/csv/firstvape-termekimport-sablon.csv`, `prototype/csv/firstvape-ar-keszlet-frissites.csv`.

**Anyag címe:** First Vape – az új webshop előnézete (javított változat)

---

Szia!

Köszi a részletes visszajelzést! Minden pontot átvezettünk, a javított előnézet itt van a portálon. Az elrendezés
és a megjelenés maradt, csak a kért pontosítások kerültek bele.

**Mobil**
- A főoldali magyarázó kártyák két oszlopba kerültek és alacsonyabbak lettek, a szakaszok közti térköz kisebb, így hamarabb
  elérhetők a termékek.
- A pénztár mezői, a szállítási és a fizetési kártyák tömörebbek. A név, a vezetéknév, az irányítószám és a város két oszlopban van.
- A négy rendelési lépés egy sorba fér, oldalirányú görgetés nélkül.

**Laptop**
- A termékkártyákon az ár, a készlet és a gomb mindig ugyanabban a magasságban van, a gomb a kártya teljes szélességében.
- A pénztárban a jobb oldali összesítő görgetés közben látható marad, ha elfér a képernyőn.

**Kategóriák, márkák, szűrők**
- A kategóriafa a kért hét pontra épül: Készülékek / Kitek (3 alkategória), Előretöltött podok, E-liquidek (5 alkategória),
  Eldobható, Kiegészítők (5 alkategória), Márkák, Akciók. A Geekvape Q Pod 0.4 / 0.6 / 0.8 ohm a Kiegészítők között van.
- A menüben és a listákban csak azok a kategóriák és márkák jelennek meg, amelyekhez van termék.
- Minden kategóriánál csak az ott értelmezhető szűrők látszanak (pl. e-liquideknél íz, nikotin, kiszerelés; kiegészítőknél ellenállás).
- A slukkszám-szűrő tartományokban keres. Ezt a szűrő alatt egy mondat jelzi, és a slukkszám mindenhol gyártói becslésként szerepel.
- A Márkák főmenüpont alatt egy márkára kattintva az összes terméke megjelenik, típustól függetlenül.
- A felirat „Akciók”, a menüben nincs kiemelve.

**Termékoldal**
- Az íz, a szín, a kiszerelés és a nikotin akkor is jól látható, ha nincs a terméknévben. A nikotin „20 mg/ml (2 %)” formában szerepel.
- Minden termék külön SIMPLE termék, ahogy a CSV-ben. Ahol több szín vagy íz van, a termékoldal a testvértermékekre linkel.
  A „Možnosti” gomb helyett a kártyán az a művelet áll, ami történik (Do košíka, Upozorniť ma, Náhrady).
- A termékoldal alján a kompatibilis podok, patronok és készülékek „Systém ELFA” jellegű rendszerjelöléssel jelennek meg.

**Kosár és pénztár**
- A kosárban a mennyiség mellett jól látható „Odstrániť” gomb van, a csomag súlya sehol nem jelenik meg.
- Packeta-szállítás: átvételi pont vagy Z-BOX választása kereséssel (az éles oldalon a Packeta saját térképes választója lesz),
  vagy házhoz szállítás, ott eltérő szállítási címmel.
- Hiányzó vagy hibás adatnál a piros keret alatt rövid szöveges hibaüzenet jelenik meg.
- A mintaadat-kitöltő blokk lekerült.

**Szövegek**
- A márkablokk címe „Naše značky” (Márkáink).
- A szagra, a megtakarításra és az eldobható készülékek töltésére vonatkozó általános állításokat óvatosabbra írtuk át.

**Kategóriák összerendelése**
A Fájlok közé feltöltöttük a `kategoria-osszerendeles.csv`-t. Ebben minden webshop-kategória mellett ott a szlovák és a
francia név, valamint egy javasolt angol név. Az import az angol névből a szlovák kategóriát választja, így nem jön létre dupla
kategória. **Kérlek, küldd el az Excel/CSV-t, amire hivatkoztál.** Ebből írjuk be a pontos angol neveket, és a termékimport
előtt egyeztetjük, ha valami eltér.

**Mire figyelj nézegetés közben?**
- A termékek, a képek, az árak és a készlet még mindig mintaadatok. A valódi termékfotók, árak és készletadatok a ti fájlotokból
  kerülnek be a termékimportnál.
- A Packeta díjai, a szállítási idők és az átvételi pontok mintaértékek („vzor”). A pontos díjakat a Packeta-szerződésetek alapján állítjuk be.

**Miben kell még döntenetek?**
- Az ELFBAR NIO kit besorolása: ha a készülék egészében eldobható, az Eldobható kategóriába kerül, ha cserélhető podos, a
  Készülékek / Előretöltött pod rendszerek közé. Kérlek, írd meg, melyik.
- A Packeta díjai és szolgáltatásai Szlovákiában és Franciaországban (átvételi pont, Z-BOX, házhoz szállítás, utánvét).

**Mi a következő lépés?**
Ha így rendben van, hagyd jóvá itt a portálon. Utána építjük meg az éles WordPress / WooCommerce webshopot a ti termékadataitokkal.
Élesítés előtt végigteszteljük a szállítási díjakat, az ingyenes szállítás határát, az utánvét díját, a Teya-fizetést, a
SuperFaktúra-számlát és a rendelési visszaigazolást. Utána tudsz egy teljes tesztrendelést végignézni mobilon és laptopon is.

Köszi!
Áron – HelloProVision
