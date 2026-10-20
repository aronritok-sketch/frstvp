<?php
/**
 * Katalógus: a termékek könnyű indexe és az előnézet core.js-ének logikája PHP-ben – kategóriák és márkák (csak a
 * termékkel rendelkezők látszanak), készletállapot, piaci ár, kereső (név, márka, attribútum, kategória, SKU,
 * számnormalizálás: „40k” = „40 000” = „40000”), szűrők darabszámmal, rendezés, kapcsolódó termékek.
 *
 * Adatmodell (WooCommerce):
 *   kategória  product_cat     – a fa a catalog.json szerint; a stabil kulcs az fv_key term meta (pl. „eldobhato”),
 *                                a francia név / leírás: fv_name_fr, fv_short_fr, fv_desc_fr
 *   márka      product_brand   – fv_color, fv_style (betűs logó), fv_desc_fr
 *   attribútum pa_prichut, pa_nikotin, pa_objem, pa_pocet-potiahnuti, pa_system, pa_farba, pa_odpor (szűrők)
 *   termék     SIMPLE; _fv_group (testvértermékek), _fv_art (típus; ha nincs: a fő kategóriából), _fv_color (ízszín), _fv_pop (népszerűség),
 *              _fv_short_fr (francia rövid leírás), _fv_discontinued (kifutott), cross-sell = az ügyfél ajánlásai
 *
 * Az index (firstvape_index opció) a termékek, kategóriák és márkák mentésekor újraépül.
 */

defined('ABSPATH') || exit;

/** Előnézet-kulcs → attribútum-taxonómia (pa_*). */
/** Előnézet-kulcs → attribútum-taxonómia (pa_*). A slug a szlovák felirat (Príchuť → pa_prichut …): így az ügyfél
 *  fájljából készült import CSV (prototype/csv/firstvape-woocommerce-import.csv, „Attribute 1 name: Príchuť”, global)
 *  a WooCommerce importerével ugyanezekre a globális attribútumokra kerül, nem jön létre dupla. */
const FIRSTVAPE_ATTRS = [
    'iz' => 'pa_prichut', 'nikotin' => 'pa_nikotin', 'ml' => 'pa_objem', 'puff' => 'pa_pocet-potiahnuti',
    'kompat' => 'pa_system', 'szin' => 'pa_farba', 'ohm' => 'pa_odpor',
];
const FIRSTVAPE_INDEX_VERSION = 4;

/* ------------------------------------------------------------------------------------------------ kategóriák */

/** A kategóriafa a catalog.json szerint, a WordPress-kifejezésekkel (név, link) összekötve: kulcs → adat. */
function firstvape_cats(): array
{
    static $cats = null;
    if ($cats !== null) {
        return $cats;
    }
    $cats = [];
    $terms = [];
    if (taxonomy_exists('product_cat')) {
        // meta_key szűrő nélkül: a WooCommerce a product_cat lekérdezésébe saját rendezést tesz, ami azzal üres
        // eredményt adna (Slugshop tanulsága)
        foreach ((array) get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false]) as $t) {
            $k = $t instanceof WP_Term ? (string) get_term_meta($t->term_id, 'fv_key', true) : '';
            if ($k !== '') {
                $terms[$k] = $t;
            }
        }
    }
    $add = function (array $c, ?string $parent) use (&$cats, $terms) {
        $key = (string) $c['slug'];
        $t = $terms[$key] ?? null;
        $cats[$key] = [
            'key' => $key, 'parent' => $parent, 'term' => $t, 'term_id' => $t ? (int) $t->term_id : 0,
            'name' => $c['name'], 'short' => $c['short'] ?? $c['name'], 'desc' => $c['desc'] ?? '',
            'art' => $c['art'] ?? '', 'color' => $c['color'] ?? '', 'en' => $c['en'] ?? '',
            'children' => array_map(fn($ch) => (string) $ch['slug'], (array) ($c['children'] ?? [])),
        ];
    };
    foreach ((array) firstvape_catalog('categories') as $c) {
        $add($c, null);
        foreach ((array) ($c['children'] ?? []) as $ch) {
            $add($ch, (string) $c['slug']);
        }
    }
    return $cats;
}

function firstvape_cat(string $key): ?array
{
    $c = firstvape_cats()[$key] ?? null;
    if (!$c) {
        return null;
    }
    // a megjelenített név: a WordPress-kifejezés (szlovák) / fv_name_fr meta (francia); ha nincs, a catalog.json
    $t = $c['term'];
    $fr = firstvape_lang() === 'fr';
    $meta = fn($k) => $t ? (string) get_term_meta($t->term_id, $k, true) : '';
    $c['name'] = $t ? ($fr ? ($meta('fv_name_fr') ?: firstvape_L($c['name'])) : $t->name) : firstvape_L($c['name']);
    $c['short'] = $fr ? ($meta('fv_short_fr') ?: firstvape_L($c['short'])) : ($meta('fv_short_sk') ?: firstvape_L($c['short']));
    $c['desc'] = $fr ? ($meta('fv_desc_fr') ?: firstvape_L($c['desc'])) : ($t && $t->description !== '' ? $t->description : firstvape_L($c['desc']));
    return $c;
}

