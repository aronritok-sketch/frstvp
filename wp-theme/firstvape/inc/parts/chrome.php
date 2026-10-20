<?php
/**
 * Keret: felső sáv, fejléc mega menüvel, mobilmenü, kosár-fiók (oldalt nyíló), lábléc, 18+ kapu, élő kereső.
 * A HTML az előnézet layout.js-ének szerkezete (a CSS ugyanaz: assets/css/site.css).
 */

defined('ABSPATH') || exit;

function firstvape_logo(): string
{
    return '<a class="logo" href="' . esc_url(home_url('/')) . '" aria-label="' . esc_attr((string) firstvape_t('logoAria')) . '">' .
        '<img class="logo-img" src="' . esc_url(firstvape_img('first-vape-logo.png')) . '" alt="First Vape" width="791" height="99"></a>';
}

/** A menü pontjai (catalog.json → menu); az Akciók csak akkor, ha van akciós termék (az ügyfél ritkán akciózik). */
function firstvape_menu_items(): array
{
    $has_sale = (bool) array_filter(firstvape_products(), fn($p) => $p['sale'] && firstvape_is_active($p));
    return array_values(array_filter((array) firstvape_catalog('menu'), function ($m) use ($has_sale) {
        if (!empty($m['sale'])) {
            return $has_sale;
        }
        return empty($m['cat']) || firstvape_cat_has_products((string) $m['cat']);
    }));
}

function firstvape_menu_label(array $m): string
{
    return !empty($m['cat']) ? (string) (firstvape_cat((string) $m['cat'])['name'] ?? '') : (string) firstvape_t((string) $m['lk']);
}

function firstvape_menu_href(array $m): string
{
    if (!empty($m['cat'])) {
        return firstvape_cat_url((string) $m['cat']);
    }
    if (!empty($m['brands'])) {
        return firstvape_page_url('brands');
    }
    return firstvape_route((string) ($m['href'] ?? '#/'));
}

/** Slukkszám-sávok, amelyekben van termék (legalább kettő kell, különben nincs értelme). */
function firstvape_puff_buckets_of(array $prods): array
{
    $has = [];
    foreach ($prods as $p) {
        foreach ($p['attrs']['puff'] ?? [] as $x) {
            $has[(string) firstvape_puff_bucket((int) $x)] = 1;
        }
    }
    return array_values(array_filter(firstvape_puff_buckets(), fn($b) => isset($has[$b['id']])));
}

function firstvape_promo(array $p, ?string $title = null, ?string $text = null): string
{
    return '<a class="promo-card" href="' . esc_url($p['url']) . '" style="--tint:' . esc_attr(firstvape_tint($p)) . '">' .
        '<span class="promo-art">' . firstvape_art($p, 'woocommerce_thumbnail') . '</span><span class="promo-txt"><b>' . esc_html($title ?? $p['name']) . '</b>' .
        '<small>' . esc_html($text ?? firstvape_money(firstvape_price($p))) . '</small></span></a>';
}

