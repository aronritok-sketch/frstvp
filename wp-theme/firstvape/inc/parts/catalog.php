<?php
/**
 * Bolt: termékkártya, terméklisták (kategória, márka, összes termék, akciók, keresés) szűrőkkel és lapozóval,
 * márkák A–Z, termékoldal, kedvencek. Az előnézet views.js-ének szerkezete; a szűrés szerveroldali (URL-paraméterek:
 * ?marka=…&puff=…&rend=…&oldal=…), JS-sel az eredmény újratöltés nélkül cserélődik (assets/js/site.js).
 */

defined('ABSPATH') || exit;

const FIRSTVAPE_PER_PAGE = 12;

/** A kártyán a terméktípusnál értelmezhető fő adatok (rendszer, íz, nikotin, slukkszám, kiszerelés, ellenállás). */
function firstvape_specs_line(array $p): array
{
    $a = $p['attrs'];
    $out = [];
    $sys = $a['kompat'][0] ?? null;
    switch ($p['art']) {
        case 'kit':
            if ($sys) {
                $out[] = firstvape_t('sysShort', ['x' => $sys]);
            }
            foreach ($a['szin'] ?? [] as $x) {
                $out[] = firstvape_color_name($x);
            }
            break;
        case 'pod':
            if ($sys) {
                $out[] = firstvape_t('sysShort', ['x' => $sys]);
            }
            foreach ($a['nikotin'] ?? [] as $x) {
                $out[] = firstvape_nic_label($x);
            }
            foreach ($a['puff'] ?? [] as $x) {
                $out[] = firstvape_puff_approx((int) $x);
            }
            break;
        case 'disposable':
            foreach ($a['puff'] ?? [] as $x) {
                $out[] = firstvape_puff_approx((int) $x);
            }
            foreach ($a['nikotin'] ?? [] as $x) {
                $out[] = firstvape_nic_label($x);
            }
            break;
        case 'liquid':
            foreach ($a['ml'] ?? [] as $x) {
                $out[] = $x;
            }
            foreach ($a['nikotin'] ?? [] as $x) {
                $out[] = firstvape_nic_label($x);
            }
            break;
        default:
            if ($sys) {
                $out[] = firstvape_t('sysShort', ['x' => $sys]);
            }
            foreach ($a['ohm'] ?? [] as $x) {
                $out[] = $x;
            }
    }
    return array_slice($out, 0, 3);
}

function firstvape_price_html(array $p, bool $big = false): string
{
    return '<span class="price' . ($big ? ' price-big' : '') . '">' .
        ($p['sale'] ? '<ins class="num">' . esc_html(firstvape_money((float) firstvape_sale_price($p))) . '</ins><del class="num">' . esc_html(firstvape_money(firstvape_regular($p))) . '</del>' : '<b class="num">' . esc_html(firstvape_money(firstvape_regular($p))) . '</b>') . '</span>';
}

/** Termékkártya. Minden termék SIMPLE: a gomb mindig a tényleges műveletet írja (kosárba / értesítés / helyettesítő). */
function firstvape_card(array $p, array $opt = []): string
{
    $st = firstvape_stock_info($p);
    $d = firstvape_discount($p);
    $b = firstvape_brand($p['brand']);
    $badges = ($d ? '<span class="bdg bdg-sale">−' . $d . '%</span>' : '') .
        ($p['stock'] === 'discontinued' ? '<span class="bdg bdg-disc">' . firstvape_t('stDiscShort') . '</span>' : '') .
        ($p['stock'] === 'outofstock' ? '<span class="bdg bdg-out">' . firstvape_t('stOutShort') . '</span>' : '');
    if ($p['stock'] === 'instock') {
        $action = '<a class="pc-add" href="' . esc_url(add_query_arg('add-to-cart', $p['id'], $p['url'])) . '" rel="nofollow" data-act="add" data-id="' . $p['id'] . '" aria-label="' . esc_attr((string) firstvape_t('addToCartAria', ['x' => $p['name']])) . '">' . firstvape_icon('bag') . '<span>' . firstvape_t('toCart') . '</span></a>';
    } elseif ($p['stock'] === 'outofstock') {
        $action = '<a class="pc-add pc-notify" href="' . esc_url($p['url']) . '#notify">' . firstvape_icon('bell') . '<span>' . firstvape_t('notifyShort') . '</span></a>';
    } else {
        $action = '<a class="pc-add pc-notify" href="' . esc_url($p['url']) . '#rel-groups">' . firstvape_icon('swap') . '<span>' . firstvape_t('substitute') . '</span></a>';
    }
    $sys = !empty($opt['sys']) && !empty($p['attrs']['kompat']);
    $specs = '';
    foreach (firstvape_specs_line($p) as $x) {
        $specs .= '<li>' . esc_html((string) $x) . '</li>';
    }
    return '<article class="pcard' . ($p['stock'] !== 'instock' ? ' is-' . esc_attr($p['stock']) : '') . '">' .
        '<a class="pc-media" href="' . esc_url($p['url']) . '" style="--tint:' . esc_attr(firstvape_tint($p)) . '" tabindex="-1" aria-hidden="true">' . firstvape_art($p) . '</a>' .
        '<div class="pc-badges">' . $badges . ($sys ? '<span class="bdg bdg-sys">' . esc_html((string) firstvape_t('sysShort', ['x' => implode(' / ', $p['attrs']['kompat'])])) . '</span>' : '') . '</div>' .
        '<button class="pc-wish" type="button" data-act="wish" data-id="' . $p['id'] . '" aria-pressed="false" aria-label="' . esc_attr((string) firstvape_t('wishAria', ['x' => $p['name']])) . '">' . firstvape_icon('heart') . '</button>' .
        '<div class="pc-body">' . ($b ? '<a class="pc-brand" href="' . esc_url((string) get_term_link($b['term'])) . '">' . esc_html($b['name']) . '</a>' : '') .
        '<h3 class="pc-name"><a href="' . esc_url($p['url']) . '">' . esc_html($p['name']) . '</a></h3>' .
        '<ul class="pc-specs">' . $specs . '</ul>' .
        '<div class="pc-foot"><div class="pc-price">' . firstvape_price_html($p) . '</div><span class="stock ' . esc_attr($st['cls']) . '">' . esc_html((string) $st['short']) . '</span>' . $action . '</div></div></article>';
}