function firstvape_cat_term(string $key): ?WP_Term
{
    return firstvape_cats()[$key]['term'] ?? null;
}

function firstvape_cat_url(string $key, array $query = []): string
{
    $t = firstvape_cat_term($key);
    $url = $t ? (string) get_term_link($t) : home_url('/');
    return $query ? add_query_arg(array_map('rawurlencode', $query), $url) : $url;
}

/** A gyökér kategóriák (a menü és a csempék sorrendjében). */
function firstvape_root_cats(): array
{
    return array_values(array_filter(array_keys(firstvape_cats()), fn($k) => firstvape_cats()[$k]['parent'] === null));
}

/* ------------------------------------------------------------------------------------------------ márkák */

function firstvape_brands(): array
{
    static $brands = null;
    if ($brands !== null) {
        return $brands;
    }
    $brands = [];
    if (!taxonomy_exists('product_brand')) {
        return $brands;
    }
    foreach ((array) get_terms(['taxonomy' => 'product_brand', 'hide_empty' => false]) as $t) {
        if (!$t instanceof WP_Term) {
            continue;
        }
        $brands[$t->slug] = [
            'slug' => $t->slug, 'name' => $t->name, 'term' => $t,
            'color' => (string) get_term_meta($t->term_id, 'fv_color', true) ?: '#EC2F4B',
            'style' => (string) get_term_meta($t->term_id, 'fv_style', true) ?: 'heavy',
            'desc_sk' => $t->description, 'desc_fr' => (string) get_term_meta($t->term_id, 'fv_desc_fr', true),
        ];
    }
    return $brands;
}

function firstvape_brand(string $slug): ?array
{
    $b = firstvape_brands()[$slug] ?? null;
    if ($b) {
        $b['desc'] = firstvape_lang() === 'fr' && $b['desc_fr'] !== '' ? $b['desc_fr'] : $b['desc_sk'];
    }
    return $b;
}

/** Márka „logó”: betűs wordmark (az előnézet szerint), amíg nincs valódi logó. */
function firstvape_wordmark(array $b, string $size = ''): string
{
    return '<span class="wm wm-' . esc_attr($b['style']) . ($size ? ' wm-' . esc_attr($size) : '') . '" style="--wm:' . esc_attr($b['color']) . '">' . esc_html($b['name']) . '</span>';
}

/* ------------------------------------------------------------------------------------------------ index */

/** Az index érvénytelenítése (a következő kérés újraépíti). */
function firstvape_index_flush(): void
{
    delete_option('firstvape_index');
    $GLOBALS['firstvape_index'] = null;
}
add_action('save_post_product', 'firstvape_index_flush');
add_action('deleted_post', 'firstvape_index_flush');
add_action('woocommerce_product_set_stock', 'firstvape_index_flush');
add_action('woocommerce_product_set_stock_status', 'firstvape_index_flush');
add_action('woocommerce_update_product', 'firstvape_index_flush');
foreach (['product_cat', 'product_brand'] as $tax) {
    add_action('created_' . $tax, 'firstvape_index_flush');
    add_action('edited_' . $tax, 'firstvape_index_flush');
    add_action('delete_' . $tax, 'firstvape_index_flush');
}

/** Minden termék könnyű adata: id → [...] (a publikált termékek, menu_order + cím szerint). */
function firstvape_index(): array
{
    if (!empty($GLOBALS['firstvape_index'])) {
        return $GLOBALS['firstvape_index'];
    }
    $cached = get_option('firstvape_index');
    if (is_array($cached) && ($cached['v'] ?? 0) === FIRSTVAPE_INDEX_VERSION) {
        return $GLOBALS['firstvape_index'] = $cached['items'];
    }
    $items = firstvape_index_build();
    update_option('firstvape_index', ['v' => FIRSTVAPE_INDEX_VERSION, 'items' => $items], false);
    return $GLOBALS['firstvape_index'] = $items;
}

