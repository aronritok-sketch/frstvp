<?php
/**
 * WooCommerce: klasszikus (shortcode-os) kosár, pénztár és fiók, a kinézet a téma CSS-éből (wp.css).
 *
 * - Piac a domain szerint: SK = Szlovákia (23 % DPH), FR = Franciaország (20 % TVA); a pénztárban csak a piac országa
 *   választható, az ÁFA a vásárló országa szerint (az árak bruttóként, SK alapon – a nettó állandó).
 * - Pénztár az előnézet szerint: elöl az e-mail és a telefon, cégként vásárlás pipával (IČO / DIČ / IČ DPH, illetve
 *   SIRET / TVA), 18+ megerősítés, utánvét díja, eltérő szállítási cím (a WooCommerce sajátja), mezőnkénti hibaüzenet.
 * - A rendelés nyelve (_fv_lang) a domainé: a későbbi levelek is ezen a nyelven mennek.
 */

defined('ABSPATH') || exit;

/** A WooCommerce saját CSS-e nem kell: a kosár, a pénztár és a fiók kinézete a wp.css-ben (sötét felület). */
add_filter('woocommerce_enqueue_styles', '__return_empty_array');
add_action('wp_enqueue_scripts', function () {
    foreach (['wc-blocks-style', 'wc-blocks-vendors-style', 'wc-block-style', 'woocommerce-inline'] as $h) {
        wp_dequeue_style($h);
    }
}, 100);

add_action('init', function () {
    remove_action('woocommerce_before_main_content', 'woocommerce_breadcrumb', 20);
    remove_action('woocommerce_sidebar', 'woocommerce_get_sidebar', 10);
    // a kosár alatti „Érdekelhet” lista helyett a téma ajánlói (a termékoldalon)
    remove_action('woocommerce_cart_collaterals', 'woocommerce_cross_sell_display');
});

/**
 * A WooCommerce a termék- és kategóriaoldalakhoz a saját sablonját töltené: az iu_woocommerce mu-plugin nélkül itt
 * irányítjuk vissza a keretrendszer index.php-jára (iu-theme skill: márka-archívum buktató).
 */
add_filter('template_include', function ($template) {
    if (function_exists('is_woocommerce') && (is_woocommerce() || is_product_taxonomy())) {
        return get_template_directory() . '/index.php';
    }
    return $template;
}, 100);

/* ------------------------------------------------------------------------------------------------ piac */

function firstvape_market_country(): string
{
    return (string) (firstvape_market()['code'] ?? 'SK');
}

/** A pénztárban (számlázás és szállítás) csak a piac országa (az .sk-n Szlovákia, az .fr-en Franciaország). */
add_filter('woocommerce_countries_allowed_countries', function ($countries) {
    if (is_admin() && !wp_doing_ajax()) {
        return $countries;
    }
    $c = firstvape_market_country();
    $all = WC()->countries ? WC()->countries->get_countries() : [];
    return isset($all[$c]) ? [$c => $all[$c]] : $countries;
});
add_filter('woocommerce_countries_shipping_countries', function ($countries) {
    if (is_admin() && !wp_doing_ajax()) {
        return $countries;
    }
    $c = firstvape_market_country();
    $all = WC()->countries ? WC()->countries->get_countries() : [];
    return isset($all[$c]) ? [$c => $all[$c]] : $countries;
});
add_filter('default_checkout_billing_country', 'firstvape_market_country');
add_filter('default_checkout_shipping_country', 'firstvape_market_country');
add_filter('woocommerce_customer_default_location_array', function ($loc) {
    if (is_admin() && !wp_doing_ajax()) {
        return $loc;
    }
    return ['country' => firstvape_market_country(), 'state' => '', 'postcode' => '', 'city' => ''];
});

/** A vásárló (munkamenet) országa mindig a piacé: így az ÁFA és a szállítás a domainhez igazodik. */
add_action('woocommerce_init', function () {
    if (is_admin() && !wp_doing_ajax() || !function_exists('WC') || !WC()->customer) {
        return;
    }
    $c = firstvape_market_country();
    if (WC()->customer->get_billing_country() !== $c) {
        WC()->customer->set_billing_country($c);
    }
    if (WC()->customer->get_shipping_country() !== $c) {
        WC()->customer->set_shipping_country($c);
    }
});
add_action('woocommerce_cart_loaded_from_session', function () {
    $c = firstvape_market_country();
    if (WC()->customer && (WC()->customer->get_billing_country() !== $c || WC()->customer->get_shipping_country() !== $c)) {
        WC()->customer->set_billing_country($c);
        WC()->customer->set_shipping_country($c);
    }
});

