<?php
/**
 * Korellenőrzés a pénztárban (az ügyfél kérése, 2026-10-22): Szlovákiában a dohány- és kapcsolódó termékek
 * távértékesítésénél kötelező az életkor-ellenőrző rendszer (89/2016 Z. z.). Szolgáltató: Adulto (adulto.cz).
 *
 *   – a piaconként bekapcsolt (alapból: SK) boltban, ha a kosárban nikotint tartalmazó termék van (pa_nikotin > 0 mg,
 *     vagy a terméknél kézzel „mindig”), a rendelés csak sikeres ellenőrzéssel zárható le;
 *   – a pénztárban az Adulto widgetje (a szolgáltató szkriptje + <div class="adulto-cz" data-sitekey=…>), a szerver a
 *     rendeléskor a privát kulccsal lekérdezi az eredményt (api.result.adulto.cz, secret + response);
 *   – a rendeléshez: azonosító, időpont, mód, eredmény, a szolgáltató nyers válasza (_fv_av_*) + rendelési megjegyzés;
 *     az adminban oszlop, keresés az azonosítóra, CSV-export (SOI-ellenőrzéshez);
 *   – teszt mód (dev / staging): a widget helyett egy gomb, az eredmény „TEST-…” azonosítóval – élesben kikapcsolni.
 * A szolgáltató szkriptjének címe és a válasz mezőnevei a fejlesztői leírásából (adulto.cz/pro-vyvojare) állíthatók.
 */

defined('ABSPATH') || exit;

const FIRSTVAPE_AV_VERIFY_URL = 'https://api.result.adulto.cz/';

function firstvape_av_opt(string $key, $default = '')
{
    $o = (array) get_option('firstvape_av', []);
    return $o[$key] ?? $default;
}

/** Be van-e kapcsolva az adott piacon (és van-e mivel ellenőrizni: kulcsok vagy teszt mód). */
function firstvape_av_active(?string $lang = null): bool
{
    $lang = $lang ?? firstvape_lang();
    if (!in_array($lang, (array) firstvape_av_opt('markets', ['sk']), true)) {
        return false;
    }
    return firstvape_av_opt('test') || (firstvape_av_opt('public') !== '' && firstvape_av_opt('secret') !== '' && firstvape_av_opt('script') !== '');
}

/** Kell-e ellenőrzés ehhez a termékhez: kézi beállítás (_fv_age_verify: yes / no), különben nikotin > 0 mg. */
function firstvape_av_product_needs($product): bool
{
    if (!$product instanceof WC_Product) {
        return false;
    }
    $id = $product->get_parent_id() ?: $product->get_id();
    $manual = (string) get_post_meta($id, '_fv_age_verify', true);
    if ($manual === 'yes' || $manual === 'no') {
        return $manual === 'yes';
    }
    if (firstvape_av_opt('scope', 'nicotine') === 'all') {
        return true;
    }
    foreach (array_map('trim', explode(',', (string) $product->get_attribute('pa_nikotin'))) as $v) {
        if (preg_match('/(\d+(?:[.,]\d+)?)/', $v, $m) && (float) str_replace(',', '.', $m[1]) > 0) {
            return true;
        }
    }
    return false;
}

function firstvape_av_cart_needs(): bool
{
    if (!function_exists('WC') || !WC()->cart || !firstvape_av_active()) {
        return false;
    }
    foreach (WC()->cart->get_cart() as $item) {
        if (firstvape_av_product_needs($item['data'] ?? null)) {
            return true;
        }
    }
    return false;
}

/**
 * Az eredmény lekérdezése a szolgáltatótól. Vissza: ['ok' => bool|null (null = nem sikerült lekérdezni), 'id', 'time',
 * 'method', 'raw']. A titkos kulcs nem kerül a nyers válaszba.
 */
