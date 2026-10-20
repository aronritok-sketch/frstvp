<?php
/**
 * Szállítás: „First Vape – Packeta (minta)” szállítási mód súlysávos díjjal és ingyenes szállítási küszöbbel, átvételi
 * pont választóval (výdajné miesto / Z-BOX, illetve point relais).
 *
 * Ez a fejlesztéshez és a staginghez kell, amíg a Packeta-szerződés (API-kulcs, díjak) meg nem jön: az élesítéskor a
 * hivatalos Packeta WooCommerce-bővítmény módjai lépnek a helyére (a Packeta widgettel, címkével, csomagkövetéssel),
 * ezt a módot pedig ki kell kapcsolni a zónában (WooCommerce → Beállítások → Szállítás).
 *
 * Ha a Packeta API-kulcs meg van adva (Megjelenés → First Vape → Adatok), az átvételi pontot a Packeta widget
 * választja ki (widget.packeta.com); különben a minta lista (catalog.json → markets.pickupPoints).
 */

defined('ABSPATH') || exit;

add_action('woocommerce_shipping_init', function () {
    if (class_exists('FirstVape_Shipping')) {
        return;
    }

    class FirstVape_Shipping extends WC_Shipping_Method
    {
        public function __construct($instance_id = 0)
        {
            $this->id = 'firstvape_ship';
            $this->instance_id = absint($instance_id);
            $this->method_title = 'First Vape – Packeta (minta)';
            $this->method_description = 'Súlysávos díj ingyenes szállítási küszöbbel, opcionális átvételi pont választóval. Élesítéskor a hivatalos Packeta bővítmény lép a helyére.';
            $this->supports = ['shipping-zones', 'instance-settings', 'instance-settings-modal'];
            $this->init();
        }

        public function init(): void
        {
            $this->instance_form_fields = [
                'title' => ['title' => 'Megnevezés', 'type' => 'text', 'default' => 'Packeta'],
                'eta' => ['title' => 'Szállítási idő (szöveg)', 'type' => 'text', 'default' => ''],
                'pickup' => ['title' => 'Átvételi pont kell', 'type' => 'checkbox', 'label' => 'Výdajné miesto / Z-BOX / point relais választó a pénztárban', 'default' => 'no'],
                'tiers' => ['title' => 'Díjsávok (súly g : díj €)', 'type' => 'text', 'default' => '5000:2.9,10000:3.9,15000:4.9', 'description' => 'Pl. 5000:2.9,10000:3.9 – a csomag súlya grammban, a díj bruttó euróban. A legnagyobb sáv fölött a mód nem választható.'],
                'free_over' => ['title' => 'Ingyenes ettől (€, bruttó részösszeg)', 'type' => 'text', 'default' => '39.99'],
            ];
            $this->init_instance_settings();
            $this->title = (string) $this->get_option('title');
            add_action('woocommerce_update_options_shipping_' . $this->id, [$this, 'process_admin_options']);
        }

        public function calculate_shipping($package = []): void
        {
            $weight = 0.0;
            $sub = 0.0;
            foreach ((array) ($package['contents'] ?? []) as $item) {
                $p = $item['data'] ?? null;
                if ($p instanceof WC_Product) {
                    $weight += (float) $p->get_weight() * (int) $item['quantity'];
                }
                $sub += (float) ($item['line_total'] ?? 0) + (float) ($item['line_tax'] ?? 0);
            }
            $grams = $weight * (get_option('woocommerce_weight_unit') === 'kg' ? 1000 : 1);
            $cost = null;
            foreach (firstvape_parse_tiers((string) $this->get_option('tiers')) as [$max, $price]) {
                if ($grams <= $max) {
                    $cost = $price;
                    break;
                }
            }
            if ($cost === null) {
                return; // túl nehéz ehhez a módhoz
            }
            $free = (string) $this->get_option('free_over');
            if ($free !== '' && is_numeric($free) && $sub >= (float) $free) {
                $cost = 0.0;
            }
            // a díj bruttó: a WooCommerce az árakat bruttóként kezeli, a szállítási díjat nettóként – visszaszámolva
            $rates = WC_Tax::get_shipping_tax_rates();
            $rate = $rates ? (float) reset($rates)['rate'] : 0.0;
            $this->add_rate([
                'id' => $this->get_rate_id(), 'label' => $this->title, 'cost' => $cost > 0 ? round($cost / (1 + $rate / 100), 4) : 0,
                'meta_data' => ['fv_pickup' => $this->get_option('pickup') === 'yes' ? 'yes' : 'no', 'fv_eta' => (string) $this->get_option('eta')],
                'package' => $package,
            ]);
        }
    }
});