/* ------------------------------------------------------------------------------------------------ pénztár */

/** Mezők az előnézet sorrendjében; a megye és a második címsor nem kell. */
add_filter('woocommerce_checkout_fields', function (array $f): array {
    $m = firstvape_market();
    $b = &$f['billing'];
    $order = ['billing_email' => 10, 'billing_phone' => 20, 'billing_first_name' => 30, 'billing_last_name' => 40, 'fv_company_toggle' => 45,
        'billing_company' => 50, 'billing_fv_id' => 51, 'billing_fv_vat' => 52, 'billing_country' => 60, 'billing_postcode' => 70, 'billing_city' => 80, 'billing_address_1' => 90];
    unset($b['billing_address_2'], $b['billing_state']);
    $b['billing_email']['class'] = ['form-row-first'];
    $b['billing_phone']['class'] = ['form-row-last'];
    $b['billing_phone']['required'] = true;
    $b['billing_phone']['placeholder'] = (string) ($m['phonePh'] ?? '');
    $b['billing_postcode']['placeholder'] = (string) ($m['zipPh'] ?? '');
    $b['billing_postcode']['class'] = ['form-row-first'];
    $b['billing_city']['class'] = ['form-row-last'];
    $b['billing_address_1']['placeholder'] = '';
    $b['billing_address_1']['label'] = (string) firstvape_t('street');
    $b['fv_company_toggle'] = ['type' => 'checkbox', 'label' => (string) firstvape_t('buyAsCompany'), 'required' => false, 'class' => ['form-row-wide', 'fv-company-toggle']];
    $b['billing_company']['required'] = false;
    $b['billing_company']['class'] = ['form-row-wide', 'fv-company'];
    $b['billing_company']['label'] = (string) firstvape_t('companyName');
    $ids = (array) ($m['companyIds'] ?? ['IČO', 'DIČ / IČ DPH']);
    $b['billing_fv_id'] = ['label' => (string) ($ids[0] ?? ''), 'required' => false, 'class' => ['form-row-first', 'fv-company'], 'autocomplete' => 'off'];
    $b['billing_fv_vat'] = ['label' => (string) ($ids[1] ?? ''), 'required' => false, 'class' => ['form-row-last', 'fv-company'], 'autocomplete' => 'off'];
    foreach ($order as $k => $p) {
        if (isset($b[$k])) {
            $b[$k]['priority'] = $p;
        }
    }
    unset($b);
    uasort($f['billing'], fn($a, $c) => ($a['priority'] ?? 99) <=> ($c['priority'] ?? 99));
    unset($f['shipping']['shipping_address_2'], $f['shipping']['shipping_state'], $f['shipping']['shipping_company']);
    if (isset($f['shipping']['shipping_postcode'])) {
        $f['shipping']['shipping_postcode']['class'] = ['form-row-first'];
        $f['shipping']['shipping_postcode']['placeholder'] = (string) ($m['zipPh'] ?? '');
        $f['shipping']['shipping_city']['class'] = ['form-row-last'];
        $f['shipping']['shipping_address_1']['placeholder'] = '';
        $f['shipping']['shipping_address_1']['label'] = (string) firstvape_t('street');
    }
    if (isset($f['order']['order_comments'])) {
        $f['order']['order_comments']['placeholder'] = (string) firstvape_t('notePh');
        $f['order']['order_comments']['label'] = (string) firstvape_t('noteLabel');
    }
    return $f;
}, 20);
add_filter('pre_option_woocommerce_checkout_phone_field', fn() => 'required');
add_filter('pre_option_woocommerce_checkout_address_2_field', fn() => 'hidden');
add_filter('pre_option_woocommerce_checkout_company_field', fn() => 'optional');

/**
 * A címmezők sorrendje (a WooCommerce address-i18n.js a mezőket a priority szerint rendezi át a böngészőben is):
 * név, cég, ország, irányítószám, város, utca – az előnézet szerint.
 */
add_filter('woocommerce_default_address_fields', function (array $f): array {
    foreach (['first_name' => 30, 'last_name' => 40, 'company' => 50, 'country' => 60, 'postcode' => 70, 'city' => 80, 'address_1' => 90] as $k => $p) {
        if (isset($f[$k])) {
            $f[$k]['priority'] = $p;
        }
    }
    unset($f['address_2'], $f['state']);
    return $f;
});

/** Rövid hibaüzenet a mező alatt („Vyplň toto pole.”) – a felső lista helyén egy összefoglaló (site.js). */
add_filter('woocommerce_checkout_required_field_notice', fn() => (string) firstvape_t('errField'));