function firstvape_mega(array $item): string
{
    if (!empty($item['brands'])) {
        $brands = firstvape_visible_brands();
        usort($brands, fn($a, $b) => strcmp($a['name'], $b['name']));
        $feat = firstvape_product_by_slug((string) get_option('firstvape_featured', 'elfbar-elfa-turbo-black'));
        $tiles = '';
        foreach ($brands as $b) {
            $n = count(array_filter(firstvape_products_of_brand($b['slug']), 'firstvape_is_active'));
            $tiles .= '<a class="brand-tile" href="' . esc_url((string) get_term_link($b['term'])) . '">' . firstvape_wordmark($b, 'sm') . '<small>' . esc_html(firstvape_nw('wProducts', $n)) . '</small></a>';
        }
        return '<div class="mega mega-brands"><div class="wrap mega-in">' .
            '<div class="mega-col mega-wide"><p class="mega-h">' . firstvape_t('allBrandsAZ') . '</p><div class="brand-grid">' . $tiles . '</div></div>' .
            ($feat ? '<div class="mega-col mega-promo"><p class="mega-h">' . firstvape_t('featuredBrand') . '</p>' . firstvape_promo($feat, (string) firstvape_t('elfaPromoTitle'), (string) firstvape_t('elfaPromoText')) . '</div>' : '') .
            '</div></div>';
    }
    if (empty($item['cat'])) {
        return '';
    }
    $key = (string) $item['cat'];
    $prods = array_values(array_filter(firstvape_products_in_cat($key), 'firstvape_is_active'));
    $brands = [];
    foreach ($prods as $p) {
        if ($p['brand'] !== '') {
            $brands[$p['brand']] = ($brands[$p['brand']] ?? 0) + 1;
        }
    }
    $in = array_values(array_filter($prods, fn($p) => $p['stock'] === 'instock'));
    usort($in, fn($a, $b) => $b['pop'] <=> $a['pop']);
    $feat = $in[0] ?? null;
    $kids = firstvape_visible_children($key);
    $sub = '<div class="mega-col"><p class="mega-h">' . firstvape_t($kids ? 'subcats' : 'products') . '</p><ul class="mega-list">';
    foreach ($kids as $ch) {
        $c = firstvape_cat($ch);
        $sub .= '<li><a href="' . esc_url(firstvape_cat_url($ch)) . '">' . esc_html((string) $c['name']) . '<span class="cnt">' . count(firstvape_products_in_cat($ch)) . '</span></a></li>';
    }
    $sub .= '<li class="mega-all"><a href="' . esc_url(firstvape_cat_url($key)) . '">' . firstvape_t('seeAll') . ' <span class="cnt">' . count(firstvape_products_in_cat($key)) . '</span> ' . firstvape_icon('chev') . '</a></li></ul></div>';
    $pb = firstvape_puff_buckets_of($prods);
    $puff = '';
    if (!empty($item['puffLinks']) && count($pb) > 1) {
        $puff = '<div class="mega-col"><p class="mega-h">' . firstvape_t('byPuffs') . '</p><div class="puff-chips">';
        foreach ($pb as $b) {
            $puff .= '<a class="puff-chip" href="' . esc_url(firstvape_cat_url($key, ['puff' => $b['id']])) . '"><b>' . esc_html(firstvape_puff_bucket_label($b['id'])) . '</b></a>';
        }
        $puff .= '</div><p class="mega-note">' . firstvape_t('puffNote') . '</p></div>';
    }
    $br = '<div class="mega-col"><p class="mega-h">' . firstvape_t('brandsInCat') . '</p><ul class="mega-list">';
    foreach ($brands as $s => $n) {
        $b = firstvape_brand($s);
        if ($b) {
            $br .= '<li><a href="' . esc_url(firstvape_cat_url($key, ['marka' => $s])) . '">' . esc_html($b['name']) . '<span class="cnt">' . $n . '</span></a></li>';
        }
    }
    $br .= '</ul></div>';
    return '<div class="mega"><div class="wrap mega-in">' . $sub . $puff . $br .
        '<div class="mega-col mega-promo"><p class="mega-h">' . firstvape_t('popularNow') . '</p>' . ($feat ? firstvape_promo($feat) : '') . '</div></div></div>';
}

/** Nyelv- és piacváltó: a másik domain (élesben) / ?lang= (dev). */
function firstvape_lang_switch(string $cls): string
{
    $names = ['sk' => 'Slovensko – slovenčina', 'fr' => 'France – français'];
    $out = '<div class="lang-sw ' . esc_attr($cls) . '" role="group" aria-label="' . esc_attr((string) firstvape_t('langAria')) . '">';
    foreach (FIRSTVAPE_LANGS as $l) {
        $on = $l === firstvape_lang();
        $out .= '<a href="' . esc_url(firstvape_lang_url($l)) . '" hreflang="' . $l . '" lang="' . $l . '" title="' . esc_attr($names[$l]) . '"' . ($on ? ' class="on" aria-current="true"' : '') . ' data-lang="' . $l . '">' . strtoupper($l) . '</a>';
    }
    return $out . '</div>';
}

function firstvape_cart_count(): int
{
    return function_exists('WC') && WC()->cart ? (int) WC()->cart->get_cart_contents_count() : 0;
}

function firstvape_cart_total(): float
{
    return function_exists('WC') && WC()->cart ? (float) WC()->cart->get_subtotal() + (float) WC()->cart->get_subtotal_tax() : 0.0;
}