function firstvape_index_build(): array
{
    if (!function_exists('wc_get_products')) {
        return [];
    }
    $key_of = [];
    $parent_of = [];
    foreach (firstvape_cats() as $k => $c) {
        if ($c['term_id']) {
            $key_of[$c['term_id']] = $k;
            $parent_of[$k] = $c['parent'];
        }
    }
    $items = [];
    $ids = wc_get_products(['status' => 'publish', 'limit' => -1, 'return' => 'ids', 'orderby' => ['menu_order' => 'ASC', 'title' => 'ASC']]);
    foreach ($ids as $id) {
        $p = wc_get_product($id);
        if (!$p) {
            continue;
        }
        $cats = [];
        foreach ($p->get_category_ids() as $tid) {
            if (isset($key_of[$tid])) {
                $k = $key_of[$tid];
                $cats[$k] = 1;
                if (!empty($parent_of[$k])) {
                    $cats[$parent_of[$k]] = 1;
                }
            }
        }
        // a gyökér kategória elöl (primaryCat)
        uksort($cats, fn($a, $b) => (int) !empty($parent_of[$a]) <=> (int) !empty($parent_of[$b]));
        $attrs = [];
        foreach (FIRSTVAPE_ATTRS as $k => $tax) {
            $vals = taxonomy_exists($tax) ? wc_get_product_terms($id, $tax, ['fields' => 'names']) : [];
            if ($vals) {
                $attrs[$k] = $k === 'puff' ? array_map('intval', $vals) : array_values($vals);
            }
        }
        $brand = wp_get_post_terms($id, 'product_brand', ['fields' => 'slugs']);
        $stock = $p->get_stock_status();
        if (get_post_meta($id, '_fv_discontinued', true)) {
            $stock = 'discontinued';
        } elseif ($stock === 'onbackorder') {
            $stock = 'instock';
        }
        $sale = $p->is_on_sale() ? (float) $p->get_sale_price() : null;
        $cross = [];
        foreach ($p->get_cross_sell_ids() as $cid) {
            $cross[] = (int) $cid;
        }
        $items[$id] = [
            'id' => (int) $id, 'slug' => $p->get_slug(), 'name' => $p->get_name(), 'url' => (string) get_permalink($id),
            'sku' => $p->get_sku(), 'ean' => method_exists($p, 'get_global_unique_id') ? (string) $p->get_global_unique_id() : '',
            'art' => (string) get_post_meta($id, '_fv_art', true) ?: firstvape_art_of_cats(array_keys($cats)),
            'color' => (string) get_post_meta($id, '_fv_color', true) ?: '#7A6A9E',
            'cats' => array_keys($cats), 'brand' => $brand && !is_wp_error($brand) ? (string) $brand[0] : '',
            'price' => (float) $p->get_regular_price(), 'sale' => $sale && $sale > 0 ? $sale : null,
            'stock' => $stock, 'qty' => $p->managing_stock() ? (int) $p->get_stock_quantity() : null,
            'attrs' => $attrs,
            'short' => ['sk' => wp_strip_all_tags($p->get_short_description()), 'fr' => (string) get_post_meta($id, '_fv_short_fr', true)],
            'pop' => (int) get_post_meta($id, '_fv_pop', true), 'group' => (string) get_post_meta($id, '_fv_group', true),
            'img' => (int) $p->get_image_id(), 'cross' => $cross,
            'swatch' => (string) get_post_meta($id, '_fv_swatch', true), 'date' => (string) $p->get_date_created()?->date('Y-m-d H:i:s'),
            'order' => (int) $p->get_menu_order(),
        ];
    }
    return $items;
}

/** A terméktípus (kártya adatai, leírás) a fő kategóriából, ha a terméknek nincs _fv_art metája (pl. CSV-importból jött). */
function firstvape_art_of_cats(array $keys): string
{
    foreach ($keys as $k) {
        $c = firstvape_cats()[$k] ?? null;
        if ($c && $c['parent'] === null && $c['art'] !== '') {
            return (string) $c['art'];
        }
    }
    return 'accessory';
}

/** A termékek (az aktuális nyelvhez igazított rövid leírással). */
function firstvape_products(): array
{
    static $out = [];
    $lang = firstvape_lang();
    if (!isset($out[$lang])) {
        $out[$lang] = array_map(function ($p) use ($lang) {
            $p['short_text'] = $lang === 'fr' && $p['short']['fr'] !== '' ? $p['short']['fr'] : $p['short']['sk'];
            $p['url'] = firstvape_swap_host($p['url']); // az index egy domainen épült: a link a látogató domainjén
            return $p;
        }, firstvape_index());
    }
    return $out[$lang];
}

function firstvape_product(int $id): ?array
{
    return firstvape_products()[$id] ?? null;
}

function firstvape_product_by_slug(string $slug): ?array
{
    foreach (firstvape_products() as $p) {
        if ($p['slug'] === $slug) {
            return $p;
        }
    }
    return null;
}

/* ------------------------------------------------------------------------------------------------ ár, készlet */

/** Alap (szlovák bruttó) ár → az aktuális piac bruttó ára (a nettó állandó: WooCommerce alapbeállítás). */
function firstvape_gross($v)
{
    if ($v === null) {
        return null;
    }
    $base = (float) firstvape_catalog('baseVat', 0.23);
    $vat = (float) (firstvape_market()['vat'] ?? $base);
    return round((float) $v / (1 + $base) * (1 + $vat), 2);
}

function firstvape_regular(array $p): float
{
    return (float) firstvape_gross($p['price']);
}