function firstvape_av_check(string $token): array
{
    if (firstvape_av_opt('test')) {
        $ok = str_starts_with($token, 'TEST-');
        return ['ok' => $ok, 'id' => $token, 'time' => gmdate('c'), 'method' => 'test', 'raw' => '{"mode":"test"}'];
    }
    $url = add_query_arg(['secret' => (string) firstvape_av_opt('secret'), 'response' => $token], (string) firstvape_av_opt('verify', FIRSTVAPE_AV_VERIFY_URL));
    $r = wp_remote_get($url, ['timeout' => 12]);
    if (is_wp_error($r) || wp_remote_retrieve_response_code($r) !== 200) {
        return ['ok' => null, 'id' => $token, 'time' => gmdate('c'), 'method' => '', 'raw' => is_wp_error($r) ? $r->get_error_message() : 'HTTP ' . wp_remote_retrieve_response_code($r)];
    }
    $body = (string) wp_remote_retrieve_body($r);
    $j = json_decode($body, true);
    if (!is_array($j)) {
        return ['ok' => null, 'id' => $token, 'time' => gmdate('c'), 'method' => '', 'raw' => substr($body, 0, 2000)];
    }
    $field = (string) firstvape_av_opt('field_adult', 'adultocz-verify-adult');
    $adult = $j[$field] ?? null;
    $pick = function (array $keys) use ($j) {
        foreach ($keys as $k) {
            if (isset($j[$k]) && is_scalar($j[$k]) && (string) $j[$k] !== '') {
                return (string) $j[$k];
            }
        }
        return '';
    };
    return [
        'ok' => $adult === true || $adult === 1 || in_array(strtolower((string) $adult), ['true', '1', 'yes'], true),
        'id' => $pick(['adultocz-uid', 'uid', 'id', 'verification_id']) ?: $token,
        'time' => $pick(['adultocz-verify-time', 'verified_at', 'time', 'date']) ?: gmdate('c'),
        'method' => $pick(['adultocz-verify-method', 'method', 'type']),
        'raw' => substr((string) wp_json_encode($j), 0, 4000),
    ];
}

// --------------------------------------------------------------------------------------------- pénztár

add_action('wp_enqueue_scripts', function () {
    if (function_exists('is_checkout') && is_checkout() && !is_order_received_page() && firstvape_av_cart_needs() && !firstvape_av_opt('test')) {
        wp_enqueue_script('firstvape-adulto', (string) firstvape_av_opt('script'), [], null, true);
    }
});

/** A doboz a megjegyzés alatt, a 18+ pipa előtt (nem az AJAX-szal újrarajzolt összesítőben – a widget állapota megmarad). */
add_action('woocommerce_after_order_notes', function () {
    if (!firstvape_av_cart_needs()) {
        return;
    }
    $lang = firstvape_lang();
    echo '<div class="fv-av" id="fv_av_field"><h3>' . esc_html((string) firstvape_t('avTitle')) . '</h3><p class="muted">' . esc_html((string) firstvape_t('avText')) . '</p>';
    if (firstvape_av_opt('test')) {
        echo '<input type="hidden" name="fv_av_token" id="fv_av_token" value="">' .
            '<button type="button" class="btn" data-fv-av-test>' . esc_html((string) firstvape_t('avTestBtn')) . '</button>' .
            '<p class="fv-av-ok" hidden>✓ ' . esc_html((string) firstvape_t('avOk')) . '</p>' .
            '<script>document.addEventListener("click",function(e){var b=e.target.closest("[data-fv-av-test]");if(!b)return;' .
            'document.getElementById("fv_av_token").value="TEST-"+Date.now();b.hidden=true;b.nextElementSibling.hidden=false;});</script>';
    } else {
        echo '<div class="adulto-cz" data-sitekey="' . esc_attr((string) firstvape_av_opt('public')) . '" data-adultocz="' . esc_attr((string) (int) firstvape_av_opt('age', 18)) . '" data-lang="' . esc_attr($lang) . '"></div>';
    }
    echo '</div>';
}, 5);

/** A token a widget rejtett mezőjéből (mezőnév állítható) vagy teszt módban a saját mezőből. */
function firstvape_av_posted_token(): string
{
    $field = (string) firstvape_av_opt('field_token', 'adultocz-uid');
    foreach ([$field, str_replace('-', '_', $field), 'fv_av_token'] as $k) {
        if (!empty($_POST[$k])) {
            return sanitize_text_field(wp_unslash((string) $_POST[$k]));
        }
    }
    return '';
}

