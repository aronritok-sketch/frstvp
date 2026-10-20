/*
 * First Vape – prototípus: nyelv és piac (i18n)
 *
 * Piacok: Szlovákia (sk, alapértelmezett) és Franciaország (fr), mindkettő EUR.
 * A nyelv és a piac együtt vált: SK = szlovák felület + 23% DPH + Packeta; FR = francia felület + 20% TVA + Packeta (szolgáltatás egyeztetendő).
 * A választás az FV.store-ban marad meg (localStorage `fv_lang`, try/catch-csel).
 *
 * WordPress megfelelő: WPML vagy Polylang for WooCommerce (nyelvenként külön URL: /sk/…, /fr/…),
 * a felületi szövegek a child téma .po/.mo fájljaiban (text domain: firstvape), az ÁFA a WooCommerce adóbeállításaiból.
 *
 * FV.t(kulcs, változók)  – felületi szöveg a szótárból ({x} helyettesítéssel)
 * FV.L(érték)            – { sk, fr } objektumból az aktuális nyelv
 * FV.pl(kulcs, n)        – többes szám (sk: 1 / 2–4 / 5+, fr: 1 / több)
 * FV.nw(kulcs, n)        – „n szó” (pl. „5 produktov”)
 */
(function (FV) {
  'use strict';

  var LANGS = ['sk', 'fr'];

  FV.I18N = {
    sk: {
      home: 'Úvod', crumbsAria: 'Omrvinková navigácia', logoAria: 'First Vape – úvodná stránka', skip: 'Preskočiť na obsah',
      close: 'Zavrieť', menuOpen: 'Otvoriť menu', brands: 'Značky', allBrands: 'Všetky značky', allBrandsAZ: 'Všetky značky od A po Z',
      sale: 'Akcie', account: 'Účet', myAccount: 'Môj účet', orders: 'Objednávky', myOrders: 'Moje objednávky', wishlist: 'Obľúbené',
      contact: 'Kontakt', cart: 'Košík', products: 'Produkty', info: 'Informácie', customer: 'Zákazník',
      wProducts: ['produkt', 'produkty', 'produktov'], wSubcats: ['podkategória', 'podkategórie', 'podkategórií'],
      wBrands: ['značka', 'značky', 'značiek'], wColors: ['farba', 'farby', 'farieb'], wFlavors: ['príchuť', 'príchute', 'príchutí'],
      wResults: ['výsledok', 'výsledky', 'výsledkov'], wOrders: ['objednávka', 'objednávky', 'objednávok'],
      wFav: ['obľúbený', 'obľúbené', 'obľúbených'], wAddr: ['adresa', 'adresy', 'adries'], wItems: ['ks', 'ks', 'ks'],
      puffUnit: 'potiahnutí',
      featuredBrand: 'Odporúčaná značka', elfaPromoTitle: 'Pod systém ELFA', elfaPromoText: 'Jedna batéria, 3 farby, desiatky príchutí podov.',
      subcats: 'Podkategórie', seeAll: 'Zobraziť všetko', byPuffs: 'Podľa počtu potiahnutí', brandsInCat: 'Značky v tejto kategórii', popularNow: 'Práve populárne',
      age18: 'Len pre osoby staršie ako 18 rokov', langAria: 'Jazyk a krajina',
      searchLabel: 'Hľadať v produktoch', searchPh: 'Značka, príchuť, počet potiahnutí… napr. Elfbar 40000', searchBtn: 'Hľadať',
      acctCartAria: 'Účet a košík', mainNavAria: 'Hlavná navigácia', mobileMenuAria: 'Mobilné menu',
      cartEmpty: 'Košík je prázdny.', startShopping: 'Začať nakupovať', freeLeft: 'Ešte <b>{x}</b> a doprava je zadarmo.',
      freeReached: '<b>Doprava zadarmo</b> – tvoja objednávka ju má.', subtotal: 'Medzisúčet', parcelWeight: 'Hmotnosť balíka',
      viewCart: 'Zobraziť košík', toCheckout: 'Prejsť k pokladni',
      a_iz: 'Príchuť', a_nikotin: 'Sila nikotínu', a_nikotinShort: 'Nikotín', a_ml: 'Objem', a_puff: 'Počet potiahnutí',
      a_kompat: 'Kompatibilita', a_szin: 'Farba', a_marka: 'Značka', a_kat: 'Kategória', a_keszlet: 'Dostupnosť',
      puffShort: 'Potiahnutia', colorsShort: 'Farby', system: 'Systém', compatWith: 'Kompatibilné s {x}',
      decrease: 'Znížiť', increase: 'Zvýšiť',
      nlTitle: 'Nové príchute a akcie ako prvý', nlText: 'Najviac dva e-maily mesačne. Odhlásiť sa môžeš kedykoľvek.',
      email: 'E-mailová adresa', emailPh: 'meno@email.sk', subscribe: 'Prihlásiť sa',
      nlAccept: 'Súhlasím so <a href="#/oldal/privacy">zásadami ochrany osobných údajov</a> a mám viac ako 18 rokov.',
      ftrAbout: 'Keď to raz vyskúšaš, zaručene si to zamiluješ! Pozri si naše výnimočné vape produkty. Zo skladu na Slovensku, doručenie cez Packeta.',
      nicWarn: 'Tento výrobok obsahuje nikotín, ktorý je vysoko návykovou látkou. Jeho používanie sa neodporúča nefajčiarom.',
      madeBy: 'Web: HelloProVision',
      ageQ: 'Máš viac ako 18 rokov?', ageText: 'Na stránkach First Vape sú výrobky s obsahom nikotínu, ktoré si môžu kúpiť iba plnoleté osoby.',
      ageYes: 'Áno, mám viac ako 18 rokov', ageNo: 'Nie', ageDenied: 'Prepáč, obsah stránky pre teba nie je dostupný.',
      lsNone: 'Pre <b>{q}</b> sme nič nenašli. Skús značku alebo počet potiahnutí.', lsAll: 'Všetky výsledky ({n})',
      sBrand: 'Značka', sCat: 'Kategória', sPuff: 'Potiahnutia', sFlavor: 'Príchuť',
      stDisc: 'Predaj ukončený', stDiscShort: 'Ukončené', stOut: 'Momentálne vypredané', stOutShort: 'Vypredané',
      stLow: 'Skladom – posledné {n} ks', stLowShort: 'Posledné kusy', stIn: 'Skladom',
      fInstock: 'Skladom', fOut: 'Vypredané', fDisc: 'Predaj ukončený',
      sortPop: 'Obľúbenosť', sortNew: 'Najnovšie', sortAsc: 'Od najlacnejších', sortDesc: 'Od najdrahších', sortPuff: 'Podľa počtu potiahnutí',
      relPods: 'Kompatibilné pody a žhaviace hlavy', relDevice: 'Kompatibilné zariadenie', relInstead: 'Namiesto neho odporúčame', relAlt: 'Alternatívy',
      addToCartAria: 'Do košíka: {x}', toCart: 'Do košíka', notifyShort: 'Upozorniť ma', substitute: 'Náhrady',
      wishAria: 'Do obľúbených: {x}',
      heroEyebrow: 'Pody · Liquidy · Zariadenia · Príslušenstvo', heroH1: 'Ponor sa do <span class="hl">oblaku príchutí!</span>',
      heroCta1: 'Prezrieť ponuku', heroCta2: 'Všetky značky',
      pfLabel: 'Vyhľadávač podľa potiahnutí', pfQ: 'Koľko potiahnutí chceš z jedného zariadenia?', pfGo: 'Zobraziť produkty ({n})',
      weeklyDeals: 'Akcie', allDeals: 'Všetky akcie', dealsEyebrow: 'Akciová cena do vypredania zásob',
      sysTitle: 'Jedna batéria, {n} {w} podov',
      sysText: 'Pri každom pode a zariadení uvádzame, s ktorým systémom funguje. Na stránke produktu sa automaticky zobrazia kompatibilné pody aj vhodné zariadenie.',
      ourBrands: 'Naše značky', bestsellers: 'Najobľúbenejšie produkty', custFav: 'Obľúbené u zákazníkov', popCats: 'Populárne kategórie',
      uspOrigT: '100 % originálne produkty', uspOrigD: 'Priamo od výrobcov a oficiálnych distribútorov.',
      uspPayT: 'Bezpečná platba', uspPayD: 'Platobná karta, Apple Pay a Google Pay cez platobnú bránu Teya.',
      uspInvT: 'Elektronická faktúra', uspInvD: 'Faktúru ti pošleme e-mailom hneď po objednávke.',
      heroLead: 'Medzi bezdymovými zariadeniami a príchuťami First Vape určite nájdeš svoju obľúbenú, nech máš chuť na čokoľvek. Zariadenia, predplnené pody, liquidy aj príslušenstvo, doručenie cez Packeta za 1–2 dni.',
      rangeTitle: 'Ponuka produktov', rangeEyebrow: 'Kategórie', allProducts: 'Všetky produkty',
      whyEyebrow: 'Prečo vape?', whyTitle: 'Prečo si vybrať vape namiesto cigarety?',
      whyItems: [['cloud', 'Menej zápachu', 'Para z e-cigarety zvyčajne zanecháva na oblečení a v byte výrazne menej zápachu ako cigaretový dym.'],
        ['coin', 'Opakované použitie', 'Pri znovu nabíjateľnom pod systéme meníš iba pod alebo coil, zariadenie ti zostáva.'],
        ['drop', 'Voľba bez nikotínu', 'Mnohé príchute sú dostupné aj vo variante 0 mg, bez nikotínu.'],
        ['star', 'Desiatky príchutí', 'Ovocné, mentolové, dezertné aj klasické príchute ku každému zariadeniu.'],
        ['box', 'Kompaktné zariadenia', 'Zmestia sa do vrecka aj kabelky, vezmeš ich kamkoľvek.'],
        ['bolt', 'Jednoduché použitie', 'Predplnené pody netreba plniť: vložíš pod a môžeš začať.']],
      bestTitle: 'First Vape je najlepší vape!', bestText: 'Prémiová kvalita, bohaté príchute a vybrané bezdymové produkty. To od nás dostane každý zákazník.',
      bestItems: ['Prémiové produkty', 'Široký a pestrý výber príchutí', 'Kompaktné zariadenia', '100 % záruka originality', 'Doručenie Packeta za 1–2 pracovné dni', 'Bezpečná platba kartou'],
      blog: 'Blog', blogTitle: 'Všetko o vape, pre teba!', blogIntro: 'Tipy, novinky a predstavenie produktov.', moreArticles: 'Ďalšie články', readMore: 'Čítať ďalej',
      partnersTitle: 'Naše značky', onSaleCat: 'Akciové produkty', moreLinksAria: 'Ďalšie odkazy',
      all: 'Všetko', saleDesc: 'Všetky akciové produkty na jednom mieste. Akciová cena platí do vypredania zásob.',
      searchTitle: 'Vyhľadávanie', searchCrumb: 'Vyhľadávanie: {q}', filters: 'Filtre', closeFilters: 'Zavrieť filtre',
      showProducts: 'Zobraziť produkty', sort: 'Zoradiť', pagination: 'Stránkovanie',
      srHead: '{n} {w} pre <q>{q}</q>', understood: 'Hľadali sme:',
      srEmpty: 'Nič sme nenašli. Skús hľadať podľa značky (napr. {a1}), príchute ({a2}) alebo počtu potiahnutí ({a3}).',
      noFilterResults: 'Zvoleným filtrom nezodpovedá žiadny produkt.', clearFilters: 'Zrušiť filtre', price: 'Cena', clearAll: 'Zrušiť všetko',
      showN: 'Zobraziť ({n})', minPrice: 'Minimálna cena', maxPrice: 'Maximálna cena', onlySale: 'Iba akciové produkty',
      brandsIntro: '{n} {w}, každá s vlastnou stránkou a ponukou, ktorú môžeš filtrovať.', azAria: 'Začiatočné písmeno',
      choose: 'vyber', qty: 'Množstvo', addToCartBig: 'Pridať do košíka', toWish: 'Pridať do obľúbených',
      notifyText: '<b>Momentálne nie je skladom.</b> Nechaj nám e-mail a dáme ti vedieť, keď bude znova dostupný.',
      notifyMe: 'Upozorniť ma', notifyOk: 'Ďakujeme! Keď bude produkt znova skladom, pošleme ti e-mail.',
      discTitle: 'Predaj tohto produktu bol ukončený.', discText: 'Výrobca ho už nedodáva, preto ho nie je možné objednať. Nižšie nájdeš náhradné produkty.',
      substitutes: 'Náhradné produkty', sku: 'Kód produktu (SKU)', weight: 'Hmotnosť', img: '{n}. obrázok',
      save: 'Ušetríš {x}', priceVat: 'Cena vrátane {r} DPH',
      perkShip: '<b>Packeta: výdajné miesto, Z-BOX alebo doručenie na adresu</b> · objednávky do 14:00 odosielame ešte v ten deň',
      perkInvoice: 'Elektronická faktúra hneď po objednávke', perkReturn: 'Originálny produkt, 14 dní na odstúpenie od zmluvy (v neotvorenom balení)',
      catsLabel: 'Kategórie:', tabDesc: 'Popis', tabSpec: 'Parametre', tabShip: 'Doprava a vrátenie',
      shipPane: 'Doručujeme cez Packeta na výdajné miesto, do Z-BOXu alebo na adresu. Pri objednávke nad <b>{free}</b> je doprava zadarmo.',
      returnText: 'Produkt v neotvorenom, nepoškodenom obale môžeš vrátiť do 14 dní. Podrobnosti: {link}.',
      dispText: 'Jednorazová e-cigareta {b} je naplnená z výroby, netreba ju plniť: rozbalíš a môžeš začať. Po spotrebovaní ju odovzdáš na recykláciu. ',
      dispBig: 'Pri väčšej kapacite ({p}, odhad výrobcu) sa batéria nabíja cez USB-C, aby vydržala až do minutia liquidu.',
      dispSmall: 'Vďaka kompaktnej veľkosti sa pohodlne zmestí do vrecka aj do kabelky.',
      inBox: 'Obsah balenia', manual: 'Návod na použitie v slovenčine',
      podText: 'Predplnený, uzavretý pod: netreba ho plniť a netečie. Stačí ho zacvaknúť do kompatibilnej batérie ({k}) a môžeš začať.',
      kitText: 'Znovu nabíjateľné zariadenie: batéria sa nabíja cez kábel USB-C a meníš len pod alebo coil.',
      kitBox: ['1× batéria', '1× pod', 'Nabíjací kábel USB-C', 'Návod na použitie v slovenčine'],
      liquidText: 'Fľaška s detskou poistkou, v súlade s európskou smernicou TPD. Skladuj na suchom a chladnom mieste mimo dosahu detí.',
      overX: 'Objednávka nad {x}', free: 'Zadarmo',
      steps: ['Košík', 'Údaje a doprava', 'Platba', 'Potvrdenie'], orderSteps: 'Kroky objednávky',
      cartEmptyH: 'Tvoj košík je prázdny', cartEmptyP: 'Pozri si naše najobľúbenejšie produkty.',
      skuShort: 'Kód:', perPc: '/ks', remove: 'Odstrániť', coupon: 'Zľavový kód', couponPh: 'napr. FIRST10', apply: 'Uplatniť',
      nicFree: 'bez nikotínu', relCross: 'Odporúčame k produktu', a_typ: 'Typ produktu', variantsCount: '{n} variantov tohto produktu', puffUpTo: 'do {n}', puffFrom: '{n} a viac',
      a_puffF: 'Počet potiahnutí (odhad výrobcu)', puffEst: 'Potiahnutia (odhad)', a_ohm: 'Odpor (Ω)',
      puffNote: 'Filter hľadá v rozsahu, nie presnú hodnotu. Počet potiahnutí je odhad výrobcu, skutočný počet závisí od spôsobu používania.',
      sysShort: 'Systém {x}', relParts: 'Kompatibilné pody a cartridge – systém {x}', relDevices: 'Kompatibilné zariadenia – systém {x}', relVariants: 'Ďalšie varianty',
      removeAria: 'Odstrániť z košíka: {x}', deliveryTime: 'Doručenie', priceFrom: 'Cena od',
      shipSample: 'Ceny dopravy sú zatiaľ orientačné, pred spustením ich potvrdíme podľa zmluvy s Packetou.',
      shipDiff: 'Doručiť na inú adresu', pickupSearch: 'Hľadať výdajné miesto (mesto, PSČ, ulica)',
      errField: 'Vyplň toto pole.', errEmail: 'Zadaj platnú e-mailovú adresu.', errPhone: 'Zadaj platné telefónne číslo.',
      errZip: 'Zadaj platné PSČ (napr. 811 01).', errCheck: 'Na pokračovanie je potrebný tvoj súhlas.', errPickup: 'Vyber výdajné miesto alebo Z-BOX.',
      errSummary: 'Niektoré údaje chýbajú alebo nie sú správne. Skontroluj označené polia.',
      couponMsg: 'Zľavové kódy budú fungovať cez kupóny WooCommerce; v prototype nie je platný žiadny kód.',
      summaryH: 'Súhrn', discount: 'Zľava', shipping: 'Doprava', total: 'Spolu na úhradu', vatLine: 'z toho DPH {r}', pricesInclVat: 'Všetky ceny sú vrátane DPH {r}.',
      backHome: 'Späť na úvod', fillDemoText: 'Prototyp: polia môžeš jedným klikom vyplniť ukážkovými údajmi.', fillDemo: 'Vyplniť ukážkové údaje',
      coContact: 'Kontaktné údaje', phone: 'Telefón', billing: 'Fakturačné údaje', first: 'Meno', last: 'Priezvisko',
      buyAsCompany: 'Nakupujem na firmu (faktúra na firmu)', companyName: 'Obchodné meno', country: 'Krajina', zip: 'PSČ', city: 'Mesto / obec', street: 'Ulica a číslo domu',
      shipMethod: 'Spôsob dopravy', choosePickup: 'Vyber výdajné miesto…', payment: 'Platba',
      payCard: 'Platobná karta, Apple Pay, Google Pay', payCardNote: 'Bezpečná online platba cez Teya',
      cod: 'Dobierka', codNote: 'Platba pri prevzatí zásielky v hotovosti alebo kartou', codFee: 'Poplatok za dobierku',
      note: 'Poznámka', noteLabel: 'Poznámka k objednávke', notePh: 'napr. kód od brány, požiadavka na doručenie',
      confirm18: 'Potvrdzujem, že mám viac ako 18 rokov.',
      terms: 'Prečítal(a) som si <a href="#/oldal/terms">obchodné podmienky</a> a <a href="#/oldal/privacy">zásady ochrany osobných údajov</a> a súhlasím s nimi.',
      yourOrder: 'Tvoja objednávka', placeOrder: 'Objednať s povinnosťou platby', cardNote: 'Údaje o karte spracúva Teya, my ich neukladáme.',
      errRequired: 'Vyplň povinné polia', errAccept: ' a potvrď súhlas s podmienkami', chooseOpt: 'Vyber: {x}.',
      thanksH: 'Ďakujeme za objednávku!', orderNo: 'Číslo objednávky:', amount: 'Suma:',
      tl1: 'Objednávka prijatá', tl1s: 'Potvrdenie sme poslali na {x}', tlCod: 'Platba na dobierku', tlCodS: 'Zaplatíš kuriérovi.',
      tlPaid: 'Platba prebehla úspešne (Teya)', tlPaidS: 'Identifikátor transakcie nájdeš v e-maile.',
      tlInv: 'Faktúra odoslaná', tlInvS: 'Faktúru sme automaticky vystavili a poslali e-mailom.',
      tlShip: 'Odovzdanie zásielky Packete', tlShipS: 'Číslo na sledovanie zásielky ti pošleme e-mailom hneď po odoslaní.',
      overview: 'Prehľad', addresses: 'Adresy', accountDetails: 'Údaje účtu', logout: 'Odhlásiť sa', accountMenu: 'Menu účtu',
      wishEmpty: 'Zatiaľ nemáš žiadne obľúbené produkty. Ulož si ich sem ikonou srdca na karte produktu.', browse: 'Prezerať produkty',
      billingAddr: 'Fakturačná adresa', shipAddr: 'Dodacia adresa', edit: 'Upraviť', saveBtn: 'Uložiť', saved: 'Uložené.',
      hello: 'Ahoj, {n}!', accIntro: 'Tu nájdeš svoje objednávky, obľúbené produkty a adresy.', lastOrder: 'Posledná objednávka',
      order: 'Objednávka', date: 'Dátum', status: 'Stav', tracking: 'Sledovanie zásielky', invoice: 'Faktúra',
      stShipped: 'Odovzdané kuriérovi', stDelivered: 'Doručené',
      nfH: 'Stránka sa nenašla', nfP: 'Produkt už možno nie je dostupný. Skús vyhľadávanie.',
      titleHome: 'First Vape – e-cigarety, pody, liquidy', titleCheckout: 'Pokladňa', titleThanks: 'Ďakujeme za objednávku', titleNotFound: 'Stránka sa nenašla',
      addedToCart: '<b>{x}</b> je v košíku.', wishAdded: 'Pridané do obľúbených.', wishRemoved: 'Odstránené z obľúbených.',
      nlDone: 'Hotovo! Poslali sme ti potvrdzovací e-mail.',
      contactName: 'Meno', orderNoOpt: 'Číslo objednávky (ak ho máš)', message: 'Správa', send: 'Odoslať správu',
      contactOk: 'Ďakujeme, správu sme dostali. Odpovieme do 1 pracovného dňa.',
      legalPh: 'Zástupný text – finálne znenie dodá klient (právnik). Údaje v hranatých zátvorkách doplní klient.',
      pageTitles: { shipping: 'Doprava a platba', terms: 'Obchodné podmienky', privacy: 'Ochrana osobných údajov', withdrawal: 'Odstúpenie od zmluvy', cookies: 'Súbory cookie', contact: 'Kontakt' },
      pageShort: { terms: 'Obchodné podmienky', privacy: 'Ochrana údajov' }
    },

    fr: {
      home: 'Accueil', crumbsAria: 'Fil d’Ariane', logoAria: 'First Vape – accueil', skip: 'Aller au contenu',
      close: 'Fermer', menuOpen: 'Ouvrir le menu', brands: 'Marques', allBrands: 'Toutes les marques', allBrandsAZ: 'Toutes les marques de A à Z',
      sale: 'Promotions', account: 'Compte', myAccount: 'Mon compte', orders: 'Commandes', myOrders: 'Mes commandes', wishlist: 'Favoris',
      contact: 'Contact', cart: 'Panier', products: 'Produits', info: 'Informations', customer: 'Espace client',
      wProducts: ['produit', 'produits'], wSubcats: ['sous-catégorie', 'sous-catégories'], wBrands: ['marque', 'marques'],
      wColors: ['coloris', 'coloris'], wFlavors: ['saveur', 'saveurs'], wResults: ['résultat', 'résultats'], wOrders: ['commande', 'commandes'],
      wFav: ['favori', 'favoris'], wAddr: ['adresse', 'adresses'], wItems: ['article', 'articles'],
      puffUnit: 'bouffées',
      featuredBrand: 'Marque à la une', elfaPromoTitle: 'Système pod ELFA', elfaPromoText: 'Une batterie, 3 coloris, des dizaines de saveurs de pods.',
      subcats: 'Sous-catégories', seeAll: 'Tout voir', byPuffs: 'Par nombre de bouffées', brandsInCat: 'Marques de cette catégorie', popularNow: 'Populaire en ce moment',
      age18: 'Vente réservée aux personnes majeures', langAria: 'Langue et pays',
      searchLabel: 'Rechercher un produit', searchPh: 'Marque, saveur, bouffées… ex. Elfbar 40000', searchBtn: 'Rechercher',
      acctCartAria: 'Compte et panier', mainNavAria: 'Navigation principale', mobileMenuAria: 'Menu mobile',
      cartEmpty: 'Votre panier est vide.', startShopping: 'Commencer mes achats', freeLeft: 'Plus que <b>{x}</b> pour profiter de la livraison offerte.',
      freeReached: 'La <b>livraison est offerte</b> pour votre commande.', subtotal: 'Sous-total', parcelWeight: 'Poids du colis',
      viewCart: 'Voir le panier', toCheckout: 'Passer commande',
      a_iz: 'Saveur', a_nikotin: 'Taux de nicotine', a_nikotinShort: 'Nicotine', a_ml: 'Contenance', a_puff: 'Nombre de bouffées',
      a_kompat: 'Compatibilité', a_szin: 'Couleur', a_marka: 'Marque', a_kat: 'Catégorie', a_keszlet: 'Disponibilité',
      puffShort: 'Bouffées', colorsShort: 'Coloris', system: 'Système', compatWith: 'Compatible {x}',
      decrease: 'Diminuer', increase: 'Augmenter',
      nlTitle: 'Nouvelles saveurs et promos en avant-première', nlText: 'Deux e-mails par mois maximum. Désinscription à tout moment.',
      email: 'Adresse e-mail', emailPh: 'nom@email.fr', subscribe: 'Je m’inscris',
      nlAccept: 'J’accepte la <a href="#/oldal/privacy">politique de confidentialité</a> et je certifie avoir 18 ans ou plus.',
      ftrAbout: 'Essayez une fois et vous allez adorer ! Découvrez nos produits vape, 100 % authentiques, expédiés depuis notre entrepôt en Slovaquie.',
      nicWarn: 'Ce produit contient de la nicotine, substance qui crée une forte dépendance. Son utilisation par les non-fumeurs n’est pas recommandée.',
      madeBy: 'Réalisation : HelloProVision',
      ageQ: 'Avez-vous 18 ans ou plus ?', ageText: 'Le site First Vape propose des produits contenant de la nicotine, dont la vente est réservée aux personnes majeures.',
      ageYes: 'Oui, j’ai 18 ans ou plus', ageNo: 'Non', ageDenied: 'Désolé, le contenu de ce site ne vous est pas accessible.',
      lsNone: 'Aucun résultat pour <b>{q}</b>. Essayez une marque ou un nombre de bouffées.', lsAll: 'Tous les résultats ({n})',
      sBrand: 'Marque', sCat: 'Catégorie', sPuff: 'Bouffées', sFlavor: 'Saveur',
      stDisc: 'Produit arrêté', stDiscShort: 'Arrêté', stOut: 'Actuellement en rupture de stock', stOutShort: 'Rupture',
      stLow: 'Plus que {n} en stock', stLowShort: 'Derniers articles', stIn: 'En stock',
      fInstock: 'En stock', fOut: 'En rupture', fDisc: 'Arrêté',
      sortPop: 'Popularité', sortNew: 'Nouveautés', sortAsc: 'Prix croissant', sortDesc: 'Prix décroissant', sortPuff: 'Nombre de bouffées',
      relPods: 'Pods et résistances compatibles', relDevice: 'Appareil compatible', relInstead: 'Nous vous recommandons plutôt', relAlt: 'Alternatives',
      addToCartAria: 'Ajouter au panier : {x}', toCart: 'Ajouter', notifyShort: 'M’alerter', substitute: 'Alternatives',
      wishAria: 'Ajouter aux favoris : {x}',
      heroEyebrow: 'Pods · E-liquides · Kits · Accessoires', heroH1: 'Plongez dans un <span class="hl">nuage de saveurs !</span>',
      heroCta1: 'Voir l’offre', heroCta2: 'Toutes les marques',
      pfLabel: 'Trouver par bouffées', pfQ: 'Combien de bouffées souhaitez-vous par appareil ?', pfGo: 'Voir les produits ({n})',
      weeklyDeals: 'Promotions', allDeals: 'Toutes les promos', dealsEyebrow: 'Prix promo dans la limite des stocks disponibles',
      sysTitle: 'Une batterie, {n} {w} de pods',
      sysText: 'Pour chaque pod et chaque appareil, nous indiquons le système compatible. La fiche produit affiche automatiquement les pods compatibles et l’appareil adapté.',
      ourBrands: 'Nos marques', bestsellers: 'Meilleures ventes', custFav: 'Les favoris de nos clients', popCats: 'Catégories populaires',
      uspOrigT: 'Produits 100 % authentiques', uspOrigD: 'Directement auprès des fabricants et des distributeurs officiels.',
      uspPayT: 'Paiement sécurisé', uspPayD: 'Carte bancaire, Apple Pay et Google Pay via Teya.',
      uspInvT: 'Facture électronique', uspInvD: 'Votre facture vous est envoyée par e-mail dès la commande.',
      heroLead: 'Parmi les appareils sans fumée et les saveurs First Vape, vous trouverez forcément votre favori, quelle que soit votre envie. Appareils, pods préremplis, e-liquides et accessoires, expédiés depuis la Slovaquie.',
      rangeTitle: 'Nos produits', rangeEyebrow: 'Catégories', allProducts: 'Tous les produits',
      whyEyebrow: 'Pourquoi vapoter ?', whyTitle: 'Pourquoi choisir la vape plutôt que la cigarette ?',
      whyItems: [['cloud', 'Moins d’odeur', 'La vapeur laisse généralement beaucoup moins d’odeur sur les vêtements et à la maison que la fumée de cigarette.'],
        ['coin', 'Réutilisable', 'Avec un système pod rechargeable, vous ne changez que le pod ou la résistance, l’appareil reste.'],
        ['drop', 'Option sans nicotine', 'De nombreuses saveurs existent aussi en 0 mg, sans nicotine.'],
        ['star', 'Des dizaines de saveurs', 'Fruitées, mentholées, gourmandes ou classiques, pour chaque appareil.'],
        ['box', 'Appareils compacts', 'Ils tiennent dans une poche ou un sac : emportez-les partout.'],
        ['bolt', 'Utilisation simple', 'Pods préremplis : rien à remplir, il suffit d’insérer le pod.']],
      bestTitle: 'First Vape, le meilleur de la vape !', bestText: 'Qualité premium, saveurs riches et produits sans fumée sélectionnés : voilà ce que nous offrons à chaque client.',
      bestItems: ['Produits premium', 'Large choix de saveurs', 'Appareils compacts', 'Authenticité garantie à 100 %', 'Expédition rapide depuis la Slovaquie', 'Paiement par carte sécurisé'],
      blog: 'Blog', blogTitle: 'Tout sur la vape, pour vous !', blogIntro: 'Conseils, nouveautés et présentations de produits.', moreArticles: 'Plus d’articles', readMore: 'Lire la suite',
      partnersTitle: 'Nos marques', onSaleCat: 'Produits en promotion', moreLinksAria: 'Liens utiles',
      all: 'Tout', saleDesc: 'Tous les produits en promotion au même endroit. Prix promo dans la limite des stocks disponibles.',
      searchTitle: 'Recherche', searchCrumb: 'Recherche : {q}', filters: 'Filtres', closeFilters: 'Fermer les filtres',
      showProducts: 'Voir les produits', sort: 'Trier par', pagination: 'Pagination',
      srHead: '{n} {w} pour <q>{q}</q>', understood: 'Nous avons compris :',
      srEmpty: 'Aucun résultat. Cherchez par marque (ex. {a1}), par saveur ({a2}) ou par nombre de bouffées ({a3}).',
      noFilterResults: 'Aucun produit ne correspond à ces filtres.', clearFilters: 'Effacer les filtres', price: 'Prix', clearAll: 'Tout effacer',
      showN: 'Afficher ({n})', minPrice: 'Prix minimum', maxPrice: 'Prix maximum', onlySale: 'Uniquement les promotions',
      brandsIntro: '{n} {w}, chacune avec sa propre page et une offre filtrable.', azAria: 'Initiale',
      choose: 'à choisir', qty: 'Quantité', addToCartBig: 'Ajouter au panier', toWish: 'Ajouter aux favoris',
      notifyText: '<b>Actuellement en rupture de stock.</b> Laissez-nous votre e-mail, nous vous préviendrons dès son retour.',
      notifyMe: 'M’alerter', notifyOk: 'Merci ! Nous vous enverrons un e-mail dès que le produit sera de nouveau disponible.',
      discTitle: 'Ce produit a été arrêté.', discText: 'Le fabricant ne le commercialise plus, il ne peut donc plus être commandé. Découvrez ci-dessous des produits de remplacement.',
      substitutes: 'Produits de remplacement', sku: 'Référence (SKU)', weight: 'Poids', img: 'Image {n}',
      save: 'Économie : {x}', priceVat: 'Prix TTC, TVA {r} incluse',
      perkShip: '<b>Expédition depuis la Slovaquie</b> · commandes passées avant 14 h expédiées le jour même',
      perkInvoice: 'Facture électronique envoyée dès la commande', perkReturn: 'Produit authentique, 14 jours pour vous rétracter (emballage non ouvert)',
      catsLabel: 'Catégories :', tabDesc: 'Description', tabSpec: 'Caractéristiques', tabShip: 'Livraison et retours',
      shipPane: 'Livraison Packeta en point relais ou à domicile. Livraison offerte dès <b>{free}</b> d’achat.',
      returnText: 'Vous pouvez retourner un produit dans son emballage d’origine non ouvert sous 14 jours. Détails : {link}.',
      dispText: 'Le jetable {b} est prérempli en usine, rien à remplir : il suffit de le déballer. Une fois vide, déposez-le dans un point de collecte. ',
      dispBig: 'Avec une grande capacité ({p}, estimation du fabricant), la batterie se recharge en USB-C pour aller jusqu’au bout du liquide.',
      dispSmall: 'Compact, il se glisse facilement dans une poche ou un sac.',
      inBox: 'Contenu de la boîte', manual: 'Notice d’utilisation en français',
      podText: 'Pod prérempli et scellé : pas de remplissage, pas de fuite. Il suffit de le clipser sur une batterie compatible ({k}).',
      kitText: 'Un appareil rechargeable : la batterie se recharge via un câble USB-C, vous ne changez que le pod ou la résistance.',
      kitBox: ['1 × batterie', '1 × pod', 'Câble de charge USB-C', 'Notice d’utilisation en français'],
      liquidText: 'Flacon avec bouchon de sécurité enfant, conforme à la directive européenne TPD. À conserver dans un endroit sec et frais, hors de portée des enfants.',
      overX: 'Commande dès {x}', free: 'Offerte',
      steps: ['Panier', 'Coordonnées et livraison', 'Paiement', 'Confirmation'], orderSteps: 'Étapes de la commande',
      cartEmptyH: 'Votre panier est vide', cartEmptyP: 'Découvrez nos produits les plus populaires.',
      skuShort: 'Réf. :', perPc: ' / pièce', remove: 'Supprimer', coupon: 'Code promo', couponPh: 'ex. FIRST10', apply: 'Appliquer',
      nicFree: 'sans nicotine', relCross: 'Recommandé avec ce produit', a_typ: 'Type de produit', variantsCount: '{n} variantes de ce produit', puffUpTo: 'jusqu’à {n}', puffFrom: '{n} et plus',
      a_puffF: 'Nombre de bouffées (estimation du fabricant)', puffEst: 'Bouffées (estimation)', a_ohm: 'Résistance (Ω)',
      puffNote: 'Le filtre recherche par tranche, pas une valeur exacte. Le nombre de bouffées est une estimation du fabricant : il dépend de votre utilisation.',
      sysShort: 'Système {x}', relParts: 'Pods et cartouches compatibles – système {x}', relDevices: 'Appareils compatibles – système {x}', relVariants: 'Autres variantes',
      removeAria: 'Retirer du panier : {x}', deliveryTime: 'Délai', priceFrom: 'À partir de',
      shipSample: 'Tarifs indicatifs, confirmés avant le lancement selon le contrat Packeta.',
      shipDiff: 'Livrer à une autre adresse', pickupSearch: 'Rechercher un point relais (ville, code postal, rue)',
      errField: 'Veuillez remplir ce champ.', errEmail: 'Veuillez saisir une adresse e-mail valide.', errPhone: 'Veuillez saisir un numéro de téléphone valide.',
      errZip: 'Veuillez saisir un code postal valide (ex. 75011).', errCheck: 'Votre accord est nécessaire pour continuer.', errPickup: 'Veuillez choisir un point relais.',
      errSummary: 'Certaines informations manquent ou sont incorrectes. Vérifiez les champs signalés.',
      couponMsg: 'Les codes promo utiliseront les coupons WooCommerce ; aucun code n’est valide dans le prototype.',
      summaryH: 'Récapitulatif', discount: 'Remise', shipping: 'Livraison', total: 'Total TTC', vatLine: 'dont TVA {r}', pricesInclVat: 'Tous les prix sont TTC (TVA {r}).',
      backHome: 'Retour à l’accueil', fillDemoText: 'Prototype : remplissez les champs avec des données d’exemple en un clic.', fillDemo: 'Remplir avec l’exemple',
      coContact: 'Coordonnées', phone: 'Téléphone', billing: 'Adresse de facturation', first: 'Prénom', last: 'Nom',
      buyAsCompany: 'J’achète pour une entreprise (facture au nom de la société)', companyName: 'Raison sociale', country: 'Pays', zip: 'Code postal', city: 'Ville', street: 'Adresse',
      shipMethod: 'Mode de livraison', choosePickup: 'Choisissez un point relais…', payment: 'Paiement',
      payCard: 'Carte bancaire, Apple Pay, Google Pay', payCardNote: 'Paiement en ligne sécurisé via Teya',
      cod: 'Paiement à la livraison', codNote: 'Paiement au livreur – disponibilité à confirmer avec le transporteur', codFee: 'Frais de paiement à la livraison',
      note: 'Commentaire', noteLabel: 'Commentaire sur la commande', notePh: 'ex. digicode, instructions de livraison',
      confirm18: 'Je certifie avoir 18 ans ou plus.',
      terms: 'J’ai lu et j’accepte les <a href="#/oldal/terms">conditions générales de vente</a> et la <a href="#/oldal/privacy">politique de confidentialité</a>.',
      yourOrder: 'Votre commande', placeOrder: 'Commander avec obligation de paiement', cardNote: 'Vos données bancaires sont traitées par Teya, nous ne les conservons pas.',
      errRequired: 'Veuillez remplir les champs obligatoires', errAccept: ' et accepter les conditions', chooseOpt: 'Veuillez choisir : {x}.',
      thanksH: 'Merci pour votre commande !', orderNo: 'N° de commande :', amount: 'Montant :',
      tl1: 'Commande enregistrée', tl1s: 'Confirmation envoyée à {x}', tlCod: 'Paiement à la livraison', tlCodS: 'Vous réglez au livreur.',
      tlPaid: 'Paiement accepté (Teya)', tlPaidS: 'La référence de transaction vous a été envoyée par e-mail.',
      tlInv: 'Facture envoyée', tlInvS: 'La facture a été émise automatiquement et envoyée par e-mail.',
      tlShip: 'Remise au transporteur', tlShipS: 'Le numéro de suivi vous sera envoyé par e-mail dès l’expédition.',
      overview: 'Tableau de bord', addresses: 'Adresses', accountDetails: 'Détails du compte', logout: 'Déconnexion', accountMenu: 'Menu du compte',
      wishEmpty: 'Vous n’avez pas encore de favoris. Enregistrez des produits ici grâce à l’icône cœur.', browse: 'Parcourir les produits',
      billingAddr: 'Adresse de facturation', shipAddr: 'Adresse de livraison', edit: 'Modifier', saveBtn: 'Enregistrer', saved: 'Enregistré.',
      hello: 'Bonjour {n} !', accIntro: 'Retrouvez ici vos commandes, vos favoris et vos adresses.', lastOrder: 'Dernière commande',
      order: 'Commande', date: 'Date', status: 'Statut', tracking: 'Suivi du colis', invoice: 'Facture',
      stShipped: 'Expédiée', stDelivered: 'Livrée',
      nfH: 'Page introuvable', nfP: 'Ce produit n’est peut-être plus disponible. Essayez la recherche.',
      titleHome: 'First Vape – cigarettes électroniques, pods, e-liquides', titleCheckout: 'Commande', titleThanks: 'Merci pour votre commande', titleNotFound: 'Page introuvable',
      addedToCart: '<b>{x}</b> a été ajouté au panier.', wishAdded: 'Ajouté aux favoris.', wishRemoved: 'Retiré des favoris.',
      nlDone: 'Inscription enregistrée. Un e-mail de confirmation vous a été envoyé.',
      contactName: 'Nom', orderNoOpt: 'N° de commande (le cas échéant)', message: 'Message', send: 'Envoyer le message',
      contactOk: 'Merci, votre message a bien été reçu. Nous vous répondons sous 1 jour ouvré.',
      legalPh: 'Texte provisoire – la version définitive doit être fournie par le client (juriste). Les éléments entre crochets sont à compléter par le client.',
      pageTitles: { shipping: 'Livraison et paiement', terms: 'Conditions générales de vente', privacy: 'Politique de confidentialité', withdrawal: 'Droit de rétractation', legal: 'Mentions légales', cookies: 'Cookies', contact: 'Contact' },
      pageShort: { terms: 'CGV', privacy: 'Confidentialité' }
    }
  };

  /* Színek (pa_szin): az érték angol kulcs, a felirat nyelvenként */
  FV.COLOR_NAMES = {
    sk: { Black: 'Čierna', Silver: 'Strieborná', Blue: 'Modrá', Green: 'Zelená', Pink: 'Ružová', Gunmetal: 'Tmavosivá' },
    fr: { Black: 'Noir', Silver: 'Argent', Blue: 'Bleu', Green: 'Vert', Pink: 'Rose', Gunmetal: 'Gris anthracite' }
  };

  /* ---------- Információs és jogi oldalak (HELYŐRZŐ jogi szövegek!) ---------- */
  function ph(lang) { return '<p class="legal-ph">' + FV.I18N[lang].legalPh + '</p>'; }
  FV.PAGES = {
    sk: {
      shipping: function () {
        return '<h2>Doprava</h2><p>Zásielky doručuje Packeta – na výdajné miesto, do Z-BOXu alebo na adresu. Objednávky prijaté v pracovné dni do 14:00 odosielame ešte v ten deň. Cena dopravy sa počíta podľa celkovej hmotnosti zásielky.</p>{shipTable}' +
          '<h2>Platba</h2><ul><li><b>Online platba kartou</b> (Visa, Mastercard, Apple Pay, Google Pay) na zabezpečenej platobnej stránke Teya.</li><li><b>Dobierka</b>: platba pri prevzatí zásielky, poplatok {cod}.</li></ul>' +
          '<h2>Faktúra</h2><p>Faktúru automaticky vystavíme po objednávke a pošleme ti ju e-mailom. Stiahnuť si ju môžeš aj vo svojom účte v časti Objednávky.</p><p>Všetky ceny sú uvedené vrátane DPH 23 %.</p>';
      },
      terms: function () {
        return ph('sk') + '<p>Tieto obchodné podmienky upravujú nákup v internetovom obchode First Vape, ktorý prevádzkuje spoločnosť John&amp;Jen s.r.o.</p>' +
          '<h2>1. Prevádzkovateľ</h2><p>John&amp;Jen s.r.o., sídlo: Banícka 703/16, 990 01 Veľký Krtíš, IČO: 50707191, DIČ: 2120427342, IČ DPH: SK2120427342, zapísaná v Obchodnom registri Okresného súdu [·], oddiel Sro, vložka č. 31298/S. Kontakt: info@firstvape.sk.</p>' +
          '<h2>2. Objednávka a uzavretie zmluvy</h2><p>[doplní klient]</p><h2>3. Ceny a platobné podmienky</h2><p>[doplní klient]</p><h2>4. Dodacie podmienky</h2><p>[doplní klient]</p>' +
          '<h2>5. Odstúpenie od zmluvy</h2><p>Pozri stránku <a href="#/oldal/withdrawal">Odstúpenie od zmluvy</a>.</p><h2>6. Reklamácie</h2><p>[doplní klient]</p>' +
          '<h2>7. Predaj len plnoletým osobám</h2><p>V internetovom obchode môžu nakupovať výlučne osoby staršie ako 18 rokov.</p>' +
          '<h2>8. Orgán dozoru a alternatívne riešenie sporov</h2><p>Slovenská obchodná inšpekcia, [inšpektorát a adresa]. [doplní klient]</p>';
      },
      privacy: function () {
        return ph('sk') + '<p>Informácie o tom, ako spracúvame osobné údaje zákazníkov (GDPR).</p><h2>Prevádzkovateľ</h2><p>John&amp;Jen s.r.o., Banícka 703/16, 990 01 Veľký Krtíš, IČO: 50707191</p>' +
          '<h2>Aké údaje spracúvame?</h2><ul><li>Meno, e-mail, telefón, fakturačná a dodacia adresa</li><li>Údaje o objednávkach</li><li>Prihlásenie na odber noviniek</li></ul>' +
          '<h2>Sprostredkovatelia</h2><ul><li>Packeta – doručenie zásielok</li><li>Teya – online platby</li><li>SuperFaktúra – fakturácia</li></ul><h2>Tvoje práva</h2><p>[doplní klient]</p>';
      },
      withdrawal: function () {
        return ph('sk') + '<p>Od zmluvy môžeš bez udania dôvodu odstúpiť do 14 dní od prevzatia tovaru.</p>' +
          '<h2>Výnimky</h2><p>Z hygienických dôvodov nie je možné vrátiť otvorené e-liquidy a predplnené pody.</p>' +
          '<h2>Postup</h2><ol><li>Oznám nám odstúpenie cez kontaktný formulár alebo e-mailom.</li><li>Pošli tovar späť v neotvorenom balení.</li><li>Kúpnu cenu ti vrátime do 14 dní od doručenia oznámenia o odstúpení.</li></ol>' +
          '<h2>Formulár na odstúpenie od zmluvy</h2><p>[vzorový formulár doplní klient]</p>';
      },
      cookies: function () {
        return '<p>Stránka používa súbory cookie na fungovanie košíka a prihlásenia a – s tvojím súhlasom – na štatistické a marketingové účely.</p>' +
          '<h2>Kategórie súborov cookie</h2><ul><li><b>Nevyhnutné</b>: košík, prihlásenie, overenie veku</li><li><b>Štatistické</b>: meranie návštevnosti</li><li><b>Marketingové</b>: meranie reklám (Google Ads, Meta)</li></ul>';
      }
    },
    fr: {
      shipping: function () {
        return '<h2>Livraison</h2><p>Les commandes sont expédiées depuis notre entrepôt en Slovaquie. Les commandes passées en semaine avant 14 h partent le jour même. Les frais de port sont calculés selon le poids total du colis.</p>' +
          '<p class="legal-ph">Transporteur, délais et tarifs pour la France : à confirmer. Le tableau ci-dessous est un exemple.</p>{shipTable}' +
          '<h2>Paiement</h2><ul><li><b>Paiement en ligne par carte</b> (Visa, Mastercard, Apple Pay, Google Pay) sur la page de paiement sécurisée de Teya.</li><li><b>Paiement à la livraison</b> : frais de {cod}, sous réserve de disponibilité chez le transporteur.</li></ul>' +
          '<h2>Facture</h2><p>La facture est émise automatiquement après la commande et vous est envoyée par e-mail. Vous pouvez aussi la télécharger depuis votre compte, rubrique Commandes.</p><p>Tous les prix sont indiqués TTC (TVA française de 20 %).</p>';
      },
      terms: function () {
        return ph('fr') + '<p>Les présentes conditions générales de vente (CGV) régissent les achats effectués sur la boutique en ligne First Vape, exploitée par la société John&amp;Jen s.r.o.</p>' +
          '<h2>1. Identification du vendeur</h2><p>John&amp;Jen s.r.o., société de droit slovaque, siège : Banícka 703/16, 990 01 Veľký Krtíš, Slovaquie, n° d’identification (IČO) : 50707191, n° de TVA intracommunautaire : SK2120427342. Contact : info@firstvape.sk.</p>' +
          '<h2>2. Commandes</h2><p>[à compléter par le client]</p><h2>3. Prix et paiement</h2><p>Les prix sont indiqués en euros, toutes taxes comprises (TTC). [à compléter]</p><h2>4. Livraison</h2><p>[à compléter]</p>' +
          '<h2>5. Droit de rétractation</h2><p>Voir la page <a href="#/oldal/withdrawal">Droit de rétractation</a>.</p><h2>6. Garanties légales</h2><p>Garantie légale de conformité et garantie des vices cachés. [à compléter]</p>' +
          '<h2>7. Vente réservée aux personnes majeures</h2><p>La vente des produits est strictement réservée aux personnes âgées de 18 ans ou plus.</p>' +
          '<h2>8. Médiation de la consommation</h2><p>[médiateur à désigner par le client]</p><h2>9. Droit applicable</h2><p>[à compléter]</p>';
      },
      privacy: function () {
        return ph('fr') + '<p>Informations sur le traitement des données personnelles de nos clients (RGPD).</p><h2>Responsable du traitement</h2><p>John&amp;Jen s.r.o., Banícka 703/16, 990 01 Veľký Krtíš, Slovaquie</p>' +
          '<h2>Données traitées</h2><ul><li>Nom, e-mail, téléphone, adresses de facturation et de livraison</li><li>Données de commande</li><li>Inscription à la newsletter</li></ul>' +
          '<h2>Sous-traitants</h2><ul><li>Transporteur – livraison des colis [à confirmer]</li><li>Teya – paiement en ligne</li><li>SuperFaktúra – facturation</li></ul><h2>Vos droits</h2><p>[à compléter par le client]</p>';
      },
      withdrawal: function () {
        return ph('fr') + '<p>Vous disposez d’un délai de 14 jours à compter de la réception de votre commande pour exercer votre droit de rétractation, sans avoir à justifier de motif.</p>' +
          '<h2>Exceptions</h2><p>Pour des raisons d’hygiène, les e-liquides et pods préremplis ouverts ne peuvent être retournés.</p>' +
          '<h2>Procédure</h2><ol><li>Informez-nous de votre décision via le formulaire de contact ou par e-mail.</li><li>Retournez le produit dans son emballage d’origine non ouvert.</li><li>Nous vous remboursons dans un délai de 14 jours à compter de la réception de votre demande.</li></ol>' +
          '<h2>Formulaire de rétractation</h2><p>[modèle à fournir par le client]</p>';
      },
      legal: function () {
        return ph('fr') + '<h2>Éditeur du site</h2><p>John&amp;Jen s.r.o., société à responsabilité limitée de droit slovaque, capital social : [·], siège : Banícka 703/16, 990 01 Veľký Krtíš, Slovaquie, n° d’identification (IČO) : 50707191, n° de TVA intracommunautaire : SK2120427342. E-mail : info@firstvape.sk.</p>' +
          '<h2>Directeur de la publication</h2><p>[nom et fonction]</p><h2>Hébergeur</h2><p>[nom, adresse et téléphone de l’hébergeur]</p>';
      },
      cookies: function () {
        return '<p>Ce site utilise des cookies nécessaires au fonctionnement du panier et du compte et, avec votre accord, des cookies de mesure d’audience et de marketing.</p>' +
          '<h2>Catégories de cookies</h2><ul><li><b>Nécessaires</b> : panier, connexion, vérification de l’âge</li><li><b>Statistiques</b> : mesure d’audience</li><li><b>Marketing</b> : mesure des publicités (Google Ads, Meta)</li></ul>';
      }
    }
  };

  /* ---------- Nyelv és piac ---------- */
  var stored = FV.store.get('lang', 'sk');
  FV.lang = LANGS.indexOf(stored) !== -1 ? stored : 'sk';
  FV.LANGS = LANGS;

  FV.mkt = function () { return FV.markets[FV.lang]; };
  FV.ship = function () { return FV.mkt().shipping; };
  FV.shipMethod = function () {
    var id = FV.store.get('ship', null), ms = FV.ship().methods;
    for (var i = 0; i < ms.length; i++) if (ms[i].id === id) return id;
    return ms[0].id;
  };
  /* Alap (szlovák bruttó) ár → az aktuális piac bruttó ára */
  FV.gross = function (v) {
    if (v == null) return v;
    return Math.round(v / (1 + FV.baseVat) * (1 + FV.mkt().vat) * 100) / 100;
  };
  FV.vatOf = function (gross) { var r = FV.mkt().vat; return gross - gross / (1 + r); };

  FV.t = function (key, vars) {
    var d = FV.I18N[FV.lang], v = key in d ? d[key] : FV.I18N.sk[key];
    if (v == null) return key;
    if (typeof v === 'string' && vars) {
      v = v.replace(/\{(\w+)\}/g, function (m, k) { return k in vars ? vars[k] : m; });
    }
    return v;
  };
  FV.L = function (v) {
    if (v && typeof v === 'object' && !Array.isArray(v)) return v[FV.lang] != null ? v[FV.lang] : v.sk;
    return v;
  };
  FV.pl = function (key, n) {
    var f = FV.t(key);
    if (FV.lang === 'sk') return f[n === 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2];
    return f[n <= 1 ? 0 : 1];
  };
  FV.nw = function (key, n) { return n + ' ' + FV.pl(key, n); };
  FV.colorName = function (v) { return (FV.COLOR_NAMES[FV.lang] || {})[v] || v; };
  FV.compatLabel = function (v) { return FV.t('compatWith', { x: v }); };
  FV.pageTitle = function (k) { return FV.t('pageTitles')[k]; };
  FV.pageList = function () { return FV.pageKeys[FV.lang]; };
  FV.fmtDate = function (iso) {
    try { return new Date(iso + 'T12:00:00').toLocaleDateString(FV.mkt().locale); } catch (e) { return iso; }
  };

  /* A { sk, fr } mezőkből getter lesz, így a meglévő kód (c.name, p.short …) mindig az aktuális nyelvet kapja */
  function localize(o, fields) {
    fields.forEach(function (f) {
      var v = o[f];
      if (v && typeof v === 'object' && !Array.isArray(v) && ('sk' in v || 'fr' in v)) {
        Object.defineProperty(o, f, { get: function () { return FV.L(v); }, enumerable: true, configurable: true });
      }
    });
  }
  FV.categories.forEach(function (c) {
    localize(c, ['name', 'short', 'desc']);
    (c.children || []).forEach(function (ch) { localize(ch, ['name']); });
  });
  Object.keys(FV.catIndex).forEach(function (k) {
    var e = FV.catIndex[k];
    Object.defineProperty(e, 'name', { get: function () { return e.node.name; }, enumerable: true, configurable: true });
  });
  FV.brands.forEach(function (b) { localize(b, ['desc']); });
  FV.products.forEach(function (p) { localize(p, ['name', 'short']); });
  (FV.posts || []).forEach(function (b) { localize(b, ['title', 'tag', 'excerpt', 'body']); });

  FV.setLang = function (l) {
    if (LANGS.indexOf(l) === -1 || l === FV.lang) return;
    FV.lang = l;
    FV.store.set('lang', l);
    FV.products.forEach(function (p) { delete p._idx; });
    document.documentElement.lang = l;
    FV.emit('lang', l);
  };
  document.documentElement.lang = FV.lang;
})(window.FV);
