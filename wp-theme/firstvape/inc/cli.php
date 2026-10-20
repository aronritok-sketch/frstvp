<?php
/**
 * WP-CLI:
 *   wp firstvape setup [--force] [--media=<mappa|zip>] [--step=<lépés>] [--verbose]   telepítés / frissítés
 *   wp firstvape check                                                               élesítési ellenőrzés
 *   wp firstvape reindex                                                             a termékindex újraépítése
 */

defined('ABSPATH') || exit;

WP_CLI::add_command('firstvape setup', function ($args, $assoc) {
    if (!empty($assoc['media'])) {
        $src = (string) $assoc['media'];
        wp_mkdir_p(firstvape_media_dir());
        if (is_dir($src)) {
            WP_CLI::launch('cp -R ' . escapeshellarg(rtrim($src, '/') . '/.') . ' ' . escapeshellarg(firstvape_media_dir()));
        } else {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            WP_Filesystem();
            $res = unzip_file($src, firstvape_media_dir());
            if (is_wp_error($res)) {
                WP_CLI::error($res->get_error_message());
            }
        }
        WP_CLI::log('Médiacsomag: ' . firstvape_media_count() . ' kép');
    }
    // A blokk-JSON-t a kses és a WP 7 custom-CSS szűrője elrontaná CLI alól (iu-theme skill).
    $admins = get_users(['role' => 'administrator', 'number' => 1, 'fields' => 'ids']);
    if ($admins) {
        wp_set_current_user((int) $admins[0]);
    }
    kses_remove_filters();
    $only = (string) ($assoc['step'] ?? '');
    foreach (firstvape_setup_steps() as $step => [$label, $batched]) {
        if ($only !== '' && $only !== $step) {
            continue;
        }
        WP_CLI::log('== ' . $label);
        $offset = 0;
        do {
            $r = firstvape_setup_run($step, $offset, !empty($assoc['force']));
            foreach ($r['log'] as $line) {
                if ((!str_starts_with($line, '+ ') && !str_starts_with($line, '↻ ')) || !empty($assoc['verbose'])) {
                    WP_CLI::log('  ' . $line);
                }
            }
            if ($batched && !$r['done']) {
                WP_CLI::log(sprintf('  … %d / %d', $r['offset'], $r['total']));
            }
            $offset = $r['offset'];
        } while (!$r['done']);
    }
    WP_CLI::success('Kész.');
});

WP_CLI::add_command('firstvape check', function () {
    foreach (firstvape_admin_checks() as [$state, $label, $fix]) {
        WP_CLI::log(['ok' => '✔', 'warn' => '!', 'bad' => '✘'][$state] . ' ' . $label . ($fix ? ' – ' . $fix : ''));
    }
});

WP_CLI::add_command('firstvape reindex', function () {
    firstvape_index_flush();
    WP_CLI::success(count(firstvape_index()) . ' termék az indexben.');
});
