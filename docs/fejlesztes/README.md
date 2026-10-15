# First Vape – fejlesztési anyagok (Laci)

Az ügyfél 2026-10-15-én jóváhagyta az előnézetet (`prototype/`). Ebből épül az éles WooCommerce-webshop:
`iu_theme` + `firstvape` child téma, Packeta, Teya, SuperFaktúra, szlovák és francia piac (EUR).

| Fájl | Mi ez |
|---|---|
| `FirstVape-WooCommerce-Laci.pdf` | Laci teljes teendőlistája fázisonként (pipa, dátum, megjegyzés soronként), az élesítés négy fázisával |
| `laci.py` | a tartalom – **egy forrás**: ebből készül a PDF és a CRM-feladat ellenőrzőlistája |
| `build.py`, `pdf.js`, `hpv.css`, `assets/` | HTML → PDF (Satoshi cím, Inter szöveg, helyi betűk; a hlprv `docs/elesites/` sablonja) |
| `ugyfel-kerdessor.txt` | az ügyfélnek szóló egyedi kérdéssor a portálra (CRM → ügyfél → Onboarding kérdőív → Egyedi kérdéssor; a formátum: `# Rész`, a kérdés végén ` *` = kötelező, `[hosszú]` = több soros, `> …` = tipp) |

```
cd docs/fejlesztes && python3 build.py && node pdf.js     # Playwright + Chromium kell
```

A CRM-ben: Firstvape → „Weboldal tervezés” projekt. A fejlesztés Laci feladata (alfeladatok fázisonként, ellenőrzőlistával,
a PDF csatolva); az „Élesítés 1/4 – 4/4” feladatok a CRM élesítési folyamatából jönnek, és a fejlesztés után indulnak.
Ha a `laci.py` változik, a PDF-et újra kell építeni, és a CRM-feladat ellenőrzőlistáját is igazítani kell (az elemek
`id`-je a pipa kulcsa: ne nevezd át).