function firstvape_grid(array $list, string $cls = '', array $opt = []): string
{
    return '<div class="pgrid ' . esc_attr($cls) . '">' . implode('', array_map(fn($p) => firstvape_card($p, $opt), $list)) . '</div>';
}

/* ================================================================================ TERMÉKLISTA */

/**
 * Terméklista: $ctx = ['type' => cat|brand|all|sale|search, 'key' => …, 'q' => …]. Szerveroldalon szűr, rendez,
 * lapoz; a szűrőpanel és az eredmény egy [data-shop] dobozban (a JS ezt cseréli).
 */
function firstvape_render_shop(array $ctx): string
{
    $bc = [];
    $desc = '';
    $head = '';
    $subnav = '';
    $allowed = null;
    $title = '';
    switch ($ctx['type']) {
        case 'cat':
            $c = firstvape_cat((string) $ctx['key']);
            if (!$c) {
                return firstvape_render_404();
            }
            $base = firstvape_products_in_cat($c['key']);
            $title = (string) $c['name'];
            $parent = $c['parent'] ? firstvape_cat($c['parent']) : null;
            $root = $parent ?: $c;
            $desc = (string) ($c['desc'] ?: $root['desc']);
            $allowed = firstvape_catalog('catFacets')[$root['key']] ?? null;
            if ($parent) {
                $bc[] = ['label' => $parent['name'], 'href' => firstvape_cat_url($parent['key'])];
            }
            $bc[] = ['label' => $c['name']];
            $kids = firstvape_visible_children($root['key']);
            if ($kids) {
                $subnav = '<div class="subnav" role="list"><a role="listitem" class="chip' . (!$parent ? ' on' : '') . '" href="' . esc_url(firstvape_cat_url($root['key'])) . '">' . firstvape_t('all') . ' <span class="cnt">' . count(firstvape_products_in_cat($root['key'])) . '</span></a>';
                foreach ($kids as $ch) {
                    $subnav .= '<a role="listitem" class="chip' . ($ch === $c['key'] ? ' on' : '') . '" href="' . esc_url(firstvape_cat_url($ch)) . '">' . esc_html((string) firstvape_cat($ch)['name']) . ' <span class="cnt">' . count(firstvape_products_in_cat($ch)) . '</span></a>';
                }
                $subnav .= '</div>';
            }
            break;
        case 'brand':
            $b = firstvape_brand((string) $ctx['key']);
            if (!$b) {
                return firstvape_render_404();
            }
            $base = firstvape_products_of_brand($b['slug']);
            $title = $b['name'];
            $bc[] = ['label' => firstvape_t('brands'), 'href' => firstvape_page_url('brands')];
            $bc[] = ['label' => $b['name']];
            $cats = [];
            foreach ($base as $p) {
                if ($pc = firstvape_primary_cat($p)) {
                    $cats[$pc['key']] = ($cats[$pc['key']] ?? 0) + 1;
                }
            }
            $chips = '';
            foreach ($cats as $k => $n) {
                $chips .= '<a class="chip" href="' . esc_url(firstvape_cat_url($k, ['marka' => $b['slug']])) . '">' . esc_html((string) firstvape_cat($k)['name']) . ' <span class="cnt">' . $n . '</span></a>';
            }
            $head = '<div class="brandhead"><div class="bh-mark">' . firstvape_wordmark($b, 'xl') . '</div><div><p>' . esc_html((string) $b['desc']) . '</p><div class="subnav">' . $chips . '</div></div></div>';
            break;
        case 'all':
            $base = array_values(firstvape_products());
            $title = (string) firstvape_t('allProducts');
            $allowed = firstvape_catalog('catFacets')['all'] ?? null;
            $bc[] = ['label' => $title];
            break;
        case 'sale':
            $base = array_values(array_filter(firstvape_products(), fn($p) => (bool) $p['sale']));
            $title = (string) firstvape_t('sale');
            $desc = (string) firstvape_t('saleDesc');
            $bc[] = ['label' => $title];
            break;
        default:
            $q = (string) ($ctx['q'] ?? '');
            $base = firstvape_search($q);
            $title = (string) firstvape_t('searchTitle');
            $bc[] = ['label' => firstvape_t('searchCrumb', ['q' => $q])];
            $head = firstvape_search_head($q, count($base));
    }

    $f = firstvape_parse_filters($_GET);
    $list = firstvape_apply_filters($base, $f);
    $sorters = firstvape_sorters();
    if ($ctx['type'] !== 'search' || $f['rend'] !== 'pop') {
        usort($list, ($sorters[$f['rend']] ?? $sorters['pop'])['fn']);
    }
    // a kifutott termékek a lista végére (stabil rendezés)
    $i = 0;
    $list = array_map(fn($p) => [$p, $i++], $list);
    usort($list, fn($a, $b) => (($a[0]['stock'] === 'discontinued') <=> ($b[0]['stock'] === 'discontinued')) ?: $a[1] <=> $b[1]);
    $list = array_column($list, 0);

    $pages = max(1, (int) ceil(count($list) / FIRSTVAPE_PER_PAGE));
    $f['oldal'] = min($f['oldal'], $pages);
    $page_items = array_slice($list, ($f['oldal'] - 1) * FIRSTVAPE_PER_PAGE, FIRSTVAPE_PER_PAGE);
    $base_url = strtok(firstvape_current_url(), '?');
    $keep = $ctx['type'] === 'search' ? ['s' => rawurlencode((string) $ctx['q']), 'post_type' => 'product'] : [];
    $url = fn(array $ff) => add_query_arg(array_merge($keep, array_map(fn($v) => is_string($v) ? rawurlencode($v) : $v, firstvape_filters_query($ff))), $base_url);

    $h1 = $ctx['type'] === 'search' ? '' : '<div class="shop-title"><h1>' . esc_html($title) . '</h1>' . ($desc !== '' ? '<p>' . esc_html($desc) . '</p>' : '') . '</div>';

    $results = $list ? firstvape_grid($page_items, 'pgrid-shop') :
        '<div class="empty"><p>' . firstvape_t('noFilterResults') . '</p><a class="btn" href="' . esc_url($url(['rend' => $f['rend']])) . '" data-shop-link>' . firstvape_t('clearFilters') . '</a></div>';

    // lapozó: első, utolsó és az aktuális ±1, közte „…”
    $pager = '';
    if ($pages > 1) {
        $prev = 0;
        for ($n = 1; $n <= $pages; $n++) {
            if ($n !== 1 && $n !== $pages && abs($n - $f['oldal']) > 1) {
                continue;
            }
            if ($prev && $n - $prev > 1) {
                $pager .= '<span class="pg-gap" aria-hidden="true">…</span>';
            }
            $pager .= '<a class="pg' . ($n === $f['oldal'] ? ' on' : '') . '" href="' . esc_url($url(['oldal' => $n] + $f)) . '" data-shop-link data-page' . ($n === $f['oldal'] ? ' aria-current="page"' : '') . '>' . $n . '</a>';
            $prev = $n;
        }
    }

    // aktív szűrők
    $defs = firstvape_facet_defs();
    $chips = [];
    foreach ($defs as $k => $d) {
        foreach ($f[$k] as $v) {
            $ff = $f;
            $ff[$k] = array_values(array_diff($ff[$k], [$v]));
            $ff['oldal'] = 1;
            $chips[] = '<a class="chip on" href="' . esc_url($url($ff)) . '" data-shop-link>' . esc_html((string) firstvape_t($d['lk'])) . ': ' . esc_html((string) ($d['name'])($v)) . firstvape_icon('close') . '</a>';
        }
    }
    [$lo_b, $hi_b] = firstvape_price_bounds($base);
    if (isset($f['min']) || isset($f['max'])) {
        $ff = $f;
        unset($ff['min'], $ff['max']);
        $ff['oldal'] = 1;
        $chips[] = '<a class="chip on" href="' . esc_url($url($ff)) . '" data-shop-link>' . firstvape_t('price') . ': ' . esc_html(firstvape_money($f['min'] ?? 0)) . ' – ' . esc_html(firstvape_money($f['max'] ?? $hi_b)) . firstvape_icon('close') . '</a>';
    }
    if (!empty($f['akcio'])) {
        $ff = $f;
        $ff['akcio'] = false;
        $chips[] = '<a class="chip on" href="' . esc_url($url($ff)) . '" data-shop-link>' . firstvape_t('onlySale') . firstvape_icon('close') . '</a>';
    }
    $active = $chips ? implode('', $chips) . '<a class="linkbtn" href="' . esc_url($url(['rend' => $f['rend']])) . '" data-shop-link>' . firstvape_t('clearAll') . '</a>' : '';

    $sort = '';
    foreach ($sorters as $k => $s) {
        $sort .= '<option value="' . esc_attr($k) . '"' . selected($f['rend'], $k, false) . '>' . esc_html((string) firstvape_t($s['lk'])) . '</option>';
    }

    $facets = firstvape_render_facets($base, $f, $allowed, $ctx['type'] === 'brand' ? 'marka' : '', $lo_b, $hi_b);
    $n = count($list);

    return '<div class="wrap">' . firstvape_crumbs($bc) . $h1 . $head . $subnav .
        '<form class="shop" data-shop action="' . esc_url($base_url) . '" method="get">' .
        ($ctx['type'] === 'search' ? '<input type="hidden" name="s" value="' . esc_attr((string) $ctx['q']) . '"><input type="hidden" name="post_type" value="product">' : '') .
        '<aside class="filters" data-filters aria-label="' . esc_attr((string) firstvape_t('filters')) . '"><div class="f-head"><p class="f-title">' . firstvape_icon('filter') . ' ' . firstvape_t('filters') . '</p>' .
        '<button class="icon-btn f-close" type="button" data-act="filters-close" aria-label="' . esc_attr((string) firstvape_t('closeFilters')) . '">' . firstvape_icon('close') . '</button></div>' .
        '<div class="f-body" data-facets>' . $facets . '</div>' .
        '<div class="f-apply"><button class="btn btn-primary" type="submit" data-act="filters-close" data-f-apply>' . firstvape_t('showN', ['n' => $n]) . '</button></div></aside>' .
        '<div class="results"><div class="toolbar">' .
        '<button class="btn btn-ghost f-open" type="button" data-act="filters-open">' . firstvape_icon('filter') . ' ' . firstvape_t('filters') . ' <span class="badge" data-fcount' . ($chips ? '' : ' hidden') . '>' . count($chips) . '</span></button>' .
        '<p class="rcount" data-rcount><b class="num">' . $n . '</b> ' . esc_html(firstvape_pl('wProducts', $n)) . '</p>' .
        '<label class="sort"><span>' . firstvape_t('sort') . '</span><select id="sort-sel" name="rend" data-sort>' . $sort . '</select></label></div>' .
        '<div class="active-f" data-active>' . $active . '</div>' .
        '<div data-results>' . $results . '</div><nav class="pager" data-pager aria-label="' . esc_attr((string) firstvape_t('pagination')) . '">' . $pager . '</nav>' .
        '<noscript><button class="btn" type="submit">' . firstvape_t('showProducts') . '</button></noscript></div></form></div>';
}

