<?php
/**
 * Admin: Megjelenés → First Vape – telepítés (lépésenként, AJAX-kötegekkel), az oldal adatai (domainek, e-mail, cég,
 * közösségi oldalak, Packeta API-kulcs, utánvét díja és ingyenes szállítási küszöb piaconként) és élesítési ellenőrzés.
 */

defined('ABSPATH') || exit;

const FIRSTVAPE_SETTINGS = [
    'firstvape_domains' => 'Domainek',
    'firstvape_email' => 'E-mail', 'firstvape_company_name' => 'Cégnév', 'firstvape_social' => 'Közösségi oldalak',
    'firstvape_packeta_key' => 'Packeta API-kulcs', 'firstvape_featured' => 'Kiemelt készülék',
    'firstvape_cod_fee_sk' => 'Utánvét díja SK', 'firstvape_cod_fee_fr' => 'Utánvét díja FR',
    'firstvape_free_over_sk' => 'Ingyenes szállítás SK', 'firstvape_free_over_fr' => 'Ingyenes szállítás FR',
    'firstvape_shipping_final' => 'Végleges díjak',
];

add_action('admin_menu', function () {
    add_theme_page('First Vape', 'First Vape', 'manage_options', 'firstvape', 'firstvape_admin_page');
});

/** Élesítési ellenőrzés: [állapot ok|warn|bad, felirat, teendő]. */
function firstvape_admin_checks(): array
{
    $c = [];
    $d = firstvape_domains();
    $c[] = firstvape_multi_domain() ? ['ok', 'Két domain: ' . $d['sk'] . ' (SK) és ' . $d['fr'] . ' (FR)', ''] : ['warn', 'Csak egy domain van beállítva (' . ($d['sk'] ?: '–') . ')', 'élesítéskor: Adatok → Domainek (firstvape.sk és firstvape.fr); addig ?lang=fr-rel váltható'];
    if (firstvape_av_opt('test')) {
        $c[] = ['bad', 'A korellenőrzés TESZT módban van', 'élesítés előtt: Korellenőrzés → Teszt mód ki, Adulto kulcsok be'];
    } elseif (!firstvape_av_active('sk')) {
        $c[] = ['bad', 'Nincs bekapcsolva az Adulto korellenőrzés (SK)', 'Korellenőrzés: nyilvános és privát kulcs, a widget szkriptje (89/2016 Z. z.: kötelező a nikotinos termékek távértékesítésénél)'];
    } else {
        $c[] = ['ok', 'Adulto korellenőrzés bekapcsolva (' . implode(', ', array_map('strtoupper', (array) firstvape_av_opt('markets', ['sk']))) . ')', ''];
    }
    $n = count(firstvape_index());
    $c[] = $n ? ['ok', $n . ' termék az indexben', ''] : ['bad', 'Nincs termék', 'Telepítés → Termékek'];
    $noimg = count(array_filter(firstvape_index(), fn($p) => !$p['img']));
    $c[] = $noimg ? ['warn', $noimg . ' terméknek nincs képe', 'médiacsomag: dist/firstvape-media.zip, vagy kézzel'] : ['ok', 'Minden terméknek van képe', ''];
    $est = (int) (new WP_Query(['post_type' => 'product', 'posts_per_page' => 1, 'fields' => 'ids', 'meta_key' => '_fv_weight_estimated', 'meta_value' => 'yes']))->found_posts;
    $c[] = $est ? ['warn', $est . ' termék súlya becsült (kategóriánként)', 'az ügyfél súlyadatai a kérdőívből – a Packeta-díj ebből számol'] : ['ok', 'Súlyok megadva', ''];
    $c[] = firstvape_shipping_is_sample() ? ['warn', 'A szállítási díjak mintaértékek', 'a Packeta-szerződés szerint: WooCommerce → Szállítás, utána Adatok → Végleges díjak'] : ['ok', 'Szállítási díjak véglegesek', ''];
    $c[] = get_option('firstvape_packeta_key') ? ['ok', 'Packeta API-kulcs megadva (widget)', ''] : ['warn', 'Nincs Packeta API-kulcs', 'élesítéskor a Packeta bővítmény (a kulcs ne a repóba kerüljön)'];
    $gw = function_exists('WC') ? array_keys(array_filter(WC()->payment_gateways()->payment_gateways(), fn($g) => $g->enabled === 'yes')) : [];
    $c[] = array_diff($gw, ['cod', 'bacs', 'cheque']) ? ['ok', 'Online fizetés: ' . implode(', ', $gw), ''] : ['warn', 'Csak utánvét (' . implode(', ', $gw) . ')', 'a Teya fizetési kapu bővítménye (08-as fázis)'];
    foreach (['sk', 'fr'] as $l) {
        foreach (['terms', 'privacy', 'withdrawal'] as $k) {
            $id = firstvape_page_id($k, $l);
            $ph = $id && str_contains((string) get_post_field('post_content', $id), 'legal-ph');
            if (!$id || $ph) {
                $c[] = ['warn', strtoupper($l) . ' ' . $k . ': ' . ($id ? 'helyőrző szöveg' : 'nincs oldal'), 'a végleges szöveget az ügyfél jogásza adja'];
            }
        }
    }
    $c[] = get_option('blog_public') ? ['ok', 'A keresőrobotok indexelhetik az oldalt', ''] : ['warn', 'Keresőrobotok kizárva (Beállítások → Olvasás)', 'élesítés 4/4 végén kapcsold ki'];
    return $c;
}

