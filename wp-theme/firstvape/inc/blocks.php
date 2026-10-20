<?php
/**
 * Saját blokkok. Mind szerveroldali, önzáró blokk (a markupban nincs mentett HTML, így a szerkesztőben nem lehet
 * „váratlan tartalom”). A szövegek a téma szótárából jönnek (SK / FR), a listák a katalógusból.
 *
 * Regisztráció az iu_custom_blocks mu-pluginnel (iucb_add_block), ha az nincs, a WordPress register_block_type-jával,
 * ugyanazzal a kimenettel (minta: Slugshop, Alpha Movers).
 */

defined('ABSPATH') || exit;

require_once __DIR__ . '/parts/chrome.php';
require_once __DIR__ . '/parts/catalog.php';
require_once __DIR__ . '/parts/home.php';
require_once __DIR__ . '/parts/pages.php';

/**
 * @param array $attrs  név => alapérték (string|bool|int)
 * @param array $fields név => [típus, címke] a szerkesztő oldalsávjához (text, textarea, toggle)
 */
function firstvape_block(string $name, string $title, array $attrs, callable $render, array $fields = []): void
{
    $attributes = [];
    foreach ($attrs as $key => $default) {
        $attributes[$key] = ['type' => is_bool($default) ? 'boolean' : (is_int($default) ? 'number' : 'string'), 'default' => $default];
    }
    $template = function ($attributes) use ($render, $attrs) {
        return (string) $render(wp_parse_args((array) $attributes, $attrs));
    };
    if (function_exists('iucb_add_block')) {
        $panel = [];
        foreach ($fields as $key => [$type, $label]) {
            $panel[$key] = ['type' => $type, 'label' => $label];
        }
        iucb_add_block('firstvape/' . $name, [
            'title' => 'First Vape: ' . $title,
            'category' => 'widgets',
            'attributes' => $attributes,
            'fields' => $panel ? [['panel' => 'Beállítások', 'fields' => $panel]] : [],
            'editJS' => 'return ' . wp_json_encode('First Vape: ' . $title) . ';',
            'template' => $template,
        ]);
        return;
    }
    register_block_type('firstvape/' . $name, [
        'title' => 'First Vape: ' . $title,
        'category' => 'widgets',
        'attributes' => $attributes + ['className' => ['type' => 'string', 'default' => '']],
        'render_callback' => fn($attributes) => $template($attributes),
        'supports' => ['html' => false],
    ]);
    $editor_fields = [];
    foreach ($fields as $key => [$type, $label]) {
        $editor_fields[] = ['key' => $key, 'type' => $type, 'label' => $label];
    }
    $GLOBALS['firstvape_editor_blocks'][] = ['name' => 'firstvape/' . $name, 'title' => 'First Vape: ' . $title, 'attributes' => $attributes, 'fields' => $editor_fields];
}

/** Szerkesztőnézet iu_custom_blocks nélkül: felcímkézett helyőrző + a beállítások az oldalsávban (assets/js/editor.js). */
add_action('enqueue_block_editor_assets', function () {
    if (empty($GLOBALS['firstvape_editor_blocks'])) {
        return;
    }
    wp_enqueue_script('firstvape-editor', FIRSTVAPE_URL . '/assets/js/editor.js', ['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components'], FIRSTVAPE_VERSION, true);
    wp_add_inline_script('firstvape-editor', 'window.FIRSTVAPE_BLOCKS = ' . wp_json_encode($GLOBALS['firstvape_editor_blocks']) . ';', 'before');
    wp_add_inline_style('wp-edit-blocks', '.fv-editor-block{padding:14px 18px;border:1px dashed #EC2F4B;background:#231B26;color:#fff;font:600 14px/1.4 system-ui,sans-serif}.fv-editor-block small{display:block;font-weight:400;color:#bbb;margin-top:2px}');
});

add_action('init', function () {
    // Keret
    firstvape_block('header', 'Fejléc (mega menü, kereső, kosár)', [], 'firstvape_render_header');
    firstvape_block('footer', 'Lábléc (hírlevél, linkek)', [], 'firstvape_render_footer');

    // Nyitóoldal (sorrendjük a szerkesztőben átrendezhető)
    firstvape_block('home-hero', 'Nyitókép + slukkszám-kereső', [], 'firstvape_render_home_hero');
    firstvape_block('home-categories', 'Kategória-csempék', [], 'firstvape_render_home_categories');
    firstvape_block('home-why', 'Miért vape?', [], 'firstvape_render_home_why');
    firstvape_block('home-system', 'Kompatibilitás (készülék + podok)', ['kit' => '', 'system' => 'ELFA', 'tags' => 'ELFA, JOIN ONE, DOJO BLAST, DRIFTER BAR'], 'firstvape_render_home_system',
        ['kit' => ['text', 'Készülék (termék slug; üresen: a kiemelt)'], 'system' => ['text', 'Rendszer (pa_system értéke)'], 'tags' => ['text', 'Rendszer-címkék (vesszővel)']]);
    firstvape_block('home-popular', 'Legnépszerűbbek (fülek)', [], 'firstvape_render_home_popular');
    firstvape_block('home-sale', 'Akciók (csak ha van akciós termék)', [], 'firstvape_render_home_sale');
    firstvape_block('home-best', 'First Vape előnyei', [], 'firstvape_render_home_best');
    firstvape_block('home-blog', 'Legújabb cikkek', [], 'firstvape_render_home_blog');
    firstvape_block('home-brands', 'Márkák sáv', [], 'firstvape_render_home_brands');

    // Bolt
    firstvape_block('shop', 'Terméklista szűrőkkel', ['type' => ''], function ($a) {
        if ($a['type'] === 'sale' || $a['type'] === 'all') {
            return firstvape_render_shop(['type' => $a['type']]);
        }
        if (is_search()) {
            return firstvape_render_shop(['type' => 'search', 'q' => get_search_query(false)]);
        }
        if (is_tax('product_brand')) {
            return firstvape_render_shop(['type' => 'brand', 'key' => get_queried_object()->slug]);
        }
        if (is_tax('product_cat')) {
            $t = get_queried_object();
            $key = (string) get_term_meta($t->term_id, 'fv_key', true);
            return firstvape_render_shop(['type' => 'cat', 'key' => $key]);
        }
        return firstvape_render_shop(['type' => 'all']);
    }, ['type' => ['text', 'Típus: all (összes), sale (akciók); üresen: az oldal szerint']]);
    firstvape_block('product', 'Termékoldal', [], 'firstvape_render_product');
    firstvape_block('brands', 'Márkák A–Z', [], 'firstvape_render_brands');
    firstvape_block('wishlist', 'Kedvencek', [], 'firstvape_render_wishlist');

    // Oldalak
    firstvape_block('page', 'Oldal (cím, oldalsó menü, tartalom)', [], 'firstvape_render_page');
    firstvape_block('contact', 'Kapcsolat (elérhetőségek + űrlap)', [], 'firstvape_render_contact');
    firstvape_block('blog', 'Cikklista', [], 'firstvape_render_blog');
    firstvape_block('post', 'Cikk', [], 'firstvape_render_post');
    firstvape_block('not-found', '404', [], 'firstvape_render_404');
}, 5);

/** Rövidkódok a szerkeszthető oldalakba: szállítási díjtábla, utánvét díja. */
add_shortcode('fv_ship_table', fn() => firstvape_ship_table());
add_shortcode('fv_cod_fee', fn() => esc_html(firstvape_money(firstvape_cod_fee())));