function firstvape_sale_price(array $p): ?float
{
    return $p['sale'] ? (float) firstvape_gross($p['sale']) : null;
}

function firstvape_price(array $p): float
{
    return (float) firstvape_gross($p['sale'] ?: $p['price']);
}

function firstvape_discount(array $p): int
{
    return $p['sale'] && $p['price'] > 0 ? (int) round((1 - $p['sale'] / $p['price']) * 100) : 0;
}

function firstvape_in_cat(array $p, string $key): bool
{
    return in_array($key, $p['cats'], true);
}

function firstvape_is_active(array $p): bool
{
    return $p['stock'] !== 'discontinued';
}

function firstvape_products_in_cat(string $key): array
{
    return array_values(array_filter(firstvape_products(), fn($p) => firstvape_in_cat($p, $key)));
}

function firstvape_products_of_brand(string $slug): array
{
    return array_values(array_filter(firstvape_products(), fn($p) => $p['brand'] === $slug));
}

function firstvape_cat_has_products(string $key): bool
{
    foreach (firstvape_products() as $p) {
        if (firstvape_is_active($p) && firstvape_in_cat($p, $key)) {
            return true;
        }
    }
    return false;
}

/** Csak azok a márkák, amelyekhez van aktív termék (az ügyfél kérése). */
function firstvape_visible_brands(): array
{
    $has = [];
    foreach (firstvape_products() as $p) {
        if (firstvape_is_active($p) && $p['brand'] !== '') {
            $has[$p['brand']] = 1;
        }
    }
    $out = [];
    foreach (firstvape_brands() as $slug => $b) {
        if (isset($has[$slug])) {
            $out[] = firstvape_brand($slug);
        }
    }
    return $out;
}

function firstvape_visible_children(string $key): array
{
    $c = firstvape_cats()[$key] ?? null;
    return $c ? array_values(array_filter($c['children'], 'firstvape_cat_has_products')) : [];
}

function firstvape_primary_cat(array $p): ?array
{
    foreach ($p['cats'] as $k) {
        $c = firstvape_cats()[$k] ?? null;
        if ($c && $c['parent'] === null) {
            return firstvape_cat($k);
        }
    }
    return $p['cats'] ? firstvape_cat($p['cats'][0]) : null;
}

function firstvape_leaf_cat(array $p): ?array
{
    foreach ($p['cats'] as $k) {
        $c = firstvape_cats()[$k] ?? null;
        if ($c && $c['parent'] !== null) {
            return firstvape_cat($k);
        }
    }
    return null;
}

/** Készletállapot: osztály, felirat, rövid felirat (alacsony készlet: ≤ 3 db). */
function firstvape_stock_info(array $p): array
{
    $low = (int) firstvape_catalog('lowStock', 3);
    if ($p['stock'] === 'discontinued') {
        return ['cls' => 'st-disc', 'label' => firstvape_t('stDisc'), 'short' => firstvape_t('stDiscShort')];
    }
    if ($p['stock'] === 'outofstock') {
        return ['cls' => 'st-out', 'label' => firstvape_t('stOut'), 'short' => firstvape_t('stOutShort')];
    }
    if ($p['qty'] !== null && $p['qty'] <= $low) {
        return ['cls' => 'st-low', 'label' => firstvape_t('stLow', ['n' => $p['qty']]), 'short' => firstvape_t('stLowShort')];
    }
    return ['cls' => 'st-in', 'label' => firstvape_t('stIn'), 'short' => firstvape_t('stIn')];
}

/** Sötét felületen a termékszín „füstös” fényként a kép mögött (CSS: --tint). */
function firstvape_tint(array $p): string
{
    $hex = ltrim((string) $p['color'], '#');
    if (!preg_match('/^[0-9a-f]{6}$/i', $hex)) {
        return '#7A6A9E';
    }
    $n = hexdec($hex);
    $lum = (0.2126 * ($n >> 16) + 0.7152 * (($n >> 8) & 255) + 0.0722 * ($n & 255)) / 255;
    return $lum < 0.2 ? '#7A6A9E' : '#' . $hex;
}

/** A termék képe (feldolgozott, átlátszó WebP); ha nincs, a márka betűs logója a színes háttéren. */
function firstvape_art(array $p, string $size = 'woocommerce_single', array $attr = []): string
{
    if ($p['img']) {
        $html = wp_get_attachment_image($p['img'], $size, false, $attr + ['class' => 'art art-img', 'alt' => $p['name'], 'loading' => 'lazy', 'decoding' => 'async', 'sizes' => '(max-width: 760px) 50vw, 320px']);
        if ($html !== '') {
            return $html;
        }
    }
    $b = firstvape_brand($p['brand']);
    return '<span class="art art-ph" role="img" aria-label="' . esc_attr($p['name']) . '">' . ($b ? firstvape_wordmark($b) : '') . '</span>';
}

/* ------------------------------------------------------------------------------------------------ kereső */

