<?php
/**
 * Telepítő: a jóváhagyott előnézet tartalma és a webshop beállításai a WordPressbe, lépésenként.
 *
 *   wp firstvape setup [--force] [--media=<mappa|zip>] [--step=<lépés>]     vagy     Megjelenés → First Vape → Telepítés
 *
 * Lépések: beállítások → attribútumok → kategóriák → márkák → termékek (25-ös kötegekben) → ajánlások (cross-sell) →
 * oldalak → cikkek → befejezés. Idempotens: a második futás nem ír át semmit. Amit az adminban azóta szerkesztettek
 * (lenyomat: fv_hash meta), azt kihagyja, kivéve --force / „Felülírás” pipával. A meglévő termék árához, készletéhez
 * csak a --force nyúl (az élő bolt adatai az adminból / importból jönnek).
 *
 * Adatok: setup/data/*.json (tools/wp/build_data.mjs generálja az előnézet adataiból). Termékképek: a médiacsomag
 * (dist/firstvape-media.zip: p/<termék-slug>.webp, 1200 px, átlátszó) kicsomagolva a wp-content/uploads/firstvape-media/
 * mappába – a telepítő onnan veszi fel őket a médiatárba (egyszer).
 */

defined('ABSPATH') || exit;

const FIRSTVAPE_SETUP_VERSION = '1.0.0';
const FIRSTVAPE_BATCH = 25;

function firstvape_media_dir(): string
{
    return wp_upload_dir()['basedir'] . '/firstvape-media';
}

function firstvape_media_count(): int
{
    $n = 0;
    foreach (['p', 'termekkepek'] as $d) {
        $n += count(glob(firstvape_media_dir() . '/' . $d . '/*.webp') ?: []);
    }
    return $n;
}

function firstvape_setup_steps(): array
{
    return [
        'settings' => ['Beállítások (WordPress, WooCommerce, EUR, ÁFA SK 23 % / FR 20 %, szállítás, fizetés)', false],
        'attributes' => ['Termékattribútumok (szűrők)', false],
        'categories' => ['Termékkategóriák (a kategóriafa)', false],
        'brands' => ['Márkák', false],
        'products' => ['Termékek képekkel', true],
        'cross' => ['Ajánlások (cross-sell)', false],
        'pages' => ['Oldalak (SK és FR jogi oldalak, bolt, kosár, pénztár, fiók, márkák, akciók, kedvencek, blog)', false],
        'posts' => ['Cikkek (SK és FR)', false],
        'finish' => ['Befejezés (nyitóoldal, permalinkek, index)', false],
    ];
}

/** @return array{done:bool, offset:int, total:int, log:string[]} */
function firstvape_setup_run(string $step, int $offset = 0, bool $force = false): array
{
    if (function_exists('set_time_limit')) {
        @set_time_limit(300);
    }
    wp_suspend_cache_invalidation(false);
    $log = [];
    $fn = 'firstvape_setup_' . $step;
    if (!function_exists($fn)) {
        return ['done' => true, 'offset' => 0, 'total' => 0, 'log' => ['Ismeretlen lépés: ' . $step]];
    }
    // a telepítő mindig a szlovák (alap) nyelven fut
    $res = firstvape_with_lang('sk', function () use ($fn, $offset, $force, &$log) {
        return $fn($offset, $force, $log);
    });
    return ['done' => (bool) ($res['done'] ?? true), 'offset' => (int) ($res['offset'] ?? 0), 'total' => (int) ($res['total'] ?? 0), 'log' => $log];
}

// --------------------------------------------------------------------------------------------------- segédek

/** Lenyomat a „kézzel szerkesztették-e” kérdéshez (blokkszinten normalizálva: a szerkesztő mentése mást ír ki). */
function firstvape_content_hash(string $content): string
{
    $norm = function (array $blocks) use (&$norm) {
        $out = [];
        foreach ($blocks as $b) {
            if ($b['blockName'] === null && trim((string) $b['innerHTML']) === '') {
                continue;
            }
            $attrs = array_filter((array) $b['attrs'], fn($v) => $v !== '' && $v !== null && $v !== []);
            unset($attrs['style'], $attrs['iu_style']);
            ksort($attrs);
            $out[] = [$b['blockName'], $attrs, $b['blockName'] && !$b['innerBlocks'] ? preg_replace('/\s+/', ' ', trim(wp_strip_all_tags((string) $b['innerHTML']))) : '', $norm((array) $b['innerBlocks'])];
        }
        return $out;
    };
    return md5((string) wp_json_encode($norm(parse_blocks($content))));
}

/** Kép a médiatárba (egyszer) a médiacsomag relatív útvonala alapján. Visszaad: melléklet azonosító vagy 0. */
function firstvape_attach(string $rel, int $parent = 0, string $alt = ''): int
{
    if ($rel === '') {
        return 0;
    }
    $file = firstvape_media_dir() . '/' . $rel;
    if (!is_readable($file) && str_starts_with($rel, 'p/')) {
        // a CRM-be feltöltött képcsomag (firstvape-termekkepek-1200.zip) termekkepek/ mappával
        $file = firstvape_media_dir() . '/termekkepek/' . substr($rel, 2);
    }
    $found = get_posts(['post_type' => 'attachment', 'post_status' => 'inherit', 'numberposts' => 1, 'fields' => 'ids', 'meta_key' => 'fv_media', 'meta_value' => $rel]);
    if ($found) {
        $old = (int) $found[0];
        $have = (string) get_attached_file($old);
        // ugyanaz a fájlnév, de új kép a médiacsomagban (az ügyfél cserélte): a régi melléklet helyett új
        if (!is_readable($file) || !is_readable($have) || md5_file($have) === md5_file($file)) {
            return $old;
        }
        wp_delete_attachment($old, true);
    }
    if (!is_readable($file)) {
        return 0;
    }
    require_once ABSPATH . 'wp-admin/includes/image.php';
    $up = wp_upload_bits(basename($file), null, (string) file_get_contents($file));
    if (!empty($up['error'])) {
        return 0;
    }
    $type = wp_check_filetype($up['file']);
    $id = wp_insert_attachment(['post_mime_type' => $type['type'] ?: 'image/webp', 'post_title' => $alt !== '' ? $alt : pathinfo($file, PATHINFO_FILENAME), 'post_status' => 'inherit'], $up['file'], $parent);
    if (is_wp_error($id) || !$id) {
        return 0;
    }
    wp_update_attachment_metadata($id, wp_generate_attachment_metadata($id, $up['file']));
    update_post_meta($id, 'fv_media', $rel);
    if ($alt !== '') {
        update_post_meta($id, '_wp_attachment_image_alt', $alt);
    }
    return (int) $id;
}

