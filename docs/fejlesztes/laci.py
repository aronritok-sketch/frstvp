"""
Laci teendői a First Vape WooCommerce-webshop megépítéséhez (iu_theme + firstvape child téma), az ügyfél által
jóváhagyott előnézet alapján (2026-10-15). Egy forrás két kimenethez: a PDF (build.py + pdf.js →
FirstVape-WooCommerce-Laci.pdf) és a CRM-feladat ellenőrzőlistája (crm.py). Az elemek mezői: id (a pipa kulcsa, ne
változtasd), who, title, desc (HTML), code (kódrészletek), check („Kész, ha”, HTML). A szöveg magyar, tegező; a HTML
általunk írt, megbízható szöveg.
"""

REPO = "https://github.com/aronritok-sketch/frstvp/blob/claude/first-vape-joomla-wordpress-4age1i/"
HLPRV = "https://github.com/aronritok-sketch/hlprv/blob/claude/great-gauss-jba4b5/"

# Amit a prototípusból kapsz (a frstvp repóban)
SOURCES = [
    ("prototype/index.html + assets/", "a jóváhagyott előnézet (megnyitás: cd prototype && python3 -m http.server)"),
    ("prototype/README.md", "piacok, adatmodell, oldalak ↔ sablonok, kategóriafa, tesztlista"),
    ("#/prototipus oldal", "minden nézet melyik iu_theme-sablonnak / WooCommerce-oldalnak felel meg"),
    ("prototype/assets/js/data.js", "kategóriák (SK, FR, EN név, slug), márkák, attribútumok, mintatermékek, szállítási módok"),
    ("prototype/assets/js/core.js", "szűrők kategóriánként (FV.catFacets), slukkszám-sávok, nikotin-felirat, kapcsolódó termékek"),
    ("prototype/assets/js/i18n.js", "minden SK és FR felületi szöveg, jogi helyőrzők, piaconkénti beállítások"),
    ("prototype/assets/css/style.css", "színek, betűk, komponensek, mobil töréspontok"),
    ("prototype/csv/", "termékimport-sablon, ár- és készletfrissítés, kategória-összerendelés (EN ↔ SK)"),
]

# Kategóriafa (az ügyfél véglegesítette, 2026-10-15)
TREE = [
    ("keszulekek", "Zariadenia / kity", "Devices / Kits", "eloretoltott-pod-rendszerek · utantoltheto-pod-rendszerek · mod-tank-kitek"),
    ("eloretoltott-podok", "Predplnené pody", "Prefilled Pods", "– (szűrés márka szerint)"),
    ("e-liquidek", "E-liquidy", "E-liquids", "nikotin-booster · kesz-liquidek-10ml · aromak · shortfill · longfill"),
    ("eldobhato", "Jednorazové e-cigarety", "Disposable E-cigarettes", "–"),
    ("kiegeszitok", "Príslušenstvo", "Accessories", "ures-podok · porlasztok · tankok · akkuk-toltok · egyeb-kiegeszitok"),
]

OPEN = [
    "Az ügyfél Excel/CSV-je (valódi termékek, fotók, árak, készlet, a pontos angol kategórianevek) – a kérdéssorban kérjük.",
    "ELFBAR NIO: Eldobható vagy Készülékek / Előretöltött pod rendszerek – az ügyfél dönt.",
    "Packeta-szerződés: API-kulcs, díjak SK és FR, ingyenes szállítás határa, utánvét díja, FR szolgáltatások.",
    "Teya: melyik WooCommerce-kapcsolatot adják (bővítmény vagy fizetési oldal), teszt- és éles kulcsok.",
    "SuperFaktúra: fiók, API-kulcs, számlasor, nyelv (SK / FR).",
    "Nyelv és piac: egy bolt két nyelvvel vagy két bolt (firstvape.sk + francia domain) – Áron dönt, mielőtt a 08-as fázis indul.",
    "Bruttó ár piaconként: ugyanaz a bruttó vagy az ÁFA-kulccsal változó (SK 23 %, FR 20 %) – ügyfél + könyvelő.",
    "Franciaország: eldobható e-cigaretta forgalmazási tilalma – jogász; valószínűleg rejteni kell a kategóriát.",
    "Régi vásárlók és rendelések átvétele a VirtueMartból – csak ha az ügyfél kéri (GDPR).",
]

