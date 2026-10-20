<?php
/**
 * Téma-alapok: támogatások, stíluslapok és szkriptek, az iu_theme alap-CSS-ének cseréje, a lap alja (fiókok, 18+ kapu,
 * üzenetsáv), cím, a keresés kiterjesztése.
 */

defined('ABSPATH') || exit;

add_action('after_setup_theme', function () {
    add_theme_support('woocommerce', ['thumbnail_image_width' => 320, 'single_image_width' => 640]);
    add_theme_support('html5', ['search-form', 'gallery', 'caption', 'style', 'script']);
    add_theme_support('post-thumbnails');
}, 20);

/** Stíluslapok és szkriptek (az előnézet CSS-e változatlanul, mellette a WordPress / WooCommerce illesztés). */
add_action('wp_enqueue_scripts', function () {
    $css = FIRSTVAPE_URL . '/assets/css/';
    $v = FIRSTVAPE_VERSION;
    wp_enqueue_style('firstvape-fonts', $css . 'fonts.css', [], $v);
    wp_enqueue_style('firstvape-site', $css . 'site.css', ['firstvape-fonts', 'style'], $v);
    wp_enqueue_style('firstvape-wp', $css . 'wp.css', ['firstvape-site'], $v);

    wp_enqueue_script('firstvape-site', FIRSTVAPE_URL . '/assets/js/site.js', [], $v, ['in_footer' => true, 'strategy' => 'defer']);
    wp_localize_script('firstvape-site', 'FIRSTVAPE', [
        'lang' => firstvape_lang(),
        'ajax' => admin_url('admin-ajax.php'),
        'wcAjax' => class_exists('WC_AJAX') ? WC_AJAX::get_endpoint('%%endpoint%%') : '',
        'rest' => esc_url_raw(rest_url('firstvape/v1/')),
        'nonce' => wp_create_nonce('firstvape'),
        'cart' => function_exists('wc_get_cart_url') ? wc_get_cart_url() : home_url('/'),
        'cookiePath' => COOKIEPATH ?: '/',
        'loggedIn' => is_user_logged_in(),
        'wish' => is_user_logged_in() ? array_values(array_map('intval', (array) get_user_meta(get_current_user_id(), 'fv_wish', true))) : [],
        'zip' => firstvape_lang() === 'fr' ? '^\\d{5}$' : '^\\d{3}\\s?\\d{2}$',
        'i18n' => [
            'addedToCart' => firstvape_t('addedToCart'), 'cart' => firstvape_t('cart'), 'wishAdded' => firstvape_t('wishAdded'),
            'wishRemoved' => firstvape_t('wishRemoved'), 'nlDone' => firstvape_t('nlDone'), 'errField' => firstvape_t('errField'),
            'errEmail' => firstvape_t('errEmail'), 'errPhone' => firstvape_t('errPhone'), 'errZip' => firstvape_t('errZip'),
            'errCheck' => firstvape_t('errCheck'), 'errSummary' => firstvape_t('errSummary'), 'showN' => firstvape_t('showN'),
            'error' => firstvape_lang() === 'fr' ? 'Une erreur s’est produite. Veuillez réessayer.' : 'Niečo sa nepodarilo. Skús to znova.',
        ],
    ]);
}, 20);