/** Az adatvédelmi tájékoztató szövege a pénztárban és a regisztrációnál, a piac nyelvén. */
add_filter('woocommerce_get_privacy_policy_text', function ($text, $type) {
    return firstvape_lang() === 'fr'
        ? 'Vos données personnelles sont utilisées pour traiter votre commande et pour les autres finalités décrites dans notre [privacy_policy].'
        : 'Tvoje osobné údaje použijeme na spracovanie objednávky a na ďalšie účely opísané v [privacy_policy].';
}, 10, 2);

/** A megye sehol nem kell (SK, FR); a címsor felirata a téma szövege. */
add_filter('woocommerce_get_country_locale', function (array $locale): array {
    foreach (['SK', 'FR'] as $c) {
        $locale[$c]['state'] = ['required' => false, 'hidden' => true];
    }
    return $locale;
});

/** Cégként vásárlásnál a cégnév és az azonosító kötelező; 18+ megerősítés; irányítószám a piac formájában. */
add_action('woocommerce_after_checkout_validation', function ($data, WP_Error $errors) {
    if (!empty($_POST['fv_company_toggle'])) {
        if (trim((string) ($data['billing_company'] ?? '')) === '') {
            $errors->add('billing_company_required', (string) firstvape_t('errField'), ['id' => 'billing_company']);
        }
        if (trim((string) ($_POST['billing_fv_id'] ?? '')) === '') {
            $errors->add('billing_fv_id_required', (string) firstvape_t('errField'), ['id' => 'billing_fv_id']);
        }
    }
    if (empty($_POST['fv_age_confirm'])) {
        $errors->add('fv_age_confirm', (string) firstvape_t('errCheck'), ['id' => 'fv_age_confirm']);
    }
    $re = firstvape_lang() === 'fr' ? '/^\d{5}$/' : '/^\d{3}\s?\d{2}$/';
    foreach (['billing', 'shipping'] as $t) {
        $pc = trim((string) ($data[$t . '_postcode'] ?? ''));
        if ($pc !== '' && !preg_match($re, $pc) && ($t === 'billing' || !empty($data['ship_to_different_address']))) {
            $errors->add($t . '_postcode_validation', (string) firstvape_t('errZip'), ['id' => $t . '_postcode']);
        }
    }
}, 10, 2);

/**
 * 18+ megerősítés a megjegyzés alatt (az előnézet szerint). Nem az összesítőben: azt a WooCommerce AJAX-szal újrarajzolja
 * (pl. irányítószám beírása után), és a pipa elveszne. Az ÁSZF-pipa a WooCommerce sajátja (annak állapotát megőrzi).
 */
add_action('woocommerce_after_order_notes', function () {
    echo '<p class="form-row validate-required fv-age" id="fv_age_confirm_field"><label class="woocommerce-form__label woocommerce-form__label-for-checkbox checkbox"><input type="checkbox" class="woocommerce-form__input woocommerce-form__input-checkbox input-checkbox" name="fv_age_confirm" id="fv_age_confirm" value="1"> <span>' . esc_html((string) firstvape_t('confirm18')) . '</span>&nbsp;<abbr class="required" aria-hidden="true">*</abbr></label></p>';
});

add_action('woocommerce_checkout_create_order', function (WC_Order $order, array $data) {
    $order->update_meta_data('_fv_lang', firstvape_lang());
    $order->update_meta_data('_fv_age_confirmed', !empty($_POST['fv_age_confirm']) ? 'yes' : 'no');
    if (!empty($_POST['fv_company_toggle'])) {
        foreach (['billing_fv_id' => '_billing_fv_id', 'billing_fv_vat' => '_billing_fv_vat'] as $k => $meta) {
            $v = sanitize_text_field(wp_unslash((string) ($_POST[$k] ?? '')));
            if ($v !== '') {
                $order->update_meta_data($meta, $v);
            }
        }
    } else {
        $order->set_billing_company('');
    }
}, 10, 2);

add_action('woocommerce_admin_order_data_after_billing_address', function (WC_Order $order) {
    $ids = (array) (firstvape_market((string) $order->get_meta('_fv_lang') ?: 'sk')['companyIds'] ?? []);
    foreach (['_billing_fv_id' => 0, '_billing_fv_vat' => 1] as $meta => $i) {
        $v = (string) $order->get_meta($meta);
        if ($v !== '') {
            echo '<p><strong>' . esc_html((string) ($ids[$i] ?? $meta)) . ':</strong> ' . esc_html($v) . '</p>';
        }
    }
    echo '<p><strong>Piac / nyelv:</strong> ' . esc_html(strtoupper((string) $order->get_meta('_fv_lang') ?: 'sk')) . ' · 18+: ' . esc_html((string) $order->get_meta('_fv_age_confirmed') ?: '–') . '</p>';
});

