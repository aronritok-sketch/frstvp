"""
Laci teendőlistájának HTML-je (laci.html) a laci.py-ból; a PDF-et a pdf.js készíti belőle.
Futtatás: python3 build.py && node pdf.js
Ugyanez a tartalom a CRM-feladat ellenőrzőlistáján is pipálható (Firstvape → Weboldal tervezés projekt).
A sablon a hlprv repó docs/elesites/ mappájáé (Satoshi cím, Inter szöveg, helyi betűk).
"""
import html
import os

import laci

HERE = os.path.dirname(os.path.abspath(__file__))
E = html.escape
OUT_HTML = "laci.html"
DATE = "2026. október 15."


def head(title):
    return (
        '<!doctype html>\n<html lang="hu">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        f'<title>{E(title)}</title>\n<meta name="author" content="HelloProVision">\n<link rel="stylesheet" href="hpv.css">\n</head>\n<body>\n'
    )


def cover(title_html, lead, meta):
    cells = "".join(f"<div>{E(k)}<b>{E(v)}</b></div>" for k, v in meta)
    return (
        '<section class="page cover">\n'
        '<div class="brand"><img src="assets/mark.svg" alt=""><span>HelloProVision</span></div>\n'
        f'<h1>{title_html}</h1>\n<p class="lead">{lead}</p>\n'
        '<div class="tag"><span>Design</span><span>Build</span><span>Grow</span></div>\n'
        f'<div class="meta">{cells}</div>\n</section>\n'
    )


def foot(left):
    return f'<div class="foot"><span><b>HelloProVision</b> · {E(left)}</span><span></span></div>'


class Pager:
    """Blokkok egymás után; a pdf.js a böngészőben méri le őket, és ami nem fér ki, új oldalra teszi
    (blokk nem törik ketté; a fejezetcím a következő blokkal együtt mozog)."""

    def __init__(self, label):
        self.label = label
        self.blocks = []

    def add(self, block_html, keep_with_next=False):
        cls = ' class="flow-keep"' if keep_with_next else ""
        self.blocks.append(f"<div{cls}>{block_html}</div>")

    def render(self):
        return '<section class="page flow">\n' + "\n".join(self.blocks) + "\n" + foot(self.label) + "\n</section>\n"


def item_html(num, item):
    who = f'<span class="who">{E(item["who"])}</span>' if item.get("who") else ""
    out = f'<ul class="check"><li><div class="it"><span class="n">{num}</span><b>{E(item["title"])}</b>{who}</div>'
    out += f'<div class="how">{item.get("desc", "")}</div>'
    for code in item.get("code", []):
        out += f"<pre>{E(code)}</pre>"
    if item.get("check"):
        out += f'<p class="done"><span>Kész, ha</span>{item["check"]}</p>'
    out += '<div class="sign"><span>Dátum</span><i></i><span>Megjegyzés</span><i class="wide"></i></div>'
    return out + "</li></ul>"


def build():
    data = laci.LACI
    phases = data["phases"]
    total = sum(len(p["items"]) for p in phases)
    doc = head("First Vape – WooCommerce webshop (Laci)")
    doc += cover(
        "First Vape<br><em>WooCommerce webshop</em>",
        "Az ügyfél által jóváhagyott előnézetből az éles webshop: <b>iu_theme + firstvape child téma</b>, Packeta, Teya, "
        "SuperFaktúra, szlovák és francia piac (EUR) – a fejlesztéstől az élesítésig.",
        [("Kinek", "Laci (fejlesztő)"), ("Feladat", f"{total} lépés, {len(phases)} fázis"), ("Dátum", DATE)],
    )

    pager = Pager("First Vape – WooCommerce webshop")
    first = '<span class="eyebrow">Hogyan használd</span><h2>Laci, ez a teljes lista</h2>'
    first += f'<p class="lead">{data["lead"]}</p>'
    first += "<h3>Amiből dolgozol (frstvp repó)</h3><table><tr><th>Hol</th><th>Mi van benne</th></tr>" + "".join(
        f"<tr><td><code>{E(a)}</code></td><td>{E(b)}</td></tr>" for a, b in laci.SOURCES
    ) + "</table>"
    first += (
        '<p class="small">Repó: <code>aronritok-sketch/frstvp</code>, ág <code>claude/first-vape-joomla-wordpress-4age1i</code>. '
        "A child téma is ide kerül (<code>wp-theme/firstvape/</code>).</p>"
    )
    pager.add(first)
    tree = "<h3>Kategóriafa (az ügyfél véglegesítette)</h3><table><tr><th>Slug</th><th>SK név</th><th>Angol név (javaslat)</th><th>Alkategóriák</th></tr>" + "".join(
        f"<tr><td><code>{E(a)}</code></td><td>{E(b)}</td><td>{E(c)}</td><td>{E(d)}</td></tr>" for a, b, c, d in laci.TREE
    ) + "</table>"
    tree += '<p class="small">Főmenü még: Značky (márkák, minden terméktípussal) és Akcie (nem kiemelve). Az angol nevek a kliens fájljával egyeztetendők (<code>prototype/csv/kategoria-osszerendeles.csv</code>).</p>'
    pager.add(tree)
    pager.add('<h3>A fázisok</h3><ol class="toc">' + "".join(
        f'<li><span>{i + 1:02d}</span>{E(p["title"])} ({len(p["items"])})</li>' for i, p in enumerate(phases)
    ) + "</ol>")
    pager.add(
        '<div class="box warn"><span class="eyebrow">Nyitott kérdések – ezekre vársz</span><ul>'
        + "".join(f"<li>{E(x)}</li>" for x in laci.OPEN)
        + "</ul><p>Az ügyfélnek szóló kérdéseket a portálon, kérdéssorként kérjük; Áron döntéseit a CRM-ben követjük. "
        "Amíg nincs válasz, a mintaadatokkal haladj, és a megjegyzésbe írd, mi vár rájuk.</p></div>"
    )

    for i, phase in enumerate(phases):
        head_html = f'<span class="num">{i + 1:02d}</span><h2>{E(phase["title"])}</h2>'
        if phase.get("intro"):
            head_html += f'<p class="sec-intro">{phase["intro"]}</p>'
        pager.add(head_html, keep_with_next=True)
        for j, item in enumerate(phase["items"]):
            pager.add(item_html(f"{i + 1:02d}.{j + 1}", item))

    pager.add(
        '<div class="box ok"><span class="eyebrow">Ha elakadsz</span><p>Írd le a CRM-feladatba, hol tartasz és mi a hiba '
        "(képernyőképpel), és jelöld meg Áront. A keretrendszer szabályai: az <code>iu-theme</code> skill a hlprv repóban "
        "(<code>.claude/skills/iu-theme/SKILL.md</code>); webshop-minta: Mandala (<code>mdn</code> repó).</p>"
        "<p><b>HelloProVision</b> · Tervezzük. Építjük. Növeljük.</p></div>"
    )
    doc += pager.render()
    doc += "</body>\n</html>\n"
    with open(os.path.join(HERE, OUT_HTML), "w", encoding="utf-8") as f:
        f.write(doc)
    return total


if __name__ == "__main__":
    print(OUT_HTML, build(), "lépés")