function firstvape_price_bounds(array $list): array
{
    if (!$list) {
        return [0, 0];
    }
    $prices = array_map('firstvape_price', $list);
    return [(int) floor(min($prices)), (int) ceil(max($prices))];
}

/** A szűrőpanel: tényezők pipával és darabszámmal, ár csúszka, csak akciós. Minden mező a GET-űrlap része. */
function firstvape_render_facets(array $base, array $f, ?array $allowed, string $hide, int $lo_b, int $hi_b): string
{
    $html = '';
    $flavors = (array) firstvape_catalog('flavorColors');
    $swatches = (array) firstvape_catalog('colorSwatches');
    foreach ($base as $p) {
        if ($p['swatch'] !== '' && !empty($p['attrs']['szin'][0])) {
            $swatches[$p['attrs']['szin'][0]] = $p['swatch'];
        }
    }
    foreach (firstvape_facets($base, $f, $allowed) as $fc) {
        $key = $fc['key'];
        if ($key === $hide) {
            continue;
        }
        $d = $fc['def'];
        $many = count($fc['values']) > 6;
        // a kiválasztott értékek egy rejtett mezőben (vesszővel), a pipák ezt írják (site.js); JS nélkül a pipák tömbként
        $list = '<ul class="f-list' . ($many ? ' f-scroll' : '') . '">';
        foreach ($fc['values'] as $i => $x) {
            $id = 'f-' . $key . '-' . $i;
            $sw = ($d['swatch'] ?? '') === 'flavor' ? '<i class="sw" style="background:' . esc_attr((string) ($flavors[$x['v']] ?? '#ccc')) . '"></i>' :
                (($d['swatch'] ?? '') === 'color' ? '<i class="sw" style="background:' . esc_attr((string) ($swatches[$x['v']] ?? '#ccc')) . '"></i>' : '');
            $list .= '<li><input type="checkbox" id="' . esc_attr($id) . '" name="' . esc_attr($key) . '[]" data-f="' . esc_attr($key) . '" value="' . esc_attr($x['v']) . '"' . ($x['on'] ? ' checked' : '') . ($x['n'] || $x['on'] ? '' : ' disabled') . '>' .
                '<label for="' . esc_attr($id) . '">' . $sw . '<span class="' . (!empty($d['mono']) ? 'num' : '') . '">' . esc_html((string) ($d['name'])($x['v'])) . '</span><em class="cnt">' . $x['n'] . '</em></label></li>';
        }
        $list .= '</ul>';
        $html .= '<details class="facet" data-facet="' . esc_attr($key) . '" open><summary>' . esc_html((string) firstvape_t($d['lk'])) . firstvape_icon('down') . '</summary>' .
            (!empty($d['note']) ? '<p class="f-note">' . firstvape_t($d['note']) . '</p>' : '') . $list . '</details>';
    }
    if ($hi_b > $lo_b) {
        $lo = (int) ($f['min'] ?? $lo_b);
        $hi = (int) ($f['max'] ?? $hi_b);
        $html .= '<details class="facet" open><summary>' . firstvape_t('price') . firstvape_icon('down') . '</summary><div class="price-f" data-price-f data-lo="' . $lo_b . '" data-hi="' . $hi_b . '">' .
            '<div class="pr-track"><i data-pr-fill></i><label class="sr" for="pr-min">' . firstvape_t('minPrice') . '</label><input id="pr-min" type="range" min="' . $lo_b . '" max="' . $hi_b . '" step="1" value="' . $lo . '" data-pr="min">' .
            '<label class="sr" for="pr-max">' . firstvape_t('maxPrice') . '</label><input id="pr-max" type="range" min="' . $lo_b . '" max="' . $hi_b . '" step="1" value="' . $hi . '" data-pr="max"></div>' .
            '<p class="pr-vals num"><span data-pr-lo>' . esc_html(firstvape_money($lo)) . '</span><span data-pr-hi>' . esc_html(firstvape_money($hi)) . '</span></p>' .
            (isset($f['min']) ? '<input type="hidden" name="min" value="' . esc_attr((string) $f['min']) . '">' : '') . (isset($f['max']) ? '<input type="hidden" name="max" value="' . esc_attr((string) $f['max']) . '">' : '') .
            '</div></details>';
    }
    if (array_filter($base, fn($p) => (bool) $p['sale'])) {
        $html .= '<label class="f-toggle"><input type="checkbox" id="f-akcio" name="akcio" value="1" data-f-akcio' . (!empty($f['akcio']) ? ' checked' : '') . '><span>' . firstvape_t('onlySale') . '</span></label>';
    }
    return $html;
}