/**
 * A rendelés későbbi levelei (pl. az adminban „teljesítve”) a rendelés nyelvén: az állapotváltás idejére a rendelés
 * nyelvére váltunk (a WooCommerce a leveleket ezen belül küldi), utána vissza.
 */
add_action('woocommerce_order_status_changed', function ($id) {
    $order = wc_get_order($id);
    $lang = $order ? (string) $order->get_meta('_fv_lang') : '';
    if ($lang !== '' && $lang !== firstvape_lang()) {
        switch_to_locale(firstvape_locale($lang));
        $GLOBALS['firstvape_lang_override'] = $lang;
        $GLOBALS['firstvape_lang_switched'] = true;
    }
}, 1);
add_action('woocommerce_order_status_changed', function () {
    if (!empty($GLOBALS['firstvape_lang_switched'])) {
        restore_previous_locale();
        unset($GLOBALS['firstvape_lang_override'], $GLOBALS['firstvape_lang_switched']);
    }
}, 9999);

/* ------------------------------------------------------------------------------------------------ utánvét díja */

function firstvape_cod_fee(): float
{
    $o = get_option('firstvape_cod_fee_' . firstvape_lang(), '');
    return $o !== '' && is_numeric($o) ? (float) $o : (float) (firstvape_market()['codFee'] ?? 0);
}

add_action('woocommerce_cart_calculate_fees', function (WC_Cart $cart) {
    if (is_admin() && !wp_doing_ajax()) {
        return;
    }
    $chosen = WC()->session ? (string) WC()->session->get('chosen_payment_method') : '';
    if ($chosen === 'cod' && firstvape_cod_fee() > 0) {
        // a díj bruttó (a vásárló ezt látja); a WooCommerce a díjat nettóként kezeli, ezért visszaszámoljuk
        $rates = WC_Tax::get_rates('', WC()->customer);
        $rate = $rates ? (float) reset($rates)['rate'] : 0.0;
        $cart->add_fee((string) firstvape_t('codFee'), round(firstvape_cod_fee() / (1 + $rate / 100), 4), true);
    }
});
/** A fizetési mód váltásakor az összesítő újraszámol (a díj miatt). */
add_action('woocommerce_review_order_before_payment', function () {
    echo '<input type="hidden" name="fv_pay_refresh" value="1">';
});

/* ------------------------------------------------------------------------------------------------ lépések, üres kosár */

add_action('woocommerce_before_cart', fn() => print(firstvape_steps(1)), 1);
add_action('woocommerce_before_checkout_form', fn() => print(firstvape_steps(2)), 1);
add_action('woocommerce_before_thankyou', fn() => print(firstvape_steps(4)), 1);
add_action('woocommerce_cart_is_empty', function () {
    echo '<div class="empty big">' . firstvape_icon('bag', 'empty-ico') . '<h1>' . firstvape_t('cartEmptyH') . '</h1><p>' . firstvape_t('cartEmptyP') . '</p><a class="btn btn-primary" href="' . esc_url(firstvape_cat_url('eldobhato')) . '">' . esc_html((string) (firstvape_cat('eldobhato')['short'] ?? '')) . '</a></div>';
}, 5);
remove_action('woocommerce_cart_is_empty', 'wc_empty_cart_message', 10);
add_filter('woocommerce_return_to_shop_redirect', fn() => home_url('/'));

/** A kosár / pénztár oldal címe (H1) a WooCommerce tartalma előtt. */
add_action('woocommerce_before_cart_table', fn() => print('<h1 class="h-page">' . esc_html((string) firstvape_t('cart')) . ' <span class="muted num">(' . esc_html(firstvape_nw('wItems', firstvape_cart_count())) . ')</span></h1>'), 1);
add_action('woocommerce_checkout_before_customer_details', fn() => print('<h1 class="h-page">' . esc_html((string) firstvape_t('titleCheckout')) . '</h1>'), 1);

/* ------------------------------------------------------------------------------------------------ AJAX: fejléc és kosár-fiók */

add_filter('woocommerce_add_to_cart_fragments', function (array $fragments): array {
    $n = firstvape_cart_count();
    $fragments['[data-minicart]'] = firstvape_minicart_html();
    $fragments['[data-cart-count]'] = '<em class="badge" data-cart-count' . ($n ? '' : ' hidden') . '>' . $n . '</em>';
    $fragments['[data-cart-total]'] = '<span data-cart-total>' . esc_html(firstvape_money(firstvape_cart_total())) . '</span>';
    return $fragments;
});