add_filter('woocommerce_shipping_methods', function (array $methods): array {
    $methods['firstvape_ship'] = 'FirstVape_Shipping';
    return $methods;
});

/** „5000:2.9,10000:3.9” → [[5000, 2.9], [10000, 3.9]] (súly szerint növekvő). */
function firstvape_parse_tiers(string $s): array
{
    $out = [];
    foreach (explode(',', $s) as $part) {
        if (preg_match('/^\s*(\d+)\s*:\s*([\d.,]+)\s*$/', $part, $m)) {
            $out[] = [(int) $m[1], (float) str_replace(',', '.', $m[2])];
        }
    }
    usort($out, fn($a, $b) => $a[0] <=> $b[0]);
    return $out;
}

/** A díjak még mintaértékek-e (amíg a Packeta-szerződés szerinti díjakat be nem állítják: firstvape_shipping_final). */
function firstvape_shipping_is_sample(): bool
{
    return !get_option('firstvape_shipping_final');
}

/** A piac szállítási módjai a díjtáblához (a WooCommerce zónájából; ha még nincs, a catalog.json mintájából). */
function firstvape_shipping_methods_display(): array
{
    $out = [];
    if (class_exists('WC_Shipping_Zones')) {
        foreach (WC_Shipping_Zones::get_zones() as $z) {
            $codes = array_map(fn($l) => $l->code, (array) $z['zone_locations']);
            if (!in_array(firstvape_market_country(), $codes, true)) {
                continue;
            }
            foreach ((array) $z['shipping_methods'] as $m) {
                if ($m->enabled !== 'yes') {
                    continue;
                }
                $from = 0.0;
                if ($m->id === 'firstvape_ship') {
                    $t = firstvape_parse_tiers((string) $m->get_option('tiers'));
                    $from = $t ? (float) $t[0][1] : 0.0;
                } elseif (isset($m->instance_settings['cost']) && is_numeric($m->instance_settings['cost'])) {
                    $from = (float) $m->instance_settings['cost'];
                }
                $out[] = ['name' => (string) $m->get_title(), 'eta' => (string) ($m->id === 'firstvape_ship' ? $m->get_option('eta') : ''), 'from' => $from];
            }
        }
    }
    if (!$out) {
        foreach ((array) (firstvape_ship()['methods'] ?? []) as $m) {
            $out[] = ['name' => (string) $m['name'], 'eta' => (string) $m['eta'], 'from' => (float) ($m['tiers'][0]['price'] ?? 0)];
        }
    }
    return $out;
}

/* ------------------------------------------------------------------------------------------------ átvételi pont */

function firstvape_chosen_rate_is_pickup(): bool
{
    if (!function_exists('WC') || !WC()->session) {
        return false;
    }
    $chosen = (array) WC()->session->get('chosen_shipping_methods');
    $packages = WC()->shipping() ? WC()->shipping()->get_packages() : [];
    foreach ($packages as $i => $pkg) {
        $rate = $pkg['rates'][$chosen[$i] ?? ''] ?? null;
        if ($rate && ($rate->get_meta_data()['fv_pickup'] ?? '') === 'yes') {
            return true;
        }
    }
    return false;
}