/** Oldal vagy cikk létrehozása / frissítése a lenyomat szerint (fv_key: a telepítő saját kulcsa). */
function firstvape_upsert_post(array $args, string $key, bool $force, array &$log, array $meta = []): int
{
    $existing = get_posts(['post_type' => $args['post_type'], 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids', 'meta_key' => 'fv_key', 'meta_value' => $key]);
    $hash = firstvape_content_hash((string) $args['post_content']);
    if ($existing) {
        $id = (int) $existing[0];
        $stored = (string) get_post_meta($id, 'fv_hash', true);
        $current = firstvape_content_hash((string) get_post_field('post_content', $id));
        if ($stored === $hash && $current === $hash && get_post_field('post_title', $id) === $args['post_title'] && (!$force || get_post_field('post_content', $id) === $args['post_content'])) {
            foreach ($meta as $k => $v) {
                update_post_meta($id, $k, $v);
            }
            return $id; // változatlan
        }
        if (!$force && $stored !== '' && $current !== $stored) {
            $log[] = '⚠ kihagyva (az adminban szerkesztették): ' . $args['post_title'];
            return $id;
        }
        $args['ID'] = $id;
        wp_update_post(wp_slash($args));
        $log[] = '↻ frissítve: ' . $args['post_title'];
    } else {
        $id = (int) wp_insert_post(wp_slash($args + ['post_status' => 'publish']), true);
        if (!$id || is_wp_error($id)) {
            $log[] = '✗ nem sikerült: ' . $args['post_title'];
            return 0;
        }
        $log[] = '+ létrehozva: ' . $args['post_title'];
    }
    update_post_meta($id, 'fv_key', $key);
    update_post_meta($id, 'fv_hash', $hash);
    foreach ($meta as $k => $v) {
        update_post_meta($id, $k, $v);
    }
    return $id;
}

/**
 * Az előnézet HTML-je (h2, p, ul, ol) → szerkeszthető blokkok (core/heading, core/paragraph, core/list), a szerkesztő
 * kanonikus alakjában: az iu_theme a mentett HTML-be saját osztályt tesz (iu-text, iu-heading, iu-list, iu-list-item) –
 * enélkül a blokk a szerkesztőben „érvénytelen”.
 */
function firstvape_html_to_blocks(string $html): string
{
    $html = str_replace(['{shipTable}', '{cod}'], ['<div data-sc="fv_ship_table"></div>', '[fv_cod_fee]'], $html);
    $html = firstvape_links($html);
    $doc = new DOMDocument();
    libxml_use_internal_errors(true);
    $doc->loadHTML('<?xml encoding="UTF-8"><div id="r">' . $html . '</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();
    $root = $doc->getElementById('r');
    $inner = function (DOMNode $n) use ($doc) {
        $s = '';
        foreach ($n->childNodes as $c) {
            $s .= $doc->saveHTML($c);
        }
        return trim($s);
    };
    $out = [];
    foreach ($root ? $root->childNodes : [] as $n) {
        if (!$n instanceof DOMElement) {
            if (trim($n->textContent) !== '') {
                $out[] = "<!-- wp:paragraph -->\n<p class=\"iu-text\">" . esc_html(trim($n->textContent)) . "</p>\n<!-- /wp:paragraph -->";
            }
            continue;
        }
        $tag = strtolower($n->tagName);
        if ($tag === 'h2' || $tag === 'h3') {
            $level = $tag === 'h3' ? ' {"level":3}' : '';
            $out[] = '<!-- wp:heading' . $level . " -->\n<" . $tag . ' class="wp-block-heading iu-heading">' . $inner($n) . '</' . $tag . ">\n<!-- /wp:heading -->";
        } elseif ($tag === 'p') {
            $cls = $n->getAttribute('class');
            $out[] = '<!-- wp:paragraph' . ($cls !== '' ? ' {"className":"' . esc_attr($cls) . '"}' : '') . " -->\n<p class=\"iu-text" . ($cls !== '' ? ' ' . esc_attr($cls) : '') . '">' . $inner($n) . "</p>\n<!-- /wp:paragraph -->";
        } elseif ($tag === 'ul' || $tag === 'ol') {
            $items = '';
            foreach ($n->childNodes as $li) {
                if ($li instanceof DOMElement && strtolower($li->tagName) === 'li') {
                    $items .= "<!-- wp:list-item -->\n<li class=\"iu-list-item\">" . $inner($li) . "</li>\n<!-- /wp:list-item -->\n\n";
                }
            }
            $out[] = '<!-- wp:list' . ($tag === 'ol' ? ' {"ordered":true}' : '') . " -->\n<" . $tag . ' class="wp-block-list iu-list">' . rtrim($items) . '</' . $tag . ">\n<!-- /wp:list -->";
        } elseif ($tag === 'div' && $n->getAttribute('data-sc') !== '') {
            $out[] = "<!-- wp:shortcode -->\n[" . $n->getAttribute('data-sc') . "]\n<!-- /wp:shortcode -->";
        }
    }
    return implode("\n\n", $out);
}

// --------------------------------------------------------------------------------------------------- lépések

function firstvape_setup_settings(int $offset, bool $force, array &$log): array
{
    $email = (string) get_option('firstvape_email', 'info@firstvape.sk');
    $opts = [
        'blogname' => 'First Vape', 'blogdescription' => '', 'timezone_string' => 'Europe/Bratislava', 'WPLANG' => 'sk_SK',
        'date_format' => 'j. n. Y', 'time_format' => 'H:i', 'start_of_week' => 1, 'permalink_structure' => '/%postname%/',
        'default_comment_status' => 'closed', 'default_ping_status' => 'closed', 'show_avatars' => 0, 'uploads_use_yearmonth_folders' => 1,
        // WooCommerce: EUR, bruttó ár (SK alap), ÁFA a vásárló országa szerint (SK 23 %, FR 20 %), SK és FR
        'woocommerce_default_country' => 'SK', 'woocommerce_currency' => 'EUR', 'woocommerce_currency_pos' => 'right_space',
        'woocommerce_price_thousand_sep' => ' ', 'woocommerce_price_decimal_sep' => ',', 'woocommerce_price_num_decimals' => 2,
        'woocommerce_calc_taxes' => 'yes', 'woocommerce_prices_include_tax' => 'yes', 'woocommerce_tax_display_shop' => 'incl',
        'woocommerce_tax_display_cart' => 'incl', 'woocommerce_tax_based_on' => 'billing', 'woocommerce_tax_total_display' => 'single',
        'woocommerce_tax_round_at_subtotal' => 'no', 'woocommerce_shipping_tax_class' => 'inherit',
        'woocommerce_allowed_countries' => 'specific', 'woocommerce_specific_allowed_countries' => ['SK', 'FR'],
        'woocommerce_ship_to_countries' => 'specific', 'woocommerce_specific_ship_to_countries' => ['SK', 'FR'],
        'woocommerce_ship_to_destination' => 'billing', 'woocommerce_enable_guest_checkout' => 'yes',
        'woocommerce_enable_checkout_login_reminder' => 'yes', 'woocommerce_enable_signup_and_login_from_checkout' => 'yes',
        'woocommerce_enable_myaccount_registration' => 'yes', 'woocommerce_registration_generate_password' => 'yes',
        'woocommerce_manage_stock' => 'yes', 'woocommerce_notify_low_stock_amount' => 3, 'woocommerce_notify_no_stock_amount' => 0,
        'woocommerce_hide_out_of_stock_items' => 'no', 'woocommerce_enable_reviews' => 'no', 'woocommerce_enable_ajax_add_to_cart' => 'yes',
        'woocommerce_cart_redirect_after_add' => 'no', 'woocommerce_weight_unit' => 'kg', 'woocommerce_dimension_unit' => 'mm',
        'woocommerce_email_from_name' => 'First Vape', 'woocommerce_email_from_address' => $email,
        'woocommerce_coming_soon' => 'no', 'woocommerce_store_pages_only' => 'no', 'woocommerce_feature_order_attribution_enabled' => 'no',
        'woocommerce_permalinks' => ['product_base' => '/produkt', 'category_base' => 'kategoria', 'tag_base' => 'stitok', 'attribute_base' => '', 'use_verbose_page_rules' => false],
        'woocommerce_brand_permalink' => 'znacka', 'woocommerce_enable_shipping_calc' => 'no', 'woocommerce_shipping_cost_requires_address' => 'no',
        // a fiók és a pénztár végpontjai szlovákul (a WP-CLI angolul hozná létre)
        'woocommerce_checkout_pay_endpoint' => 'platba', 'woocommerce_checkout_order_received_endpoint' => 'objednavka-prijata',
        'woocommerce_myaccount_orders_endpoint' => 'objednavky', 'woocommerce_myaccount_view_order_endpoint' => 'objednavka',
        'woocommerce_myaccount_downloads_endpoint' => 'stiahnutia', 'woocommerce_myaccount_edit_account_endpoint' => 'udaje-uctu',
        'woocommerce_myaccount_edit_address_endpoint' => 'adresy', 'woocommerce_myaccount_payment_methods_endpoint' => 'platobne-metody',
        'woocommerce_myaccount_lost_password_endpoint' => 'zabudnute-heslo', 'woocommerce_logout_endpoint' => 'odhlasenie',
    ];
    foreach ($opts as $k => $v) {
        update_option($k, $v);
    }
    if (!get_option('firstvape_domains')) {
        update_option('firstvape_domains', ['sk' => (string) wp_parse_url(home_url(), PHP_URL_HOST), 'fr' => '']);
    }
    // ÁFA: SK 23 %, FR 20 % normál kulcs (egyszer); a könyvelő élesítés előtt ellenőrzi (OSS, jövedéki adó)
    if (class_exists('WC_Tax')) {
        global $wpdb;
        foreach (['SK' => ['23.0000', 'DPH'], 'FR' => ['20.0000', 'TVA']] as $c => [$rate, $name]) {
            $has = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}woocommerce_tax_rates WHERE tax_rate_country = %s AND tax_rate_class = ''", $c));
            if (!$has) {
                WC_Tax::_insert_tax_rate(['tax_rate_country' => $c, 'tax_rate' => $rate, 'tax_rate_name' => $name, 'tax_rate_priority' => 1, 'tax_rate_compound' => 0, 'tax_rate_shipping' => 1, 'tax_rate_order' => 0, 'tax_rate_class' => '']);
                $log[] = '+ ÁFA ' . $c . ' ' . (float) $rate . ' %';
            }
        }
    }
    firstvape_setup_shipping($log);
    firstvape_setup_payments($log);
    $log[] = '✓ WordPress- és WooCommerce-beállítások';
    return ['done' => true];
}

/**
 * Szállítás: „Slovensko” és „Francúzsko” zóna, piaconként két mód (átvételi pont / Z-BOX, házhoz) a minta díjakkal
 * (catalog.json → markets.shipping; az ügyfél Packeta-díjai a kérdőívből). Élesítéskor a Packeta bővítmény módjai.
 */
function firstvape_setup_shipping(array &$log): void
{
    if (!class_exists('WC_Shipping_Zones')) {
        return;
    }
    $names = ['sk' => 'Slovensko', 'fr' => 'Francúzsko'];
    $have = [];
    foreach (WC_Shipping_Zones::get_zones() as $z) {
        $have[$z['zone_name']] = $z;
    }
    foreach ($names as $lang => $zname) {
        if (isset($have[$zname])) {
            // meglévő zóna: az ingyenes küszöb a kérdőívből (2026-10-20) – csak ha még a régi minta (50) van beállítva
            $free = (string) (firstvape_market($lang)['shipping']['freeOver'] ?? '');
            foreach ((array) $have[$zname]['shipping_methods'] as $sm) {
                if ($sm->id === 'firstvape_ship' && in_array((string) $sm->get_option('free_over'), ['', '50'], true) && $free !== '' && $free !== '50') {
                    $key = 'woocommerce_firstvape_ship_' . $sm->instance_id . '_settings';
                    $opt = (array) get_option($key, []);
                    $opt['free_over'] = $free;
                    update_option($key, $opt);
                    $log[] = '↻ ingyenes szállítás ' . $free . ' €-tól: ' . $zname . ' – ' . $sm->get_title();
                }
            }
            continue;
        }
        $m = firstvape_market($lang);
        $zone = new WC_Shipping_Zone();
        $zone->set_zone_name($zname);
        $zone->set_zone_order($lang === 'sk' ? 1 : 2);
        $zone->add_location((string) $m['code'], 'country');
        $zone->save();
        foreach ((array) ($m['shipping']['methods'] ?? []) as $sm) {
            $iid = $zone->add_shipping_method('firstvape_ship');
            $tiers = implode(',', array_map(fn($t) => $t['max'] . ':' . $t['price'], (array) $sm['tiers']));
            update_option('woocommerce_firstvape_ship_' . $iid . '_settings', [
                'title' => (string) $sm['name'], 'eta' => (string) $sm['eta'], 'pickup' => !empty($sm['pickup']) ? 'yes' : 'no',
                'tiers' => $tiers, 'free_over' => (string) ($m['shipping']['freeOver'] ?? ''),
            ]);
        }
        $log[] = '+ szállítási zóna: ' . $zname . ' (minta díjak – a Packeta-szerződés szerint kell átírni)';
    }
}

/** Fizetés: utánvét bekapcsolva (díj: firstvape_cod_fee); a Teya fizetési kapu bővítményként jön (Laci, 08-as fázis). */
function firstvape_setup_payments(array &$log): void
{
    $cod = (array) get_option('woocommerce_cod_settings', []);
    if (empty($cod)) {
        update_option('woocommerce_cod_settings', ['enabled' => 'yes', 'title' => 'Dobierka', 'description' => 'Platba pri prevzatí zásielky', 'instructions' => '', 'enable_for_methods' => [], 'enable_for_virtual' => 'no']);
        $log[] = '+ fizetés: utánvét (dobierka)';
    }
}

/** A szűrők attribútumai (pa_*): szlovák felirat, a francia a téma szótárából. */
function firstvape_setup_attributes(int $offset, bool $force, array &$log): array
{
    $labels = ['pa_prichut' => 'Príchuť', 'pa_nikotin' => 'Nikotín', 'pa_objem' => 'Objem', 'pa_pocet-potiahnuti' => 'Počet potiahnutí', 'pa_system' => 'Systém', 'pa_farba' => 'Farba', 'pa_odpor' => 'Odpor'];
    foreach ($labels as $tax => $label) {
        $slug = substr($tax, 3);
        if (!wc_attribute_taxonomy_id_by_name($tax)) {
            $id = wc_create_attribute(['name' => $label, 'slug' => $slug, 'type' => 'select', 'order_by' => 'name', 'has_archives' => false]);
            $log[] = is_wp_error($id) ? '✗ attribútum: ' . $label . ' – ' . $id->get_error_message() : '+ attribútum: ' . $label . ' (' . $tax . ')';
        }
        if (!taxonomy_exists($tax)) {
            register_taxonomy($tax, ['product'], ['hierarchical' => false, 'show_ui' => false, 'query_var' => false, 'rewrite' => false]);
        }
    }
    delete_transient('wc_attribute_taxonomies');
    return ['done' => true];
}

function firstvape_setup_categories(int $offset, bool $force, array &$log): array
{
    $made = 0;
    $walk = function (array $c, int $parent) use (&$walk, &$made, $force, &$log) {
        $key = (string) $c['slug'];
        $name = (string) ($c['name']['sk'] ?? $key);
        $slug = sanitize_title(remove_accents($name));
        $found = null;
        foreach ((array) get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false]) as $t) {
            if ((string) get_term_meta($t->term_id, 'fv_key', true) === $key) {
                $found = $t;
                break;
            }
        }
        if (!$found) {
            $r = wp_insert_term($name, 'product_cat', ['slug' => $slug, 'parent' => $parent, 'description' => (string) ($c['desc']['sk'] ?? '')]);
            if (is_wp_error($r)) {
                $log[] = '✗ kategória: ' . $name . ' – ' . $r->get_error_message();
                return;
            }
            $tid = (int) $r['term_id'];
            $made++;
        } else {
            $tid = (int) $found->term_id;
            if ($force) {
                wp_update_term($tid, 'product_cat', ['name' => $name, 'parent' => $parent, 'description' => (string) ($c['desc']['sk'] ?? '')]);
            }
        }
        update_term_meta($tid, 'fv_key', $key);
        update_term_meta($tid, 'fv_en_name', (string) ($c['en'] ?? ''));
        update_term_meta($tid, 'fv_name_fr', (string) ($c['name']['fr'] ?? ''));
        if (isset($c['short'])) {
            update_term_meta($tid, 'fv_short_sk', (string) ($c['short']['sk'] ?? ''));
            update_term_meta($tid, 'fv_short_fr', (string) ($c['short']['fr'] ?? ''));
        }
        if (isset($c['desc']['fr'])) {
            update_term_meta($tid, 'fv_desc_fr', (string) $c['desc']['fr']);
        }
        foreach ((array) ($c['children'] ?? []) as $i => $ch) {
            $walk($ch, $tid);
        }
    };
    foreach ((array) firstvape_catalog('categories') as $i => $c) {
        $walk($c, 0);
    }
    // a fából kikerült kategóriák (pl. az Eldobható e-cigaretták, 2026-10-20) – csak a telepítő sajátjai (fv_key)
    $keys = array_keys(firstvape_cats_fresh());
    foreach ((array) get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false]) as $t) {
        $k = (string) get_term_meta($t->term_id, 'fv_key', true);
        if ($k !== '' && !in_array($k, $keys, true)) {
            wp_delete_term($t->term_id, 'product_cat');
            $log[] = '− kategória törölve (már nincs a fában): ' . $t->name;
        }
    }
    // a menü / fa sorrendje (WooCommerce: term order)
    $order = 0;
    foreach (array_keys(firstvape_cats_fresh()) as $k) {
        if ($t = firstvape_cats_fresh()[$k]) {
            update_term_meta($t->term_id, 'order', $order++);
        }
    }
    $log[] = '✓ kategóriák (' . $made . ' új)';
    return ['done' => true];
}

