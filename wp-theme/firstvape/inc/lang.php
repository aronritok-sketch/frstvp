<?php
/**
 * Egy webshop két domainnel (Áron döntése, 2026-10-19): firstvape.sk = szlovák felület + SK piac, firstvape.fr =
 * francia felület + FR piac. Egy WordPress, közös katalógus, készlet és rendeléslista; a domain dönti el a nyelvet,
 * a piacot (ÁFA, szállítás, ország), a leveleket és a jogi oldalakat.
 *
 * - A domainek: Megjelenés → First Vape → Domainek (firstvape_domains opció). Ha csak egy domain van (dev, staging),
 *   a nyelv ?lang=fr / ?lang=sk-val váltható (fv_lang süti) – így egy gépen mindkét piac kipróbálható.
 * - Ha a WPML be van kapcsolva, a nyelvet a WPML adja (wpml_current_language), a domain-kezelés is az övé.
 * - A WordPress a home / siteurl opcióban egy domaint tárol: a második domainen a kérés hostjára cseréljük, így
 *   minden link (WooCommerce is) a látogató domainjén marad.
 */

defined('ABSPATH') || exit;

const FIRSTVAPE_LANGS = ['sk', 'fr'];

/** A két domain (host, www nélkül): ['sk' => 'firstvape.sk', 'fr' => 'firstvape.fr']; üres, ami nincs beállítva. */
function firstvape_domains(): array
{
    $d = (array) get_option('firstvape_domains', []);
    $out = [];
    foreach (FIRSTVAPE_LANGS as $l) {
        $host = strtolower(trim((string) ($d[$l] ?? '')));
        $host = preg_replace('#^https?://#', '', $host);
        $out[$l] = preg_replace('#^www\.|/.*$#', '', $host);
    }
    return $out;
}

function firstvape_request_host(): string
{
    $host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    return preg_replace('#^www\.|:\d+$#', '', $host);
}

/** Melyik domainen jár a látogató ('sk' / 'fr'), vagy '' ha nem a két beállított domain egyikén (dev). */
function firstvape_domain_lang(): string
{
    $host = firstvape_request_host();
    foreach (firstvape_domains() as $l => $d) {
        if ($d !== '' && $host === $d) {
            return $l;
        }
    }
    return '';
}

/** Két külön domain van-e beállítva (élesben igen; dev / staging: nem, ott ?lang= vált). */
function firstvape_multi_domain(): bool
{
    $d = firstvape_domains();
    return $d['sk'] !== '' && $d['fr'] !== '' && $d['sk'] !== $d['fr'];
}

function firstvape_wpml(): bool
{
    return defined('ICL_SITEPRESS_VERSION');
}

/** Az aktuális nyelv: 'sk' vagy 'fr'. */
function firstvape_lang(): string
{
    if (isset($GLOBALS['firstvape_lang_override'])) {
        return $GLOBALS['firstvape_lang_override'];
    }
    static $lang = null;
    if ($lang !== null) {
        return $lang;
    }
    if (firstvape_wpml()) {
        $w = (string) apply_filters('wpml_current_language', null);
        if (in_array($w, FIRSTVAPE_LANGS, true)) {
            return $lang = $w;
        }
    }
    if (($d = firstvape_domain_lang()) !== '' && firstvape_multi_domain()) {
        return $lang = $d;
    }
    $q = isset($_GET['lang']) ? sanitize_key((string) $_GET['lang']) : '';
    if (in_array($q, FIRSTVAPE_LANGS, true)) {
        return $lang = $q;
    }
    $c = isset($_COOKIE['fv_lang']) ? sanitize_key((string) $_COOKIE['fv_lang']) : '';
    if (in_array($c, FIRSTVAPE_LANGS, true)) {
        return $lang = $c;
    }
    return $lang = 'sk';
}