/** Az átvételi pont választó a kiválasztott szállítási mód alatt (pénztár). */
add_action('woocommerce_after_shipping_rate', function ($rate) {
    $meta = $rate->get_meta_data();
    if (!empty($meta['fv_eta'])) {
        echo '<small class="method-note">' . esc_html((string) $meta['fv_eta']) . '</small>';
    }
    if (!is_checkout() || ($meta['fv_pickup'] ?? '') !== 'yes') {
        return;
    }
    $chosen = (array) (WC()->session ? WC()->session->get('chosen_shipping_methods') : []);
    if (!in_array($rate->get_id(), $chosen, true)) {
        return;
    }
    $m = firstvape_market();
    $sel = (string) (WC()->session->get('fv_pickup') ?? '');
    $key = (string) get_option('firstvape_packeta_key', '');
    echo '<div class="pickup" data-pickup><p class="pickup-h">' . esc_html((string) ($m['pickupLabel'] ?? '')) . '</p>';
    if ($key !== '') {
        // Packeta widget (v6): a kiválasztott pont neve és azonosítója a rejtett mezőbe kerül
        echo '<button type="button" class="btn btn-ghost" data-packeta data-key="' . esc_attr($key) . '" data-country="' . esc_attr(strtolower(firstvape_market_country())) . '" data-lang="' . esc_attr(firstvape_lang()) . '">' . esc_html((string) firstvape_t('choosePickup')) . '</button>' .
            '<p class="pp-chosen" data-pp-chosen>' . esc_html($sel) . '</p><input type="hidden" name="fv_pickup" value="' . esc_attr($sel) . '" data-pickup-value>';
    } else {
        echo '<label class="sr" for="co-pickup-q">' . esc_html((string) firstvape_t('pickupSearch')) . '</label><input class="pickup-q" id="co-pickup-q" type="search" placeholder="' . esc_attr((string) firstvape_t('pickupSearch')) . '" data-pickup-q>' .
            '<div class="pp-list" role="radiogroup" aria-label="' . esc_attr((string) ($m['pickupLabel'] ?? '')) . '" data-pp-list>';
        foreach ((array) ($m['pickupPoints'] ?? []) as $i => $x) {
            echo '<label class="pp-item"><input type="radio" name="fv_pickup" id="pp-' . (int) $i . '" value="' . esc_attr((string) $x) . '"' . checked($sel, $x, false) . '><span>' . esc_html((string) $x) . '</span></label>';
        }
        echo '</div>';
    }
    echo '<p class="err-msg" data-pickup-err hidden>' . esc_html((string) firstvape_t('errPickup')) . '</p></div>';
});

/** A választás a munkamenetben marad (az összesítő AJAX-frissítésekor sem vész el). */
add_action('woocommerce_checkout_update_order_review', function ($post) {
    parse_str((string) $post, $data);
    if (isset($data['fv_pickup']) && WC()->session) {
        WC()->session->set('fv_pickup', sanitize_text_field((string) $data['fv_pickup']));
    }
});

add_action('woocommerce_after_checkout_validation', function ($data, WP_Error $errors) {
    if (firstvape_chosen_rate_is_pickup() && trim((string) ($_POST['fv_pickup'] ?? '')) === '') {
        $errors->add('fv_pickup', (string) firstvape_t('errPickup'), ['id' => 'fv_pickup']);
    }
}, 10, 2);

add_action('woocommerce_checkout_create_order', function (WC_Order $order) {
    $v = sanitize_text_field(wp_unslash((string) ($_POST['fv_pickup'] ?? '')));
    if ($v !== '' && firstvape_chosen_rate_is_pickup()) {
        $order->update_meta_data('_fv_pickup_point', $v);
    }
}, 20);

/** Az átvételi pont a rendelés adatlapján, a köszönő oldalon és a leveleken. */
add_action('woocommerce_admin_order_data_after_shipping_address', function (WC_Order $order) {
    $v = (string) $order->get_meta('_fv_pickup_point');
    if ($v !== '') {
        echo '<p><strong>Átvételi pont:</strong> ' . esc_html($v) . '</p>';
    }
});
add_filter('woocommerce_get_order_item_totals', function (array $rows, WC_Order $order) {
    $v = (string) $order->get_meta('_fv_pickup_point');
    if ($v !== '') {
        $new = [];
        foreach ($rows as $k => $r) {
            $new[$k] = $r;
            if ($k === 'shipping') {
                $new['fv_pickup'] = ['label' => (string) firstvape_with_lang((string) $order->get_meta('_fv_lang') ?: 'sk', fn() => firstvape_market()['pickupLabel'] ?? '') . ':', 'value' => esc_html($v)];
            }
        }
        return $new;
    }
    return $rows;
}, 10, 2);

/** A Packeta widget szkriptje csak a pénztárban és csak API-kulccsal. */
add_action('wp_enqueue_scripts', function () {
    if (function_exists('is_checkout') && is_checkout() && get_option('firstvape_packeta_key')) {
        wp_enqueue_script('packeta-widget', 'https://widget.packeta.com/v6/www/js/library.js', [], null, ['in_footer' => true]);
    }
}, 30);
