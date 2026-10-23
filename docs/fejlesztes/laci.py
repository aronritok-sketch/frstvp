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
    ("eloretoltott-podok", "Predplnené pody", "Prefilled Pods", "podok-elfbar-elfa · podok-elfbar-joinone · podok-vaporesso-dojo · podok-drifter-bar"),
    ("e-liquidek", "E-liquidy", "E-liquids", "nikotin-booster · kesz-liquidek-10ml · aromak · shortfill · longfill"),
    ("kiegeszitok", "Príslušenstvo", "Accessories", "ures-podok · porlasztok · tankok · akkuk-toltok · egyeb-kiegeszitok"),
]

OPEN = [
    "Az ügyfél javított fájlja (2026-10-20) átvezetve. Még kell: valódi készlet (leltár után), súly (a kategóriaátlag elég, az ügyfél pontosíthat), jobb fotó 26 termékhez – prototype/csv/import-ellenorzes.md.",
    "Packeta-szerződés (az ügyfél szerint ezen a héten): API-kulcs, díjak SK és FR; házhoz + Z-BOX kell; ingyenes szállítás 39,99 €-tól (FR-re megerősítendő); utánvét 1–2 € (pontos összeg kell).",
    "Teya: melyik WooCommerce-kapcsolatot adják (bővítmény vagy fizetési oldal), teszt- és éles kulcsok.",
    "SuperFaktúra: a fiók megvan (az ügyfél adja meg a hozzáférést / API-kulcsot); a számla FR-en franciául, SK-n szlovákul; számlasor: maradhat az alapértelmezett.",
    "Francia domain: firstvape.fr – megvan-e már, kinél van regisztrálva, ki fér hozzá (a DNS-hez kell).",
    "Bruttó ár piaconként: ugyanaz a bruttó vagy az ÁFA-kulccsal változó (SK 23 %, FR 20 %) – ügyfél + könyvelő.",
    "Régi vásárlók és rendelések átvétele a VirtueMartból – csak ha az ügyfél kéri (GDPR).",
    "Adulto korellenőrzés: az ügyfél regisztrál (adulto.cz), a kulcsokat a portálon adja meg; kell-e minden terméknél (jogász); SOI-bejelentés a rendszerről.",
]