/** fv_key → kifejezés, gyorsítótár nélkül (a telepítő közben változik). */
function firstvape_cats_fresh(): array
{
    $map = [];
    foreach ((array) get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false]) as $t) {
        $k = (string) get_term_meta($t->term_id, 'fv_key', true);
        if ($k !== '') {
            $map[$k] = $t;
        }
    }
    $sorted = [];
    foreach ((array) firstvape_catalog('categories') as $c) {
        $sorted[$c['slug']] = $map[$c['slug']] ?? null;
        foreach ((array) ($c['children'] ?? []) as $ch) {
            $sorted[$ch['slug']] = $map[$ch['slug']] ?? null;
        }
    }
    return $sorted;
}

function firstvape_setup_brands(int $offset, bool $force, array &$log): array
{
    if (!taxonomy_exists('product_brand')) {
        $log[] = '✗ a product_brand taxonómia hiányzik (WooCommerce 9.6+ kell)';
        return ['done' => true];
    }
    $made = 0;
    foreach ((array) firstvape_catalog('brands') as $b) {
        $t = get_term_by('slug', (string) $b['slug'], 'product_brand');
        if (!$t) {
            $r = wp_insert_term((string) $b['name'], 'product_brand', ['slug' => (string) $b['slug'], 'description' => (string) ($b['desc']['sk'] ?? '')]);
            if (is_wp_error($r)) {
                $log[] = '✗ márka: ' . $b['name'] . ' – ' . $r->get_error_message();
                continue;
            }
            $tid = (int) $r['term_id'];
            $made++;
        } else {
            $tid = (int) $t->term_id;
            if ($force) {
                wp_update_term($tid, 'product_brand', ['name' => (string) $b['name'], 'description' => (string) ($b['desc']['sk'] ?? '')]);
            }
        }
        update_term_meta($tid, 'fv_color', (string) ($b['color'] ?? ''));
        update_term_meta($tid, 'fv_style', (string) ($b['style'] ?? 'heavy'));
        update_term_meta($tid, 'fv_desc_fr', (string) ($b['desc']['fr'] ?? ''));
    }
    $log[] = '✓ márkák (' . $made . ' új)';
    return ['done' => true];
}