add_action('woocommerce_after_checkout_validation', function ($data, WP_Error $errors) {
    if (!firstvape_av_cart_needs() || $errors->has_errors()) {
        return;
    }
    $token = firstvape_av_posted_token();
    if ($token === '') {
        $errors->add('fv_av', (string) firstvape_t('avErrMissing'), ['id' => 'fv_av_field']);
        return;
    }
    $res = firstvape_av_check($token);
    $GLOBALS['firstvape_av_result'] = $res;
    if ($res['ok'] === null) {
        $errors->add('fv_av', (string) firstvape_t('avErrApi'), ['id' => 'fv_av_field']);
    } elseif (!$res['ok']) {
        $errors->add('fv_av', (string) firstvape_t('avErrFail'), ['id' => 'fv_av_field']);
    }
}, 20, 2);

add_action('woocommerce_checkout_create_order', function (WC_Order $order) {
    $res = $GLOBALS['firstvape_av_result'] ?? null;
    if (!$res) {
        return;
    }
    $provider = firstvape_av_opt('test') ? 'test' : 'adulto';
    foreach (['_fv_av_required' => 'yes', '_fv_av_provider' => $provider, '_fv_av_id' => $res['id'], '_fv_av_time' => $res['time'],
              '_fv_av_method' => $res['method'], '_fv_av_result' => $res['ok'] ? 'ok' : 'fail', '_fv_av_raw' => $res['raw']] as $k => $v) {
        $order->update_meta_data($k, (string) $v);
    }
}, 20);

add_action('woocommerce_checkout_order_created', function (WC_Order $order) {
    if ($order->get_meta('_fv_av_required') !== 'yes') {
        return;
    }
    $order->add_order_note(sprintf('Overenie veku: %s (%s, ID %s, %s%s)', $order->get_meta('_fv_av_result') === 'ok' ? 'OK' : 'neúspešné',
        $order->get_meta('_fv_av_provider'), $order->get_meta('_fv_av_id'), $order->get_meta('_fv_av_time'),
        $order->get_meta('_fv_av_method') !== '' ? ', ' . $order->get_meta('_fv_av_method') : ''));
});

// ---------------------------------------------------------------------------------------------- admin

/** Termék: kézi felülírás (alapból a nikotin-attribútum dönt). */
add_action('woocommerce_product_options_general_product_data', function () {
    woocommerce_wp_select(['id' => '_fv_age_verify', 'label' => 'Korellenőrzés (18+)', 'desc_tip' => true,
        'description' => 'Automatikus: ha a termék nikotint tartalmaz (pa_nikotin > 0 mg). A pénztárban ilyenkor kötelező az Adulto-ellenőrzés.',
        'options' => ['' => 'Automatikus (nikotin szerint)', 'yes' => 'Mindig kell', 'no' => 'Nem kell']]);
});
add_action('woocommerce_admin_process_product_object', function (WC_Product $p) {
    $v = sanitize_key((string) ($_POST['_fv_age_verify'] ?? ''));
    $p->update_meta_data('_fv_age_verify', in_array($v, ['yes', 'no'], true) ? $v : '');
});

/** Rendelés: az ellenőrzés adatai a számlázási cím alatt. */
add_action('woocommerce_admin_order_data_after_billing_address', function (WC_Order $order) {
    if ($order->get_meta('_fv_av_required') !== 'yes') {
        return;
    }
    echo '<div class="fv-av-admin"><p><strong>Korellenőrzés:</strong> ' . esc_html($order->get_meta('_fv_av_result') === 'ok' ? 'sikeres' : 'sikertelen') .
        ' (' . esc_html((string) $order->get_meta('_fv_av_provider')) . ')<br>Azonosító: <code>' . esc_html((string) $order->get_meta('_fv_av_id')) . '</code><br>' .
        'Időpont: ' . esc_html((string) $order->get_meta('_fv_av_time')) . ($order->get_meta('_fv_av_method') !== '' ? '<br>Mód: ' . esc_html((string) $order->get_meta('_fv_av_method')) : '') . '</p></div>';
}, 20);

