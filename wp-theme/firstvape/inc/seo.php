<?php
/**
 * SEO: meta leírás, hreflang a két domain között (sk ↔ fr, x-default: sk), canonical, a szűrt / lapozott listák
 * noindex,follow, JSON-LD: Product (SKU, GTIN, márka, ár EUR-ban, készlet), OnlineStore, BreadcrumbList.
 * Ha Yoast SEO van bekapcsolva, a meta leírást és a canonicalt az adja; a hreflang és a JSON-LD Product a témáé.
 */

defined('ABSPATH') || exit;

function firstvape_meta_description(): string
{
    if (is_front_page()) {
        return wp_strip_all_tags((string) firstvape_t('heroLead'));
    }
    if (is_singular('product')) {
        $p = firstvape_product(get_queried_object_id());
        return $p ? $p['name'] . ' – ' . $p['short_text'] : '';
    }
    if (is_tax('product_cat')) {
        $c = firstvape_cat((string) get_term_meta(get_queried_object_id(), 'fv_key', true));
        return $c ? wp_strip_all_tags((string) $c['desc']) : '';
    }
    if (is_tax('product_brand')) {
        $b = firstvape_brand(get_queried_object()->slug);
        return $b ? (string) $b['desc'] : '';
    }
    if (is_singular()) {
        return wp_trim_words(wp_strip_all_tags(strip_shortcodes((string) get_post_field('post_content', get_queried_object_id()))), 28, '…');
    }
    return '';
}

function firstvape_yoast(): bool
{
    return defined('WPSEO_VERSION');
}

/** Szűrt, rendezett vagy lapozott terméklista: ne kerüljön az indexbe (a linkjeit kövesse). */
function firstvape_is_filtered(): bool
{
    foreach (array_merge(array_keys(firstvape_facet_defs()), ['min', 'max', 'rend', 'oldal', 'akcio']) as $k) {
        if (isset($_GET[$k]) && $_GET[$k] !== '') {
            return true;
        }
    }
    return false;
}

add_filter('wp_robots', function (array $robots): array {
    if (firstvape_is_filtered() || is_search() || (function_exists('is_cart') && (is_cart() || is_checkout() || is_account_page()))) {
        $robots['noindex'] = true;
        $robots['follow'] = true;
        unset($robots['max-image-preview']);
    }
    $id = is_singular() ? get_queried_object_id() : 0;
    if ($id && $id === firstvape_page_id('wishlist')) {
        $robots['noindex'] = true;
    }
    return $robots;
});

add_action('wp_head', function () {
    if (!firstvape_yoast() && ($d = firstvape_meta_description()) !== '') {
        echo '<meta name="description" content="' . esc_attr(mb_substr($d, 0, 300)) . '">' . "\n";
    }
    // hreflang: ugyanaz az oldal a másik piacon (a WPML a sajátját írja)
    if (!firstvape_wpml() && !is_404() && !is_search() && !firstvape_is_filtered()) {
        foreach (FIRSTVAPE_LANGS as $l) {
            echo '<link rel="alternate" hreflang="' . $l . '" href="' . esc_url(remove_query_arg(['lang', 'add-to-cart'], firstvape_lang_url($l))) . '">' . "\n";
        }
        echo '<link rel="alternate" hreflang="x-default" href="' . esc_url(remove_query_arg(['lang', 'add-to-cart'], firstvape_lang_url('sk'))) . '">' . "\n";
    }
    echo firstvape_jsonld();
}, 5);

/** A WordPress saját canonicalja a szűrt listán a szűrés nélküli címre mutasson. */
add_filter('get_canonical_url', function ($url) {
    return firstvape_is_filtered() ? strtok((string) $url, '?') : $url;
});
add_action('wp_head', function () {
    if (firstvape_yoast() || is_singular()) {
        return; // a bejegyzéseknél a WordPress rel_canonical-ja írja
    }
    if (is_tax() || (function_exists('is_shop') && is_shop())) {
        echo '<link rel="canonical" href="' . esc_url(strtok(firstvape_current_url(), '?')) . '">' . "\n";
    }
}, 6);

function firstvape_jsonld(): string
{
    $out = [];
    if (is_front_page()) {
        $out[] = [
            '@context' => 'https://schema.org', '@type' => 'OnlineStore', 'name' => 'First Vape', 'url' => home_url('/'),
            'logo' => firstvape_img('first-vape-logo.png'), 'legalName' => (string) get_option('firstvape_company_name', 'John&Jen s.r.o.'),
            'email' => (string) get_option('firstvape_email', 'info@firstvape.sk'), 'currenciesAccepted' => 'EUR',
            'areaServed' => firstvape_market_country(),
        ];
    }
    if (is_singular('product') && ($p = firstvape_product(get_queried_object_id()))) {
        $b = firstvape_brand($p['brand']);
        $ld = [
            '@context' => 'https://schema.org', '@type' => 'Product', 'name' => $p['name'], 'sku' => $p['sku'],
            'description' => $p['short_text'], 'url' => $p['url'],
            'offers' => ['@type' => 'Offer', 'priceCurrency' => 'EUR', 'price' => number_format(firstvape_price($p), 2, '.', ''), 'url' => $p['url'],
                'availability' => 'https://schema.org/' . ($p['stock'] === 'instock' ? 'InStock' : ($p['stock'] === 'outofstock' ? 'OutOfStock' : 'Discontinued')),
                'seller' => ['@type' => 'Organization', 'name' => 'First Vape']],
        ];
        if ($p['ean'] !== '') {
            $ld['gtin13'] = $p['ean'];
        }
        if ($b) {
            $ld['brand'] = ['@type' => 'Brand', 'name' => $b['name']];
        }
        if ($p['img'] && ($src = wp_get_attachment_image_url($p['img'], 'full'))) {
            $ld['image'] = $src;
        }
        $out[] = $ld;
    }
    $crumbs = (array) ($GLOBALS['firstvape_breadcrumbs'] ?? []);
    if ($crumbs) {
        $items = [['@type' => 'ListItem', 'position' => 1, 'name' => (string) firstvape_t('home'), 'item' => home_url('/')]];
        foreach (array_values($crumbs) as $i => $c) {
            $href = (string) ($c['href'] ?? '');
            $items[] = array_filter(['@type' => 'ListItem', 'position' => $i + 2, 'name' => (string) $c['label'], 'item' => $href !== '' ? (str_starts_with($href, '#/') ? firstvape_route($href) : $href) : null]);
        }
        $out[] = ['@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => $items];
    }
    $html = '';
    foreach ($out as $ld) {
        $html .= '<script type="application/ld+json">' . wp_json_encode($ld, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) . '</script>' . "\n";
    }
    return $html;
}
// Megjegyzés: az iu_theme index.php-ja a tartalmat a <head> előtt rendereli (ob_start), így a morzsamenü
// (firstvape_crumbs) már megvan, amikor a wp_head a BreadcrumbList-et írja.