/** Attribútum-érték(ek) a termékre: pa_* kifejezések létrehozása, WC_Product_Attribute lista. */
function firstvape_product_attributes(array $attrs): array
{
    $out = [];
    $pos = 0;
    foreach (FIRSTVAPE_ATTRS as $key => $tax) {
        $vals = (array) ($attrs[$key] ?? []);
        if (!$vals || !taxonomy_exists($tax)) {
            continue;
        }
        $ids = [];
        foreach ($vals as $v) {
            $v = (string) $v;
            $t = get_term_by('name', $v, $tax);
            if (!$t) {
                $r = wp_insert_term($v, $tax, ['slug' => sanitize_title(remove_accents($v))]);
                if (is_wp_error($r)) {
                    $existing = $r->get_error_data('term_exists');
                    if ($existing) {
                        $ids[] = (int) $existing;
                    }
                    continue;
                }
                $ids[] = (int) $r['term_id'];
            } else {
                $ids[] = (int) $t->term_id;
            }
        }
        $a = new WC_Product_Attribute();
        $a->set_id((int) wc_attribute_taxonomy_id_by_name($tax));
        $a->set_name($tax);
        $a->set_options($ids);
        $a->set_position($pos++);
        $a->set_visible(true);
        $a->set_variation(false);
        $out[$tax] = $a;
    }
    return $out;
}

