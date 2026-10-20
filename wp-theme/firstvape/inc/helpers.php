<?php
/**
 * Közös segédfüggvények: a téma adatai (setup/data/*.json, az előnézetből generálva), felületi szövegek SK / FR,
 * piac (ÁFA, szállítás), pénz- és számformátum, ikonok, útvonalak, morzsamenü.
 *
 * A felületi szövegek a jóváhagyott előnézet szótára (prototype/assets/js/i18n.js → setup/data/i18n.json):
 * firstvape_t('kulcs', ['x' => …]). A szótár a téma része (megbízható HTML-t is tartalmaz, pl. <b>).
 */

defined('ABSPATH') || exit;

/** A téma JSON-adata (setup/data/<név>.json). */
function firstvape_data(string $name): array
{
    static $cache = [];
    if (!isset($cache[$name])) {
        $file = FIRSTVAPE_DIR . '/setup/data/' . $name . '.json';
        $cache[$name] = is_readable($file) ? (array) json_decode((string) file_get_contents($file), true) : [];
    }
    return $cache[$name];
}

function firstvape_catalog(string $key, $default = [])
{
    return firstvape_data('catalog')[$key] ?? $default;
}

/** Felületi szöveg az aktuális nyelven ({x} helyettesítéssel); tömb értéknél a tömb. A #/… előnézet-linkek valódi URL-ek. */
function firstvape_t(string $key, array $vars = [])
{
    $d = firstvape_data('i18n');
    $lang = firstvape_lang();
    $v = $d[$lang][$key] ?? $d['sk'][$key] ?? $key;
    if (is_string($v)) {
        if ($vars) {
            $v = (string) preg_replace_callback('/\{(\w+)\}/', fn($m) => array_key_exists($m[1], $vars) ? (string) $vars[$m[1]] : $m[0], $v);
        }
        if (str_contains($v, '#/')) {
            $v = firstvape_links($v);
        }
    }
    return $v;
}

/** Többes szám: szlovákul 1 / 2–4 / 5+, franciául 1 / több. */
function firstvape_pl(string $key, int $n): string
{
    $f = (array) firstvape_t($key);
    if (firstvape_lang() === 'sk') {
        return (string) ($f[$n === 1 ? 0 : ($n >= 2 && $n <= 4 ? 1 : 2)] ?? '');
    }
    return (string) ($f[$n <= 1 ? 0 : 1] ?? '');
}

function firstvape_nw(string $key, int $n): string
{
    return $n . ' ' . firstvape_pl($key, $n);
}

/** { sk: …, fr: … } → az aktuális nyelv (különben az érték maga). */
function firstvape_L($v)
{
    if (is_array($v) && (isset($v['sk']) || isset($v['fr']))) {
        return $v[firstvape_lang()] ?? $v['sk'] ?? '';
    }
    return $v;
}

/** A piac adatai (catalog.json → markets): ÁFA, ország, szállítás, telefon- és irányítószám-minta. */
function firstvape_market(?string $lang = null): array
{
    $m = (array) firstvape_catalog('markets');
    return (array) ($m[$lang ?? firstvape_lang()] ?? $m['sk'] ?? []);
}

function firstvape_ship(): array
{
    $s = (array) (firstvape_market()['shipping'] ?? []);
    $free = get_option('firstvape_free_over_' . firstvape_lang(), '');
    if ($free !== '' && is_numeric($free)) {
        $s['freeOver'] = (float) $free;
    }
    return $s;
}

/** Ár: „12,90 €” (mindkét piacon EUR). */
function firstvape_money($n): string
{
    return number_format((float) $n, 2, ',', ' ') . ' €';
}

/** Ezres tagolás szóközzel: 40000 → „40 000”. */
function firstvape_num($n): string
{
    return (string) preg_replace('/\B(?=(\d{3})+(?!\d))/', ' ', (string) $n);
}

function firstvape_img(string $file): string
{
    return FIRSTVAPE_URL . '/assets/img/' . ltrim($file, '/');
}

/** Ikonok (az előnézet layout.js-éből, 24×24, vonalas). */
function firstvape_icon(string $name, string $class = ''): string
{
    static $p = [
        'search' => '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
        'user' => '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
        'heart' => '<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9Z"/>',
        'bag' => '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
        'menu' => '<path d="M4 7h16M4 12h16M4 17h16"/>',
        'close' => '<path d="M6 6l12 12M18 6 6 18"/>',
        'chev' => '<path d="m9 6 6 6-6 6"/>',
        'down' => '<path d="m6 9 6 6 6-6"/>',
        'truck' => '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
        'shield' => '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
        'card' => '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
        'receipt' => '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/>',
        'filter' => '<path d="M4 6h16M7 12h10M10 18h4"/>',
        'check' => '<path d="m5 12 5 5 9-10"/>',
        'plus' => '<path d="M12 5v14M5 12h14"/>',
        'minus' => '<path d="M5 12h14"/>',
        'trash' => '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
        'swap' => '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
        'box' => '<path d="M3 7l9-4 9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/>',
        'bell' => '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2Z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
        'info' => '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
        'pin' => '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
        'mail' => '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
        'phone' => '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
        'cloud' => '<path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18Z"/>',
        'coin' => '<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.5c-.5-1-1.4-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.9 2.5 2-1 2-2.5 2c-1.2 0-2.1-.5-2.6-1.5M12 6.5v1.5M12 16v1.5"/>',
        'drop' => '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
        'star' => '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
        'bolt' => '<path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z"/>',
    ];
    return '<svg class="ico ' . esc_attr($class) . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . ($p[$name] ?? '') . '</svg>';
}

