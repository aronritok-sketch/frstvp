<?php
/**
 * Nyitóoldal: szekciónként egy saját blokk (a „Úvod” oldal tartalma, sorrendjük a szerkesztőben átrendezhető).
 * A szövegek az előnézet szótárából jönnek (SK / FR), a listák a katalógusból.
 */

defined('ABSPATH') || exit;

function firstvape_render_home_hero(): string
{
    $active = array_filter(firstvape_products(), 'firstvape_is_active');
    $brands = firstvape_visible_brands();
    $counts = [];
    foreach (firstvape_puff_buckets() as $b) {
        $counts[$b['id']] = count(array_filter($active, fn($p) => (bool) array_filter($p['attrs']['puff'] ?? [], fn($x) => firstvape_puff_bucket((int) $x) === $b['id'])));
    }
    $shop = (string) wc_get_page_permalink('shop');
    $ticks = '';
    $steps = [];
    foreach (firstvape_puff_buckets() as $b) {
        $ticks .= '<span>' . esc_html((string) $b['tick']) . '</span>';
        $steps[] = ['id' => $b['id'], 'label' => firstvape_puff_bucket_label($b['id']), 'n' => $counts[$b['id']], 'url' => add_query_arg('puff', rawurlencode($b['id']), $shop)];
    }
    $start = 2;
    return '<section class="hero"><div class="hero-smoke" aria-hidden="true"></div><div class="wrap hero-in">' .
        '<div class="hero-copy"><p class="eyebrow">' . firstvape_t('heroEyebrow') . '</p>' .
        '<h1>' . firstvape_t('heroH1') . '</h1>' .
        '<p class="lead">' . firstvape_t('heroLead') . '</p>' .
        '<div class="hero-cta"><a class="btn btn-primary btn-lg" href="' . esc_url($shop) . '">' . firstvape_t('heroCta1') . '</a><a class="btn btn-ghost btn-lg" href="' . esc_url(firstvape_page_url('brands')) . '">' . firstvape_t('heroCta2') . '</a></div>' .
        '<ul class="hero-facts"><li><b class="num">' . count($active) . '</b> ' . esc_html(firstvape_pl('wProducts', count($active))) . '</li><li><b class="num">' . count($brands) . '</b> ' . esc_html(firstvape_pl('wBrands', count($brands))) . '</li>' . (firstvape_lang() === 'sk' ? '<li><b class="num">1–2</b> dni doručenie</li>' : '<li><b class="num">100 %</b> authentiques</li>') . '</ul></div>' .
        '<div class="pufffinder" data-pufffinder data-steps="' . esc_attr((string) wp_json_encode($steps)) . '"><p class="pf-label">' . firstvape_t('pfLabel') . '</p>' .
        '<p class="pf-q">' . firstvape_t('pfQ') . '</p>' .
        '<output class="pf-val num" id="pf-out" for="pf-range">' . esc_html($steps[$start]['label'] ?? '') . '</output><span class="pf-unit">' . firstvape_t('puffUnit') . '</span>' .
        '<label class="sr" for="pf-range">' . firstvape_t('a_puffF') . '</label>' .
        '<input id="pf-range" class="pf-range" type="range" min="0" max="' . (count($steps) - 1) . '" step="1" value="' . $start . '" data-pf-range>' .
        '<div class="pf-ticks" aria-hidden="true">' . $ticks . '</div>' .
        '<p class="pf-note">' . firstvape_t('puffNote') . '</p>' .
        '<a class="btn btn-primary pf-go" href="' . esc_url($steps[$start]['url'] ?? $shop) . '" data-pf-go><span>' . firstvape_t('pfGo', ['n' => '<span data-pf-count>' . (int) ($steps[$start]['n'] ?? 0) . '</span>']) . '</span></a></div>' .
        '</div></section>';
}

