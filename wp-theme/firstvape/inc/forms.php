<?php
/**
 * Űrlapok (űrlap-bővítmény nélkül): kapcsolat, hírlevél-feliratkozás, „Upozorniť ma” (elfogyott termék).
 *
 * - Beküldés JS-sel a REST-en: POST firstvape/v1/form/<contact|newsletter|notify> (rest_url() – az iu_theme egyedi
 *   REST-előtagja miatt).
 * - Védelem: rejtett csapdamező, legalább 3 mp kitöltési idő, IP-nkénti korlát (10 / óra, firstvape_form_rate_limit).
 * - Minden beküldés megmarad az adminban (First Vape → Beküldések); a kapcsolati üzenet levélben a bolt címére megy
 *   (Reply-To a kitöltőé). A hírlevél-feliratkozók itt gyűlnek, amíg a hírlevélküldő nincs kiválasztva (kérdéssor).
 * - Az „Upozorniť ma” feliratkozás: amikor a termék újra raktárra kerül, a téma a feliratkozó nyelvén levelet küld.
 */

defined('ABSPATH') || exit;

const FIRSTVAPE_MSG = 'fv_message';

add_action('init', function () {
    register_post_type(FIRSTVAPE_MSG, [
        'labels' => ['name' => 'Beküldések', 'singular_name' => 'Beküldés', 'menu_name' => 'Beküldések', 'edit_item' => 'Beküldés', 'search_items' => 'Keresés a beküldésekben', 'not_found' => 'Nincs beküldés.'],
        'public' => false, 'show_ui' => true, 'show_in_menu' => true, 'menu_icon' => 'dashicons-email-alt', 'menu_position' => 58,
        'supports' => ['title'], 'capability_type' => 'post', 'capabilities' => ['create_posts' => 'do_not_allow'], 'map_meta_cap' => true,
    ]);
});

/** Rejtett csapdamező és időbélyeg (az űrlapba). */
function firstvape_form_trap(): string
{
    return '<div class="hp" aria-hidden="true"><label>Web<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>'
        . '<input type="hidden" name="ts" value="' . esc_attr((string) time()) . '">';
}

function firstvape_form_ip(): string
{
    $ip = (string) ($_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '');
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
}

/**
 * @return array{ok:bool, message?:string, errors?:array}
 */
function firstvape_handle_form(string $kind, array $p): array
{
    if (!in_array($kind, ['contact', 'newsletter', 'notify'], true)) {
        return ['ok' => false, 'errors' => ['form' => 'unknown form']];
    }
    // Csapda: a robot kitölti a rejtett mezőt, vagy azonnal küld. Ilyenkor „sikert” mondunk, de nem mentünk.
    if (!empty($p['website']) || (time() - (int) ($p['ts'] ?? 0)) < 3) {
        return ['ok' => true];
    }
    $rl = 'firstvape_form_' . md5(firstvape_form_ip());
    $n = (int) get_transient($rl);
    if ($n >= (int) apply_filters('firstvape_form_rate_limit', 10)) {
        return ['ok' => false, 'errors' => ['form' => firstvape_lang() === 'fr' ? 'Trop d’envois. Réessayez dans une heure.' : 'Príliš veľa odoslaní. Skús to znova o hodinu.']];
    }
    $name = sanitize_text_field((string) ($p['your-name'] ?? ''));
    $email = sanitize_email((string) ($p['email'] ?? ''));
    $message = sanitize_textarea_field((string) ($p['message'] ?? ''));
    $order = sanitize_text_field((string) ($p['order'] ?? ''));
    $product = (int) ($p['product'] ?? 0) && function_exists('wc_get_product') ? wc_get_product((int) $p['product']) : null;
    $errors = [];
    if (!is_email($email)) {
        $errors['email'] = (string) firstvape_t('errEmail');
    }
    if ($kind === 'contact') {
        if ($name === '') {
            $errors['your-name'] = (string) firstvape_t('errField');
        }
        if ($message === '') {
            $errors['message'] = (string) firstvape_t('errField');
        }
    } elseif ($kind === 'newsletter') {
        if (empty($p['accept'])) {
            $errors['accept'] = (string) firstvape_t('errCheck');
        }
    } elseif (!$product) {
        $errors['form'] = 'product not found';
    }
    if ($errors) {
        return ['ok' => false, 'errors' => $errors];
    }
    if ($kind === 'newsletter') {
        $dup = get_posts(['post_type' => FIRSTVAPE_MSG, 'numberposts' => 1, 'fields' => 'ids', 'meta_query' => [['key' => 'kind', 'value' => 'newsletter'], ['key' => 'email', 'value' => $email]]]);
        if ($dup) {
            return ['ok' => true];
        }
    }
    $titles = ['contact' => 'Üzenet', 'newsletter' => 'Hírlevél', 'notify' => 'Értesítést kér'];
    $id = wp_insert_post(['post_type' => FIRSTVAPE_MSG, 'post_status' => 'publish', 'post_title' => $titles[$kind] . ': ' . ($name !== '' ? $name . ' <' . $email . '>' : $email) . ($product ? ' – ' . $product->get_name() : '')], true);
    if (is_wp_error($id)) {
        return ['ok' => false, 'errors' => ['form' => (string) firstvape_t('error')]];
    }
    $fields = array_filter(['Név' => $name, 'E-mail' => $email, 'Rendelésszám' => $order, 'Üzenet' => $message, 'Termék' => $product ? $product->get_name() . ' (' . $product->get_sku() . ')' : '', 'Piac' => strtoupper(firstvape_lang())]);
    update_post_meta($id, 'kind', $kind);
    update_post_meta($id, 'email', $email);
    update_post_meta($id, 'lang', firstvape_lang());
    update_post_meta($id, 'fields', $fields);
    update_post_meta($id, 'ip', firstvape_form_ip());
    if ($product) {
        update_post_meta($id, 'product', $product->get_id());
        update_post_meta($id, 'notify_status', 'waiting');
    }
    set_transient($rl, $n + 1, HOUR_IN_SECONDS);
    if ($kind === 'contact') {
        $to = (string) get_option('firstvape_email', get_option('admin_email'));
        $body = '';
        foreach ($fields as $k => $v) {
            $body .= $k . ': ' . $v . "\n";
        }
        wp_mail($to, 'First Vape – ' . $titles[$kind] . ': ' . $name, $body, ['Reply-To: ' . $name . ' <' . $email . '>']);
    }
    return ['ok' => true];
}

