# Válasz az ügyfélnek – képminőség (2026-10-21)

**Hova:** ügyfélportál → a „Képfeltöltés” kérés (CRM 6532633) válaszaként.
**Előtte:** az új képekkel frissített előnézet a portálon, és Laci feltölti a dev oldalra az új képcsomagot.
**Kiküldve:** 2026-10-21, Claude, Áron kérésére (előnézet-anyag 12990001; Laci feladata 75628266).

---

Szia Johny!

Igazad volt, köszi, hogy ilyen alaposan átnézted! Megnéztük mind a 386 képet, és két hibát találtunk:

1. **A háttér eltávolítása több képből a termék egy részét is kivágta.** Például az RF350 podoknál eltűnt a doboz,
   a GTX coiloknál 3 coil hiányzott, a Dojo dobozokon fekete folt maradt. Az átlátszó kupakok és üvegek pedig a sötét
   háttéren szürkének, piszkosnak látszottak.
2. **A nagykereskedő képei kicsik (800 px), és a felnagyítás elmosta őket.**

Mindkettőt javítottuk, és mind a 392 képet újra elkészítettük:
- a termékből most semmi nem vész el, a kupakok és üvegek tiszták maradnak;
- a felnagyítást mesterséges intelligenciás élesítés végzi (Real-ESRGAN). Ez a meglévő fotót élesíti, nem rajzolja újra
  a terméket, így a címkék és a kötelező figyelmeztetések az eredetiek maradnak.

**A ChatGPT-s képek:** nagyon jól néznek ki, de a ChatGPT újrarajzolja a terméket. A címke, a figyelmeztető szöveg vagy
egy apró részlet ilyenkor eltérhet a valóditól, és ezt képenként ellenőrizni kellene. Ezért a webshopban a valódi
fotókat használjuk, csak élesítve. Ha egy-egy terméknél mégis a ChatGPT-s képet szeretnéd, küldd el, és feltesszük.

**Elfliq:** köszi a tippet! A hivatalos oldalon 16 íz van tiszta, átlátszó hátterű képpel, ezeket onnan vettük:
Apple Peach, Blue Razz Lemonade, Blueberry, Blueberry Sour Raspberry, Cherry, Cherry Cola, Cola, Elfbull Ice,
Grape, Kiwi Passion Fruit Guava, Mango, Peach Ice, Pink Lemonade, Strawberry Ice, Strawberry Kiwi, Watermelon.
(Ezeken a gyári kép angol feliratú címkéje látszik.)

A másik 14 íz nincs fent a hivatalos oldalon: Pineapple Ice, Pineapple Mango Orange, Banana Ice, Lemon Lime,
Frozen Strawberry, Red Berries, Green Mint, Sour Apple, Rinbo Bonbon Tutti Frutti, Triple Melon, Menthol, Classic Creme,
Cotton Candy, Pina Colada. Ha a forgalmazótól van róluk kép, vagy le tudjátok fotózni őket (telefon is jó, világos
háttér előtt), küldd el, és ugyanígy elkészítjük. Addig a mostani, élesített képükkel mennek.

Az új képeket feltöltöttük az előnézetbe a portálon, és a fejlesztői oldalra is felkerülnek
(https://dev.otletoldal.hu/firstvape/). Kérlek, nézd át újra, és írd meg, ha valamelyik még nem jó – lehetőleg a
termék nevével.

Áron – HelloProVision