/** Keresési normalizálás: kisbetű, ékezet nélkül, ezres tagolás nélkül („40 000” → „40000”), „40k” → „40000”, „20 mg” → „20mg”. */
function firstvape_norm(string $s): string
{
    $s = mb_strtolower(remove_accents($s));
    for ($i = 0; $i < 2; $i++) {
        $s = (string) preg_replace('/(\d)[\s.,](?=\d{3}(\D|$))/', '$1', $s);
    }
    $s = (string) preg_replace_callback('/\b(\d+)\s?k\b/', fn($m) => (string) ((int) $m[1] * 1000), $s);
    $s = (string) preg_replace('/(\d+)\s?(mg|ml)\b/', '$1$2', $s);
    return trim((string) preg_replace('/\s+/', ' ', $s));
}

function firstvape_search_index(array $p): array
{
    static $cache = [];
    $key = firstvape_lang() . $p['id'];
    if (isset($cache[$key])) {
        return $cache[$key];
    }
    $b = firstvape_brand($p['brand']);
    $a = $p['attrs'];
    $cats = implode(' ', array_map(fn($k) => (string) (firstvape_cat($k)['name'] ?? ''), $p['cats']));
    $ix = [
        'name' => firstvape_norm($p['name']),
        'brand' => firstvape_norm($b ? $b['name'] : ''),
        'attrs' => firstvape_norm(implode(' ', array_merge($a['iz'] ?? [], $a['nikotin'] ?? [], $a['ml'] ?? [], $a['kompat'] ?? [], array_map('firstvape_color_name', $a['szin'] ?? []), $a['szin'] ?? []))),
        'puff' => array_map('strval', $a['puff'] ?? []),
        'cats' => firstvape_norm($cats),
        'ids' => firstvape_norm($p['sku'] . ' ' . $p['ean']),
    ];
    $ix['all'] = implode(' ', [$ix['name'], $ix['brand'], $ix['attrs'], implode(' ', $ix['puff']), !empty($a['puff']) ? 'puff ' . firstvape_norm((string) firstvape_t('puffUnit')) : '', $ix['cats'], $ix['ids']]);
    return $cache[$key] = $ix;
}

/** Kereső pontozással (a slukkszám pontos egyezése, a név szava, a márka, az attribútumok, a kategória, a cikkszám). */
function firstvape_search(string $q): array
{
    $stop = ['puff', 'puffs', 'potiahnuti', 'potiahnutia', 'bouffee', 'bouffees'];
    $tokens = array_values(array_filter(explode(' ', firstvape_norm($q)), fn($t) => $t !== '' && !in_array($t, $stop, true)));
    if (!$tokens) {
        return [];
    }
    $res = [];
    foreach (firstvape_products() as $p) {
        $ix = firstvape_search_index($p);
        $score = 0;
        $ok = true;
        foreach ($tokens as $t) {
            $s = 0;
            if (ctype_digit($t)) {
                if (in_array($t, $ix['puff'], true)) {
                    $s += 14;
                } elseif (array_filter($ix['puff'], fn($x) => str_starts_with($x, $t))) {
                    $s += 6;
                }
            }
            if (str_contains($ix['name'], $t)) {
                $s += in_array($t, explode(' ', $ix['name']), true) ? 10 : 6;
            }
            if ($ix['brand'] !== '' && str_contains($ix['brand'], $t)) {
                $s += $ix['brand'] === $t ? 9 : 5;
            }
            if (str_contains($ix['attrs'], $t)) {
                $s += 5;
            }
            if (str_contains($ix['cats'], $t)) {
                $s += 3;
            }
            if (str_contains($ix['ids'], $t)) {
                $s += 7;
            }
            if (!$s && str_contains($ix['all'], $t)) {
                $s = 1;
            }
            if (!$s) {
                $ok = false;
                break;
            }
            $score += $s;
        }
        if ($ok) {
            $res[] = [$p, $score + $p['pop'] / 100 + ($p['stock'] === 'discontinued' ? -4 : 0)];
        }
    }
    usort($res, fn($a, $b) => $b[1] <=> $a[1]);
    return array_map(fn($r) => $r[0], $res);
}