function firstvape_render_header(): string
{
    $nav = '';
    foreach (firstvape_menu_items() as $i => $m) {
        $mega = !empty($m['cat']) || !empty($m['brands']);
        $nav .= '<li class="nav-item' . ($mega ? ' has-mega' : '') . (!empty($m['sale']) ? ' is-sale' : '') . (firstvape_menu_is_on($m) ? ' on' : '') . '" data-nav="' . $i . '">' .
            '<a class="nav-link" href="' . esc_url(firstvape_menu_href($m)) . '"' . ($mega ? ' aria-haspopup="true" aria-expanded="false"' : '') . '>' . esc_html(firstvape_menu_label($m)) . ($mega ? firstvape_icon('down', 'nav-caret') : '') . '</a>' .
            ($mega ? firstvape_mega($m) : '') . '</li>';
    }
    $free = firstvape_money(firstvape_ship()['freeOver'] ?? 50);
    $msg = firstvape_lang() === 'sk'
        ? 'Packeta: výdajné miesto, Z-BOX alebo na adresu · Doprava zadarmo nad <b>' . $free . '</b>'
        : 'Expédition depuis la Slovaquie · Livraison offerte dès <b>' . $free . '</b>';
    $count = firstvape_cart_count();
    $acc = function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : home_url('/');

    return '<div class="topbar"><div class="wrap topbar-in">' .
        '<p class="tb-msg">' . firstvape_icon('truck') . '<span>' . $msg . '</span></p>' .
        '<p class="tb-age"><span class="age-pill">18+</span> ' . firstvape_t('age18') . '</p>' .
        '<nav class="tb-links" aria-label="' . esc_attr((string) firstvape_t('moreLinksAria')) . '"><a href="' . esc_url(firstvape_page_url('blog')) . '">' . firstvape_t('blog') . '</a><a href="' . esc_url(firstvape_page_url('shipping')) . '">' . esc_html(firstvape_page_title('shipping')) . '</a><a href="' . esc_url(firstvape_page_url('contact')) . '">' . firstvape_t('contact') . '</a></nav>' .
        firstvape_lang_switch('tb-lang') .
        '</div></div>' .
        '<div class="hdr"><div class="wrap hdr-in">' .
        '<button class="icon-btn hdr-burger" type="button" data-act="menu-open" aria-label="' . esc_attr((string) firstvape_t('menuOpen')) . '">' . firstvape_icon('menu') . '</button>' .
        firstvape_logo() .
        '<form class="hsearch" role="search" action="' . esc_url(home_url('/')) . '" method="get" data-search-form autocomplete="off">' .
        '<label class="sr" for="hsearch-q">' . firstvape_t('searchLabel') . '</label>' .
        firstvape_icon('search', 'hs-ico') .
        '<input id="hsearch-q" name="s" type="search" value="' . esc_attr(is_search() ? get_search_query() : '') . '" placeholder="' . esc_attr((string) firstvape_t('searchPh')) . '" data-live-search>' .
        '<input type="hidden" name="post_type" value="product">' .
        '<button class="hs-btn" type="submit">' . firstvape_t('searchBtn') . '</button>' .
        '<div class="hs-drop" hidden></div></form>' .
        '<nav class="hdr-acts" aria-label="' . esc_attr((string) firstvape_t('acctCartAria')) . '">' .
        '<a class="hact" href="' . esc_url($acc) . '">' . firstvape_icon('user') . '<span>' . firstvape_t('account') . '</span></a>' .
        '<a class="hact" href="' . esc_url(firstvape_page_url('wishlist')) . '">' . firstvape_icon('heart') . '<span>' . firstvape_t('wishlist') . '</span><em class="badge" data-wish-count hidden>0</em></a>' .
        '<a class="hact hact-cart" href="' . esc_url(wc_get_cart_url()) . '" data-act="cart-open" aria-label="' . esc_attr((string) firstvape_t('cart')) . '">' . firstvape_icon('bag') . '<span data-cart-total>' . esc_html(firstvape_money(firstvape_cart_total())) . '</span><em class="badge" data-cart-count' . ($count ? '' : ' hidden') . '>' . $count . '</em></a>' .
        '</nav></div>' .
        '<nav class="mainnav" aria-label="' . esc_attr((string) firstvape_t('mainNavAria')) . '"><div class="wrap"><ul class="nav-list">' . $nav . '</ul></div></nav>' .
        '</div>';
}