function firstvape_render_home_categories(): string
{
    $tiles = '';
    foreach (firstvape_root_cats() as $k) {
        if (!firstvape_cat_has_products($k)) {
            continue;
        }
        $c = firstvape_cat($k);
        $act = array_values(array_filter(firstvape_products_in_cat($k), 'firstvape_is_active'));
        usort($act, fn($a, $b) => $b['pop'] <=> $a['pop']);
        $kids = count(firstvape_visible_children($k));
        $tiles .= '<a class="cattile" href="' . esc_url(firstvape_cat_url($k)) . '" style="--tint:' . esc_attr((string) $c['color']) . '">' .
            '<span class="ct-art">' . ($act ? firstvape_art($act[0], 'woocommerce_thumbnail') : '') . '</span>' .
            '<span class="ct-txt"><b>' . esc_html((string) $c['name']) . '</b><small>' . esc_html(firstvape_nw('wProducts', count($act)) . ($kids ? ' · ' . firstvape_nw('wSubcats', $kids) : '')) . '</small></span>' . firstvape_icon('chev', 'ct-go') . '</a>';
    }
    return '<section class="wrap sec">' . firstvape_section_head((string) firstvape_t('rangeTitle'), null, null, (string) firstvape_t('rangeEyebrow')) . '<div class="catgrid">' . $tiles . '</div></section>';
}

function firstvape_render_home_why(): string
{
    $items = '';
    foreach ((array) firstvape_t('whyItems') as $w) {
        $items .= '<div class="why-item"><span class="why-ico">' . firstvape_icon((string) $w[0]) . '</span><b>' . esc_html((string) $w[1]) . '</b><p>' . esc_html((string) $w[2]) . '</p></div>';
    }
    return '<section class="sec why"><div class="wrap"><div class="why-head"><p class="eyebrow">' . firstvape_t('whyEyebrow') . '</p><h2>' . firstvape_t('whyTitle') . '</h2></div><div class="why-grid">' . $items . '</div></div></section>';
}

/** Kompatibilitás-blokk: az ELFA készlet + a rendszer podjai (íz szerint egy-egy), rendszer-címkék. */
function firstvape_render_home_system(array $attrs = []): string
{
    $kit = firstvape_product_by_slug((string) ($attrs['kit'] ?? '') ?: (string) get_option('firstvape_featured', 'elfbar-elfa-turbo-black'));
    $sys = (string) ($attrs['system'] ?? 'ELFA');
    $all = array_values(array_filter(firstvape_products(), fn($p) => firstvape_in_cat($p, 'eloretoltott-podok') && in_array($sys, $p['attrs']['kompat'] ?? [], true) && firstvape_is_active($p)));
    $seen = [];
    $pods = array_values(array_filter($all, function ($p) use (&$seen) {
        $k = $p['attrs']['iz'][0] ?? '';
        if (isset($seen[$k])) {
            return false;
        }
        return $seen[$k] = true;
    }));
    $n = count($pods);
    if (!$kit && !$pods) {
        return '';
    }
    $tags = '';
    $systems = array_filter(array_map('trim', explode(',', (string) ($attrs['tags'] ?? 'ELFA, JOIN ONE, DOJO BLAST, DRIFTER BAR'))));
    foreach ($systems as $s) {
        $tags .= '<a class="tag" href="' . esc_url(firstvape_cat_url('eloretoltott-podok', ['kompat' => $s])) . '">' . esc_html(firstvape_compat_label($s)) . '</a>';
    }
    $minis = '';
    foreach (array_slice($pods, 0, 8) as $p) {
        $minis .= '<a class="mini" href="' . esc_url($p['url']) . '" style="--tint:' . esc_attr(firstvape_tint($p)) . '"><span>' . firstvape_art($p, 'woocommerce_thumbnail') . '</span><b>' . esc_html((string) ($p['attrs']['iz'][0] ?? $p['name'])) . '</b><small class="num">' . esc_html(firstvape_money(firstvape_price($p))) . '</small></a>';
    }
    return '<section class="sec system"><div class="wrap sys-in"><div class="sys-copy"><p class="eyebrow">' . firstvape_t('a_kompat') . '</p>' .
        '<h2>' . firstvape_t('sysTitle', ['n' => $n, 'w' => firstvape_pl('wFlavors', $n)]) . '</h2>' .
        '<p>' . firstvape_t('sysText') . '</p><div class="sys-tags">' . $tags . '</div></div>' .
        '<div class="sys-combo"><div class="sys-kit">' . ($kit ? firstvape_card($kit) : '') . '</div><span class="sys-plus" aria-hidden="true">' . firstvape_icon('plus') . '</span><div class="sys-pods">' . $minis . '</div></div></div></section>';
}