/** Egy kódrészlet futtatása más nyelven (pl. levél a rendelés nyelvén). */
function firstvape_with_lang(string $lang, callable $fn)
{
    $prev = $GLOBALS['firstvape_lang_override'] ?? null;
    $GLOBALS['firstvape_lang_override'] = in_array($lang, FIRSTVAPE_LANGS, true) ? $lang : 'sk';
    try {
        return $fn();
    } finally {
        if ($prev === null) {
            unset($GLOBALS['firstvape_lang_override']);
        } else {
            $GLOBALS['firstvape_lang_override'] = $prev;
        }
    }
}

function firstvape_locale(?string $lang = null): string
{
    return ($lang ?? firstvape_lang()) === 'fr' ? 'fr_FR' : 'sk_SK';
}

/** Dev / staging: a ?lang= választás sütibe (egy évre), hogy a következő oldalon is megmaradjon. */
add_action('init', function () {
    if (firstvape_wpml() || (firstvape_multi_domain() && firstvape_domain_lang() !== '')) {
        return;
    }
    $q = isset($_GET['lang']) ? sanitize_key((string) $_GET['lang']) : '';
    if (in_array($q, FIRSTVAPE_LANGS, true) && ($_COOKIE['fv_lang'] ?? '') !== $q && !headers_sent()) {
        setcookie('fv_lang', $q, ['expires' => time() + YEAR_IN_SECONDS, 'path' => COOKIEPATH ?: '/', 'secure' => is_ssl(), 'httponly' => false, 'samesite' => 'Lax']);
        $_COOKIE['fv_lang'] = $q;
    }
}, 1);

/**
 * A felület nyelve (WordPress és WooCommerce szövegei is): a látogatói oldalon a domain / választás szerint. Az admin a
 * felhasználó saját nyelvén marad. A nyelvi csomagok: sk_SK és fr_FR (WordPress + WooCommerce).
 */
add_filter('locale', function ($locale) {
    if (is_admin() && !wp_doing_ajax() || firstvape_wpml() || (defined('WP_CLI') && WP_CLI)) {
        return $locale;
    }
    return firstvape_locale();
}, 20);

/** A második domainen a WordPress saját címe a kérés hostja (különben minden link az első domainre vinne). */
function firstvape_swap_host($url)
{
    if (!is_string($url) || $url === '' || firstvape_wpml() || !firstvape_multi_domain()) {
        return $url;
    }
    $lang = firstvape_domain_lang();
    if ($lang === '') {
        return $url;
    }
    $want = firstvape_domains()[$lang];
    $host = (string) wp_parse_url($url, PHP_URL_HOST);
    if ($host === '' || preg_replace('#^www\.#', '', strtolower($host)) === $want) {
        return $url;
    }
    $real = (string) ($_SERVER['HTTP_HOST'] ?? $want);
    return (string) preg_replace('#^(https?://)[^/]+#i', '${1}' . $real, $url); // ${1}: a host számmal kezdődhet
}
add_filter('option_home', 'firstvape_swap_host', 1);
add_filter('option_siteurl', 'firstvape_swap_host', 1);
// a wp-content címe (WP_CONTENT_URL) a téma betöltése előtt rögzül: a téma, a bővítmények, a feltöltött képek és a
// szkriptek / stílusok is a látogató domainjén legyenek (különben a betűk CORS miatt nem töltődnének be a .fr-en)
foreach (['content_url', 'plugins_url', 'theme_root_uri', 'stylesheet_directory_uri', 'template_directory_uri', 'includes_url', 'script_loader_src', 'style_loader_src', 'wp_get_attachment_url'] as $hook) {
    add_filter($hook, 'firstvape_swap_host', 1);
}
add_filter('upload_dir', function ($dir) {
    foreach (['url', 'baseurl'] as $k) {
        if (isset($dir[$k])) {
            $dir[$k] = firstvape_swap_host($dir[$k]);
        }
    }
    return $dir;
}, 1);
add_filter('wp_calculate_image_srcset', function ($sources) {
    foreach ((array) $sources as $w => $src) {
        if (isset($src['url'])) {
            $sources[$w]['url'] = firstvape_swap_host($src['url']);
        }
    }
    return $sources;
}, 1);