function firstvape_search_head(string $q, int $n): string
{
    $nq = explode(' ', firstvape_norm($q));
    $chips = [];
    foreach (firstvape_visible_brands() as $b) {
        if (in_array(firstvape_norm($b['name']), $nq, true)) {
            $chips[] = firstvape_t('a_marka') . ': ' . $b['name'];
        }
    }
    foreach ($nq as $x) {
        if (preg_match('/^\d{3,}$/', $x)) {
            $chips[] = firstvape_t('sPuff') . ': ≈ ' . firstvape_num($x);
        }
        if (preg_match('/^\d+mg$/', $x)) {
            $chips[] = firstvape_t('a_nikotinShort') . ': ' . str_replace('mg', ' mg', $x);
        }
    }
    $s = fn($t) => '<a href="' . esc_url(add_query_arg(['s' => rawurlencode($t), 'post_type' => 'product'], home_url('/'))) . '">' . esc_html($t) . '</a>';
    return '<div class="srchead"><h1>' . firstvape_t('srHead', ['n' => $n, 'w' => firstvape_pl('wResults', $n), 'q' => esc_html($q)]) . '</h1>' .
        ($chips ? '<p class="sr-understood">' . firstvape_t('understood') . ' ' . implode('', array_map(fn($c) => '<span class="tag">' . esc_html((string) $c) . '</span>', $chips)) . '</p>' : '') .
        ($n ? '' : '<div class="empty"><p>' . firstvape_t('srEmpty', ['a1' => $s('Elfbar'), 'a2' => $s('mango'), 'a3' => $s('40000')]) . '</p></div>') . '</div>';
}