LACI = dict(
    key="laci",
    title="First Vape – WooCommerce webshop",
    lead="Az ügyfél 2026-10-15-én jóváhagyta a webshop előnézetét. <b>A <code>firstvape</code> child téma kész</b> (2026-10-20): "
         "az előnézet kinézete és működése WordPress + WooCommerce alatt, az ügyfél 392 termékével és képeivel, két domainnel, "
         "telepítővel – <code>dist/firstvape-tema.zip</code>, leírás: <code>docs/wp/TELEPITES.md</code>, kód: <code>docs/wp/DEVELOPER.md</code>. 2026-10-20: az ügyfél javított fájlja és döntései (eldobhatók nélkül, pod-alkategóriák, SK / FR leírások) – új zip, frissítés: <code>prep-update</code>. "
         "A „Kész – ellenőrizd” pontoknál csak nézd meg a dev oldalon, és pipáld ki; a „Laci” pontok a te munkád: telepítés, "
         "bővítmények (Packeta, Teya, SuperFaktúra, SMTP, Yoast), kulcsok, jogi szövegek, 301-ek, tesztrendelés, élesítés. "
         "A 11–14. fázis a CRM négy élesítési feladata. A megjegyzésbe írd, ha valami eltért.",
    phases=[
        dict(id="prep", title="Előkészítés", intro="Mielőtt kódot írsz: nézd végig az előnézetet, és állítsd össze a dev környezetet.", items=[
            dict(id="prep-read", who="Laci", title="Az előnézet és a prototípus átnézése",
                 desc="<p>Nézd végig az előnézetet (<code>prototype/</code>) és a kész témát a dev oldalon, SK és FR nyelven (<code>?lang=fr</code>): főoldal, mega menü, kategória + szűrők, márka, termékoldal, kosár, pénztár, fiók. A téma felépítése: <code>docs/wp/DEVELOPER.md</code>.</p>",
                 check="tudod, melyik oldal melyik sablon / blokk (DEVELOPER.md táblázata)."),
            dict(id="prep-env", who="Laci", title="Dev WordPress: WooCommerce + iu_theme 0.2.2 + firstvape child",
                 desc="<p><b>A téma kész</b> (<code>dist/firstvape-tema.zip</code>, a CRM-feladat melléklete). Dev WordPress szlovákul + francia nyelvi csomag, WooCommerce, <code>iu_theme</code> 0.2.2 (hlprv <code>themes/iu_theme</code>, <code>HPV_GITHUB_TOKEN</code> a wp-config.php-ba), a <code>firstvape</code> téma zipből, a képcsomag a <code>wp-content/uploads/firstvape-media/</code> mappába, végül Megjelenés → First Vape → Telepítés (vagy <code>wp firstvape setup --media=…</code>). Lépésenként: <code>docs/wp/TELEPITES.md</code>.</p>",
                 check="a dev oldalon 392 termék képekkel, a <code>wp firstvape check</code> csak a várt figyelmeztetéseket adja (domain, díjak, kulcsok, jogi szövegek)."),
            dict(id="prep-plugins", who="Laci", title="Csak a megengedett bővítmények",
                 desc="<p>Csak: WooCommerce, Packeta, a Teya fizetési kapcsolata, SuperFaktúra, WP Mail SMTP, Yoast SEO. <b>WPML / Polylang nem kell</b>: a két domaint a téma kezeli (09-es fázis). <b>Nincs</b> page builder, űrlap-, slider- és wishlist-bővítmény (a kedvencek, űrlapok, 18+ kapu, szűrők a témában vannak).</p>",
                 check="a Bővítmények listáján csak ezek vannak."),
            dict(id="prep-update", who="Laci", title="Frissítés a 2026-10-20-i témára (az ügyfél 2. köre)",
                 desc="<p>Új <code>firstvape-tema.zip</code> és <code>firstvape-media.zip</code> (CRM-melléklet). Téma felülírása zipből (Megjelenés → Témák → Feltöltés → „Csere”), a médiacsomag kicsomagolása a <code>wp-content/uploads/firstvape-media/</code> mappába (felülírással), majd <code>wp firstvape setup</code> (<b>--force nélkül</b>). A telepítő: a 3 ELFBAR 600-at és a régi SKU-s termékeket kukába teszi, az Eldobható kategóriát és cikket törli, a podokat a 4 rendszer-alkategóriába teszi, a javított ajánlásokat (cross-sell) és testvércsoportokat átírja, a 4 cserélt képet lecseréli, az SK / FR leírásokat beírja, az ingyenes szállítást 39,99 €-ra állítja (ha még a minta 50 € volt).</p>",
                 code=["wp theme install firstvape-tema.zip --force\nunzip -o firstvape-media.zip -d wp-content/uploads/firstvape-media/\nwp firstvape setup\nwp firstvape check"],
                 check="392 termék, nincs Eldobható menüpont, a Predplnené pody alatt 4 alkategória, a termékoldalon szlovák / francia leírás."),
        ]),
        dict(id="theme", title="Child téma és arculat", intro="A jóváhagyott sötét arculat: az eredeti firstvape.sk modernizálva. "
             "A tokenek a <code>prototype/assets/css/style.css</code> <code>:root</code> részéből jönnek.", items=[
            dict(id="theme-tokens", who="Kész – ellenőrizd", title="Színek, betűk, theme.json paletta",
                 desc="<p>A téma az előnézet CSS-ét használja változatlanul (<code>assets/css/site.css</code>), az iu_theme alap-CSS-éből csak a <code>variables.css</code> töltődik. Betűk helyben (Barlow, Barlow Semi Condensed).</p>",
                 check="a dev oldal úgy néz ki, mint az előnézet (1440 és 390 px)."),
            dict(id="theme-head", who="Kész – ellenőrizd", title="Fejléc, lábléc, mega menü",
                 desc="<p>Felső sáv, fejléc kereséssel, mega menü (alkategóriák, márkák, slukkszám-sávok, kiemelt termék), mobilmenü, kosár-fiók, lábléc hírlevéllel. A menü a kategóriafából jön, csak a termékkel rendelkező kategóriák és márkák látszanak; az Akcie csak akkor, ha van akciós termék.</p>",
                 check="hover, billentyűzet, érintés (első koppintás a panelt nyitja); mobilon a menü és a kosár-fiók."),
            dict(id="theme-smoke", who="Kész – ellenőrizd", title="Mozgó füst a háttérben",
                 desc="<p>A nyitóképen és a hírlevél sávban a füstkép (az előnézet CSS-éből).</p>",
                 check="a nyitókép az előnézet szerint."),
            dict(id="theme-age", who="Kész – ellenőrizd", title="18+ korkapu nyelvválasztóval",
                 desc="<p>18+ kapu nyelvváltóval, az elfogadás egy évig megmarad (<code>fv_age</code> süti); „Nie” esetén üzenet.</p>",
                 check="első látogatáskor megjelenik, elfogadás után nem."),
            dict(id="theme-templates", who="Kész – ellenőrizd", title="Sablonok a templates/ mappában",
                 desc="<p>14 sablonfájl a <code>templates/</code> mappában (fejléc, lábléc, nyitóoldal, oldal, kategória, márka, bolt, keresés, termék, blog, cikk, 404), mind érvényes a blokkszerkesztőben (<code>tests/wp/editor-check.mjs</code>).</p>",
                 check="Megjelenés → Template-ek alatt ne legyen admin sablon, ami felülírná a fájlokat."),
        ]),
        dict(id="model", title="WooCommerce adatmodell", intro="Kategória = mi a termék, márka = ki gyártja, attribútum = tulajdonság "
             "(szűrő). <b>Minden termék SIMPLE</b>, ahogy az ügyfél CSV-jében.", items=[
            dict(id="model-shop", who="Kész – ellenőrizd", title="Bolt-alapbeállítások",
                 desc="<p>A telepítő beállítja: EUR, bruttó árak, ÁFA SK 23 % / FR 20 % a vásárló országa szerint, súly kg, klasszikus kosár / pénztár / fiók szlovák végpontokkal, vendégvásárlás, alacsony készlet: 3 db.</p>",
                 check="WooCommerce → Beállítások: a fentiek; az ÁFA-kulcsokat a könyvelő hagyja jóvá (OSS)."),
            dict(id="model-cats", who="Kész – ellenőrizd", title="Kategóriafa telepítő lépésként",
                 desc="<p>A 7 főmenüpontos fa (18 kategória) szlovák névvel és slugokkal, francia névvel (<code>fv_name_fr</code>), az ügyfél angol nevével (<code>fv_en_name</code>); stabil kulcs: <code>fv_key</code>.</p>",
                 check="Termékek → Kategóriák: a fa az előnézet szerint; átnevezéskor a téma követi."),
            dict(id="model-brands", who="Kész – ellenőrizd", title="Márkák (WooCommerce Brands)",
                 desc="<p>12 márka (WooCommerce Brands), leírással SK / FR, betűs logóval (szín, stílus).</p>",
                 check="Termékek → Márkák; ha az ügyfél valódi logót küld, a márka képe lehet (kérésre)."),
            dict(id="model-attrs", who="Kész – ellenőrizd", title="Attribútumok",
                 desc="<p>7 globális attribútum: <code>pa_prichut</code>, <code>pa_nikotin</code>, <code>pa_objem</code>, <code>pa_pocet-potiahnuti</code>, <code>pa_system</code>, <code>pa_farba</code>, <code>pa_odpor</code> – a szűrők és a kártyák ezekből; a francia feliratok a téma szótárából.</p>",
                 check="Termékek → Attribútumok: 7 db, dupla nincs."),
            dict(id="model-status", who="Kész – ellenőrizd", title="„Kifutott” készletállapot",
                 desc="<p>„Kifutott termék” pipa (termék szerkesztése → Készlet): az oldal megmarad, nem rendelhető, a helyettesítőket mutatja, a listák végére kerül.</p>",
                 check="egy termékre próbaképp: a termékoldal és a lista az előnézet szerint."),
            dict(id="model-group", who="Kész – ellenőrizd", title="Testvértermékek (_fv_group)",
                 desc="<p>A testvértermékek (<code>_fv_group</code>) a termékoldalon linkként, 12 fölött választólistaként (pl. 49 ELFA Pro pod).</p>",
                 check="ELFA TURBO (4 szín), ELFA Pro pod (választólista)."),
        ]),
        dict(id="import", title="Termékimport", intro="Az ügyfél fájlja megérkezett (javítva: 2026-10-20, <code>prototype/csv/ugyfel/</code>, 392 SIMPLE termék az ELFBAR 600-asok nélkül). "
             "A tisztított importfájl és a hibalista kész: <code>prototype/csv/firstvape-woocommerce-import.csv</code>, <code>prototype/csv/import-ellenorzes.md</code> "
             "(generátor: <code>prototype/tools/client_import.py</code> – ha az ügyfél javított fájlt küld, ezt futtasd újra).", items=[
            dict(id="imp-map", who="Kész – ellenőrizd", title="Angol kategória → szlovák kategória, dupla nélkül",
                 desc="<p>A telepítő az ügyfél fájljából generált adatokkal (392 termék) tölti fel a boltot, a szlovák kategóriákba; dupla kategória nem jön létre. A javított fájl jöttével: <code>client_import.py</code> → <code>build_data.mjs</code> → <code>wp firstvape setup --step=products</code> (árak / készlet: <code>--force</code>) – TELEPITES.md.</p>",
                 check="az ELFBAR 600-asok kimaradtak (az ügyfél kérése: az EU 2027-től tiltja), az előretöltött podok rendszerenként alkategóriában, dupla SKU nincs."),
            dict(id="imp-columns", who="Laci", title="Import a tisztított CSV-ből, frissítés SKU alapján",
                 desc="<p>Ha az ügyfél javított fájlt küld: újragenerálás és frissítés a fenti módon (SKU alapján). A WooCommerce CSV-importere a meglévő termékekre <b>nem</b> jó (a képoszlop fájlnevet tartalmaz – tesztelve); új termékhez kép nélkül igen.</p>",
                 check="frissítés után <code>wp firstvape check</code>, a változott termékek a boltban."),
            dict(id="imp-images", who="Kész – ellenőrizd", title="Feldolgozott termékfotók, átlátszó háttérrel",
                 desc="<p>392 feldolgozott kép (átlátszó WebP, FIRSTVAPE logó) a médiacsomagból, kiemelt képként; a WordPress méretei is WebP-k (az átlátszóság marad). Képoptimalizáló bővítmény ne alakítsa JPEG-re.</p>",
                 check="a 13 kicsi forráskép (9 Elfliq, 4 J Cartridge): ha az ügyfél újat küld (csere: <code>prototype/csv/termekkepek-forras-csere.csv</code>), <code>product_images.py</code>, majd csere a médiatárban."),
            dict(id="imp-redirect", who="Laci", title="301 a régi VirtueMart-címekről",
                 desc="<p>301 a régi Joomla / VirtueMart címekről az újakra (a régi oldal termék- és kategóriacímei, Search Console listája) – a témában ehhez még nincs térkép: a régi címlista kell (élesítés 4/4).</p>",
                 check="a régi top 50 cím 301-gyel az új oldalra visz."),
        ]),
        dict(id="list", title="Listák, szűrők, kereső", items=[
            dict(id="list-facets", who="Kész – ellenőrizd", title="Csak a kategóriában értelmezhető szűrők",
                 desc="<p>Főkategóriánként csak a ráérvényes szűrők, darabszámmal; szűrés újratöltés nélkül (URL-ben marad), JS nélkül is; mobilon lenyíló panel. A szűrt URL noindex, a canonical a szűretlen cím.</p>",
                 check="e-liquid: íz, nikotin, kiszerelés; kiegészítő: ellenállás; készülék: szín, rendszer."),
            dict(id="list-puff", who="Kész – ellenőrizd", title="Slukkszám-szűrő tartományokkal",
                 desc="<p>Slukkszám tartományokra (gyártói becslés felirattal), a nyitóoldali keresővel és a mega menü sávjaival.</p>",
                 check="a nyitóoldali csúszka a megfelelő darabszámot és listát adja."),
            dict(id="list-card", who="Kész – ellenőrizd", title="Egységes termékkártya („Loop Product” pattern)",
                 desc="<p>Egységes termékkártya (márka, név, fő adatok, ár, készlet, a valódi művelet gombja); kosárba AJAX-szal, kedvencek szívvel.</p>",
                 check="egyforma kártyamagasság a rácsban."),
            dict(id="list-search", who="Kész – ellenőrizd", title="Bővített termékkereső",
                 desc="<p>Bővített kereső: név, márka, attribútumok, kategória, SKU; „40k” = „40 000” = „40000”; élő lenyíló javaslatokkal (márka, kategória, slukkszám, íz).</p>",
                 check="<code>Elfbar 40000</code>, <code>40k</code>, <code>mango</code>, <code>wenax</code>."),
        ]),
        dict(id="pdp", title="Termékoldal", items=[
            dict(id="pdp-specs", who="Kész – ellenőrizd", title="Íz, szín, kiszerelés, nikotin mindig látszik",
                 desc="<p>Íz, szín, kiszerelés, nikotin („20 mg/ml (2 %)”), rendszer, ellenállás, slukkszám mindig látszik; paramétertábla; súly sehol.</p>",
                 check="egy pod, egy liquid, egy készülék termékoldala."),
            dict(id="pdp-related", who="Kész – ellenőrizd", title="Kompatibilis podok és készülékek, rendszerjelöléssel",
                 desc="<p>Az ügyfél ajánlásai (cross-sell), kompatibilis podok / patronok és készülékek (<code>pa_system</code>), további változatok, alternatívák – egy termék csak egyszer.</p>",
                 check="ELFA TURBO: alatta az ELFA podok „Systém ELFA” jelöléssel."),
            dict(id="pdp-notify", who="Kész – ellenőrizd", title="Értesítés, ha újra raktáron (saját kód)",
                 desc="<p>„Upozorniť ma” elfogyott terméknél: a feliratkozás a Beküldések között, újra raktáron a téma a feliratkozó nyelvén levelet küld (tesztelve).</p>",
                 check="egy termék készletét 0-ra, feliratkozás, vissza 5-re: megjön a levél."),
            dict(id="pdp-seo", who="Kész – ellenőrizd", title="JSON-LD Product és nikotin-figyelmeztetés",
                 desc="<p>JSON-LD Product (SKU, márka, EUR ár, készlet, kép), OnlineStore, BreadcrumbList; nikotin-figyelmeztetés; hreflang sk ↔ fr.</p>",
                 check="Google Rich Results teszt egy termékoldalra (élesítés után)."),
        ]),
        dict(id="checkout", title="Kosár, pénztár, fiók", intro="Klasszikus (shortcode-os) kosár és pénztár, ahogy minden webshopunknál.", items=[
            dict(id="co-cart", who="Kész – ellenőrizd", title="Kosár és mini kosár",
                 desc="<p>Kosár-fiók (mennyiség, törlés, ingyenes szállításig hiányzó összeg) és klasszikus kosár oldal kártyás tételekkel, a mennyiség változására magától frissül.</p>",
                 check="mobilon és laptopon."),
            dict(id="co-layout", who="Kész – ellenőrizd", title="Pénztár: lépések, tömör mobil, ragadó összesítő",
                 desc="<p>Rendelési lépések, kétoszlopos pénztár ragadó összesítővel, mobilon egy oszlop.</p>",
                 check="390 px: nincs vízszintes görgetés."),
            dict(id="co-errors", who="Kész – ellenőrizd", title="Hibaüzenet a mező alatt",
                 desc="<p>Mezőnkénti rövid hibaüzenet (a WooCommerce sajátja, rövidített szöveggel), fölül egy összefoglaló; gépelés közben eltűnik; irányítószám piaconként (SK: 945 01, FR: 75011).</p>",
                 check="üres beküldés: minden kötelező mező alatt üzenet."),
            dict(id="co-address", who="Kész – ellenőrizd", title="Eltérő szállítási cím, cégadatok",
                 desc="<p>Eltérő szállítási cím (WooCommerce), „cégként vásárolok” pipa: cégnév, IČO, DIČ / IČ DPH (FR: SIRET, TVA) – a rendelés metájában (<code>_billing_fv_id</code>, <code>_billing_fv_vat</code>); 18+ megerősítés.</p>",
                 check="a SuperFaktúra bővítmény ezekből tegye a számlára (08.3)."),
            dict(id="co-account", who="Kész – ellenőrizd", title="Fiók",
                 desc="<p>Fiók (rendelések, címek, adatok) a téma kinézetével, a menüben a Kedvencek (saját kód, böngészőben + bejelentkezve a fiókban).</p>",
                 check="regisztráció, belépés, rendelés megtekintése."),
        ]),
        dict(id="integr", title="Szállítás, fizetés, számlázás", intro="A díjak, kulcsok és szerződéses adatok az ügyféltől jönnek; "
             "a prototípus díjai mintaértékek („vzor”).", items=[
            dict(id="int-packeta", who="Laci", title="Packeta: átvételi pont / Z-BOX és házhoz szállítás",
                 desc="<p>A témában van egy <b>minta</b> szállítási mód („First Vape – Packeta (minta)”): súlysávos díj, ingyenes küszöb, átvételi pont választó (minta lista, vagy API-kulccsal a Packeta widget) – a díjak mintaértékek. Élesítéshez a hivatalos <b>Packeta bővítmény</b> (API-kulcs a portálon), a módjai a két zónába, a minta módot kapcsold ki. A díjak a kérdőívből; utána Adatok → „A díjak véglegesek”.</p>",
                 check="SK és FR: átvételi pont / Z-BOX és házhoz, a Packeta címke és a csomagátadás működik."),
            dict(id="int-teya", who="Laci", title="Teya: kártya, Apple Pay, Google Pay",
                 desc="<p>Teya fizetési kapu bővítmény, előbb tesztkulcsokkal: kártya, Apple Pay, Google Pay. Az utánvét a témában kész (díj piaconként: Adatok). A kulcs a bővítmény beállításába / wp-configba, <b>soha a repóba</b>. Mindkét domain engedélyezve.</p>",
                 check="sikeres és sikertelen fizetés is helyesen zárul; utánvétnél a díj a végösszegben."),
            dict(id="int-sf", who="Laci", title="SuperFaktúra: számla rendeléskor / fizetéskor",
                 desc="<p>SuperFaktúra bővítmény: számla a rendelés nyelvén (<code>_fv_lang</code>), helyes ÁFÁ-val, cégadatokkal (<code>_billing_fv_id</code> / <code>_billing_fv_vat</code>), kártyánál fizetéskor, utánvétnél a beállított állapotnál.</p>",
                 check="SK és FR tesztrendelés: a számla nyelve és ÁFÁ-ja helyes."),
            dict(id="int-mail", who="Laci", title="E-mailek és SMTP",
                 desc="<p>WooCommerce-levelek: a vásárló a rendelés nyelvén kapja (a téma a domain szerint vált, a későbbi állapotlevelek is). Feladó: <code>info@firstvape.sk</code> (az ügyféllel egyeztetve), WP Mail SMTP a tárhely postafiókjával.</p>",
                 check="a visszaigazolás megérkezik a vásárlónak és az adminnak, nem spamként."),
            dict(id="int-adulto", who="Laci", title="Adulto korellenőrzés (SK, kötelező)",
                 desc="<p>Az ügyfél kérése (2026-10-22): Szlovákiában a nikotinos termékek távértékesítésénél kötelező az életkor-ellenőrző rendszer (89/2016 Z. z.). <b>A témában kész</b> (<code>inc/ageverify.php</code>): nikotinos kosárnál (158 termék: <code>pa_nikotin</code> &gt; 0 mg, terméknél felülírható) a pénztárban az Adulto widget, sikeres ellenőrzés nélkül nincs rendelés; a rendeléshez azonosító, időpont, mód, eredmény + megjegyzés; a rendeléslistában oszlop, keresés az azonosítóra, CSV-export (SOI). A te részed: az ügyfél Adulto-kulcsai (nyilvános + privát, a firstvape.sk domainhez) a Megjelenés → First Vape → Korellenőrzés fülön, a widget szkriptjének címe és a válasz mezőnevei az Adulto fejlesztői leírásából (adulto.cz/pro-vyvojare), a dev oldalon addig teszt mód.</p>",
                 check="élő kulccsal: nikotinos termékkel ellenőrzés nélkül nem megy a rendelés, ellenőrzéssel igen, és az adatok a rendelésnél, a CSV-exportban; a teszt mód élesben KI; <code>wp firstvape check</code> zöld."),
        ]),
        dict(id="market", title="Nyelvek és piacok", intro="Áron döntése (2026-10-19): <b>egy webshop két domainnel</b>. "
             "<b>firstvape.sk</b> = szlovák felület + SK piac, <b>firstvape.fr</b> = francia felület + FR piac. Egy WordPress, egy "
             "termékkatalógus, egy készlet és egy rendeléslista; a nyelv és a piac a domainnel együtt vált.", items=[
            dict(id="mk-domain", who="Laci", title="Egy WordPress, két domain (a téma kezeli)",
                 desc="<p><b>A téma kezeli a két domaint</b> (WPML nem kell): Megjelenés → First Vape → Adatok → Szlovák domain: <code>firstvape.sk</code>, Francia domain: <code>firstvape.fr</code>. Mindkét domain ugyanarra a WordPressre mutasson (alias / parkolt domain), mindkettőn SSL. A <code>.fr</code>-en francia felület, ÁFA, szállítás, ország; minden link, kép és CSS a látogató domainjén (tesztelve két hosttal). Dev / staging: <code>?lang=fr</code>.</p>",
                 check="a firstvape.fr franciául jön be ugyanabból a WordPressből; a nyelvváltó a másik domain ugyanazon oldalára visz; egy rendelés mindkét domainről ugyanabba a listába kerül; Search Console mindkét domainre."),
            dict(id="mk-lang", who="Kész – ellenőrizd", title="SK alapnyelv + FR",
                 desc="<p>A felület szövegei a téma szótárából (SK tegező, FR magázó), a WordPress és a WooCommerce szövegei a nyelvi csomagokból; a kategóriák, márkák, rövid leírások francia változata metában. A hosszú termékleírás SK-ul a tartalomban, franciául a <code>_fv_desc_fr</code> metában – a telepítő tölti (a mi szövegünk az ügyfél angol szövegéből, <code>prototype/csv/leirasok-sk-fr.json</code>).</p>",
                 check="FR-en nincs szlovák maradvány (a termékneveken kívül)."),
            dict(id="mk-legal", who="Laci", title="Jogi oldalak piaconként (helyőrzővel)",
                 desc="<p>A jogi oldalak piaconként létrejöttek helyőrző szöveggel (szerkeszthető blokkok, a pénztár pipája a piac ÁSZF-jére és adatvédelmére mutat). A végleges szöveget az ügyfél jogásza adja: cseréld, a „legal-ph” bekezdést töröld. Süti-hozzájárulás és GA4 csak hozzájárulással: élesítéskor (a témában még nincs süti-sáv).</p>",
                 check="<code>wp firstvape check</code>: nincs „helyőrző szöveg” figyelmeztetés."),
            dict(id="mk-fr", who="Kész – ellenőrizd", title="Eldobható e-cigaretta nincs a kínálatban",
                 desc="<p>Az ügyfél döntése (2026-10-20): az eldobható e-cigarettákat (ELFBAR 600) nem árulja – az EU 2027-től tiltja, Franciaországban már tilos. Az Eldobható főkategória és a hozzá tartozó cikk megszűnt; a francia piacon nincs mit rejteni.</p>",
                 check="sem a .sk-n, sem a .fr-en nincs Eldobható kategória, ELFBAR 600 vagy jednorazové / jetable szöveg."),
        ]),
        dict(id="test", title="Belső tesztelés", intro="Ez a CRM „Élesítés 1/4” feladat BELSŐ TESZTELÉS pontja előtt fut.", items=[
            dict(id="test-order", who="Laci", title="Teljes tesztrendelés mobilon és laptopon, SK és FR",
                 desc="<p>Minden szállítási és fizetési móddal, mobilon és laptopon, SK és FR domainen: kosár → pénztár → fizetés → köszönő oldal → levél → számla → Packeta. A téma e2e tesztje (<code>tests/wp/e2e.mjs</code>, 69 ellenőrzés) a minta módokkal átment; a valódi bővítményekkel neked kell végigvinni.</p>",
                 check="minden ág hibátlan, a levelek kimennek."),
            dict(id="test-ui", who="Laci", title="Megjelenés és szerkesztő",
                 desc="<p>390, 768, 1024, 1280, 1440 px: nincs vízszintes görgetés, oldalanként egy H1 (az e2e ezt ellenőrzi). Minden oldal érvényes a szerkesztőben (<code>tests/wp/editor-check.mjs</code>). 404, keresés, mobil menü, 18+ kapu.</p>",
                 check="képernyőképek a CRM-feladatban."),
        ]),
        dict(id="golive1", title="Élesítés 1/4 – Előfeltételek", intro="A CRM „Élesítés 1/4” feladata. A következő fázis csak akkor indul, ha ez kész.", items=[
            dict(id="gl1", who="Laci", title="Fejlesztés kész, dev szerveren, belső teszt, jóváhagyás",
                 desc="<p>FEJLESZTÉS kész · PRODUKTUM (fájlok + adatbázis) a dev szerveren · BELSŐ TESZTELÉS (a 10-es fázis) · "
                      "ÉLESÍTÉS JÓVÁHAGYVA (Áron belső ellenőrzése).</p>",
                 check="a CRM-feladat négy pontja ki van pipálva."),
        ]),
        dict(id="golive2", title="Élesítés 2/4 – Domain és tárhely", intro="A hozzáféréseket az ügyfél a portálon adja meg.", items=[
            dict(id="gl2", who="Laci", title="Hozzáférés, domain, SSL, e-mail, staging, éles mappa",
                 desc="<p>SZERVER HOZZÁFÉRÉS (portálon) · a firstvape.sk és a firstvape.fr is ugyanarra a tárhelyre és WordPressre mutat · SSL mindkettőre + https-átirányítás · "
                      "a régi Joomla / VirtueMart oldal a váltásig fut, a postafiókok megmaradnak (MX-hez ne nyúlj) · e-mail fiókok · "
                      "staging aldomain / almappa · éles mappa előkészítve.</p>",
                 check="a CRM „Élesítés 2/4” feladat minden pontja kész."),
        ]),
        dict(id="golive3", title="Élesítés 3/4 – Staging", items=[
            dict(id="gl3", who="Laci", title="Staging az ügyfél valódi adataival",
                 desc="<p>Feltöltés · Better Search Replace (a JSON-escape-elt <code>https:\\/\\/</code> alakra is, <b>mindkét domainre</b>; a staging két aldomainnel: Megjelenés → First Vape → Adatok → Domainek ezekre) · permalinkek · e-mail címek · SMTP · "
                      "IMPORTÁLÁS az ügyfél Excel/CSV-jéből (a 04-es fázis importálójával) · Packeta, Teya, SuperFaktúra <b>teszt</b> adatokkal · "
                      "belső teszt · az ügyfél a portálon végigvisz egy teljes tesztrendelést mobilon és laptopon, és jóváhagyja.</p>",
                 check="az ügyfél jóváhagyása a portálon megvan."),
        ]),
        dict(id="golive4", title="Élesítés 4/4 – Élesítés", items=[
            dict(id="gl4", who="Laci", title="Éles oldal, éles kulcsok, mérés, keresőrobotok utoljára",
                 desc="<p>Másolás · Better Search Replace (mindkét domain) · First Vape → Adatok → Domainek az éles domainekre · permalinkek · e-mail · "
                      "Packeta, Teya, SuperFaktúra <b>éles</b> adatokkal (a Teyánál mindkét domain engedélyezve) · "
                      "301-ek a régi címekről (ha a régi oldalon volt francia változat, az a firstvape.fr-re) · GTM, GA4 (hozzájárulással), Yoast, SEO OS Connect · belső teszt (egy valódi kis rendelés, "
                      "utána sztornó) · ügyfél-jóváhagyás · végül a „Keresőmotorok ne indexeljék” jelölő kivétele.</p>",
                 check="a CRM „Élesítés 4/4” feladat minden pontja kész, az oldal indexelhető."),
        ]),
    ],
)
