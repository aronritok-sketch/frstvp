<?php
/**
 * AJAX: élő kereső (REST: firstvape/v1/search), kosár-fiók mennyiség / törlés (admin-ajax: ott a WooCommerce kosara
 * betöltődik), kedvencek mentése a fiókba.
 */

defined('ABSPATH') || exit;

add_action('rest_api_init', function () {
    register_rest_route('firstvape/v1', '/search', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'args' => ['q' => ['type' => 'string', 'required' => true], 'lang' => ['type' => 'string']],
        'callback' => function (WP_REST_Request $r) {
            $lang = (string) $r->get_param('lang');
            $q = mb_substr(trim((string) $r->get_param('q')), 0, 80);
            $html = firstvape_with_lang(in_array($lang, FIRSTVAPE_LANGS, true) ? $lang : firstvape_lang(), fn() => mb_strlen($q) < 2 ? '' : firstvape_live_search_html($q));
            return new WP_REST_Response(['html' => $html], 200, ['Cache-Control' => 'public, max-age=60']);
        },
    ]);
});

/** Kosár-fiók: mennyiség (+1 / −1) és törlés; válasz: a WooCommerce fragmentjei (fejléc számláló, összeg, fiók). */
function firstvape_ajax_cart(): void
{
    check_ajax_referer('firstvape', 'nonce');
    $key = sanitize_text_field(wp_unslash((string) ($_POST['key'] ?? '')));
    $cart = WC()->cart;
    if (!$cart || !$cart->get_cart_item($key)) {
        wp_send_json_error(['message' => 'cart item not found'], 404);
    }
    $item = $cart->get_cart_item($key);
    $qty = isset($_POST['remove']) ? 0 : max(0, (int) $item['quantity'] + (int) ($_POST['d'] ?? 0));
    if ($qty === 0) {
        $cart->remove_cart_item($key);
    } else {
        $p = $item['data'];
        if ($p instanceof WC_Product && $p->managing_stock() && !$p->backorders_allowed() && $qty > (int) $p->get_stock_quantity()) {
            $qty = (int) $p->get_stock_quantity();
        }
        $cart->set_quantity($key, $qty, true);
    }
    $cart->calculate_totals();
    WC_AJAX::get_refreshed_fragments();
}
add_action('wp_ajax_firstvape_cart', 'firstvape_ajax_cart');
add_action('wp_ajax_nopriv_firstvape_cart', 'firstvape_ajax_cart');

/** Kedvencek a fiókba (bejelentkezve); a böngészőben a fv_wish süti a forrás. */
add_action('wp_ajax_firstvape_wish', function () {
    check_ajax_referer('firstvape', 'nonce');
    $ids = array_values(array_unique(array_filter(array_map('intval', explode(',', (string) ($_POST['ids'] ?? ''))))));
    $ids = array_values(array_filter($ids, fn($id) => get_post_type($id) === 'product'));
    update_user_meta(get_current_user_id(), 'fv_wish', $ids);
    wp_send_json_success(['n' => count($ids)]);
});
