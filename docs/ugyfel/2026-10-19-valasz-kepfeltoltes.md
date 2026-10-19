# Válasz az ügyfélnek – „Képfeltöltés” kérés + termékfájl (2026-10-19)

**Hova:** ügyfélportál → a „Képfeltöltés” kérés (CRM: Firstvape → Kérések) válaszaként, nem e-mailben.
**Melléklet:** `prototype/csv/javitando-a-termekfajlban.csv` (Excelben nyitható, soronként mit kell javítani).
**Előtte:** az új előnézet (`prototype/dist/firstvape-elonezet.zip`) új portál-anyagként (a régi már jóvá van hagyva), és a kérdőív.
**Kiküldve:** 2026-10-19, Claude, Áron kérésére.

---

Szia Johny!

Köszi a mintát és a termékfájlt, mindkettőt feldolgoztuk.

**Termékképek**
- Mind a 392 termékképet átalakítottuk a mintád szerint: átlátszó háttér, bal felső sarokban FIRSTVAPE logó. A webshop sötét
  hátterén így fehér keret nélkül jelennek meg.
- Az előnézetet feltöltöttük a portálra („Webshop-előnézet a saját termékeiddel és képeiddel”), már a te termékeiddel és ezekkel a
  képekkel. A termékkártyákon és a termékoldalakon is megnézheted, hogyan mutatnak, például: E-liquidy → Hotové liquidy 10 ml,
  vagy bármelyik ELFA pod. Ha így jó, ott hagyd jóvá; ha valamit másképp szeretnél, írd meg ott.
- Feltöltéskor az átlátszó háttér megmarad: a képeket WebP-formátumban töltjük fel, és semmi nem alakítja őket JPEG-re.

**A gyengébb képek**
- 36 képet feljavítottunk (felnagyítás, élesítés): ezeken a termék túl kicsi vagy életlen volt.
- 26 képnél a forráskép annyira kicsi, hogy a javítás után is homályos marad: 22 Elfliq liquid és a 4 Geekvape J Cartridge.
  Ha a mintaként küldött Elfliq-képed jobb fotóból készült, kérlek, küldd el a többi ízről is ugyanilyet (vagy a gyártói fotókat),
  és ugyanígy elkészítjük őket. A listát a mellékelt táblázatban találod.
- Az Elfliq Strawberry Kiwi a fájlban a Frozen Strawberry képét kapta – ehhez is a helyes kép kell.

**Termékfájl**
A fájlt betöltöttük, a kategóriákat a szlovák webshop kategóriáihoz rendeltük, dupla kategória nem jön létre. Pár dolgot viszont
javítani kell a fájlban, mielőtt élesben importáljuk – soronként a mellékelt táblázatban:
1. 5 SKU kétszer szerepel (pl. ELFA Pro Pod Pineapple Lemon és Pink Lemonade ugyanazzal az SKU-val), az import egymásra írná őket.
2. A Cross-sells oszlopban 169 nem létező SKU van – valószínűleg Excel-lehúzás számolta tovább a végüket.
3. A 3 ELFBAR 600 terméknek nincs kategóriája: az Eldobható e-cigaretták közé tettük.
4. Az ELFA Pro podok 0 mg-os és 20 mg-os változata ugyanazt a nevet viseli, és az 5 OBVIOUS booster is; a névben legyen ott a különbség.
5. Súly egyik terméknél sincs – a Packeta-díjhoz kell.
6. A készlet szinte mindenhol 10 db: ha ez mintaszám, élesítés előtt a valódi készlet kell.
7. A leírások a nagykereskedő angol szövegei, ezek így nem kerülhetnek ki. Szlovák és francia leírás kell – ha szeretnéd, megírjuk.

**Kérdőív**
A portálon küldtünk egy rövid kérdőívet is: Packeta-díjak, Teya, SuperFaktúra, árak SK / FR, francia domain, jogi szövegek,
cégadatok, tárhely. Ezek kellenek az éles webshop beállításához; menet közben elmentheted és később folytathatod.

**Két kérdés**
- A fájlban az előretöltött podok rendszerenként alkategóriában vannak (ELFBAR ELFA, VAPORESSO DOJO, ELFBAR JOINONE, DRIFTER BAR).
  A korábbi kérésed szerint ezek egy kategóriában vannak, rendszer és márka szerint szűrhetően. Maradjon így?
- Az EFEST akkut és töltőket az Akkumulátorok / töltők kategóriába tettük (a fájlban „Other accessories”). Jó így?

Köszi!
Áron – HelloProVision