/** Ugyanez az oldal a másik nyelven / domainen (nyelvváltó, hreflang). */
function firstvape_lang_url(string $lang, ?string $url = null): string
{
    $url ??= firstvape_current_url();
    // a piachoz kötött oldalak (jogi oldalak, cikkek) párja: fv_pair meta
    if (is_singular(['page', 'post'])) {
        $id = get_queried_object_id();
        $own = (string) get_post_meta($id, 'fv_lang', true);
        if ($own !== '' && $own !== $lang) {
            $pair = (int) get_post_meta($id, 'fv_pair', true);
            $url = $pair ? (string) get_permalink($pair) : home_url('/');
        }
    }
    if (firstvape_wpml()) {
        return (string) apply_filters('wpml_permalink', $url, $lang);
    }
    $url = remove_query_arg('lang', $url);
    if (firstvape_multi_domain()) {
        $host = firstvape_domains()[$lang];
        $scheme = is_ssl() ? 'https://' : 'http://';
        $cur = (string) ($_SERVER['HTTP_HOST'] ?? '');
        $port = preg_match('#:\d+$#', $cur, $m) ? $m[0] : '';
        return (string) preg_replace('#^https?://[^/]+#i', $scheme . (str_starts_with($cur, 'www.') ? 'www.' : '') . $host . $port, $url);
    }
    return add_query_arg('lang', $lang, $url);
}

function firstvape_current_url(): string
{
    $req = (string) ($_SERVER['REQUEST_URI'] ?? '/');
    return home_url(wp_parse_url(home_url(), PHP_URL_PATH) ? substr($req, strlen((string) wp_parse_url(home_url(), PHP_URL_PATH))) : $req);
}

/**
 * Piachoz kötött oldal a másik domainen (pl. a szlovák ÁSZF a .fr-en): átirányítás a párjára (301). A kosár, pénztár,
 * fiók és a termékek közösek – azok mindkét domainen ugyanott vannak.
 */
add_action('template_redirect', function () {
    if (!is_singular(['page', 'post']) || is_admin()) {
        return;
    }
    $own = (string) get_post_meta(get_queried_object_id(), 'fv_lang', true);
    if ($own === '' || $own === firstvape_lang()) {
        return;
    }
    $pair = (int) get_post_meta(get_queried_object_id(), 'fv_pair', true);
    if ($pair && get_post_status($pair) === 'publish') {
        wp_safe_redirect((string) get_permalink($pair), 301);
        exit;
    }
    if (firstvape_multi_domain()) {
        wp_redirect(firstvape_lang_url($own), 302);
        exit;
    }
});

/** A második domain is „biztonságos” átirányítási cél (wp_safe_redirect). */
add_filter('allowed_redirect_hosts', function (array $hosts): array {
    foreach (firstvape_domains() as $d) {
        if ($d !== '') {
            $hosts[] = $d;
            $hosts[] = 'www.' . $d;
        }
    }
    return array_values(array_unique($hosts));
});

/** <html lang="sk"> / <html lang="fr">. */
add_filter('language_attributes', function ($output) {
    return (string) preg_replace('/lang="[^"]*"/', 'lang="' . firstvape_lang() . '"', (string) $output);
});

/**
 * A WordPress saját szövegei (alap textdomain) a téma betöltése előtt, az oldal nyelvén töltődnek be: a francia
 * domainen újratöltjük franciául (a WooCommerce és a többi bővítmény szövegei később, már a helyes nyelven jönnek).
 */
add_action('after_setup_theme', function () {
    if (is_admin() && !wp_doing_ajax() || firstvape_wpml() || (defined('WP_CLI') && WP_CLI)) {
        return;
    }
    $want = firstvape_locale();
    if (get_option('WPLANG') !== $want) {
        unload_textdomain('default', true);
        load_default_textdomain($want);
        $GLOBALS['wp_locale'] = new WP_Locale();
    }
}, 0);