function firstvape_setup_products(int $offset, bool $force, array &$log): array
{
    $all = firstvape_data('products');
    $total = count($all);
    $cats = firstvape_cats_fresh();
    if ($offset === 0) {
        firstvape_prune_products($all, $log);
    }
    foreach (array_slice($all, $offset, FIRSTVAPE_BATCH) as $row) {
        $sku = (string) $row['sku'];
        $id = (int) wc_get_product_id_by_sku($sku);
        $new = !$id;
        $p = $new ? new WC_Product_Simple() : wc_get_product($id);
        if (!$p) {
            $log[] = '✗ termék: ' . $sku;
            continue;
        }
        $hash = md5((string) $row['name'] . '|' . (string) ($row['short']['sk'] ?? ''));
        $stored = $new ? '' : (string) get_post_meta($id, 'fv_hash', true);
        $current = $new ? '' : md5($p->get_name() . '|' . wp_strip_all_tags($p->get_short_description()));
        $edited = !$new && $stored !== '' && $current !== $stored;
        if ($edited && !$force) {
            $log[] = '⚠ kihagyva (az adminban szerkesztették): ' . $p->get_name();
            continue;
        }
        $term_ids = [];
        foreach ((array) $row['cats'] as $k) {
            if (!empty($cats[$k])) {
                $term_ids[] = (int) $cats[$k]->term_id;
                $parent = (int) $cats[$k]->parent;
                if ($parent) {
                    $term_ids[] = $parent;
                }
            }
        }
        $term_ids = array_values(array_unique($term_ids));
        if (!$new && !$force && $stored === $hash) {
            // változatlan név / leírás – a kategória (pl. új alkategória) és a kép (az ügyfél cserélte) akkor is frissül
            $had = $p->get_category_ids();
            sort($had);
            $want = $term_ids;
            sort($want);
            if ($had !== $want) {
                $p->set_category_ids($term_ids);
                $p->save();
                $log[] = '↻ kategória: ' . $p->get_name();
            }
            firstvape_product_meta($id, $row);
            firstvape_product_image($id, $row, $log);
            firstvape_product_desc($id, $row, false, $log);
            continue;
        }
        $p->set_name((string) $row['name']);
        $p->set_slug((string) $row['slug']);
        $p->set_status('publish');
        $p->set_catalog_visibility('visible');
        $p->set_short_description((string) ($row['short']['sk'] ?? ''));
        $p->set_featured(!empty($row['featured']));
        if ($new || $force) {
            $p->set_sku($sku);
            $p->set_regular_price((string) $row['price']);
            if (!empty($row['sale'])) {
                $p->set_sale_price((string) $row['sale']);
            }
            $p->set_manage_stock(true);
            $p->set_stock_quantity((int) ($row['qty'] ?? 0));
            $p->set_stock_status(((int) ($row['qty'] ?? 0)) > 0 ? 'instock' : 'outofstock');
            $p->set_backorders('no');
            // a súly az ügyfél fájljában üres: kategóriánkénti becslés (csak a szállítási díjhoz), a valódi súly a kérdőívből
            if (!empty($row['weight'])) {
                $p->set_weight((string) round((float) $row['weight'] / 1000, 3)); // g → kg (a WooCommerce és a Packeta egysége)
            }
            $p->set_tax_status('taxable');
        }
        $p->set_category_ids($term_ids);
        $p->set_attributes(firstvape_product_attributes((array) ($row['attrs'] ?? [])));
        $id = $p->save();
        if (!$id) {
            $log[] = '✗ mentés: ' . $sku;
            continue;
        }
        if (!empty($row['brand'])) {
            wp_set_object_terms($id, (string) $row['brand'], 'product_brand');
        }
        firstvape_product_meta($id, $row);
        update_post_meta($id, 'fv_hash', $hash);
        firstvape_product_image($id, $row, $log);
        firstvape_product_desc($id, $row, $force, $log);
        $log[] = ($new ? '+ ' : '↻ ') . $row['name'];
    }
    $next = $offset + FIRSTVAPE_BATCH;
    if ($next >= $total) {
        firstvape_index_flush();
    }
    return ['done' => $next >= $total, 'offset' => min($next, $total), 'total' => $total];
}