/** Javaslatok az élő keresőhöz: márkák, kategóriák, slukkszám, íz. */
function firstvape_suggest(string $q): array
{
    $nq = firstvape_norm($q);
    if (mb_strlen($nq) < 2) {
        return [];
    }
    $tokens = explode(' ', $nq);
    $hit = function (string $label) use ($tokens) {
        $n = firstvape_norm($label);
        foreach ($tokens as $t) {
            if (strlen($t) > 1 && str_contains($n, $t)) {
                return true;
            }
        }
        return false;
    };
    $out = [];
    foreach (firstvape_visible_brands() as $b) {
        if ($hit($b['name'])) {
            $out[] = ['type' => firstvape_t('sBrand'), 'label' => $b['name'], 'href' => (string) get_term_link($b['term'])];
        }
    }
    foreach (array_keys(firstvape_cats()) as $k) {
        $c = firstvape_cat($k);
        if ($c && $c['term'] && firstvape_cat_has_products($k) && $hit((string) $c['name'])) {
            $out[] = ['type' => firstvape_t('sCat'), 'label' => $c['name'], 'href' => firstvape_cat_url($k)];
        }
    }
    $puffs = [];
    $flav = [];
    foreach (firstvape_products() as $p) {
        foreach ($p['attrs']['puff'] ?? [] as $x) {
            $puffs[(string) $x] = 1;
        }
        foreach ($p['attrs']['iz'] ?? [] as $x) {
            $flav[$x] = 1;
        }
    }
    foreach (array_keys($puffs) as $x) {
        foreach ($tokens as $t) {
            if (preg_match('/^\d{3,}$/', $t) && str_starts_with((string) $x, $t)) {
                $out[] = ['type' => firstvape_t('sPuff'), 'label' => firstvape_puff_label((int) $x), 'href' => add_query_arg('puff', rawurlencode((string) firstvape_puff_bucket((int) $x)), (string) wc_get_page_permalink('shop'))];
            }
        }
    }
    foreach (array_keys($flav) as $x) {
        foreach ($tokens as $t) {
            if (strlen($t) > 2 && str_contains(firstvape_norm((string) $x), $t)) {
                $out[] = ['type' => firstvape_t('sFlavor'), 'label' => (string) $x, 'href' => add_query_arg(['s' => rawurlencode((string) $x), 'post_type' => 'product'], home_url('/'))];
                break;
            }
        }
    }
    $seen = [];
    $out = array_values(array_filter($out, function ($o) use (&$seen) {
        $k = $o['type'] . $o['label'];
        if (isset($seen[$k])) {
            return false;
        }
        return $seen[$k] = true;
    }));
    return array_slice($out, 0, 6);
}

/* ------------------------------------------------------------------------------------------------ szűrők */

/** A szűrők (WooCommerce layered nav megfelelője): kulcs → [felirat-kulcs, értékek(termék), név(érték), rendezés, …]. */
function firstvape_facet_defs(): array
{
    static $defs = null;
    if ($defs !== null) {
        return $defs;
    }
    $order = array_column(firstvape_puff_buckets(), 'id');
    $defs = [
        'typ' => ['lk' => 'a_typ', 'get' => fn($p) => ($c = firstvape_primary_cat($p)) ? [$c['key']] : [], 'name' => fn($v) => (string) (firstvape_cat($v)['name'] ?? $v)],
        'kat' => ['lk' => 'a_kat', 'get' => fn($p) => array_values(array_filter($p['cats'], fn($c) => (firstvape_cats()[$c]['parent'] ?? null) !== null)), 'name' => fn($v) => (string) (firstvape_cat($v)['name'] ?? $v)],
        'marka' => ['lk' => 'a_marka', 'get' => fn($p) => $p['brand'] !== '' ? [$p['brand']] : [], 'name' => fn($v) => (string) (firstvape_brand($v)['name'] ?? $v)],
        'kompat' => ['lk' => 'a_kompat', 'get' => fn($p) => $p['attrs']['kompat'] ?? [], 'name' => fn($v) => $v],
        'iz' => ['lk' => 'a_iz', 'get' => fn($p) => $p['attrs']['iz'] ?? [], 'name' => fn($v) => $v, 'swatch' => 'flavor'],
        'puff' => ['lk' => 'a_puffF', 'note' => 'puffNote', 'get' => fn($p) => array_values(array_filter(array_map('firstvape_puff_bucket', $p['attrs']['puff'] ?? []))), 'name' => 'firstvape_puff_bucket_label', 'order' => fn($v) => (int) array_search($v, $order, true), 'mono' => true],
        'nikotin' => ['lk' => 'a_nikotin', 'get' => fn($p) => $p['attrs']['nikotin'] ?? [], 'name' => 'firstvape_nic_label', 'sort' => 'num', 'mono' => true],
        'ml' => ['lk' => 'a_ml', 'get' => fn($p) => $p['attrs']['ml'] ?? [], 'name' => fn($v) => $v, 'sort' => 'num', 'mono' => true],
        'szin' => ['lk' => 'a_szin', 'get' => fn($p) => $p['attrs']['szin'] ?? [], 'name' => 'firstvape_color_name', 'swatch' => 'color'],
        'ohm' => ['lk' => 'a_ohm', 'get' => fn($p) => $p['attrs']['ohm'] ?? [], 'name' => fn($v) => $v, 'sort' => 'ohm', 'mono' => true],
        'keszlet' => ['lk' => 'a_keszlet', 'get' => fn($p) => [$p['stock']], 'name' => fn($v) => (string) firstvape_t(['instock' => 'fInstock', 'outofstock' => 'fOut', 'discontinued' => 'fDisc'][$v] ?? 'fInstock')],
    ];
    return $defs;
}