/** Rendeléslista: „Vek” oszlop (HPOS és régi lista). */
$fv_av_col = function (array $cols): array {
    $out = [];
    foreach ($cols as $k => $v) {
        $out[$k] = $v;
        if ($k === 'order_status') {
            $out['fv_av'] = 'Korellenőrzés';
        }
    }
    return $out + ['fv_av' => 'Korellenőrzés'];
};
$fv_av_cell = function ($order) {
    $order = $order instanceof WC_Order ? $order : wc_get_order($order);
    if (!$order || $order->get_meta('_fv_av_required') !== 'yes') {
        echo '–';
        return;
    }
    echo $order->get_meta('_fv_av_result') === 'ok' ? '<span title="' . esc_attr((string) $order->get_meta('_fv_av_id')) . '">✔ ' . esc_html((string) $order->get_meta('_fv_av_provider')) . '</span>' : '✘';
};
add_filter('manage_woocommerce_page_wc-orders_columns', $fv_av_col);
add_filter('manage_edit-shop_order_columns', $fv_av_col);
add_action('manage_woocommerce_page_wc-orders_custom_column', fn($col, $order) => $col === 'fv_av' && $fv_av_cell($order), 10, 2);
add_action('manage_shop_order_posts_custom_column', fn($col, $id) => $col === 'fv_av' && $fv_av_cell($id), 10, 2);

/** Keresés a rendelések között az ellenőrzés azonosítójára. */
add_filter('woocommerce_shop_order_search_fields', fn($f) => array_merge((array) $f, ['_fv_av_id']));
add_filter('woocommerce_order_table_search_query_meta_keys', fn($k) => array_merge((array) $k, ['_fv_av_id']));

/** CSV-export (SOI-ellenőrzéshez): Megjelenés → First Vape → Korellenőrzés. */
add_action('admin_post_firstvape_av_export', function () {
    if (!current_user_can('manage_woocommerce')) {
        wp_die('Nincs jogosultság.');
    }
    check_admin_referer('firstvape_av_export');
    $from = sanitize_text_field((string) ($_GET['from'] ?? ''));
    $to = sanitize_text_field((string) ($_GET['to'] ?? ''));
    $args = ['limit' => -1, 'orderby' => 'date', 'order' => 'ASC', 'type' => 'shop_order'];
    if ($from !== '' || $to !== '') {
        $args['date_created'] = ($from ?: '2000-01-01') . '...' . ($to ?: gmdate('Y-m-d'));
    }
    nocache_headers();
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="firstvape-overenie-veku-' . gmdate('Ymd') . '.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF");
    fputcsv($out, ['Objednávka', 'Dátum objednávky', 'Zákazník', 'E-mail', 'Krajina', 'Stav', 'Overenie veku', 'Poskytovateľ', 'ID overenia', 'Čas overenia', 'Spôsob'], ';');
    foreach (wc_get_orders($args) as $o) {
        if ($o->get_meta('_fv_av_required') !== 'yes') {
            continue;
        }
        fputcsv($out, [$o->get_order_number(), $o->get_date_created() ? $o->get_date_created()->date('Y-m-d H:i:s') : '', $o->get_formatted_billing_full_name(),
            $o->get_billing_email(), $o->get_billing_country(), $o->get_status(), $o->get_meta('_fv_av_result') === 'ok' ? 'úspešné' : 'neúspešné',
            $o->get_meta('_fv_av_provider'), $o->get_meta('_fv_av_id'), $o->get_meta('_fv_av_time'), $o->get_meta('_fv_av_method')], ';');
    }
    fclose($out);
    exit;
});