/** A téma saját termékmetái (testvércsoport, típus, ízszín …) – a változatlan termékeknél is a termékfájl szerint. */
function firstvape_product_meta(int $id, array $row): void
{
    $meta = ['_fv_art' => (string) ($row['art'] ?? ''), '_fv_color' => (string) ($row['color'] ?? ''), '_fv_pop' => (int) ($row['pop'] ?? 0),
        '_fv_group' => (string) ($row['group'] ?? ''), '_fv_swatch' => (string) ($row['swatch'] ?? ''), '_fv_short_fr' => (string) ($row['short']['fr'] ?? ''),
        '_fv_weight_estimated' => empty($row['weight']) ? '' : 'yes'];
    foreach ($meta as $k => $v) {
        if ((string) get_post_meta($id, $k, true) !== (string) $v) {
            update_post_meta($id, $k, $v);
        }
    }
}

/** A termék képe a médiacsomagból – ha nincs képe, vagy a telepítő képe van rajta (a kézzel feltöltöttet nem cseréli). */
function firstvape_product_image(int $id, array $row, array &$log): void
{
    if (empty($row['img'])) {
        return;
    }
    $cur = (int) get_post_thumbnail_id($id);
    if ($cur && get_post_meta($cur, 'fv_media', true) === '') {
        return;
    }
    $att = firstvape_attach('p/' . basename((string) $row['img']), $id, (string) $row['name']);
    if (!$att) {
        if (!$cur) {
            $log[] = '! nincs kép a médiacsomagban: ' . basename((string) $row['img']);
        }
        return;
    }
    if ($att !== $cur) {
        set_post_thumbnail($id, $att);
        if ($cur) {
            $log[] = '↻ új kép: ' . $row['name'];
        }
    }
}

/**
 * A hosszú leírás (SK: post_content, FR: _fv_desc_fr) – ha üres, vagy még a telepítő korábbi szövege van benne
 * (fv_desc_hash); amit az adminban átírtak, azt csak --force írja felül.
 */
function firstvape_product_desc(int $id, array $row, bool $force, array &$log): void
{
    $sk = (string) ($row['desc']['sk'] ?? '');
    $fr = (string) ($row['desc']['fr'] ?? '');
    if ($sk === '' && $fr === '') {
        return;
    }
    $cur = (string) get_post_field('post_content', $id);
    $cur_fr = (string) get_post_meta($id, '_fv_desc_fr', true);
    $want = md5($sk . '|' . $fr);
    $prev = (string) get_post_meta($id, 'fv_desc_hash', true);
    if ($prev === $want && $cur === $sk && $cur_fr === $fr) {
        return;
    }
    $ours = ($cur === '' && $cur_fr === '') || ($prev !== '' && md5($cur . '|' . $cur_fr) === $prev);
    if (!$ours && !$force) {
        return;
    }
    wp_update_post(['ID' => $id, 'post_content' => $sk]);
    update_post_meta($id, '_fv_desc_fr', $fr);
    update_post_meta($id, 'fv_desc_hash', $want);
}

/**
 * A telepítő korábbi termékei (fv_hash), amelyek már nincsenek a termékfájlban (az ügyfél kivette, vagy új SKU-t kapott):
 * kukába (visszaállítható), a rendelések megmaradnak.
 */
function firstvape_prune_products(array $all, array &$log): void
{
    $skus = array_flip(array_map(fn($r) => (string) $r['sku'], $all));
    $ids = get_posts(['post_type' => 'product', 'post_status' => ['publish', 'draft', 'pending', 'private'], 'numberposts' => -1, 'fields' => 'ids', 'meta_key' => 'fv_hash']);
    foreach ($ids as $id) {
        $sku = (string) get_post_meta($id, '_sku', true);
        if (!isset($skus[$sku])) {
            wp_trash_post($id);
            $log[] = '− kukába (már nincs a termékfájlban): ' . get_post_field('post_title', $id) . ($sku !== '' ? ' (' . $sku . ')' : '');
        }
    }
}