LACI = dict(
    key="laci",
    title="First Vape – WooCommerce webshop",
    lead="Az ügyfél 2026-10-15-én jóváhagyta a webshop előnézetét (mobilon és laptopon is). Ebből kell megépíteni az éles "
         "WordPress / WooCommerce webshopot: <b>iu_theme + <code>firstvape</code> child téma</b>, klasszikus pénztár, "
         "Packeta, Teya, SuperFaktúra, szlovák és francia piac (EUR). Az előnézet a minta: ami ott működik, annak itt is "
         "ugyanúgy kell. Haladj a fázisok sorrendjében; a 10–13. fázis a CRM négy élesítési feladata, a projekt saját "
         "lépéseivel. Pipáld ki, ami kész (a CRM-feladat ellenőrzőlistáján is), és a megjegyzésbe írd, ha valami eltért.",
    phases=[
        dict(id="prep", title="Előkészítés", intro="Mielőtt kódot írsz: nézd végig az előnézetet, és állítsd össze a dev környezetet.", items=[
            dict(id="prep-read", who="Laci", title="Az előnézet és a prototípus átnézése",
                 desc="<p>Nyisd meg a prototípust (<code>cd prototype &amp;&amp; python3 -m http.server 8765</code>), és kattints végig "
                      "SK és FR nyelven: főoldal, mega menü, kategória + szűrők, márkaoldal, termékoldal, kosár, pénztár, fiók. "
                      "A <code>#/prototipus</code> oldal megmondja, melyik nézet melyik sablon lesz. A <code>prototype/README.md</code> "
                      "„Kategóriafa” és „WordPress terv” fejezete a specifikáció.</p>",
                 check="minden nézetnél tudod, melyik <code>templates/*.html</code> vagy shortcode-os WooCommerce-oldal lesz belőle."),
            dict(id="prep-env", who="Laci", title="Dev WordPress: WooCommerce + iu_theme 0.2.2 + firstvape child",
                 desc="<p>Friss WordPress a dev tárhelyen, <code>noindex</code>-szel (Beállítások → Olvasás). Alap téma: a hlprv repó "
                      "<code>themes/iu_theme</code> (0.2.2, javított), <code>HPV_GITHUB_TOKEN</code> a wp-config.php-ban az automatikus "
                      "frissítéshez. Child téma a frstvp repóban: <code>wp-theme/firstvape/</code> (<code>Template: iu_theme</code>). "
                      "Mintaprojekt a felépítéshez: <b>Mandala</b> (<code>mdn</code> repó, <code>wp-theme/mandala</code>: child téma, "
                      "telepítő lépések, költöztető) és a <code>vasskisgep</code> <code>dev/</code> eszközei.</p>",
                 check="a dev oldal a child témával fut, a téma kódja a frstvp repóban van, verziózva."),
            dict(id="prep-plugins", who="Laci", title="Csak a megengedett bővítmények",
                 desc="<p>WooCommerce, Packeta, SuperFaktúra, a Teya fizetési kapcsolata, WP Mail SMTP, Yoast SEO. "
                      "Többnyelvű bővítmény csak Áron döntése után (lásd a nyitott kérdéseket). <b>Nincs</b> page builder, űrlap-, "
                      "slider- és wishlist-bővítmény: a hiányzó funkció saját blokk (<code>iucb_add_block</code>) vagy a child téma PHP-ja.</p>",
                 check="a Bővítmények listáján csak ezek vannak."),
        ]),
        dict(id="theme", title="Child téma és arculat", intro="A jóváhagyott sötét arculat: az eredeti firstvape.sk modernizálva. "
             "A tokenek a <code>prototype/assets/css/style.css</code> <code>:root</code> részéből jönnek.", items=[
            dict(id="theme-tokens", who="Laci", title="Színek, betűk, theme.json paletta",
                 desc="<p><code>vars.css</code>: alap <code>#151017</code>, kártya <code>#231B26</code>, fő színátmenet "
                      "<code>linear-gradient(45deg, #EC2F4B 0%, #1F2250 80%)</code>, fejléc <code>linear-gradient(90deg, #002460, #38203F)</code>. "
                      "Betű: Barlow (szöveg) és Barlow Semi Condensed (címek), helyi woff2-ből (<code>prototype/assets/fonts/</code>, latin + latin-ext). "
                      "A paletta slugjait (pl. <code>dark</code>, <code>surface</code>, <code>primary</code>) a <code>theme.json</code>-ba is vedd fel, "
                      "mert az <code>iu/section</code> <code>bgColor</code>-ja slugot kér.</p>",
                 check="az előnézettel egymás mellett nézve a színek, betűk, lekerekítések egyeznek."),
            dict(id="theme-head", who="Laci", title="Fejléc, lábléc, mega menü",
                 desc="<p>Felső sáv (Packeta, ingyenes szállítás határa, 18+, SK / FR), logó, termékkereső, fiók, kedvencek, mini kosár, főmenü. "
                      "A mega menü saját blokk (<code>firstvape/mega-menu</code>): alkategóriák darabszámmal, a kategória márkái, "
                      "slukkszám-sávok, kiemelt termék. <b>Csak a termékkel rendelkező kategóriák és márkák látszanak.</b> "
                      "Az „Akcie / Promotions” menüpont nincs kiemelve (nem piros gomb). Mobilon lenyíló menü.</p>",
                 check="a menü az előnézet szerint működik egérrel, billentyűzettel és mobilon; üres kategória vagy márka nem jelenik meg."),
            dict(id="theme-smoke", who="Laci", title="Mozgó füst a háttérben",
                 desc="<p>A <code>prototype/assets/js/smoke.js</code> és a két füstkép (<code>smoke-a.png</code>, <code>smoke-b.png</code>) a child témába, "
                      "<code>wp_enqueue_script</code>-tel a láblécben. Csak <code>transform</code> / <code>opacity</code> animáció, "
                      "<code>prefers-reduced-motion</code> esetén áll.</p>",
                 check="görgetésre lassan áramlik, a Lighthouse nem jelez elrendezés-ugrást miatta."),
            dict(id="theme-age", who="Laci", title="18+ korkapu nyelvválasztóval",
                 desc="<p>Első látogatáskor 18+ ablak (SK / FR választóval), a választás sütiben marad. A nikotin-figyelmeztetés "
                      "(TPD szöveg) a láblécben és a termékoldalon.</p>",
                 check="új böngészőben megjelenik, „igen” után nem jön vissza; „nem” esetén nem lehet továbblépni."),
            dict(id="theme-templates", who="Laci", title="Sablonok a templates/ mappában",
                 desc="<p><code>front_page_content</code>, <code>tax_product_cat_content</code>, <code>tax_product_brand_content</code>, "
                      "<code>single_product_content</code>, <code>search</code>, <code>404</code>, <code>blog_page</code>, <code>single_post</code>, "
                      "<code>single_page_content</code> (saját H1 miatt). Oldalanként egy H1. A blokk-markupot a szerkesztő tegye kanonikussá "
                      "(Playwright, <code>\"invalid\":[]</code>).</p>",
                 check="minden sablon és oldal érvényes a blokkszerkesztőben, nincs dupla H1."),
        ]),
        dict(id="model", title="WooCommerce adatmodell", intro="Kategória = mi a termék, márka = ki gyártja, attribútum = tulajdonság "
             "(szűrő). <b>Minden termék SIMPLE</b>, ahogy az ügyfél CSV-jében.", items=[
            dict(id="model-shop", who="Laci", title="Bolt-alapbeállítások",
                 desc="<p>Pénznem EUR, bolt helye Szlovákia, árak ÁFÁ-val megadva. Adókulcsok: SK 23 %, FR 20 % (OSS) – "
                      "a végleges kulcsokat a könyvelő hagyja jóvá. A francia bruttó ár kérdése nyitott (lásd lent); "
                      "ha az ügyfél azonos bruttót kér: <code>woocommerce_adjust_non_base_location_prices</code> → <code>false</code>.</p>",
                 check="SK és FR számlázási címmel a kosár a megfelelő ÁFÁ-t mutatja."),
            dict(id="model-cats", who="Laci", title="Kategóriafa telepítő lépésként",
                 desc="<p>A fát az <code>inc/setup.php</code> hozza létre (egyszer futó, verziózott lépés), a slugok a táblázat szerint. "
                      "Minden kategória kapja meg az angol nevét term metában (<code>_fv_en_name</code>) – az import ebből rendel. "
                      "Forrás: <code>prototype/csv/kategoria-osszerendeles.csv</code>. A Geekvape Q Pod 0.4 / 0.6 / 0.8 Ω az "
                      "<code>ures-podok</code> alá kerül, a gyárilag töltött cserepodok az <code>eloretoltott-podok</code> alá.</p>",
                 check="a fa egyezik a táblázattal; a telepítő második futása nem hoz létre semmit."),
            dict(id="model-brands", who="Laci", title="Márkák (WooCommerce Brands)",
                 desc="<p><code>product_brand</code> logóval és leírással. A márkaoldal a márka <b>minden</b> termékét mutatja, "
                      "terméktípustól függetlenül, típus szerinti szűrővel. iu_theme-buktatók: a márka-archívum saját sablont töltene "
                      "(<code>template_include</code> → a téma <code>index.php</code>-ja), az <code>is_archive('product_cat')</code> "
                      "márkaoldalon is igaz (javítás <code>shortcode_atts_products</code> szűrővel).</p>",
                 check="pl. az Elfbar oldalán készülék, előretöltött pod és eldobható is látszik; a „Naše značky” lista csak termékes márkát mutat."),
            dict(id="model-attrs", who="Laci", title="Attribútumok",
                 desc="<p><code>pa_iz</code>, <code>pa_nikotin</code> (felirat: <b>„20 mg/ml (2 %)”</b>, 0 mg: „0 mg/ml (bez nikotínu)”), "
                      "<code>pa_kiszereles</code>, <code>pa_puff</code> (szám), <code>pa_puff_sav</code> (sáv, mentéskor számolva: "
                      "do 1 000 · 1 000–9 999 · 10 000–19 999 · 20 000 a viac), <code>pa_kompatibilitas</code> (a rendszer neve, pl. ELFA), "
                      "<code>pa_szin</code> (term metában a minta színe), <code>pa_ellenallas</code> (Ω). A slugok nyelvfüggetlenek.</p>",
                 check="egy termék mentésekor a <code>pa_puff_sav</code> magától beáll; a nikotin a fenti formában jelenik meg."),
            dict(id="model-status", who="Laci", title="„Kifutott” készletállapot",
                 desc="<p>Saját készletállapot (<code>discontinued</code>) a „Raktáron” és „Nincs készleten” mellé: a termékoldal megmarad, "
                      "nem vásárolható, a helyettesítő termékek látszanak (a kártya gombja: „Náhrady”, a termékoldal "
                      "<code>#rel-groups</code> részére visz). A listákban a végére kerül.</p>",
                 check="egy kifutott terméknél nincs kosár gomb, a helyettesítők megjelennek."),
            dict(id="model-group", who="Laci", title="Testvértermékek (_fv_group)",
                 desc="<p>A színek / ízek / nikotin / ellenállás külön SIMPLE termékek. Az összetartozókat a <code>_fv_group</code> meta "
                      "köti össze (az import „Termékcsoport” oszlopa); a termékoldal a különbség szerint linkeket mutat "
                      "(pl. Farba: Čierna · Strieborná · Modrá), a nem raktáros szaggatott kerettel.</p>",
                 check="az ELFA Pro Kit oldalán a három szín link, a jelenlegi kiemelve."),
        ]),
        dict(id="import", title="Termékimport", intro="A valódi adatok az ügyfél Excel/CSV-jéből jönnek (még nincs meg, a kérdéssorban kérjük). "
             "Addig a <code>prototype/csv/firstvape-termekimport-sablon.csv</code> mintaadataival építs.", items=[
            dict(id="imp-map", who="Laci", title="Angol kategória → szlovák kategória, dupla nélkül",
                 desc="<p>Az ügyfél fájljában a kategóriák angolul vannak. Az importáló (<code>woocommerce_product_import_pre_insert_product_object</code> "
                      "vagy saját importáló) az angol nevet / „Szülő &gt; Gyerek” útvonalat a <code>_fv_en_name</code> alapján a meglévő "
                      "szlovák kategóriához rendeli, <b>új kategóriát nem hoz létre</b>. Ismeretlen angol név: hibalista, nem új kategória.</p>",
                 check="ugyanazt a fájlt kétszer importálva sincs új kategória; az ismeretlen nevek listában jönnek."),
            dict(id="imp-columns", who="Laci", title="Oszlop-hozzárendelés és frissítés SKU alapján",
                 desc="<p>Az ügyfél fájljának oszlopait rendeld a WooCommerce mezőihez és a <code>pa_*</code> attribútumokhoz "
                      "(<code>woocommerce_csv_product_import_mapping_*</code> szűrők). Fallback: a mi sablonunk fejlécei "
                      "(Típus, Terméknév, SKU, EAN, Kategória (EN), Márka, Termékcsoport, Íz, Nikotin, ML, Puff, Kompatibilitás, Szín, "
                      "Ellenállás (Ω), árak, Készlet, Státusz, Súly (kg), leírások, Kép URL-ek). EAN → <code>global_unique_id</code>. "
                      "Ár- és készletfrissítés az ötoszlopos rövid sablonnal.</p>",
                 check="a minta CSV hiba nélkül bejön, másodszorra csak frissít (nincs dupla termék)."),
            dict(id="imp-images", who="Laci", title="Valódi termékfotók",
                 desc="<p>A képek az ügyfél fájljából (URL) vagy a régi VirtueMart-oldalról jönnek; <code>alt</code> = terméknév. "
                      "A prototípus rajzolt illusztrációi nem kerülnek át.</p>",
                 check="minden terméknek van fotója; a listában egységes képarány."),
            dict(id="imp-redirect", who="Laci", title="301 a régi VirtueMart-címekről",
                 desc="<p>A régi oldal termék- és kategóriacímeit (feltérképezés vagy a Search Console listája) az új címekre irányítsd, "
                      "SKU vagy név alapján párosítva.</p>",
                 check="a régi címek mintája 301-gyel a megfelelő új oldalra visz, nincs láncolt átirányítás."),
        ]),
        dict(id="list", title="Listák, szűrők, kereső", items=[
            dict(id="list-facets", who="Laci", title="Csak a kategóriában értelmezhető szűrők",
                 desc="<p>Az <code>iu-woocommerce/filter</code> blokk főkategóriánként más szűrőket mutat (<code>FV.catFacets</code> a <code>core.js</code>-ben): "
                      "Készülékek: alkategória, márka, rendszer, szín, ellenállás, elérhetőség · Előretöltött podok: márka, rendszer, íz, nikotin, "
                      "slukkszám, elérhetőség · E-liquidek: alkategória, márka, íz, nikotin, kiszerelés · Eldobható: márka, íz, slukkszám, nikotin · "
                      "Kiegészítők: alkategória, márka, rendszer, ellenállás. Egyértékű szűrő nem látszik. Szűrt URL: canonical / noindex szabály.</p>",
                 check="minden főkategóriában csak a felsorolt szűrők vannak, élő darabszámmal, mobilon oldalpanelben."),
            dict(id="list-puff", who="Laci", title="Slukkszám-szűrő tartományokkal",
                 desc="<p>A <code>pa_puff_sav</code> alapján; a szűrő alatt egy mondat: „A szűrő tartományban keres, nem pontos értékre. "
                      "A slukkszám gyártói becslés.” (SK / FR szöveg az <code>i18n.js</code>-ben: <code>puffNote</code>). A főoldali slukkszám-kereső is sávokra visz.</p>",
                 check="a „20 000 a viac” sáv a 20 000 feletti termékeket adja, a megjegyzés látszik."),
            dict(id="list-card", who="Laci", title="Egységes termékkártya („Loop Product” pattern)",
                 desc="<p>Márka, név (két sor), legfeljebb 3 jellemző-címke, alul mindig ugyanott: ár, készlet, teljes szélességű gomb. "
                      "Gombfeliratok: „Do košíka” · „Upozorniť ma” (nincs készleten) · „Náhrady” (kifutott). „Možnosti” nincs.</p>",
                 check="egy sorban a kártyák ára, készlete és gombja egy vonalban van (laptopon és mobilon is)."),
            dict(id="list-search", who="Laci", title="Bővített termékkereső",
                 desc="<p>Név, márka, íz, slukkszám, nikotin, rendszer, kategória, SKU és EAN alapján; számnormalizálás "
                      "(<code>40000</code> = <code>40 000</code> = <code>40k</code>); élő javaslatok. A keresőszót mindig escapeld (iu_theme 0.1.0 XSS-tanulság).</p>",
                 check="„Elfbar 40000”, „40k”, „mango”, „xros” és egy SKU is jó találatot ad; <code>/?s=\"&gt;&lt;svg onload=alert(1)&gt;</code> nem fut le."),
        ]),
        dict(id="pdp", title="Termékoldal", items=[
            dict(id="pdp-specs", who="Laci", title="Íz, szín, kiszerelés, nikotin mindig látszik",
                 desc="<p>A kiemelt jellemzők (íz, szín, nikotin, kiszerelés, rendszer, ellenállás, becsült slukkszám) akkor is látszanak, "
                      "ha nincsenek a névben. Specifikációs táblázat SKU-val és EAN-nal, <b>súly nélkül</b>.</p>",
                 check="egy liquidnél, egy podnál és egy készüléknél is minden releváns jellemző fent van."),
            dict(id="pdp-related", who="Laci", title="Kompatibilis podok és készülékek, rendszerjelöléssel",
                 desc="<p>A <code>pa_kompatibilitas</code> alapján: készüléknél „Kompatibilné pody a cartridge – systém X”, podnál "
                      "„Kompatibilné zariadenia – systém X”, a kártyán „Systém X” címke; utána a testvértermékek és az alternatívák "
                      "(csoportonként egy).</p>",
                 check="az ELFA Pro Kit alatt az ELFA podok jönnek „Systém ELFA” címkével."),
            dict(id="pdp-notify", who="Laci", title="Értesítés, ha újra raktáron (saját kód)",
                 desc="<p>Nincs készleten: e-mail cím megadása, mentés saját táblába / metába; készlet-változáskor levél SK / FR nyelven, "
                      "utána a feliratkozás törlődik. Bővítmény nélkül.</p>",
                 check="feliratkozás után a készletet 0-ról 5-re állítva a levél megérkezik."),
            dict(id="pdp-seo", who="Laci", title="JSON-LD Product és nikotin-figyelmeztetés",
                 desc="<p><code>Product</code>: név, SKU, GTIN, márka, ajánlat EUR-ban, készlet. A Yoast schemájával ne legyen dupla. "
                      "A JS-sztringben a lezáró script-taget mindig <code>&lt;\\/script&gt;</code>-ként írd.</p>",
                 check="a Rich Results teszt hiba nélkül olvassa a terméket."),
        ]),
        dict(id="checkout", title="Kosár, pénztár, fiók", intro="Klasszikus (shortcode-os) kosár és pénztár, ahogy minden webshopunknál.", items=[
            dict(id="co-cart", who="Laci", title="Kosár és mini kosár",
                 desc="<p>A mennyiség mellett jól látható „Odstrániť” gomb (a mini kosárban kuka ikon), ingyenes szállítás sáv. "
                      "<b>A csomag súlya sehol nem jelenik meg</b> a vásárlói felületen.</p>",
                 check="tétel törölhető a kosárból és a mini kosárból is; „Hmotnosť” / „Poids” sehol."),
            dict(id="co-layout", who="Laci", title="Pénztár: lépések, tömör mobil, ragadó összesítő",
                 desc="<p>A 4 rendelési lépés mobilon egy sorban, 4 oszlopban, vízszintes görgetés nélkül. Mobilon tömör mezők és kártyák "
                      "(név / vezetéknév, irányítószám / város két oszlopban). Laptopon két oszlop, a jobb oldali összesítő görgetéskor "
                      "<b>csak akkor ragad, ha elfér</b> a képernyőn (minta: <code>FV.fitSummary</code> az <code>app.js</code>-ben).</p>",
                 check="390 px-en nincs vízszintes görgetés; laptopon lejjebb görgetve az összesítő látszik, és nem marad üres hely."),
            dict(id="co-errors", who="Laci", title="Hibaüzenet a mező alatt",
                 desc="<p>Hiányzó vagy hibás adatnál a piros keret alatt rövid szöveg (pl. „Vyplň toto pole.”, „Zadaj platné PSČ (napr. 811 01).”), "
                      "felül egy összefoglaló. PSČ: SK <code>^\\d{3}\\s?\\d{2}$</code>, FR <code>^\\d{5}$</code>; telefon legalább 9 számjegy. "
                      "A szövegek az <code>i18n.js</code>-ben (<code>err*</code> kulcsok). A mintaadat-kitöltő blokk <b>nem kerül át</b>.</p>",
                 check="üres beküldésnél minden hibás mező alatt ott a szöveg, kijavításkor eltűnik."),
            dict(id="co-address", who="Laci", title="Eltérő szállítási cím, cégadatok",
                 desc="<p>Házhoz szállításnál „Doručiť na inú adresu” (a WooCommerce saját szállítási címe); átvételi pontnál rejtve. "
                      "Céges vásárlás: SK IČO, DIČ, IČ DPH · FR SIRET, TVA. Nézd meg, a SuperFaktúra bővítmény melyik meta kulcsból olvassa "
                      "az adószámot, és oda is írd be (Mandala / Számlázz.hu tanulság, DONTESEK 2026-10-08).</p>",
                 check="céges tesztrendelés számláján ott az IČO / DIČ / IČ DPH."),
            dict(id="co-account", who="Laci", title="Fiók",
                 desc="<p>Rendelések Packeta-követési linkkel, számla letöltése (SuperFaktúra), kedvencek (saját kód, user meta), címek.</p>",
                 check="egy teszt-vásárló látja a rendelését, a követési linket és a számlát."),
        ]),
        dict(id="integr", title="Szállítás, fizetés, számlázás", intro="A díjak, kulcsok és szerződéses adatok az ügyféltől jönnek; "
             "a prototípus díjai mintaértékek („vzor”).", items=[
            dict(id="int-packeta", who="Laci", title="Packeta: átvételi pont / Z-BOX és házhoz szállítás",
                 desc="<p>A Packeta hivatalos WooCommerce-bővítménye. SK: „Výdajné miesto alebo Z-BOX” (a Packeta térképes választója) és "
                      "„Doručenie na adresu”; FR: point relais és házhoz. Díjak, ingyenes szállítás határa, utánvét a szerződés szerint. "
                      "A súly a termékeken a díjszámításhoz kell, a vásárló nem látja. Címkenyomtatás a bővítményből.</p>",
                 check="mindkét piacon választható átvételi pont, a rendelés átmegy a Packetába, a címke kinyomtatható."),
            dict(id="int-teya", who="Laci", title="Teya: kártya, Apple Pay, Google Pay",
                 desc="<p>A Teya által adott WooCommerce-kapcsolat, előbb tesztkulcsokkal. Utánvét (dobierka) a díjjal. "
                      "A kulcs a wp-configba vagy a bővítmény beállításába kerül, <b>soha a repóba</b>.</p>",
                 check="teszt kártyás fizetés sikeres és sikertelen ága is helyesen zárul; utánvétnél a díj a végösszegben."),
            dict(id="int-sf", who="Laci", title="SuperFaktúra: számla rendeléskor / fizetéskor",
                 desc="<p>SuperFaktúra WooCommerce-bővítmény: számla a rendelés nyelvén (SK / FR), helyes ÁFÁ-val, céges adatokkal, "
                      "e-mailben a vásárlónak. Kártyánál fizetéskor, utánvétnél a beállított állapotnál.</p>",
                 check="a tesztrendelésekről hibátlan számla készül a SuperFaktúrában."),
            dict(id="int-mail", who="Laci", title="E-mailek és SMTP",
                 desc="<p>WooCommerce-levelek SK és FR nyelven, létező feladócímmel (pl. <code>info@firstvape.sk</code> – az ügyféllel egyeztetve), "
                      "WP Mail SMTP a tárhely postafiókjával.</p>",
                 check="a rendelés visszaigazolása megérkezik a vásárlónak és az adminnak, nem spamként."),
        ]),
        dict(id="market", title="Nyelvek és piacok", intro="A nyelv és a piac együtt vált: SK = szlovák felület + 23 % + SK szállítás, "
             "FR = francia felület + 20 % + FR szállítás. A megoldás módja Áron döntése (lásd nyitott kérdések).", items=[
            dict(id="mk-lang", who="Laci", title="SK alapnyelv + FR",
                 desc="<p>Minden felületi szöveg az <code>i18n.js</code>-ből (SK tegező, FR magázó). A kategóriák, márkaleírások, "
                      "termékszövegek fordítása; <code>hreflang</code> a két változat között.</p>",
                 check="FR-re váltva nincs szlovák maradvány a felületen, az árak és a szállítás a francia piacé."),
            dict(id="mk-legal", who="Laci", title="Jogi oldalak piaconként (helyőrzővel)",
                 desc="<p>SK: Doprava a platba, Obchodné podmienky, Ochrana osobných údajov, Odstúpenie od zmluvy, Súbory cookie, Kontakt · "
                      "FR: Livraison et paiement, CGV, Politique de confidentialité, Droit de rétractation, Mentions légales, Cookies, Contact. "
                      "A szöveget az ügyfél jogásza adja; addig jelölt helyőrző. Süti-hozzájárulás, GA4 csak hozzájárulással.</p>",
                 check="az oldalak telepítő lépésként jönnek létre, a pénztár az ÁSZF-re linkel."),
            dict(id="mk-fr", who="Laci", title="Eldobható e-cigaretták Franciaországban",
                 desc="<p>Előkészítés: piaconként rejthető kategória (menü, lista, kereső, közvetlen cím). Hogy rejteni kell-e, a jogász mondja meg.</p>",
                 check="egy kapcsolóval az FR piacon a kategória és termékei eltűnnek, a közvetlen cím nem rendelhető."),
        ]),
        dict(id="test", title="Belső tesztelés", intro="Ez a CRM „Élesítés 1/4” feladat BELSŐ TESZTELÉS pontja előtt fut.", items=[
            dict(id="test-order", who="Laci", title="Teljes tesztrendelés mobilon és laptopon, SK és FR",
                 desc="<p>Minden szállítási és fizetési móddal: kosár → pénztár → fizetés → köszönő oldal → visszaigazoló levél → "
                      "SuperFaktúra-számla → Packeta. Céges és magánszemély vásárló, eltérő szállítási cím, átvételi pont.</p>",
                 check="minden ág hibátlan, a levelek kimennek a vásárlónak és az adminnak."),
            dict(id="test-ui", who="Laci", title="Megjelenés és szerkesztő",
                 desc="<p>390, 768, 1024, 1280, 1360 px: nincs vízszintes görgetés (a prototípusban ugyanez a teszt átment). Oldalanként egy H1. "
                      "Minden oldal és sablon érvényes a blokkszerkesztőben. 404, keresés, mobil menü, 18+ kapu.</p>",
                 check="a lista minden pontja rendben, képernyőképek a CRM-feladatban."),
        ]),
        dict(id="golive1", title="Élesítés 1/4 – Előfeltételek", intro="A CRM „Élesítés 1/4” feladata. A következő fázis csak akkor indul, ha ez kész.", items=[
            dict(id="gl1", who="Laci", title="Fejlesztés kész, dev szerveren, belső teszt, jóváhagyás",
                 desc="<p>FEJLESZTÉS kész · PRODUKTUM (fájlok + adatbázis) a dev szerveren · BELSŐ TESZTELÉS (a 09-es fázis) · "
                      "ÉLESÍTÉS JÓVÁHAGYVA (Áron belső ellenőrzése).</p>",
                 check="a CRM-feladat négy pontja ki van pipálva."),
        ]),
        dict(id="golive2", title="Élesítés 2/4 – Domain és tárhely", intro="A hozzáféréseket az ügyfél a portálon adja meg.", items=[
            dict(id="gl2", who="Laci", title="Hozzáférés, domain, SSL, e-mail, staging, éles mappa",
                 desc="<p>SZERVER HOZZÁFÉRÉS (portálon) · a firstvape.sk (és ha lesz, a francia domain) a tárhelyre mutat · SSL + https-átirányítás · "
                      "a régi Joomla / VirtueMart oldal a váltásig fut, a postafiókok megmaradnak (MX-hez ne nyúlj) · e-mail fiókok · "
                      "staging aldomain / almappa · éles mappa előkészítve.</p>",
                 check="a CRM „Élesítés 2/4” feladat minden pontja kész."),
        ]),
        dict(id="golive3", title="Élesítés 3/4 – Staging", items=[
            dict(id="gl3", who="Laci", title="Staging az ügyfél valódi adataival",
                 desc="<p>Feltöltés · Better Search Replace (a JSON-escape-elt <code>https:\\/\\/</code> alakra is) · permalinkek · e-mail címek · SMTP · "
                      "IMPORTÁLÁS az ügyfél Excel/CSV-jéből (a 04-es fázis importálójával) · Packeta, Teya, SuperFaktúra <b>teszt</b> adatokkal · "
                      "belső teszt · az ügyfél a portálon végigvisz egy teljes tesztrendelést mobilon és laptopon, és jóváhagyja.</p>",
                 check="az ügyfél jóváhagyása a portálon megvan."),
        ]),
        dict(id="golive4", title="Élesítés 4/4 – Élesítés", items=[
            dict(id="gl4", who="Laci", title="Éles oldal, éles kulcsok, mérés, keresőrobotok utoljára",
                 desc="<p>Másolás · Better Search Replace · permalinkek · e-mail · Packeta, Teya, SuperFaktúra <b>éles</b> adatokkal · "
                      "301-ek a régi címekről · GTM, GA4 (hozzájárulással), Yoast, SEO OS Connect · belső teszt (egy valódi kis rendelés, "
                      "utána sztornó) · ügyfél-jóváhagyás · végül a „Keresőmotorok ne indexeljék” jelölő kivétele.</p>",
                 check="a CRM „Élesítés 4/4” feladat minden pontja kész, az oldal indexelhető."),
        ]),
    ],
)