/** A szűrők a lekérdezésből (?marka=elfbar,vaporesso&puff=20000%2B&min=5&rend=ar_n&oldal=2). */
function firstvape_parse_filters(array $q): array
{
    $f = ['rend' => sanitize_key((string) ($q['rend'] ?? 'pop')) ?: 'pop', 'oldal' => max(1, (int) ($q['oldal'] ?? 1)), 'akcio' => !empty($q['akcio'])];
    foreach (array_keys(firstvape_facet_defs()) as $k) {
        // JS-sel vesszős lista (?marka=a,b), JS nélkül az űrlap tömbje (?marka[]=a&marka[]=b)
        $v = $q[$k] ?? '';
        $v = is_array($v) ? array_map(fn($x) => wp_unslash((string) $x), $v) : explode(',', wp_unslash((string) $v));
        $f[$k] = array_values(array_unique(array_filter(array_map('trim', $v), 'strlen')));
    }
    if (isset($q['min']) && is_numeric($q['min'])) {
        $f['min'] = (float) $q['min'];
    }
    if (isset($q['max']) && is_numeric($q['max'])) {
        $f['max'] = (float) $q['max'];
    }
    return $f;
}

function firstvape_filters_query(array $f): array
{
    $q = [];
    foreach (array_keys(firstvape_facet_defs()) as $k) {
        if (!empty($f[$k])) {
            $q[$k] = implode(',', $f[$k]);
        }
    }
    foreach (['min', 'max'] as $k) {
        if (isset($f[$k])) {
            $q[$k] = $f[$k];
        }
    }
    if (!empty($f['akcio'])) {
        $q['akcio'] = 1;
    }
    if (($f['rend'] ?? 'pop') !== 'pop') {
        $q['rend'] = $f['rend'];
    }
    if (($f['oldal'] ?? 1) > 1) {
        $q['oldal'] = $f['oldal'];
    }
    return $q;
}

function firstvape_apply_filters(array $list, array $f, ?string $skip = null): array
{
    $defs = firstvape_facet_defs();
    return array_values(array_filter($list, function ($p) use ($f, $skip, $defs) {
        foreach ($defs as $k => $d) {
            if ($k === $skip || empty($f[$k])) {
                continue;
            }
            if (!array_intersect($f[$k], array_map('strval', ($d['get'])($p)))) {
                return false;
            }
        }
        $pr = firstvape_price($p);
        if (isset($f['min']) && $pr < $f['min']) {
            return false;
        }
        if (isset($f['max']) && $pr > $f['max']) {
            return false;
        }
        if (!empty($f['akcio']) && !$p['sale']) {
            return false;
        }
        return true;
    }));
}

/** Tényezők darabszámmal (az adott tényező saját kijelölését figyelmen kívül hagyva, mint a WooCommerce „OR” szűrőnél). */
function firstvape_facets(array $base, array $f, ?array $allowed): array
{
    $out = [];
    foreach (firstvape_facet_defs() as $key => $d) {
        if ($allowed !== null && !in_array($key, $allowed, true)) {
            continue;
        }
        $pool = firstvape_apply_filters($base, $f, $key);
        $all = [];
        $counts = [];
        foreach ($base as $p) {
            foreach (($d['get'])($p) as $v) {
                $all[(string) $v] = 1;
            }
        }
        foreach ($pool as $p) {
            foreach (($d['get'])($p) as $v) {
                $counts[(string) $v] = ($counts[(string) $v] ?? 0) + 1;
            }
        }
        $vals = array_map('strval', array_keys($all));
        if (isset($d['order'])) {
            usort($vals, fn($a, $b) => ($d['order'])($a) <=> ($d['order'])($b));
        } elseif (($d['sort'] ?? '') === 'num') {
            usort($vals, fn($a, $b) => (float) $a <=> (float) $b);
        } elseif (($d['sort'] ?? '') === 'ohm') {
            usort($vals, fn($a, $b) => firstvape_ohm_num($a) <=> firstvape_ohm_num($b));
        } else {
            $coll = class_exists('Collator') ? new Collator(firstvape_locale()) : null;
            usort($vals, fn($a, $b) => $coll ? $coll->compare(($d['name'])($a), ($d['name'])($b)) : strcmp(($d['name'])($a), ($d['name'])($b)));
        }
        $values = array_map(fn($v) => ['v' => $v, 'n' => $counts[$v] ?? 0, 'on' => in_array($v, $f[$key] ?? [], true)], $vals);
        if (count($values) > 1 || array_filter($values, fn($x) => $x['on'])) {
            $out[] = ['key' => $key, 'def' => $d, 'values' => $values];
        }
    }
    return $out;
}