function firstvape_admin_page(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }
    $tab = sanitize_key((string) ($_GET['tab'] ?? 'setup'));
    $saved = false;
    if ($tab === 'data' && isset($_POST['firstvape_save']) && check_admin_referer('firstvape_data')) {
        $p = wp_unslash($_POST);
        update_option('firstvape_domains', ['sk' => sanitize_text_field((string) ($p['domain_sk'] ?? '')), 'fr' => sanitize_text_field((string) ($p['domain_fr'] ?? ''))]);
        update_option('firstvape_email', sanitize_email((string) ($p['email'] ?? '')));
        update_option('firstvape_company_name', sanitize_text_field((string) ($p['company'] ?? '')));
        update_option('firstvape_social', ['facebook' => esc_url_raw((string) ($p['facebook'] ?? '')), 'instagram' => esc_url_raw((string) ($p['instagram'] ?? '')), 'tiktok' => esc_url_raw((string) ($p['tiktok'] ?? ''))]);
        if (($p['packeta'] ?? '') !== '********') {
            update_option('firstvape_packeta_key', sanitize_text_field((string) ($p['packeta'] ?? '')), false);
        }
        update_option('firstvape_featured', sanitize_title((string) ($p['featured'] ?? '')));
        foreach (['sk', 'fr'] as $l) {
            foreach (['cod_fee', 'free_over'] as $k) {
                $v = str_replace(',', '.', trim((string) ($p[$k . '_' . $l] ?? '')));
                update_option('firstvape_' . $k . '_' . $l, $v === '' || is_numeric($v) ? $v : '');
            }
        }
        update_option('firstvape_shipping_final', !empty($p['shipping_final']) ? 1 : 0);
        $saved = true;
    }
    $url = fn($t) => esc_url(admin_url('themes.php?page=firstvape&tab=' . $t));
    echo '<div class="wrap"><h1>First Vape</h1><nav class="nav-tab-wrapper">';
    foreach (['setup' => 'Telepítés', 'data' => 'Adatok', 'age' => 'Korellenőrzés', 'check' => 'Élesítési ellenőrzés'] as $k => $l) {
        echo '<a class="nav-tab' . ($tab === $k ? ' nav-tab-active' : '') . '" href="' . $url($k) . '">' . esc_html($l) . '</a>';
    }
    echo '</nav>';
    if ($tab === 'data') {
        if ($saved) {
            echo '<div class="notice notice-success"><p>Mentve.</p></div>';
        }
        $d = firstvape_domains();
        $s = (array) get_option('firstvape_social', []);
        $f = fn($name, $label, $value, $help = '') => '<tr><th><label for="' . esc_attr($name) . '">' . esc_html($label) . '</label></th><td><input class="regular-text" id="' . esc_attr($name) . '" name="' . esc_attr($name) . '" value="' . esc_attr((string) $value) . '">' . ($help ? '<p class="description">' . esc_html($help) . '</p>' : '') . '</td></tr>';
        echo '<form method="post">';
        wp_nonce_field('firstvape_data');
        echo '<table class="form-table">' .
            $f('domain_sk', 'Szlovák domain', $d['sk'], 'pl. firstvape.sk – a szlovák felület és piac') .
            $f('domain_fr', 'Francia domain', $d['fr'], 'pl. firstvape.fr – üresen: egy domain, a francia nyelv ?lang=fr-rel érhető el (dev / staging)') .
            $f('email', 'Az üzlet e-mail címe', get_option('firstvape_email', 'info@firstvape.sk'), 'kapcsolati űrlap címzettje, a láblécben és a kapcsolat oldalon') .
            $f('company', 'Cégnév', get_option('firstvape_company_name', 'John&Jen s.r.o.')) .
            $f('facebook', 'Facebook', $s['facebook'] ?? '') . $f('instagram', 'Instagram', $s['instagram'] ?? '') . $f('tiktok', 'TikTok', $s['tiktok'] ?? '') .
            $f('packeta', 'Packeta API-kulcs (widget)', get_option('firstvape_packeta_key') ? '********' : '', 'csak a minta szállítási módhoz; élesben a Packeta bővítmény saját beállítása') .
            $f('featured', 'Kiemelt készülék (termék slug)', get_option('firstvape_featured', 'elfbar-elfa-turbo-black'), 'a márkák menüjében és a kompatibilitás-blokkban') .
            $f('cod_fee_sk', 'Utánvét díja – SK (€)', get_option('firstvape_cod_fee_sk', ''), 'üresen a minta: ' . firstvape_money((float) (firstvape_market('sk')['codFee'] ?? 0))) .
            $f('cod_fee_fr', 'Utánvét díja – FR (€)', get_option('firstvape_cod_fee_fr', ''), 'üresen a minta: ' . firstvape_money((float) (firstvape_market('fr')['codFee'] ?? 0))) .
            $f('free_over_sk', 'Ingyenes szállítás – SK (€-tól)', get_option('firstvape_free_over_sk', ''), 'a fejléc / kosár szövegéhez; a díjszámítás a szállítási módé') .
            $f('free_over_fr', 'Ingyenes szállítás – FR (€-tól)', get_option('firstvape_free_over_fr', '')) .
            '<tr><th>Szállítási díjak</th><td><label><input type="checkbox" name="shipping_final" value="1"' . checked((bool) get_option('firstvape_shipping_final'), true, false) . '> A díjak véglegesek (a „orientačné” megjegyzés eltűnik)</label></td></tr>' .
            '</table><p><button class="button button-primary" name="firstvape_save" value="1">Mentés</button></p></form>';
    } elseif ($tab === 'age') {
        firstvape_av_admin_tab();
    } elseif ($tab === 'check') {
        echo '<table class="widefat striped" style="max-width:900px"><tbody>';
        foreach (firstvape_admin_checks() as [$st, $label, $fix]) {
            echo '<tr><td style="width:24px">' . ['ok' => '✔', 'warn' => '!', 'bad' => '✘'][$st] . '</td><td>' . esc_html($label) . ($fix ? '<br><small>' . esc_html($fix) . '</small>' : '') . '</td></tr>';
        }
        echo '</tbody></table>';
    } else {
        echo '<p>A jóváhagyott előnézet tartalma (kategóriák, márkák, termékek, oldalak, cikkek) és a webshop beállításai. A második futás nem ír át semmit; amit az adminban szerkesztettek, azt kihagyja (kivéve a „Felülírás” pipával).</p>' .
            '<p>Médiacsomag: <code>' . esc_html(firstvape_media_dir()) . '/p/</code> – ' . firstvape_media_count() . ' kép. (Kicsomagolva ide: <code>dist/firstvape-media.zip</code>, vagy <code>wp firstvape setup --media=…</code>.)</p>' .
            '<p><label><input type="checkbox" id="fv-force"> Felülírás (a szerkesztett tartalmat, az árat és a készletet is)</label></p>' .
            '<p><button class="button button-primary" id="fv-run">Telepítés indítása</button></p><pre id="fv-log" style="background:#fff;border:1px solid #ccd;padding:12px;max-height:420px;overflow:auto"></pre>';
        $steps = array_keys(firstvape_setup_steps());
        ?>
        <script>
        (function () {
          var steps = <?php echo wp_json_encode($steps); ?>, nonce = <?php echo wp_json_encode(wp_create_nonce('firstvape_setup')); ?>, log = document.getElementById('fv-log');
          function line(s) { log.textContent += s + '\n'; log.scrollTop = log.scrollHeight; }
          function run(i, offset) {
            if (i >= steps.length) { line('✔ Kész.'); return; }
            var body = new URLSearchParams({ action: 'firstvape_setup', step: steps[i], offset: offset, force: document.getElementById('fv-force').checked ? 1 : 0, _ajax_nonce: nonce });
            fetch(ajaxurl, { method: 'POST', body: body, credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (r) {
              if (!r.success) { line('✘ ' + steps[i] + ': ' + JSON.stringify(r.data)); return; }
              (r.data.log || []).forEach(function (l) { if (l.indexOf('+ ') && l.indexOf('↻ ')) line('  ' + l); });
              if (!r.data.done) { line('  … ' + r.data.offset + ' / ' + r.data.total); run(i, r.data.offset); } else { line('== ' + steps[i] + ' ✓'); run(i + 1, 0); }
            }).catch(function (e) { line('✘ ' + e); });
          }
          document.getElementById('fv-run').addEventListener('click', function (e) { e.preventDefault(); log.textContent = ''; run(0, 0); });
        })();
        </script>
        <?php
    }
    echo '</div>';
}

add_action('wp_ajax_firstvape_setup', function () {
    check_ajax_referer('firstvape_setup');
    if (!current_user_can('manage_options')) {
        wp_send_json_error('forbidden', 403);
    }
    kses_remove_filters();
    $r = firstvape_setup_run(sanitize_key((string) ($_POST['step'] ?? '')), (int) ($_POST['offset'] ?? 0), !empty($_POST['force']));
    wp_send_json_success($r);
});