/** Az ügyfél ajánlásai (a termékfájl Cross-sells oszlopa, SKU szerint) – a létező termékekre. */
function firstvape_setup_cross(int $offset, bool $force, array &$log): array
{
    $n = 0;
    foreach (firstvape_data('products') as $row) {
        if (empty($row['cross'])) {
            continue;
        }
        $id = (int) wc_get_product_id_by_sku((string) $row['sku']);
        $p = $id ? wc_get_product($id) : null;
        if (!$p) {
            continue;
        }
        $have = array_map('intval', $p->get_cross_sell_ids());
        // a telepítő saját ajánlásai frissülnek (az ügyfél javított fájlja); amit az adminban átírtak, azt csak --force
        $prev = get_post_meta($id, 'fv_cross', true);
        $ours = !$have || ($prev === '' ? get_post_meta($id, 'fv_hash', true) !== '' : $prev === implode(',', $have));
        if (!$ours && !$force) {
            continue;
        }
        $ids = array_values(array_filter(array_map(fn($s) => (int) wc_get_product_id_by_sku((string) $s), (array) $row['cross'])));
        if ($ids && $ids !== $have) {
            $p->set_cross_sell_ids($ids);
            $p->save();
            $n++;
        }
        if ($ids) {
            update_post_meta($id, 'fv_cross', implode(',', $ids));
        }
    }
    firstvape_index_flush();
    $log[] = '✓ ajánlások: ' . $n . ' termék';
    return ['done' => true];
}

/**
 * Oldalak. Piaconként: a jogi és információs oldalak (SK: Doprava a platba …, FR: Livraison et paiement, CGV …) és a
 * kapcsolat, párjukkal (fv_pair) összekötve. Közös: Úvod (nyitóoldal), Produkty (bolt), kosár, pénztár, fiók, Akcie,
 * Značky, Obľúbené, Blog – a címük a látogató nyelvén (fv_title_key).
 */
function firstvape_setup_pages(int $offset, bool $force, array &$log): array
{
    if (class_exists('WC_Install')) {
        WC_Install::create_pages();
    }
    $i18n = firstvape_data('i18n');
    $slugs = [
        'sk' => ['shipping' => 'doprava-a-platba', 'terms' => 'obchodne-podmienky', 'privacy' => 'ochrana-osobnych-udajov', 'withdrawal' => 'odstupenie-od-zmluvy', 'cookies' => 'subory-cookie', 'contact' => 'kontakt'],
        'fr' => ['shipping' => 'livraison-et-paiement', 'terms' => 'cgv', 'privacy' => 'politique-de-confidentialite', 'withdrawal' => 'droit-de-retractation', 'legal' => 'mentions-legales', 'cookies' => 'cookies', 'contact' => 'contact'],
    ];
    $map = ['sk' => [], 'fr' => [], '*' => []];
    // 1. kör: az oldalak (a linkek feloldásához előbb létezniük kell)
    foreach ($slugs as $lang => $keys) {
        foreach ($keys as $k => $slug) {
            $title = (string) ($i18n[$lang]['pageTitles'][$k] ?? $k);
            $content = $k === 'contact' ? '<!-- wp:firstvape/contact /-->' : '';
            $map[$lang][$k] = firstvape_upsert_post(['post_type' => 'page', 'post_title' => $title, 'post_name' => $slug, 'post_content' => $content], 'page-' . $lang . '-' . $k, $force, $log, ['fv_lang' => $lang, 'fv_page' => $k]);
        }
    }
    $shared = [
        'home' => ['Úvod', 'uvod', firstvape_home_content(), ''],
        'sale' => ['Akcie', 'akcie', '<!-- wp:firstvape/shop {"type":"sale"} /-->', 'sale'],
        'brands' => ['Značky', 'znacky', '<!-- wp:firstvape/brands /-->', 'brands'],
        'wishlist' => ['Obľúbené', 'oblubene', '<!-- wp:firstvape/wishlist /-->', 'wishlist'],
        'blog' => ['Blog', 'blog', '', 'blog'],
    ];
    foreach ($shared as $k => [$title, $slug, $content, $tkey]) {
        $map['*'][$k] = firstvape_upsert_post(['post_type' => 'page', 'post_title' => $title, 'post_name' => $slug, 'post_content' => $content], 'page-' . $k, $force, $log, $tkey !== '' ? ['fv_title_key' => $tkey] : []);
    }
    update_option('firstvape_pages', $map);
    // 2. kör: a jogi szövegek (helyőrző) blokkokként, a linkek már feloldhatók
    foreach ($slugs as $lang => $keys) {
        foreach ($keys as $k => $slug) {
            if ($k === 'contact' || empty($i18n['pages'][$lang][$k])) {
                continue;
            }
            $content = firstvape_with_lang($lang, fn() => firstvape_html_to_blocks((string) $i18n['pages'][$lang][$k]));
            firstvape_upsert_post(['post_type' => 'page', 'post_title' => (string) $i18n[$lang]['pageTitles'][$k], 'post_name' => $slug, 'post_content' => $content], 'page-' . $lang . '-' . $k, $force, $log, ['fv_lang' => $lang, 'fv_page' => $k]);
        }
    }
    // párok (nyelvváltó, hreflang)
    foreach ($slugs['sk'] as $k => $slug) {
        if (!empty($map['fr'][$k]) && !empty($map['sk'][$k])) {
            update_post_meta($map['sk'][$k], 'fv_pair', $map['fr'][$k]);
            update_post_meta($map['fr'][$k], 'fv_pair', $map['sk'][$k]);
        }
    }
    // a WooCommerce oldalainak címe a látogató nyelvén
    foreach (['shop' => 'allProducts', 'cart' => 'cart', 'checkout' => 'titleCheckout', 'myaccount' => 'myAccount'] as $wc => $tkey) {
        $pid = (int) wc_get_page_id($wc);
        if ($pid > 0) {
            update_post_meta($pid, 'fv_title_key', $tkey);
            // szlovák cím és cím (a WP-CLI angolul hozná létre: cart, checkout, my-account)
            $sk = ['shop' => ['Produkty', 'produkty'], 'cart' => ['Košík', 'kosik'], 'checkout' => ['Pokladňa', 'pokladna'], 'myaccount' => ['Môj účet', 'moj-ucet']][$wc];
            if (get_post_field('post_name', $pid) !== $sk[1]) {
                wp_update_post(['ID' => $pid, 'post_title' => $sk[0], 'post_name' => $sk[1]]);
            }
            // klasszikus (shortcode-os) kosár, pénztár és fiók – a WooCommerce 8.3+ blokkos oldalt hozna létre
            $sc = ['cart' => 'woocommerce_cart', 'checkout' => 'woocommerce_checkout', 'myaccount' => 'woocommerce_my_account'][$wc] ?? '';
            if ($sc !== '' && !has_shortcode((string) get_post_field('post_content', $pid), $sc)) {
                wp_update_post(['ID' => $pid, 'post_content' => "<!-- wp:shortcode -->\n[" . $sc . "]\n<!-- /wp:shortcode -->"]);
                $log[] = '↻ klasszikus ' . $wc . ' oldal ([' . $sc . '])';
            }
        }
    }
    if (!empty($map['sk']['terms'])) {
        update_option('woocommerce_terms_page_id', $map['sk']['terms']);
    }
    if (!empty($map['sk']['privacy'])) {
        update_option('wp_page_for_privacy_policy', $map['sk']['privacy']);
    }
    $log[] = '✓ oldalak';
    return ['done' => true];
}