/** Az aktív főmenüpont (kategória, márka, akció). */
function firstvape_menu_is_on(array $m): bool
{
    if (!empty($m['cat']) && is_tax('product_cat')) {
        $t = get_queried_object();
        foreach (firstvape_cats() as $k => $c) {
            if ($c['term_id'] === (int) $t->term_id) {
                return ($c['parent'] ?? $k) === $m['cat'];
            }
        }
    }
    if (!empty($m['brands'])) {
        return is_tax('product_brand') || (is_page() && get_queried_object_id() === firstvape_page_id('brands'));
    }
    if (!empty($m['sale'])) {
        return is_page() && get_queried_object_id() === firstvape_page_id('sale');
    }
    return false;
}

function firstvape_page_title(string $k): string
{
    $titles = (array) firstvape_t('pageTitles');
    return (string) ($titles[$k] ?? $k);
}

/** A piac jogi és információs oldalai (catalog.json → pageKeys). */
function firstvape_page_keys(): array
{
    return (array) (firstvape_catalog('pageKeys')[firstvape_lang()] ?? []);
}

function firstvape_mobile_menu(): string
{
    $items = '';
    foreach (firstvape_menu_items() as $m) {
        if (!empty($m['cat'])) {
            $key = (string) $m['cat'];
            $c = firstvape_cat($key);
            $pb = !empty($m['puffLinks']) ? firstvape_puff_buckets_of(firstvape_products_in_cat($key)) : [];
            $items .= '<li><details><summary>' . esc_html(firstvape_menu_label($m)) . firstvape_icon('down') . '</summary><ul>' .
                '<li><a href="' . esc_url(firstvape_cat_url($key)) . '">' . firstvape_t('seeAll') . ': ' . esc_html((string) $c['short']) . '</a></li>';
            foreach (firstvape_visible_children($key) as $ch) {
                $items .= '<li><a href="' . esc_url(firstvape_cat_url($ch)) . '">' . esc_html((string) firstvape_cat($ch)['name']) . '</a></li>';
            }
            if (count($pb) > 1) {
                $items .= '<li class="mm-puffs">';
                foreach ($pb as $b) {
                    $items .= '<a class="puff-chip sm" href="' . esc_url(firstvape_cat_url($key, ['puff' => $b['id']])) . '"><b>' . esc_html(firstvape_puff_bucket_label($b['id'])) . '</b></a>';
                }
                $items .= '</li>';
            }
            $items .= '</ul></details></li>';
        } elseif (!empty($m['brands'])) {
            $items .= '<li><details><summary>' . firstvape_t('brands') . firstvape_icon('down') . '</summary><ul>';
            foreach (firstvape_visible_brands() as $b) {
                $items .= '<li><a href="' . esc_url((string) get_term_link($b['term'])) . '">' . esc_html($b['name']) . '</a></li>';
            }
            $items .= '<li><a href="' . esc_url(firstvape_page_url('brands')) . '">' . firstvape_t('allBrands') . '</a></li></ul></details></li>';
        } else {
            $items .= '<li><a class="mm-link' . (!empty($m['sale']) ? ' is-sale' : '') . '" href="' . esc_url(firstvape_menu_href($m)) . '">' . esc_html(firstvape_menu_label($m)) . '</a></li>';
        }
    }
    return '<div class="drawer drawer-left" data-drawer="menu" hidden><div class="drawer-scrim" data-act="drawer-close"></div>' .
        '<aside class="drawer-panel" aria-label="' . esc_attr((string) firstvape_t('mobileMenuAria')) . '"><div class="drawer-head">' . firstvape_logo() .
        '<button class="icon-btn" type="button" data-act="drawer-close" aria-label="' . esc_attr((string) firstvape_t('close')) . '">' . firstvape_icon('close') . '</button></div>' .
        '<ul class="mm">' . $items . '</ul>' .
        '<ul class="mm mm-sec"><li><a href="' . esc_url(firstvape_route('#/fiok')) . '">' . firstvape_icon('user') . ' ' . firstvape_t('myAccount') . '</a></li><li><a href="' . esc_url(firstvape_route('#/fiok/rendelesek')) . '">' . firstvape_icon('box') . ' ' . firstvape_t('myOrders') . '</a></li><li><a href="' . esc_url(firstvape_page_url('wishlist')) . '">' . firstvape_icon('heart') . ' ' . firstvape_t('wishlist') . '</a></li><li><a href="' . esc_url(firstvape_page_url('blog')) . '">' . firstvape_icon('star') . ' ' . firstvape_t('blog') . '</a></li><li><a href="' . esc_url(firstvape_page_url('contact')) . '">' . firstvape_icon('mail') . ' ' . firstvape_t('contact') . '</a></li></ul>' .
        '<div class="mm-lang"><span>' . firstvape_t('langAria') . '</span>' . firstvape_lang_switch('mm-lang-sw') . '</div>' .
        '</aside></div>';
}

