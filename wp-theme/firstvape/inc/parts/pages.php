<?php
/**
 * Oldalak: információs és jogi oldalak (piaconként, oldalsó menüvel), kapcsolat, blog, cikk, 404.
 * A jogi szövegek HELYŐRZŐK (az ügyfél jogásza adja) – szerkeszthető blokkok az oldal tartalmában.
 */

defined('ABSPATH') || exit;

/** Tartalmi oldal: morzsamenü, oldalsó menü (a piac oldalai), cím, a szerkeszthető tartalom. */
function firstvape_render_page(): string
{
    // csak a látogatói oldalon, oldalra (a szerkesztőben / REST-ben a sablon önmagát renderelné: végtelen ciklus)
    static $depth = 0;
    if (!is_singular('page') || $depth > 0) {
        return '';
    }
    $depth++;
    try {
        return firstvape_render_page_inner();
    } finally {
        $depth--;
    }
}

function firstvape_render_page_inner(): string
{
    $id = get_queried_object_id();
    $key = (string) get_post_meta($id, 'fv_page', true);
    $keys = firstvape_page_keys();
    $raw = (string) get_post_field('post_content', $id);
    $content = (string) apply_filters('the_content', $raw);
    // teljes oldalas blokk (terméklista, márkák, kedvencek, cikklista): saját címmel és morzsamenüvel jön
    foreach (['firstvape/shop', 'firstvape/brands', 'firstvape/wishlist', 'firstvape/blog'] as $full) {
        if (has_block($full, $raw)) {
            return $content;
        }
    }
    $title = get_the_title($id);
    if ($key !== '' && in_array($key, $keys, true)) {
        $nav = '';
        foreach ($keys as $k) {
            $nav .= '<a href="' . esc_url(firstvape_page_url($k)) . '"' . ($k === $key ? ' class="on" aria-current="page"' : '') . '>' . esc_html(firstvape_page_title($k)) . '</a>';
        }
        return '<div class="wrap">' . firstvape_crumbs([['label' => $title]]) . '<div class="pagegrid"><nav class="side-nav" aria-label="' . esc_attr((string) firstvape_t('info')) . '">' . $nav .
            '</nav><article class="prose page"><h1>' . esc_html($title) . '</h1>' . $content . '</article></div></div>';
    }
    // a WooCommerce oldalai (kosár, pénztár, fiók) és a többi oldal: cím + tartalom
    $wc = function_exists('is_cart') && (is_cart() || is_checkout() || is_account_page());
    if ($wc) {
        // a kosár és a pénztár címe a WooCommerce horgonyain jön (lépések után); a fiók oldalé itt
        $h1 = is_account_page() ? '<h1 class="h-page">' . esc_html($title) . '</h1>' : '';
        return '<div class="wrap wc-page">' . $h1 . $content . '</div>';
    }
    return '<div class="wrap">' . firstvape_crumbs([['label' => $title]]) . '<article class="prose page"><h1>' . esc_html($title) . '</h1>' . $content . '</article></div>';
}

/** Kapcsolat: elérhetőségek + űrlap (REST: firstvape/v1/form/contact, levél az üzlet címére). */
function firstvape_render_contact(): string
{
    $email = (string) get_option('firstvape_email', 'info@firstvape.sk');
    $company = (string) get_option('firstvape_company_name', 'John&Jen s.r.o.');
    return '<div class="contact"><div><h2>' . firstvape_t('contact') . '</h2><ul class="clist"><li>' . firstvape_icon('mail') . '<span><a href="mailto:' . esc_attr($email) . '">' . esc_html($email) . '</a></span></li><li>' . firstvape_icon('phone') . '<span>' . (firstvape_lang() === 'sk' ? 'Zákaznícka linka v pracovné dni 9:00–17:00' : 'Service client du lundi au vendredi, 9 h – 17 h') . '</span></li><li>' . firstvape_icon('pin') . '<span>' . esc_html($company) . ', ' . (firstvape_lang() === 'sk' ? 'Slovensko' : 'Slovaquie') . '</span></li></ul></div>' .
        '<form class="fgrid" data-form="contact" novalidate><div class="fld"><label for="ct-name">' . firstvape_t('contactName') . '</label><input id="ct-name" name="your-name" required autocomplete="name"></div><div class="fld"><label for="ct-mail">' . firstvape_t('email') . '</label><input id="ct-mail" name="email" type="email" required autocomplete="email"></div><div class="fld span2"><label for="ct-order">' . firstvape_t('orderNoOpt') . '</label><input id="ct-order" name="order" placeholder="FV-…"></div><div class="fld span2"><label for="ct-msg">' . firstvape_t('message') . '</label><textarea id="ct-msg" name="message" rows="5" required></textarea></div>' .
        firstvape_form_trap() . '<div class="fld span2"><button class="btn btn-primary" type="submit">' . firstvape_t('send') . '</button><p class="ok-msg" data-form-msg role="status" hidden>' . firstvape_t('contactOk') . '</p></div></form></div>';
}