/* ================================================================================ MÁRKÁK A–Z */

function firstvape_render_brands(): string
{
    $brands = firstvape_visible_brands();
    usort($brands, fn($a, $b) => strcmp($a['name'], $b['name']));
    $groups = [];
    foreach ($brands as $b) {
        $groups[mb_strtoupper(mb_substr($b['name'], 0, 1))][] = $b;
    }
    $az = '';
    $sections = '';
    foreach ($groups as $L => $list) {
        $id = 'az-' . (preg_match('/^[A-Z0-9]$/', $L) ? $L : 'x' . bin2hex($L));
        $az .= '<a href="#' . esc_attr($id) . '">' . esc_html($L) . '</a>';
        $cards = '';
        foreach ($list as $b) {
            $n = count(firstvape_products_of_brand($b['slug']));
            $cards .= '<a class="brand-card" href="' . esc_url((string) get_term_link($b['term'])) . '">' . firstvape_wordmark($b, 'lg') . '<p>' . esc_html((string) $b['desc']) . '</p><small>' . esc_html(firstvape_nw('wProducts', $n)) . ' ' . firstvape_icon('chev') . '</small></a>';
        }
        $sections .= '<section class="az-group" id="' . esc_attr($id) . '"><h2 class="az-l">' . esc_html($L) . '</h2><div class="brand-grid lg">' . $cards . '</div></section>';
    }
    return '<div class="wrap">' . firstvape_crumbs([['label' => firstvape_t('brands')]]) .
        '<div class="shop-title"><h1>' . firstvape_t('brands') . '</h1><p>' . firstvape_t('brandsIntro', ['n' => count($brands), 'w' => firstvape_pl('wBrands', count($brands))]) . '</p></div>' .
        '<nav class="az" aria-label="' . esc_attr((string) firstvape_t('azAria')) . '">' . $az . '</nav>' . $sections . '</div>';
}

/* ================================================================================ TERMÉKOLDAL */