function firstvape_sorters(): array
{
    return [
        'pop' => ['lk' => 'sortPop', 'fn' => fn($a, $b) => $b['pop'] <=> $a['pop']],
        'uj' => ['lk' => 'sortNew', 'fn' => fn($a, $b) => strcmp($b['date'], $a['date'])],
        'ar_n' => ['lk' => 'sortAsc', 'fn' => fn($a, $b) => firstvape_price($a) <=> firstvape_price($b)],
        'ar_cs' => ['lk' => 'sortDesc', 'fn' => fn($a, $b) => firstvape_price($b) <=> firstvape_price($a)],
        'puff' => ['lk' => 'sortPuff', 'fn' => fn($a, $b) => (($b['attrs']['puff'] ?? [0])[0]) <=> (($a['attrs']['puff'] ?? [0])[0])],
    ];
}

/* ------------------------------------------------------------------------------------------------ kapcsolódó */

/**
 * Kapcsolódó termékek: az ügyfél ajánlásai (cross-sell), készülék → kompatibilis podok / patronok, pod → kompatibilis
 * készülékek (pa_system), testvértermékek, alternatívák. Egy termék csak egyszer jelenik meg, csoportonként 4.
 */
function firstvape_related(array $p): array
{
    $is_device = firstvape_in_cat($p, 'keszulekek');
    $is_part = firstvape_in_cat($p, 'eloretoltott-podok') || firstvape_in_cat($p, 'ures-podok') || firstvape_in_cat($p, 'porlasztok') || firstvape_in_cat($p, 'tankok');
    $others = array_values(array_filter(firstvape_products(), fn($x) => $x['id'] !== $p['id'] && firstvape_is_active($x)));
    $shares = fn($a, $b) => (bool) array_intersect($a['attrs']['kompat'] ?? [], $b['attrs']['kompat'] ?? []);
    $sys = implode(', ', $p['attrs']['kompat'] ?? []);
    $out = [];
    if ($p['cross']) {
        $by = [];
        foreach ($others as $x) {
            $by[$x['id']] = $x;
        }
        $cross = array_values(array_filter(array_map(fn($id) => $by[$id] ?? null, $p['cross'])));
        if ($cross) {
            $out[] = ['title' => firstvape_t('relCross'), 'items' => $cross];
        }
    }
    if ($is_device && $sys !== '') {
        $parts = array_values(array_filter($others, fn($x) => !firstvape_in_cat($x, 'keszulekek') && $shares($p, $x)));
        usort($parts, fn($a, $b) => (firstvape_in_cat($b, 'eloretoltott-podok') <=> firstvape_in_cat($a, 'eloretoltott-podok')) ?: $b['pop'] <=> $a['pop']);
        $out[] = ['title' => firstvape_t('relParts', ['x' => $sys]), 'items' => $parts, 'sys' => true];
    }
    if ($is_part && $sys !== '') {
        $out[] = ['title' => firstvape_t('relDevices', ['x' => $sys]), 'items' => array_values(array_filter($others, fn($x) => firstvape_in_cat($x, 'keszulekek') && $shares($p, $x))), 'sys' => true];
    }
    if ($p['group'] !== '') {
        $sib = array_values(array_filter($others, fn($x) => $x['group'] === $p['group']));
        if ($sib) {
            $out[] = ['title' => firstvape_t('relVariants'), 'items' => $sib];
        }
    }
    $leaf = firstvape_leaf_cat($p);
    $prim = firstvape_primary_cat($p);
    $not_sib = fn($x) => $p['group'] === '' || $x['group'] !== $p['group'];
    $alt = array_values(array_filter($others, fn($x) => $not_sib($x) && ($leaf ? firstvape_in_cat($x, $leaf['key']) : ($prim && firstvape_in_cat($x, $prim['key'])))));
    if (count($alt) < 4 && $prim) {
        $ids = array_column($alt, 'id');
        foreach ($others as $x) {
            if (firstvape_in_cat($x, $prim['key']) && !in_array($x['id'], $ids, true) && $not_sib($x)) {
                $alt[] = $x;
            }
        }
    }
    usort($alt, fn($a, $b) => (($b['stock'] === 'instock') <=> ($a['stock'] === 'instock')) ?: $b['pop'] <=> $a['pop']);
    $seen = [];
    $alt = array_values(array_filter($alt, function ($x) use (&$seen) {
        if ($x['group'] === '') {
            return true;
        }
        if (isset($seen[$x['group']])) {
            return false;
        }
        return $seen[$x['group']] = true;
    }));
    $out[] = ['title' => firstvape_t($p['stock'] === 'discontinued' ? 'relInstead' : 'relAlt'), 'items' => $alt];
    $shown = [];
    $res = [];
    foreach ($out as $g) {
        $g['items'] = array_slice(array_values(array_filter($g['items'], fn($x) => !isset($shown[$x['id']]))), 0, 4);
        foreach ($g['items'] as $x) {
            $shown[$x['id']] = 1;
        }
        if ($g['items']) {
            $res[] = $g;
        }
    }
    return $res;
}