/** A kosár-fiók tartalma (a WooCommerce kosarából; AJAX-szal frissül: fragments). */
function firstvape_minicart_html(): string
{
    $cart = function_exists('WC') ? WC()->cart : null;
    if (!$cart || $cart->is_empty()) {
        return '<div class="mc-body" data-minicart><div class="empty">' . firstvape_icon('bag', 'empty-ico') . '<p>' . firstvape_t('cartEmpty') . '</p><a class="btn" href="' . esc_url(firstvape_cat_url('eloretoltott-podok')) . '">' . firstvape_t('startShopping') . '</a></div></div>';
    }
    $sub = firstvape_cart_total();
    $free = (float) (firstvape_ship()['freeOver'] ?? 50);
    $left = $free - $sub;
    $lines = '';
    foreach ($cart->get_cart() as $key => $item) {
        $p = firstvape_product((int) $item['product_id']);
        if (!$p) {
            continue;
        }
        $total = (float) $item['line_subtotal'] + (float) $item['line_subtotal_tax'];
        $lines .= '<li class="mc-item"><a class="mc-art" href="' . esc_url($p['url']) . '" style="--tint:' . esc_attr(firstvape_tint($p)) . '">' . firstvape_art($p, 'woocommerce_thumbnail') . '</a>' .
            '<div class="mc-info"><a href="' . esc_url($p['url']) . '">' . esc_html($p['name']) . '</a>' .
            '<div class="mc-row">' . firstvape_qty_ctl((string) $key, (int) $item['quantity']) .
            '<button type="button" class="cl-remove sm" data-act="line-remove" data-key="' . esc_attr((string) $key) . '" aria-label="' . esc_attr((string) firstvape_t('removeAria', ['x' => $p['name']])) . '">' . firstvape_icon('trash') . '</button><b class="num">' . esc_html(firstvape_money($total)) . '</b></div></div></li>';
    }
    return '<div class="mc-body" data-minicart><div class="freebar"><p>' . ($left > 0 ? firstvape_t('freeLeft', ['x' => firstvape_money($left)]) : firstvape_t('freeReached')) . '</p>' .
        '<span class="freebar-track"><i style="width:' . esc_attr((string) min(100, $free > 0 ? $sub / $free * 100 : 100)) . '%"></i></span></div>' .
        '<ul class="mc-list">' . $lines . '</ul>' .
        '<div class="mc-foot"><p class="mc-sum"><span>' . firstvape_t('subtotal') . '</span><b class="num">' . esc_html(firstvape_money($sub)) . '</b></p>' .
        '<a class="btn btn-ghost" href="' . esc_url(wc_get_cart_url()) . '">' . firstvape_t('viewCart') . '</a>' .
        '<a class="btn btn-primary" href="' . esc_url(wc_get_checkout_url()) . '">' . firstvape_t('toCheckout') . '</a></div></div>';
}

function firstvape_qty_ctl(string $key, int $q): string
{
    return '<span class="qty qty-sm"><button type="button" data-act="line-qty" data-key="' . esc_attr($key) . '" data-d="-1" aria-label="' . esc_attr((string) firstvape_t('decrease')) . '">' . firstvape_icon('minus') . '</button>' .
        '<b class="num">' . $q . '</b><button type="button" data-act="line-qty" data-key="' . esc_attr($key) . '" data-d="1" aria-label="' . esc_attr((string) firstvape_t('increase')) . '">' . firstvape_icon('plus') . '</button></span>';
}