/** A piac cikkei (fv_lang meta: sk / fr; ami nincs jelölve, mindkét piacon). */
function firstvape_posts(int $n = -1, array $exclude = []): array
{
    return get_posts([
        'post_type' => 'post', 'numberposts' => $n, 'post__not_in' => $exclude, 'suppress_filters' => false,
        'meta_query' => ['relation' => 'OR', ['key' => 'fv_lang', 'value' => firstvape_lang()], ['key' => 'fv_lang', 'compare' => 'NOT EXISTS']],
    ]);
}

function firstvape_blog_cards(array $posts): string
{
    $out = '<div class="blog-grid">';
    foreach ($posts as $post) {
        $tint = (string) get_post_meta($post->ID, 'fv_color', true) ?: '#EC2F4B';
        $img = has_post_thumbnail($post) ? get_the_post_thumbnail($post, 'medium_large', ['class' => 'post-photo', 'alt' => '']) : '';
        $cat = get_the_category($post->ID);
        $out .= '<a class="post-card" href="' . esc_url((string) get_permalink($post)) . '"><span class="post-img" style="--tint:' . esc_attr($tint) . '">' . $img . '</span>' .
            '<span class="post-body"><small>' . esc_html(firstvape_date(get_the_date('Y-m-d', $post))) . ($cat ? ' · ' . esc_html($cat[0]->name) : '') . '</small><b>' . esc_html(get_the_title($post)) . '</b><p>' . esc_html(get_the_excerpt($post)) . '</p><em>' . firstvape_t('readMore') . ' ' . firstvape_icon('chev') . '</em></span></a>';
    }
    return $out . '</div>';
}

function firstvape_render_blog(): string
{
    return '<div class="wrap">' . firstvape_crumbs([['label' => firstvape_t('blog')]]) . '<div class="shop-title"><h1>' . firstvape_t('blogTitle') . '</h1><p>' . firstvape_t('blogIntro') . '</p></div>' . firstvape_blog_cards(firstvape_posts()) . '</div>';
}

function firstvape_render_post(): string
{
    static $depth = 0;
    if (!is_singular('post') || $depth > 0) {
        return '';
    }
    $id = get_queried_object_id();
    $depth++;
    try {
        return firstvape_render_post_inner($id);
    } finally {
        $depth--;
    }
}

function firstvape_render_post_inner(int $id): string
{
    $post = get_post($id);
    if (!$post) {
        return firstvape_render_404();
    }
    $tint = (string) get_post_meta($id, 'fv_color', true) ?: '#EC2F4B';
    $cat = get_the_category($id);
    $img = has_post_thumbnail($post) ? get_the_post_thumbnail($post, 'large', ['class' => 'post-photo', 'alt' => '', 'fetchpriority' => 'high']) : '';
    $more = firstvape_posts(3, [$id]);
    return '<div class="wrap">' . firstvape_crumbs([['label' => firstvape_t('blog'), 'href' => firstvape_page_url('blog')], ['label' => get_the_title($post)]]) .
        '<article class="prose page post"><span class="post-img lg" style="--tint:' . esc_attr($tint) . '">' . $img . '</span><small class="muted">' . esc_html(firstvape_date(get_the_date('Y-m-d', $post))) . ($cat ? ' · ' . esc_html($cat[0]->name) : '') . '</small><h1>' . esc_html(get_the_title($post)) . '</h1>' .
        apply_filters('the_content', $post->post_content) . '</article>' .
        ($more ? '<section class="sec">' . firstvape_section_head((string) firstvape_t('moreArticles')) . firstvape_blog_cards($more) . '</section>' : '') . '</div>';
}

function firstvape_render_404(): string
{
    if (!is_404() && !headers_sent() && !(function_exists('wp_is_serving_rest_request') && wp_is_serving_rest_request()) && !is_admin()) {
        status_header(404);
    }
    return '<div class="wrap"><div class="empty big"><h1>' . firstvape_t('nfH') . '</h1><p>' . firstvape_t('nfP') . '</p><a class="btn btn-primary" href="' . esc_url(home_url('/')) . '">' . firstvape_t('home') . '</a></div></div>';
}

/** A rendelés lépései (kosár → adatok és szállítás → fizetés → visszaigazolás). */
function firstvape_steps(int $n): string
{
    $out = '<ol class="steps" aria-label="' . esc_attr((string) firstvape_t('orderSteps')) . '">';
    foreach ((array) firstvape_t('steps') as $i => $x) {
        $out .= '<li class="' . ($i + 1 < $n ? 'done' : ($i + 1 === $n ? 'on' : '')) . '"' . ($i + 1 === $n ? ' aria-current="step"' : '') . '><span class="num">' . ($i + 1) . '</span><b>' . esc_html((string) $x) . '</b></li>';
    }
    return $out . '</ol>';
}