/* ------------------------------------------------------------------------------------------------ útvonalak */

/** A téma oldalai kulcs szerint (a telepítő írja: fv_page meta + fv_lang): shipping, terms, … , sale, brands, wishlist, blog. */
function firstvape_page_id(string $key, ?string $lang = null): int
{
    $lang ??= firstvape_lang();
    $map = (array) get_option('firstvape_pages', []);
    $id = (int) ($map[$lang][$key] ?? $map['*'][$key] ?? 0);
    return $id && get_post_status($id) === 'publish' ? $id : 0;
}

function firstvape_page_url(string $key): string
{
    $id = firstvape_page_id($key);
    return $id ? (string) get_permalink($id) : home_url('/');
}

/**
 * Az előnézet hash-útvonala (#/kategoria/x, #/termek/y …) → WordPress URL. A nézetek az előnézet szerkezetét követik,
 * így a linkek is ugyanazok maradnak.
 */
function firstvape_route(string $route): string
{
    $route = ltrim($route, '#/');
    $query = '';
    if (($i = strpos($route, '?')) !== false) {
        $query = substr($route, $i + 1);
        $route = substr($route, 0, $i);
    }
    $parts = array_map('rawurldecode', array_values(array_filter(explode('/', $route), 'strlen')));
    $url = home_url('/');
    switch ($parts[0] ?? '') {
        case 'kategoria':
            $t = firstvape_cat_term($parts[1] ?? '');
            $url = $t ? (string) get_term_link($t) : home_url('/');
            break;
        case 'marka':
            $t = get_term_by('slug', (string) ($parts[1] ?? ''), 'product_brand');
            $url = $t ? (string) get_term_link($t) : firstvape_page_url('brands');
            break;
        case 'markak':
            $url = firstvape_page_url('brands');
            break;
        case 'termek':
            $p = get_page_by_path((string) ($parts[1] ?? ''), OBJECT, 'product');
            $url = $p ? (string) get_permalink($p) : home_url('/');
            break;
        case 'produkty':
            $url = function_exists('wc_get_page_permalink') ? wc_get_page_permalink('shop') : home_url('/');
            break;
        case 'akciok':
            $url = firstvape_page_url('sale');
            break;
        case 'kereses':
            $url = add_query_arg(['s' => implode('/', array_slice($parts, 1)), 'post_type' => 'product'], home_url('/'));
            break;
        case 'kosar':
            $url = function_exists('wc_get_cart_url') ? wc_get_cart_url() : home_url('/');
            break;
        case 'penztar':
            $url = function_exists('wc_get_checkout_url') ? wc_get_checkout_url() : home_url('/');
            break;
        case 'fiok':
            $acc = function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : home_url('/');
            $sub = $parts[1] ?? '';
            if ($sub === 'kedvencek') {
                $url = firstvape_page_url('wishlist');
            } elseif ($sub === 'rendelesek') {
                $url = function_exists('wc_get_endpoint_url') ? wc_get_endpoint_url('orders', '', $acc) : $acc;
            } elseif ($sub === 'cimek') {
                $url = function_exists('wc_get_endpoint_url') ? wc_get_endpoint_url('edit-address', '', $acc) : $acc;
            } else {
                $url = $acc;
            }
            break;
        case 'oldal':
            $url = firstvape_page_url((string) ($parts[1] ?? ''));
            break;
        case 'blog':
            if (!empty($parts[1])) {
                $p = get_posts(['post_type' => 'post', 'name' => $parts[1], 'numberposts' => 1]);
                $url = $p ? (string) get_permalink($p[0]) : firstvape_page_url('blog');
            } else {
                $url = firstvape_page_url('blog');
            }
            break;
    }
    if ($query !== '') {
        parse_str($query, $q);
        $url = add_query_arg(array_map(fn($v) => is_string($v) ? rawurlencode($v) : $v, $q), $url);
    }
    return $url;
}

/** HTML-ben a href="#/…" előnézet-linkek cseréje valódi URL-re. */
function firstvape_links(string $html): string
{
    return (string) preg_replace_callback('/href="#(\/[^"]*)"/', fn($m) => 'href="' . esc_url(firstvape_route($m[1])) . '"', $html);
}