function firstvape_render_product(): string
{
    if (!is_singular('product')) {
        return ''; // a szerkesztőben / REST-ben nincs lekérdezett termék
    }
    $id = get_queried_object_id();
    $p = firstvape_product((int) $id);
    if (!$p) {
        return firstvape_render_404();
    }
    $b = firstvape_brand($p['brand']);
    $st = firstvape_stock_info($p);
    $prim = firstvape_primary_cat($p);
    $leaf = firstvape_leaf_cat($p);
    $a = $p['attrs'];
    $bc = [];
    if ($prim) {
        $bc[] = ['label' => $prim['name'], 'href' => firstvape_cat_url($prim['key'])];
    }
    if ($leaf) {
        $bc[] = ['label' => $leaf['name'], 'href' => firstvape_cat_url($leaf['key'])];
    }
    $bc[] = ['label' => $p['name']];

    // testvértermékek (minden változat külön SIMPLE termék, saját SKU-val): linkek, 12 fölött választólista
    $sibs = $p['group'] !== '' ? array_values(array_filter(firstvape_products(), fn($x) => $x['group'] === $p['group'])) : [];
    $diff = array_values(array_filter(['szin', 'iz', 'nikotin', 'ohm', 'ml'], function ($k) use ($sibs) {
        $vals = [];
        foreach ($sibs as $x) {
            $vals[implode('/', $x['attrs'][$k] ?? [])] = 1;
        }
        return count($vals) > 1;
    }));
    $vlabel = function ($x) use ($diff) {
        $out = [];
        foreach ($diff as $k) {
            $v = $x['attrs'][$k][0] ?? null;
            if ($v !== null) {
                $out[] = $k === 'szin' ? firstvape_color_name((string) $v) : ($k === 'nikotin' ? firstvape_nic_label((string) $v) : (string) $v);
            }
        }
        return implode(' · ', $out);
    };
    $labels = ['szin' => 'a_szin', 'nikotin' => 'a_nikotinShort', 'ohm' => 'a_ohm', 'iz' => 'a_iz', 'ml' => 'a_ml'];
    $vhead = implode(' · ', array_map(fn($k) => (string) firstvape_t($labels[$k]), $diff));
    $opt = '';
    if (count($sibs) > 12 && $diff) {
        usort($sibs, fn($x, $y) => strcmp($vlabel($x), $vlabel($y)));
        $opt = '<div class="variants"><label class="variants-h" for="var-sel">' . esc_html($vhead) . ':</label><select id="var-sel" class="var-sel" data-variant-select>';
        foreach ($sibs as $x) {
            $opt .= '<option value="' . esc_url($x['url']) . '"' . selected($x['id'], $p['id'], false) . '>' . esc_html($vlabel($x)) . ($x['stock'] !== 'instock' ? ' – ' . esc_html((string) firstvape_stock_info($x)['short']) : '') . '</option>';
        }
        $opt .= '</select><p class="muted small">' . firstvape_t('variantsCount', ['n' => count($sibs)]) . '</p></div>';
    } elseif (count($sibs) > 1 && $diff) {
        $swatches = (array) firstvape_catalog('colorSwatches');
        $opt = '<div class="variants"><p class="variants-h">' . esc_html($vhead) . ':</p><div class="opt-row">';
        foreach ($sibs as $x) {
            $v = $x['attrs']['szin'][0] ?? '';
            $sw = $diff[0] === 'szin' ? '<i class="sw" style="background:' . esc_attr($x['swatch'] ?: (string) ($swatches[$v] ?? '#ccc')) . '"></i>' : '';
            $on = $x['id'] === $p['id'];
            $opt .= '<a class="opt-chip' . ($on ? ' on' : '') . ($x['stock'] !== 'instock' ? ' na' : '') . '" href="' . esc_url($x['url']) . '"' . ($on ? ' aria-current="true"' : '') . '>' . $sw . '<span>' . esc_html($vlabel($x)) . '</span></a>';
        }
        $opt .= '</div></div>';
    }

    if ($p['stock'] === 'instock') {
        $max = $p['qty'] ?: 99;
        $buy = '<form class="buy" data-buy data-id="' . $p['id'] . '" action="' . esc_url($p['url']) . '" method="post">' .
            '<div class="buy-row"><span class="qty"><button type="button" data-act="qty" data-d="-1" aria-label="' . esc_attr((string) firstvape_t('decrease')) . '">' . firstvape_icon('minus') . '</button>' .
            '<label class="sr" for="buy-qty">' . firstvape_t('qty') . '</label><input id="buy-qty" name="quantity" class="num" type="number" min="1" max="' . (int) $max . '" value="1" inputmode="numeric">' .
            '<button type="button" data-act="qty" data-d="1" aria-label="' . esc_attr((string) firstvape_t('increase')) . '">' . firstvape_icon('plus') . '</button></span>' .
            '<button class="btn btn-primary btn-lg buy-btn" type="submit" name="add-to-cart" value="' . $p['id'] . '">' . firstvape_icon('bag') . ' ' . firstvape_t('addToCartBig') . '</button>' .
            '<button class="icon-btn wish-lg" type="button" data-act="wish" data-id="' . $p['id'] . '" aria-pressed="false" aria-label="' . esc_attr((string) firstvape_t('toWish')) . '">' . firstvape_icon('heart') . '</button></div>' .
            '<p class="buy-err" data-buy-err hidden></p></form>';
    } elseif ($p['stock'] === 'outofstock') {
        $buy = '<form class="notify" id="notify" data-form="notify" novalidate><p>' . firstvape_t('notifyText') . '</p>' .
            '<div class="nl-row"><label class="sr" for="notify-mail">' . firstvape_t('email') . '</label><input id="notify-mail" name="email" type="email" required placeholder="' . esc_attr((string) firstvape_t('emailPh')) . '"><input type="hidden" name="product" value="' . $p['id'] . '"><button class="btn btn-primary" type="submit">' . firstvape_icon('bell') . ' ' . firstvape_t('notifyMe') . '</button></div>' .
            firstvape_form_trap() . '<p class="ok-msg" data-form-msg role="status" hidden>' . firstvape_t('notifyOk') . '</p></form>';
    } else {
        $buy = '<div class="notice-disc">' . firstvape_icon('info') . '<div><b>' . firstvape_t('discTitle') . '</b><p>' . firstvape_t('discText') . '</p><a class="btn btn-primary" href="#rel-groups">' . firstvape_t('substitutes') . '</a></div></div>';
    }

    $sys_links = implode(', ', array_map(fn($k) => '<a href="' . esc_url(add_query_arg(['s' => rawurlencode($k), 'post_type' => 'product'], home_url('/'))) . '">' . esc_html((string) firstvape_t('sysShort', ['x' => $k])) . '</a>', $a['kompat'] ?? []));
    $specs = array_filter([
        [firstvape_t('a_marka'), $b ? '<a href="' . esc_url((string) get_term_link($b['term'])) . '">' . esc_html($b['name']) . '</a>' : ''],
        [firstvape_t('a_iz'), esc_html(implode(', ', $a['iz'] ?? []))],
        [firstvape_t('a_nikotin'), esc_html(implode(', ', array_map('firstvape_nic_label', $a['nikotin'] ?? [])))],
        [firstvape_t('a_ml'), esc_html(implode(', ', $a['ml'] ?? []))],
        [firstvape_t('a_puffF'), esc_html(implode(', ', array_map(fn($x) => firstvape_puff_approx((int) $x), $a['puff'] ?? [])))],
        [firstvape_t('a_kompat'), $sys_links],
        [firstvape_t('a_ohm'), esc_html(implode(', ', $a['ohm'] ?? []))],
        [firstvape_t('a_szin'), esc_html(implode(', ', array_map('firstvape_color_name', $a['szin'] ?? [])))],
        [firstvape_t('sku'), '<span class="num">' . esc_html($p['sku']) . '</span>'],
        ['EAN', $p['ean'] !== '' ? '<span class="num">' . esc_html($p['ean']) . '</span>' : ''],
    ], fn($r) => $r[1] !== '');
    $key_specs = array_filter([
        !empty($a['iz']) ? [firstvape_t('a_iz'), implode(', ', $a['iz'])] : null,
        !empty($a['szin']) ? [firstvape_t('a_szin'), implode(', ', array_map('firstvape_color_name', $a['szin']))] : null,
        !empty($a['nikotin']) ? [firstvape_t('a_nikotinShort'), implode(', ', array_map('firstvape_nic_label', $a['nikotin']))] : null,
        !empty($a['ml']) ? [firstvape_t('a_ml'), implode(', ', $a['ml'])] : null,
        !empty($a['kompat']) ? [firstvape_t('system'), implode(', ', $a['kompat'])] : null,
        !empty($a['ohm']) ? [firstvape_t('a_ohm'), implode(', ', $a['ohm'])] : null,
        !empty($a['puff']) ? [firstvape_t('puffEst'), firstvape_puff_approx((int) $a['puff'][0])] : null,
    ]);
    $related = firstvape_related($p);
    $cats = implode(', ', array_filter(array_map(function ($k) {
        $c = firstvape_cat($k);
        return $c && $c['term'] ? '<a href="' . esc_url(firstvape_cat_url($k)) . '">' . esc_html((string) $c['name']) . '</a>' : '';
    }, $p['cats'])));
    $has_nic = (bool) array_filter($a['nikotin'] ?? [], fn($x) => (float) $x > 0);

    // képek: a kiemelt kép + a galéria (az ügyfél fájljában egy kép van termékenként)
    $gallery = array_values(array_filter(array_merge([$p['img']], (array) (wc_get_product($id)?->get_gallery_image_ids() ?? []))));
    $thumbs = '';
    if (count($gallery) > 1) {
        $thumbs = '<div class="g-thumbs" role="list">';
        foreach ($gallery as $i => $img) {
            $full = wp_get_attachment_image_url($img, 'woocommerce_single');
            $thumbs .= '<button role="listitem" type="button" class="g-th' . ($i ? '' : ' on') . '" data-act="gview" data-src="' . esc_url((string) $full) . '" style="--tint:' . esc_attr(firstvape_tint($p)) . '" aria-label="' . esc_attr((string) firstvape_t('img', ['n' => $i + 1])) . '">' . wp_get_attachment_image($img, 'woocommerce_gallery_thumbnail', false, ['class' => 'art art-img', 'alt' => '']) . '</button>';
        }
        $thumbs .= '</div>';
    }

    $kspecs = '';
    foreach ($key_specs as [$k, $v]) {
        $kspecs .= '<div><dt>' . esc_html((string) $k) . '</dt><dd class="num">' . esc_html((string) $v) . '</dd></div>';
    }
    $spec_rows = '';
    foreach ($specs as [$k, $v]) {
        $spec_rows .= '<tr><th scope="row">' . esc_html((string) $k) . '</th><td>' . $v . '</td></tr>';
    }
    $rel = '';
    foreach ($related as $g) {
        $rel .= '<section class="sec">' . firstvape_section_head((string) $g['title']) . firstvape_grid($g['items'], '', ['sys' => !empty($g['sys'])]) . '</section>';
    }

    return '<div class="wrap">' . firstvape_crumbs($bc) .
        '<div class="pdp">' .
        '<div class="gallery"><div class="g-main" style="--tint:' . esc_attr(firstvape_tint($p)) . '" data-g-main>' . firstvape_art($p, 'woocommerce_single', ['loading' => 'eager', 'fetchpriority' => 'high', 'sizes' => '(max-width: 760px) 100vw, 600px']) .
        '<div class="pc-badges">' . (firstvape_discount($p) ? '<span class="bdg bdg-sale">−' . firstvape_discount($p) . '%</span>' : '') . ($p['stock'] === 'discontinued' ? '<span class="bdg bdg-disc">' . firstvape_t('stDiscShort') . '</span>' : '') . '</div></div>' .
        $thumbs . '</div>' .
        '<div class="pinfo">' . ($b ? '<a class="pi-brand" href="' . esc_url((string) get_term_link($b['term'])) . '">' . firstvape_wordmark($b, 'sm') . '</a>' : '') .
        '<h1>' . esc_html($p['name']) . '</h1>' .
        '<p class="pi-short">' . esc_html($p['short_text']) . '</p>' . $opt .
        ($kspecs ? '<dl class="keyspecs">' . $kspecs . '</dl>' : '') .
        '<div class="pi-price">' . firstvape_price_html($p, true) . ($p['sale'] ? '<span class="save">' . firstvape_t('save', ['x' => firstvape_money(firstvape_regular($p) - (float) firstvape_sale_price($p))]) . '</span>' : '') . '</div>' .
        '<p class="pi-vat muted small">' . firstvape_t('priceVat', ['r' => firstvape_market()['vatLabel'] ?? '']) . '</p>' .
        '<p class="stock-lg ' . esc_attr($st['cls']) . '"><i></i>' . esc_html((string) $st['label']) . '</p>' .
        $buy .
        '<ul class="pi-perks"><li>' . firstvape_icon('truck') . '<span>' . firstvape_t('perkShip') . '</span></li>' .
        '<li>' . firstvape_icon('receipt') . '<span>' . firstvape_t('perkInvoice') . '</span></li>' .
        '<li>' . firstvape_icon('shield') . '<span>' . firstvape_t('perkReturn') . '</span></li></ul>' .
        '<p class="pi-cats">' . firstvape_t('catsLabel') . ' ' . $cats . ($p['sale'] ? ', <a href="' . esc_url(firstvape_page_url('sale')) . '">' . firstvape_t('onSaleCat') . '</a>' : '') . '</p>' .
        ($has_nic ? '<p class="nic-warn">' . firstvape_t('nicWarn') . '</p>' : '') .
        '</div></div>' .
        '<div class="ptabs"><div class="tabs" role="tablist">' .
        '<button class="tab on" type="button" role="tab" aria-selected="true" data-act="ptab" data-t="leiras">' . firstvape_t('tabDesc') . '</button>' .
        '<button class="tab" type="button" role="tab" aria-selected="false" data-act="ptab" data-t="spec">' . firstvape_t('tabSpec') . '</button>' .
        '<button class="tab" type="button" role="tab" aria-selected="false" data-act="ptab" data-t="szall">' . firstvape_t('tabShip') . '</button></div>' .
        '<div class="tabpane" data-pane="leiras">' . firstvape_long_desc($p) . '</div>' .
        '<div class="tabpane" data-pane="spec" hidden><div class="tbl-wrap"><table class="spec-tbl"><tbody>' . $spec_rows . '</tbody></table></div></div>' .
        '<div class="tabpane" data-pane="szall" hidden><div class="prose"><p>' . firstvape_t('shipPane', ['free' => firstvape_money(firstvape_ship()['freeOver'] ?? 50)]) . '</p>' . firstvape_ship_table() .
        '<p>' . firstvape_t('returnText', ['link' => '<a href="' . esc_url(firstvape_page_url('withdrawal')) . '">' . esc_html(firstvape_page_title('withdrawal')) . '</a>']) . '</p></div></div>' .
        '</div>' .
        '<div id="rel-groups">' . $rel . '</div></div>' .
        ($p['stock'] === 'instock' ? '<div class="sticky-buy" data-sticky-buy><div class="wrap sb-in"><span class="sb-name">' . esc_html($p['name']) . '</span>' . firstvape_price_html($p) . '<button class="btn btn-primary" type="button" data-act="sticky-add">' . firstvape_t('toCart') . '</button></div></div>' : '');
}