/** A nyitóoldal blokkjai (az előnézet sorrendjében). */
function firstvape_home_content(): string
{
    $blocks = ['home-hero', 'home-categories', 'home-why', 'home-system', 'home-popular', 'home-sale', 'home-best', 'home-blog', 'home-brands'];
    return implode("\n\n", array_map(fn($b) => '<!-- wp:firstvape/' . $b . ' /-->', $blocks));
}

function firstvape_setup_posts(int $offset, bool $force, array &$log): array
{
    foreach ((array) firstvape_catalog('posts') as $b) {
        $ids = [];
        foreach (FIRSTVAPE_LANGS as $lang) {
            $tag = (string) ($b['tag'][$lang] ?? '');
            $cat = $tag !== '' ? (term_exists($tag, 'category') ?: wp_insert_term($tag, 'category')) : null;
            $cat_id = is_array($cat) ? (int) $cat['term_id'] : 0;
            $content = implode("\n\n", array_map(fn($p) => "<!-- wp:paragraph -->\n<p class=\"iu-text\">" . esc_html((string) $p) . "</p>\n<!-- /wp:paragraph -->", (array) ($b['body'][$lang] ?? [])));
            $ids[$lang] = firstvape_upsert_post([
                'post_type' => 'post', 'post_title' => (string) $b['title'][$lang], 'post_name' => $lang === 'sk' ? (string) $b['slug'] : sanitize_title(remove_accents((string) $b['title'][$lang])),
                'post_content' => $content, 'post_excerpt' => (string) ($b['excerpt'][$lang] ?? ''), 'post_date' => (string) $b['date'] . ' 10:00:00',
                'post_category' => $cat_id ? [$cat_id] : [],
            ], 'post-' . $lang . '-' . $b['slug'], $force, $log, ['fv_lang' => $lang, 'fv_color' => (string) ($b['color'] ?? '')]);
        }
        if ($ids['sk'] && $ids['fr']) {
            update_post_meta($ids['sk'], 'fv_pair', $ids['fr']);
            update_post_meta($ids['fr'], 'fv_pair', $ids['sk']);
        }
    }
    // a kikerült cikkek (pl. az eldobható e-cigarettás, 2026-10-20) kukába – csak a telepítő sajátjai (fv_key post-…)
    $keep = [];
    foreach ((array) firstvape_catalog('posts') as $b) {
        foreach (FIRSTVAPE_LANGS as $lang) {
            $keep['post-' . $lang . '-' . $b['slug']] = true;
        }
    }
    foreach (get_posts(['post_type' => 'post', 'post_status' => 'any', 'numberposts' => -1, 'meta_key' => 'fv_key']) as $post) {
        $k = (string) get_post_meta($post->ID, 'fv_key', true);
        if (str_starts_with($k, 'post-') && !isset($keep[$k])) {
            wp_trash_post($post->ID);
            $log[] = '− cikk kukába (már nincs az előnézetben): ' . $post->post_title;
        }
    }
    $log[] = '✓ cikkek';
    return ['done' => true];
}

function firstvape_setup_finish(int $offset, bool $force, array &$log): array
{
    $map = (array) get_option('firstvape_pages', []);
    if (!empty($map['*']['home'])) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', (int) $map['*']['home']);
    }
    if (!empty($map['*']['blog'])) {
        update_option('page_for_posts', (int) $map['*']['blog']);
    }
    // a minta „Hello world” bejegyzés és „Sample page” oldal ne maradjon
    foreach (get_posts(['post_type' => ['post', 'page'], 'post_status' => 'any', 'numberposts' => 10, 'name' => '', 'meta_query' => [['key' => 'fv_key', 'compare' => 'NOT EXISTS']], 'date_query' => [['before' => '-0 seconds']]]) as $p) {
        if (in_array($p->post_name, ['hello-world', 'sample-page', 'ahoj-svet', 'ukazkova-stranka', 'vzorova-stranka'], true)) {
            wp_delete_post($p->ID, true);
            $log[] = '− törölve a minta: ' . $p->post_title;
        }
    }
    flush_rewrite_rules(false);
    firstvape_index_flush();
    firstvape_index();
    update_option('firstvape_setup_version', FIRSTVAPE_SETUP_VERSION);
    $log[] = '✓ kész: ' . count(firstvape_index()) . ' termék az indexben';
    return ['done' => true];
}