/** Legnépszerűbbek kategóriánként (fülek; mind a négy lista a HTML-ben, a JS csak vált). Csoportonként egy termék. */
function firstvape_popular(string $cat): array
{
    $list = array_values(array_filter(firstvape_products_in_cat($cat), 'firstvape_is_active'));
    usort($list, fn($a, $b) => $b['pop'] <=> $a['pop']);
    $seen = [];
    $list = array_values(array_filter($list, function ($p) use (&$seen) {
        if ($p['group'] === '') {
            return true;
        }
        if (isset($seen[$p['group']])) {
            return false;
        }
        return $seen[$p['group']] = true;
    }));
    return array_slice($list, 0, 4);
}

function firstvape_render_home_popular(): string
{
    $tabs = array_values(array_filter(['eloretoltott-podok', 'keszulekek', 'e-liquidek', 'kiegeszitok'], 'firstvape_cat_has_products'));
    $btns = '';
    $panes = '';
    foreach ($tabs as $i => $c) {
        $btns .= '<button class="tab' . ($i ? '' : ' on') . '" type="button" role="tab" aria-selected="' . ($i ? 'false' : 'true') . '" data-act="home-tab" data-tab="' . esc_attr($c) . '">' . esc_html((string) firstvape_cat($c)['short']) . '</button>';
        $panes .= '<div data-home-pane="' . esc_attr($c) . '"' . ($i ? ' hidden' : '') . '>' . firstvape_grid(firstvape_popular($c)) . '</div>';
    }
    return '<section class="wrap sec">' . firstvape_section_head((string) firstvape_t('bestsellers'), null, null, (string) firstvape_t('custFav')) .
        '<div class="tabs" role="tablist" aria-label="' . esc_attr((string) firstvape_t('popCats')) . '">' . $btns . '</div><div data-home-tab>' . $panes . '</div></section>';
}

function firstvape_render_home_sale(): string
{
    $sale = array_values(array_filter(firstvape_products(), fn($p) => $p['sale'] && $p['stock'] === 'instock'));
    if (!$sale) {
        return '';
    }
    usort($sale, fn($a, $b) => firstvape_discount($b) <=> firstvape_discount($a));
    return '<section class="wrap sec sec-sale">' . firstvape_section_head((string) firstvape_t('weeklyDeals'), firstvape_page_url('sale'), (string) firstvape_t('allDeals')) . firstvape_grid(array_slice($sale, 0, 4)) . '</section>';
}

function firstvape_render_home_best(): string
{
    $items = '';
    foreach ((array) firstvape_t('bestItems') as $x) {
        $items .= '<li>' . firstvape_icon('check') . '<span>' . esc_html((string) $x) . '</span></li>';
    }
    return '<section class="sec best"><div class="wrap best-in"><div class="best-copy"><p class="eyebrow">First Vape</p><h2>' . firstvape_t('bestTitle') . '</h2>' .
        '<p>' . firstvape_t('bestText') . '</p><a class="btn btn-ghost" href="' . esc_url(firstvape_page_url('shipping')) . '">' . esc_html(firstvape_page_title('shipping')) . '</a></div><ul class="best-list">' . $items . '</ul></div></section>';
}

function firstvape_render_home_blog(): string
{
    $posts = firstvape_posts(3);
    if (!$posts) {
        return '';
    }
    return '<section class="wrap sec">' . firstvape_section_head((string) firstvape_t('blogTitle'), firstvape_page_url('blog'), (string) firstvape_t('moreArticles'), (string) firstvape_t('blog')) . firstvape_blog_cards($posts) . '</section>';
}

function firstvape_render_home_brands(): string
{
    $tiles = '';
    foreach (firstvape_visible_brands() as $b) {
        $n = count(array_filter(firstvape_products_of_brand($b['slug']), 'firstvape_is_active'));
        $tiles .= '<a class="brand-tile" href="' . esc_url((string) get_term_link($b['term'])) . '">' . firstvape_wordmark($b) . '<small>' . esc_html(firstvape_nw('wProducts', $n)) . '</small></a>';
    }
    return '<section class="wrap sec">' . firstvape_section_head((string) firstvape_t('partnersTitle'), firstvape_page_url('brands'), (string) firstvape_t('allBrands'), (string) firstvape_t('brands')) . '<div class="brandstrip">' . $tiles . '</div></section>';
}