/**
 * A leírás: ha a terméknek van saját leírása az oldal nyelvén (szlovákul a WooCommerce leírás, franciául a
 * _fv_desc_fr meta), az; különben a terméktípus szerinti szöveg (az előnézet longDesc-je). A nagykereskedő angol
 * szövegei nem kerülnek ki (az ügyfél megírja / megíratja – kérdéssor).
 */
function firstvape_long_desc(array $p): string
{
    $own = firstvape_lang() === 'fr' ? (string) get_post_meta($p['id'], '_fv_desc_fr', true) : (string) get_post_field('post_content', $p['id']);
    if (trim(wp_strip_all_tags($own)) !== '') {
        return '<div class="prose">' . wp_kses_post(wpautop($own)) . '</div>';
    }
    $a = $p['attrs'];
    $b = firstvape_brand($p['brand']);
    $parts = ['<div class="prose"><p>' . esc_html($p['short_text']) . '</p>'];
    if ($p['art'] === 'disposable') {
        $puff = (int) ($a['puff'][0] ?? 0);
        $parts[] = '<p>' . firstvape_t('dispText', ['b' => esc_html($b ? $b['name'] : '')]) . ($puff >= 10000 ? firstvape_t('dispBig', ['p' => firstvape_puff_label($puff)]) : firstvape_t('dispSmall')) . '</p>';
        $parts[] = '<h3>' . firstvape_t('inBox') . '</h3><ul><li>1× ' . esc_html($p['name']) . '</li><li>' . firstvape_t('manual') . '</li></ul>';
    } elseif ($p['art'] === 'pod') {
        $parts[] = '<p>' . firstvape_t('podText', ['k' => esc_html(implode(', ', $a['kompat'] ?? []))]) . '</p>';
    } elseif ($p['art'] === 'kit') {
        $parts[] = '<p>' . firstvape_t('kitText') . '</p><h3>' . firstvape_t('inBox') . '</h3><ul>' . implode('', array_map(fn($x) => '<li>' . esc_html((string) $x) . '</li>', (array) firstvape_t('kitBox'))) . '</ul>';
    } elseif ($p['art'] === 'liquid') {
        $parts[] = '<p>' . firstvape_t('liquidText') . '</p>';
    }
    $parts[] = '</div>';
    return implode('', $parts);
}

