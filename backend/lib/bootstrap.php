<?php
// ─── HORIZON OOH — Core Bootstrap ────────────────────────────────────────
// Loaded by every API entry-point.

declare(strict_types=1);

define('ROOT_DIR', dirname(__DIR__));
define('CONFIG_DIR', ROOT_DIR . '/config');
define('LIB_DIR',    ROOT_DIR . '/lib');

// ── Autoload libs (no Composer dependency required) ──────────────────────
spl_autoload_register(function (string $class) {
    $file = LIB_DIR . '/' . str_replace('\\', '/', $class) . '.php';
    if (file_exists($file)) require_once $file;
});

// ── Load config ────────────────────────────────────────────────────────
$configFile = CONFIG_DIR . '/config.php';
if (!file_exists($configFile)) {
    // Fall back to example in dev; in production this MUST be set.
    $configFile = CONFIG_DIR . '/config.example.php';
}
$CONFIG = require $configFile;

// ── Error display (dev only) ──────────────────────────────────────────
if (($CONFIG['app']['env'] ?? 'production') === 'development') {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    error_reporting(0);
}

// ── Timezone ──────────────────────────────────────────────────────────
date_default_timezone_set('Africa/Cairo');

// ── CORS ──────────────────────────────────────────────────────────────
require_once LIB_DIR . '/Cors.php';
Cors::handle($CONFIG['cors']['allowed_origins'] ?? []);

// ── JSON helpers ──────────────────────────────────────────────────────
function jsonOk(array $data = [], int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'ok', 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError(string $message, int $status = 400, array $errors = []): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    $body = ['status' => 'error', 'message' => $message];
    if (!empty($errors)) $body['errors'] = $errors;
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonMethodNotAllowed(): void
{
    jsonError('Method not allowed', 405);
}