/** Morzsamenü: [['label' => …, 'href' => '#/…' | URL | null], …]; a BreadcrumbList a seo.php-ban. */
function firstvape_crumbs(array $list): string
{
    $GLOBALS['firstvape_breadcrumbs'] = $list;
    $out = '<nav class="crumbs" aria-label="' . esc_attr((string) firstvape_t('crumbsAria')) . '"><ol><li><a href="' . esc_url(home_url('/')) . '">' . esc_html((string) firstvape_t('home')) . '</a></li>';
    $n = count($list);
    foreach (array_values($list) as $i => $c) {
        $href = (string) ($c['href'] ?? '');
        if ($href !== '' && str_starts_with($href, '#/')) {
            $href = firstvape_route($href);
        }
        $out .= '<li>' . ($href !== '' && $i < $n - 1 ? '<a href="' . esc_url($href) . '">' . esc_html((string) $c['label']) . '</a>' : '<span aria-current="page">' . esc_html((string) $c['label']) . '</span>') . '</li>';
    }
    return $out . '</ol></nav>';
}

function firstvape_section_head(string $title, ?string $link = null, ?string $link_label = null, ?string $eyebrow = null): string
{
    return '<div class="sec-head"><div>' . ($eyebrow ? '<p class="eyebrow">' . esc_html($eyebrow) . '</p>' : '') . '<h2>' . esc_html($title) . '</h2></div>' .
        ($link ? '<a class="more" href="' . esc_url(str_starts_with($link, '#/') ? firstvape_route($link) : $link) . '">' . esc_html((string) $link_label) . firstvape_icon('chev') . '</a>' : '') . '</div>';
}

/* ------------------------------------------------------------------------------------------------ attribútumok */

function firstvape_color_name(string $v): string
{
    $c = (array) (firstvape_data('i18n')['colors'][firstvape_lang()] ?? []);
    return (string) ($c[$v] ?? $v);
}

/** Nikotin: „20 mg” → „20 mg/ml (2 %)” (a % = mg/ml ÷ 10), 0 → „0 mg/ml (bez nikotínu)”. */
function firstvape_nic_label(string $v): string
{
    if (!preg_match('/^\s*([\d.,]+)/', $v, $m)) {
        return $v;
    }
    $n = (float) str_replace(',', '.', $m[1]);
    if ($n == 0) {
        return '0 mg/ml (' . firstvape_t('nicFree') . ')';
    }
    $fmt = fn($x) => str_replace('.', ',', rtrim(rtrim(number_format($x, 2, '.', ''), '0'), '.'));
    return $fmt($n) . ' mg/ml (' . $fmt($n / 10) . ' %)';
}

function firstvape_compat_label(string $v): string
{
    return (string) firstvape_t('compatWith', ['x' => $v]);
}

/** Slukkszám-sávok (gyártói becslés; a szűrő tartományra keres). */
function firstvape_puff_buckets(): array
{
    return (array) firstvape_catalog('puffBuckets');
}

function firstvape_puff_bucket(int $n): ?string
{
    foreach (firstvape_puff_buckets() as $b) {
        if ($n >= $b['min'] && ($b['max'] === null || $n <= $b['max'])) {
            return (string) $b['id'];
        }
    }
    return null;
}

function firstvape_puff_bucket_label(string $id): string
{
    foreach (firstvape_puff_buckets() as $b) {
        if ($b['id'] !== $id) {
            continue;
        }
        if ((int) $b['min'] === 0) {
            return (string) firstvape_t('puffUpTo', ['n' => firstvape_num((int) $b['max'] + 1)]);
        }
        if ($b['max'] === null) {
            return (string) firstvape_t('puffFrom', ['n' => firstvape_num((int) $b['min'])]);
        }
        return firstvape_num((int) $b['min']) . ' – ' . firstvape_num((int) $b['max']);
    }
    return $id;
}

function firstvape_puff_label(int $n): string
{
    return firstvape_num($n) . ' ' . firstvape_t('puffUnit');
}

function firstvape_puff_approx(int $n): string
{
    return '≈ ' . firstvape_puff_label($n);
}

function firstvape_ohm_num(string $v): float
{
    return (float) str_replace(',', '.', $v);
}

/** Dátum a piac formájában (sk: 12. 9. 2026, fr: 12/09/2026). */
function firstvape_date(string $iso): string
{
    $t = strtotime($iso . ' 12:00:00');
    if (!$t) {
        return $iso;
    }
    return firstvape_lang() === 'fr' ? date('d/m/Y', $t) : date('j. n. Y', $t);
}

/** Egyszerű zárolás (pl. készletfigyelő levelek). */
function firstvape_lock(string $name, int $ttl = 300): bool
{
    $key = 'firstvape_lock_' . $name;
    if (get_transient($key)) {
        return false;
    }
    set_transient($key, 1, $ttl);
    return true;
}