/** Szállítási díjak szállítási módonként (a súlyt a vásárló nem látja; a díjszámítás a háttérben súlyalapú). */
function firstvape_ship_table(): string
{
    $rows = '';
    foreach (firstvape_shipping_methods_display() as $m) {
        $rows .= '<tr><td>' . esc_html($m['name']) . '</td><td>' . esc_html($m['eta']) . '</td><td class="num">' . esc_html(firstvape_money($m['from'])) . '</td></tr>';
    }
    $sh = firstvape_ship();
    return '<div class="tbl-wrap"><table class="ship-tbl"><thead><tr><th scope="col">' . firstvape_t('shipMethod') . '</th><th scope="col">' . firstvape_t('deliveryTime') . '</th><th scope="col">' . firstvape_t('priceFrom') . '</th></tr></thead><tbody>' .
        $rows . '<tr class="free"><td colspan="2">' . firstvape_t('overX', ['x' => firstvape_money($sh['freeOver'] ?? 50)]) . '</td><td>' . firstvape_t('free') . '</td></tr></tbody></table></div>' .
        (firstvape_shipping_is_sample() ? '<p class="muted small">' . firstvape_t('shipSample') . '</p>' : '');
}

/* ================================================================================ KEDVENCEK */

/** Kedvencek: a látogató böngészőjében (fv_wish süti: termékazonosítók), bejelentkezve a fiókjában is (user meta). */
function firstvape_wish_ids(): array
{
    $ids = array_filter(array_map('intval', explode(',', (string) ($_COOKIE['fv_wish'] ?? ''))));
    if (is_user_logged_in()) {
        $ids = array_merge($ids, array_map('intval', (array) get_user_meta(get_current_user_id(), 'fv_wish', true)));
    }
    return array_values(array_unique(array_filter($ids)));
}

function firstvape_render_wishlist(): string
{
    $w = array_values(array_filter(array_map('firstvape_product', firstvape_wish_ids())));
    return '<div class="wrap">' . firstvape_crumbs([['label' => firstvape_t('wishlist')]]) .
        '<div class="shop-title"><h1>' . firstvape_t('wishlist') . ' <span class="muted num">(' . count($w) . ')</span></h1></div>' .
        ($w ? firstvape_grid($w) : '<div class="empty"><p>' . firstvape_t('wishEmpty') . '</p><a class="btn" href="' . esc_url(firstvape_cat_url('eldobhato')) . '">' . firstvape_t('browse') . '</a></div>') . '</div>';
}