/** Kosárba téve a termékoldalról (JS nélkül) ne a WooCommerce „Kosár megtekintése” sávja legyen, hanem a téma üzenete. */
add_filter('wc_add_to_cart_message_html', function ($message, $products) {
    $names = [];
    foreach ((array) $products as $id => $qty) {
        $names[] = ($qty > 1 ? $qty . ' × ' : '') . get_the_title((int) $id);
    }
    return firstvape_t('addedToCart', ['x' => esc_html(implode(', ', $names))]) . ' <a href="' . esc_url(wc_get_cart_url()) . '" class="linkbtn">' . esc_html((string) firstvape_t('cart')) . '</a>';
}, 10, 2);

/* ------------------------------------------------------------------------------------------------ fiók */

/** A fiók menüjében a Kedvencek (a téma saját oldala, wishlist-bővítmény nélkül). */
add_filter('woocommerce_account_menu_items', function (array $items): array {
    $out = [];
    foreach ($items as $k => $v) {
        $out[$k] = $v;
        if ($k === 'orders') {
            $out['fv-wishlist'] = (string) firstvape_t('wishlist');
        }
    }
    unset($out['downloads']);
    return $out;
});
add_filter('woocommerce_get_endpoint_url', function ($url, $endpoint) {
    return $endpoint === 'fv-wishlist' ? firstvape_page_url('wishlist') : $url;
}, 10, 2);

/** A kedvencek a fiókba is (bejelentkezéskor a böngésző listája hozzáadódik). */
add_action('wp_login', function ($login, $user) {
    $cookie = array_filter(array_map('intval', explode(',', (string) ($_COOKIE['fv_wish'] ?? ''))));
    if ($cookie) {
        $ids = array_values(array_unique(array_merge(array_map('intval', (array) get_user_meta($user->ID, 'fv_wish', true)), $cookie)));
        update_user_meta($user->ID, 'fv_wish', $ids);
    }
}, 10, 2);

/* ------------------------------------------------------------------------------------------------ súly */

/** A súly csak a háttérben kell (szállítási díj, Packeta): a vásárlói felületen sehol nem jelenik meg. */
add_filter('wc_product_enable_dimensions_display', '__return_false');
add_filter('woocommerce_display_product_attributes', function (array $attrs): array {
    unset($attrs['weight'], $attrs['dimensions']);
    return $attrs;
});

/* ------------------------------------------------------------------------------------------------ piaconkénti oldalak */

/** Az ÁSZF és az adatvédelem oldala a piac szerint (a pénztár pipája és linkje ide mutat). */
add_filter('woocommerce_terms_and_conditions_page_id', fn($id) => firstvape_page_id('terms') ?: $id);
add_filter('woocommerce_privacy_policy_page_id', fn($id) => firstvape_page_id('privacy') ?: $id);
/** Az ÁSZF-pipa szövege az előnézetből (ÁSZF + adatvédelem linkkel, a piac oldalaira). */
add_filter('woocommerce_get_terms_and_conditions_checkbox_text', fn() => (string) firstvape_t('terms'));

/** A fizetési módok neve és leírása a látogató nyelvén (a WooCommerce egy nyelven tárolja). */
add_filter('woocommerce_gateway_title', function ($title, $id) {
    return $id === 'cod' ? (string) firstvape_t('cod') : $title;
}, 10, 2);
add_filter('woocommerce_gateway_description', function ($desc, $id) {
    if ($id !== 'cod') {
        return $desc;
    }
    $fee = firstvape_cod_fee();
    return (string) firstvape_t('codNote') . ($fee > 0 ? ' · ' . firstvape_t('codFee') . ': ' . firstvape_money($fee) : '');
}, 10, 2);

/* ------------------------------------------------------------------------------------------------ kifutott termék */

/**
 * „Kifutott” (a gyártó már nem szállítja): a termékoldal megmarad, nem rendelhető, a helyettesítőket mutatja; a
 * listák végére kerül, a menü és a márkák számlálója nem számolja. Termék szerkesztése → Készlet → „Kifutott termék”.
 */
add_action('woocommerce_product_options_stock_status', function () {
    woocommerce_wp_checkbox(['id' => '_fv_discontinued', 'label' => 'Kifutott termék', 'description' => 'nem rendelhető, a termékoldal a helyettesítőket mutatja (First Vape)']);
});
add_action('woocommerce_admin_process_product_object', function (WC_Product $p) {
    $on = !empty($_POST['_fv_discontinued']);
    $p->update_meta_data('_fv_discontinued', $on ? 'yes' : '');
    if ($on) {
        $p->set_stock_status('outofstock');
    }
});