function firstvape_minicart_drawer(): string
{
    return '<div class="drawer drawer-right" data-drawer="cart" hidden><div class="drawer-scrim" data-act="drawer-close"></div>' .
        '<aside class="drawer-panel" aria-label="' . esc_attr((string) firstvape_t('cart')) . '"><div class="drawer-head"><p class="drawer-title">' . firstvape_t('cart') . '</p>' .
        '<button class="icon-btn" type="button" data-act="drawer-close" aria-label="' . esc_attr((string) firstvape_t('close')) . '">' . firstvape_icon('close') . '</button></div>' .
        firstvape_minicart_html() . '</aside></div>';
}

/** A közösségi oldalak (Megjelenés → First Vape → Adatok); amíg nincs megadva, nem jelenik meg. */
function firstvape_social(): string
{
    $s = (array) get_option('firstvape_social', []);
    $out = '';
    foreach (['facebook' => ['Facebook', 'f'], 'instagram' => ['Instagram', 'ig'], 'tiktok' => ['TikTok', 'tt']] as $k => [$label, $short]) {
        if (!empty($s[$k])) {
            $out .= '<a href="' . esc_url((string) $s[$k]) . '" aria-label="' . esc_attr($label) . '" rel="noopener" target="_blank">' . esc_html($short) . '</a>';
        }
    }
    return $out ? '<div class="social">' . $out . '</div>' : '';
}

function firstvape_render_footer(): string
{
    $short = (array) firstvape_t('pageShort');
    $cats = '';
    foreach (firstvape_root_cats() as $k) {
        if (firstvape_cat_has_products($k)) {
            $cats .= '<li><a href="' . esc_url(firstvape_cat_url($k)) . '">' . esc_html((string) firstvape_cat($k)['name']) . '</a></li>';
        }
    }
    $has_sale = (bool) array_filter(firstvape_products(), fn($p) => $p['sale']);
    $pages = '';
    foreach (firstvape_page_keys() as $k) {
        if ($k !== 'contact') {
            $pages .= '<li><a href="' . esc_url(firstvape_page_url($k)) . '">' . esc_html((string) ($short[$k] ?? firstvape_page_title($k))) . '</a></li>';
        }
    }
    $company = (string) get_option('firstvape_company_name', 'John&Jen s.r.o.');
    return '<section class="newsletter"><div class="wrap nl-in"><div><h2>' . firstvape_t('nlTitle') . '</h2>' .
        '<p>' . firstvape_t('nlText') . '</p></div>' .
        '<form class="nl-form" data-form="newsletter" novalidate><label class="sr" for="nl-mail">' . firstvape_t('email') . '</label><input id="nl-mail" name="email" type="email" required placeholder="' . esc_attr((string) firstvape_t('emailPh')) . '">' .
        '<button class="btn btn-primary" type="submit">' . firstvape_t('subscribe') . '</button>' .
        '<label class="nl-ok"><input id="nl-accept" name="accept" type="checkbox" required><span>' . firstvape_t('nlAccept') . '</span></label>' .
        firstvape_form_trap() . '<p class="form-msg" data-form-msg role="status" hidden></p></form></div></section>' .
        '<div class="ftr"><div class="wrap ftr-grid">' .
        '<div class="ftr-brand">' . firstvape_logo() . '<p>' . firstvape_t('ftrAbout') . '</p>' . firstvape_social() . '</div>' .
        '<div><p class="ftr-h">' . firstvape_t('products') . '</p><ul>' . $cats .
        '<li><a href="' . esc_url(firstvape_page_url('brands')) . '">' . firstvape_t('brands') . '</a></li>' . ($has_sale ? '<li><a href="' . esc_url(firstvape_page_url('sale')) . '">' . firstvape_t('sale') . '</a></li>' : '') . '</ul></div>' .
        '<div><p class="ftr-h">' . firstvape_t('info') . '</p><ul>' . $pages . '</ul></div>' .
        '<div><p class="ftr-h">' . firstvape_t('customer') . '</p><ul><li><a href="' . esc_url(firstvape_page_url('contact')) . '">' . firstvape_t('contact') . '</a></li><li><a href="' . esc_url(firstvape_route('#/fiok')) . '">' . firstvape_t('myAccount') . '</a></li><li><a href="' . esc_url(firstvape_route('#/fiok/rendelesek')) . '">' . firstvape_t('orders') . '</a></li><li><a href="' . esc_url(firstvape_page_url('wishlist')) . '">' . firstvape_t('wishlist') . '</a></li></ul></div>' .
        '</div><div class="wrap ftr-pay"><div class="pay-badges"><span>Teya</span><span>VISA</span><span>Mastercard</span><span>Apple Pay</span><span>Google Pay</span><span class="carrier">Packeta</span></div>' .
        '<p class="warn-line">' . firstvape_t('nicWarn') . '</p></div>' .
        '<div class="wrap ftr-bottom"><p>© ' . esc_html(wp_date('Y')) . ' First Vape · ' . esc_html($company) . '</p><p>' . firstvape_t('madeBy') . '</p></div></div>';
}