/** A First Vape admin oldal „Korellenőrzés” füle: beállítások + export. */
function firstvape_av_admin_tab(): void
{
    if (isset($_POST['firstvape_av_save']) && check_admin_referer('firstvape_av')) {
        $p = wp_unslash($_POST);
        $old = (array) get_option('firstvape_av', []);
        $new = [
            'markets' => array_values(array_intersect(['sk', 'fr'], (array) ($p['av_markets'] ?? []))),
            'public' => sanitize_text_field((string) ($p['av_public'] ?? '')),
            'secret' => ($p['av_secret'] ?? '') === '********' ? (string) ($old['secret'] ?? '') : sanitize_text_field((string) ($p['av_secret'] ?? '')),
            'script' => esc_url_raw((string) ($p['av_script'] ?? '')),
            'verify' => esc_url_raw((string) ($p['av_verify'] ?? '')) ?: FIRSTVAPE_AV_VERIFY_URL,
            'field_token' => sanitize_text_field((string) ($p['av_field_token'] ?? '')) ?: 'adultocz-uid',
            'field_adult' => sanitize_text_field((string) ($p['av_field_adult'] ?? '')) ?: 'adultocz-verify-adult',
            'age' => max(18, (int) ($p['av_age'] ?? 18)),
            'scope' => ($p['av_scope'] ?? '') === 'all' ? 'all' : 'nicotine',
            'test' => !empty($p['av_test']) ? 1 : 0,
        ];
        update_option('firstvape_av', $new, false);
        echo '<div class="notice notice-success"><p>Mentve.</p></div>';
    }
    $o = fn($k, $d = '') => firstvape_av_opt($k, $d);
    $row = fn($name, $label, $value, $help = '', $type = 'text') => '<tr><th><label for="' . esc_attr($name) . '">' . esc_html($label) . '</label></th><td><input class="regular-text" type="' . $type . '" id="' . esc_attr($name) . '" name="' . esc_attr($name) . '" value="' . esc_attr((string) $value) . '">' . ($help ? '<p class="description">' . esc_html($help) . '</p>' : '') . '</td></tr>';
    $markets = (array) $o('markets', ['sk']);
    echo '<p>Adulto korellenőrzés a pénztárban: ha a kosárban nikotint tartalmazó termék van, a rendelés csak sikeres ellenőrzéssel zárható le; ' .
        'az eredmény a rendeléshez kerül (azonosító, időpont, mód), a rendeléslistában oszlop, keresés az azonosítóra, lent CSV-export.</p>';
    echo '<form method="post">';
    wp_nonce_field('firstvape_av');
    echo '<table class="form-table">' .
        '<tr><th>Piacok</th><td><label><input type="checkbox" name="av_markets[]" value="sk"' . checked(in_array('sk', $markets, true), true, false) . '> SK (firstvape.sk)</label> &nbsp; ' .
        '<label><input type="checkbox" name="av_markets[]" value="fr"' . checked(in_array('fr', $markets, true), true, false) . '> FR</label></td></tr>' .
        $row('av_public', 'Nyilvános kulcs (sitekey)', $o('public'), 'az Adulto partner-portálján a domainhez (firstvape.sk) kapott nyilvános kulcs') .
        $row('av_secret', 'Privát kulcs (secret)', $o('secret') ? '********' : '', 'csak itt tároljuk (adatbázis), a repóba nem kerül', 'password') .
        $row('av_script', 'A widget szkriptjének címe', $o('script'), 'az Adulto fejlesztői leírásából (adulto.cz/pro-vyvojare)') .
        $row('av_verify', 'Ellenőrző API', $o('verify', FIRSTVAPE_AV_VERIFY_URL), 'GET ?secret=…&response=<token>') .
        $row('av_field_token', 'A token mezőneve a formban', $o('field_token', 'adultocz-uid')) .
        $row('av_field_adult', 'A válasz „nagykorú” mezője', $o('field_adult', 'adultocz-verify-adult')) .
        $row('av_age', 'Korhatár', $o('age', 18), '', 'number') .
        '<tr><th>Mely termékeknél</th><td><label><input type="radio" name="av_scope" value="nicotine"' . checked($o('scope', 'nicotine') !== 'all', true, false) . '> nikotint tartalmazó (pa_nikotin > 0 mg) – terméknél felülírható</label><br>' .
        '<label><input type="radio" name="av_scope" value="all"' . checked($o('scope', 'nicotine') === 'all', true, false) . '> minden termék</label></td></tr>' .
        '<tr><th>Teszt mód</th><td><label><input type="checkbox" name="av_test" value="1"' . checked((bool) $o('test'), true, false) . '> a widget helyett teszt gomb, „TEST-…” azonosító (dev / staging – élesben KI)</label></td></tr>' .
        '</table><p><button class="button button-primary" name="firstvape_av_save" value="1">Mentés</button></p></form>';
    echo '<h2>Export (SOI-ellenőrzéshez)</h2><form method="get" action="' . esc_url(admin_url('admin-post.php')) . '">' .
        '<input type="hidden" name="action" value="firstvape_av_export">' . wp_nonce_field('firstvape_av_export', '_wpnonce', false, false) .
        '<label>Ettől <input type="date" name="from"></label> <label>eddig <input type="date" name="to"></label> ' .
        '<button class="button">CSV letöltése</button></form>';
}