add_action('rest_api_init', function () {
    register_rest_route('firstvape/v1', '/form/(?P<kind>contact|newsletter|notify)', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $r) {
            $lang = (string) $r->get_param('lang');
            $p = array_map(fn($v) => is_string($v) ? wp_unslash($v) : $v, (array) $r->get_body_params());
            $res = firstvape_with_lang(in_array($lang, FIRSTVAPE_LANGS, true) ? $lang : 'sk', fn() => firstvape_handle_form((string) $r['kind'], $p));
            return new WP_REST_Response($res, $res['ok'] ? 200 : 422);
        },
    ]);
});

/** Újra raktáron: levél a feliratkozóknak (a nyelvükön), a feliratkozás lezárul. */
add_action('woocommerce_product_set_stock_status', function ($product_id, $status) {
    if ($status !== 'instock' || !firstvape_lock('notify_' . $product_id, 60)) {
        return;
    }
    $subs = get_posts(['post_type' => FIRSTVAPE_MSG, 'numberposts' => 200, 'fields' => 'ids', 'meta_query' => [['key' => 'product', 'value' => (int) $product_id], ['key' => 'notify_status', 'value' => 'waiting']]]);
    $product = wc_get_product($product_id);
    if (!$product) {
        return;
    }
    foreach ($subs as $sid) {
        $email = (string) get_post_meta($sid, 'email', true);
        $lang = (string) get_post_meta($sid, 'lang', true) ?: 'sk';
        firstvape_with_lang($lang, function () use ($email, $product, $lang) {
            $subject = $lang === 'fr' ? 'De retour en stock : ' . $product->get_name() : 'Opäť skladom: ' . $product->get_name();
            $body = ($lang === 'fr' ? "Bonjour,\n\nle produit que vous attendiez est de nouveau disponible :\n" : "Ahoj,\n\nprodukt, na ktorý čakáš, je opäť skladom:\n") . $product->get_name() . "\n" . firstvape_lang_url($lang, (string) get_permalink($product->get_id())) . "\n\nFirst Vape";
            wp_mail($email, $subject, $body);
        });
        update_post_meta($sid, 'notify_status', 'sent');
        update_post_meta($sid, 'notify_sent', current_time('mysql'));
    }
}, 20, 2);

/** A beküldés adatai az adminban. */
add_action('add_meta_boxes_' . FIRSTVAPE_MSG, function () {
    add_meta_box('fv-msg', 'Adatok', function ($post) {
        echo '<table class="widefat striped"><tbody>';
        foreach ((array) get_post_meta($post->ID, 'fields', true) as $k => $v) {
            echo '<tr><th style="width:140px">' . esc_html((string) $k) . '</th><td>' . nl2br(esc_html((string) $v)) . '</td></tr>';
        }
        $st = (string) get_post_meta($post->ID, 'notify_status', true);
        if ($st !== '') {
            echo '<tr><th>Értesítés</th><td>' . esc_html($st === 'sent' ? 'elküldve (' . get_post_meta($post->ID, 'notify_sent', true) . ')' : 'vár (amikor a termék raktárra kerül)') . '</td></tr>';
        }
        echo '<tr><th>Beküldve</th><td>' . esc_html(get_the_date('Y-m-d H:i', $post)) . ' · ' . esc_html((string) get_post_meta($post->ID, 'ip', true)) . '</td></tr></tbody></table>';
    }, FIRSTVAPE_MSG, 'normal', 'high');
});
add_filter('manage_' . FIRSTVAPE_MSG . '_posts_columns', fn($c) => ['cb' => $c['cb'] ?? '', 'title' => 'Beküldés', 'fv_kind' => 'Fajta', 'date' => 'Dátum']);
add_action('manage_' . FIRSTVAPE_MSG . '_posts_custom_column', function ($col, $id) {
    if ($col === 'fv_kind') {
        echo esc_html(['contact' => 'Kapcsolat', 'newsletter' => 'Hírlevél', 'notify' => 'Értesítést kér'][(string) get_post_meta($id, 'kind', true)] ?? '–');
    }
}, 10, 2);