/** A betűk előtöltése (a fejléc betűi azonnal kellenek), ikon. */
add_action('wp_head', function () {
    foreach (['barlow-400-latin', 'barlow-semi-condensed-600-latin'] as $f) {
        if (is_readable(FIRSTVAPE_DIR . '/assets/fonts/' . $f . '.woff2')) {
            printf('<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n", esc_url(FIRSTVAPE_URL . '/assets/fonts/' . $f . '.woff2'));
        }
    }
    printf('<link rel="icon" href="%s">' . "\n", esc_url(firstvape_img('favicon.png')));
    echo '<meta name="theme-color" content="#151017">' . "\n";
}, 2);

/**
 * Az iu_theme alap-stíluslapja (style.css → block-styles.css) elemszintű szabályokkal ad színt a p-nek és a címsoroknak,
 * ezért a sötét felületen sötét szöveg lenne. Ahogy a Mandalánál és a Slugshopnál: a szülő style.css helyett csak a
 * variables.css töltődik; a kinézetet az előnézet CSS-e adja. Kikapcsolható: add_filter('firstvape_iu_base_styles', '__return_false').
 */
add_filter('style_loader_src', function ($src) {
    static $on = null;
    $on ??= apply_filters('firstvape_iu_base_styles', true) && is_readable(get_template_directory() . '/variables.css');
    if ($on && is_string($src) && strtok($src, '?') === trailingslashit(get_template_directory_uri()) . 'style.css') {
        return trailingslashit(get_template_directory_uri()) . 'variables.css';
    }
    return $src;
}, 5);

function firstvape_iu_dequeue_block_styles(): void
{
    if (!apply_filters('firstvape_iu_base_styles', true)) {
        return;
    }
    foreach (['row', 'column', 'section', 'group', 'button', 'button-group', 'card', 'query', 'breadcrumbs', 'search', 'menu', 'title', 'content'] as $block) {
        wp_dequeue_style('iu-' . $block . '-style');
    }
}
add_action('wp_print_styles', 'firstvape_iu_dequeue_block_styles', 1);
add_action('wp_print_footer_scripts', 'firstvape_iu_dequeue_block_styles', 1);

/** „Ugrás a tartalomra” + a fő tartalom horgonya. */
add_action('wp_body_open', function () {
    // Az iu_theme a <body>-ra csak „front-page” / „admin-bar” osztályt ír (nem a body_class szűrőt): a WordPress és a
    // WooCommerce osztályai (woocommerce-cart, woocommerce-checkout, logged-in …) itt kerülnek rá.
    // Csak a szükségesek: a WordPress „page”, „search”, „blog” osztálya ütközne az előnézet CSS-ével (.page = a tartalmi doboz).
    $classes = array_values(array_filter(get_body_class(), fn($c) => (bool) preg_match('/^(woocommerce|logged-in|fv$|lang-|is-home|single-product|tax-product)/', $c)));
    echo '<script>document.body.classList.add.apply(document.body.classList,' . wp_json_encode(array_map('sanitize_html_class', $classes)) . ');</script>';
    echo '<a class="skip" href="#main">' . esc_html((string) firstvape_t('skip')) . '</a>';
}, 1);
add_action('iu_main_template', function () {
    echo '<span id="main" tabindex="-1"></span>';
}, 1);

/** A lap alja: mobilmenü, kosár-fiók, üzenetsáv, 18+ kapu (az előnézet szerint a <body> végén). */
add_action('wp_footer', function () {
    if (is_admin()) {
        return;
    }
    echo firstvape_mobile_menu();
    echo firstvape_minicart_drawer();
    echo '<div class="toast" data-toast role="status" aria-live="polite" hidden></div>';
    echo firstvape_age_gate();
}, 5);

add_filter('body_class', function (array $classes): array {
    $classes[] = 'fv';
    $classes[] = 'lang-' . firstvape_lang();
    if (is_front_page()) {
        $classes[] = 'is-home';
    }
    return $classes;
});

/** A dokumentum címe: „Oldal | First Vape”, a nyitóoldalon a szótár címe. */
add_filter('document_title_separator', fn() => '|');
add_filter('document_title_parts', function (array $parts): array {
    if (is_front_page()) {
        return ['title' => (string) firstvape_t('titleHome')];
    }
    if (is_search()) {
        $parts['title'] = (string) firstvape_t('searchCrumb', ['q' => get_search_query()]);
    }
    if (function_exists('is_cart') && is_cart()) {
        $parts['title'] = (string) firstvape_t('cart');
    } elseif (function_exists('is_checkout') && is_checkout()) {
        $parts['title'] = (string) firstvape_t(is_wc_endpoint_url('order-received') ? 'titleThanks' : 'titleCheckout');
    } elseif (is_404()) {
        $parts['title'] = (string) firstvape_t('titleNotFound');
    } elseif (is_tax('product_cat')) {
        $key = (string) get_term_meta(get_queried_object_id(), 'fv_key', true);
        $parts['title'] = (string) (firstvape_cat($key)['name'] ?? $parts['title']);
    } elseif (function_exists('is_shop') && is_shop()) {
        $parts['title'] = (string) firstvape_t('allProducts');
    } elseif (is_page() && ($k = (string) get_post_meta(get_queried_object_id(), 'fv_title_key', true)) !== '') {
        $parts['title'] = (string) firstvape_t($k);
    }
    $parts['site'] = 'First Vape';
    unset($parts['tagline']);
    return $parts;
});

/** A téma oldalainak címe a látogató nyelvén (a közös oldalak: bolt, kosár, pénztár, fiók, márkák, akciók, kedvencek, blog). */
add_filter('the_title', function ($title, $id = 0) {
    if (is_admin() || !$id) {
        return $title;
    }
    $k = (string) get_post_meta((int) $id, 'fv_title_key', true);
    return $k !== '' ? (string) firstvape_t($k) : $title;
}, 10, 2);

/** A keresés a termékekben keres (a találatokat a téma saját keresője rendezi: catalog.php). */
add_action('pre_get_posts', function (WP_Query $q) {
    if (!is_admin() && $q->is_main_query() && $q->is_search()) {
        $q->set('post_type', ['product']);
        $q->set('posts_per_page', 1);
    }
}, 20);

/** A szöveg betűre azonos maradjon (kötőjel, idézőjel). */
add_filter('run_wptexturize', '__return_false');