/** 18+ kapu: a látogató böngészőjében (fv_age süti); a keresőrobotok és az elfogadók nem látják. */
function firstvape_age_gate(): string
{
    if (!empty($_COOKIE['fv_age'])) {
        return '';
    }
    return '<div class="agegate" data-agegate role="dialog" aria-modal="true" aria-labelledby="age-t" hidden><div class="ag-card">' .
        firstvape_lang_switch('ag-lang') .
        '<img class="ag-logo" src="' . esc_url(firstvape_img('first-vape-logo.png')) . '" alt="First Vape" width="791" height="99"><span class="age-pill big">18+</span><h2 id="age-t">' . firstvape_t('ageQ') . '</h2>' .
        '<p>' . firstvape_t('ageText') . '</p>' .
        '<div class="ag-acts"><button class="btn btn-primary" type="button" data-act="age-yes">' . firstvape_t('ageYes') . '</button>' .
        '<button class="btn btn-ghost" type="button" data-act="age-no">' . firstvape_t('ageNo') . '</button></div>' .
        '<p class="ag-no" hidden>' . firstvape_t('ageDenied') . '</p></div></div>';
}

/** Élő kereső lenyíló (REST: firstvape/v1/search). */
function firstvape_live_search_html(string $q): string
{
    $all = firstvape_search($q);
    $res = array_slice($all, 0, 5);
    $sug = firstvape_suggest($q);
    if (!$res && !$sug) {
        return '<p class="hs-empty">' . firstvape_t('lsNone', ['q' => esc_html($q)]) . '</p>';
    }
    $out = '';
    if ($sug) {
        $out .= '<div class="hs-sug">';
        foreach ($sug as $s) {
            $out .= '<a href="' . esc_url($s['href']) . '"><em>' . esc_html((string) $s['type']) . '</em>' . esc_html((string) $s['label']) . '</a>';
        }
        $out .= '</div>';
    }
    $out .= '<ul class="hs-res">';
    foreach ($res as $p) {
        $a = $p['attrs'];
        $b = firstvape_brand($p['brand']);
        $meta = array_slice(array_merge([$b ? $b['name'] : ''], array_map('firstvape_puff_label', $a['puff'] ?? []), $a['nikotin'] ?? [], $a['iz'] ?? []), 0, 4);
        $out .= '<li><a href="' . esc_url($p['url']) . '"><span class="hs-art" style="--tint:' . esc_attr(firstvape_tint($p)) . '">' . firstvape_art($p, 'woocommerce_gallery_thumbnail') . '</span>' .
            '<span class="hs-txt"><b>' . esc_html($p['name']) . '</b><small>' . esc_html(implode(' · ', array_filter($meta))) . '</small></span>' .
            '<span class="hs-price num">' . esc_html(firstvape_money(firstvape_price($p))) . '</span></a></li>';
    }
    $out .= '</ul><a class="hs-all" href="' . esc_url(add_query_arg(['s' => rawurlencode($q), 'post_type' => 'product'], home_url('/'))) . '">' . firstvape_t('lsAll', ['n' => count($all)]) . ' ' . firstvape_icon('chev') . '</a>';
    return $out;
}
