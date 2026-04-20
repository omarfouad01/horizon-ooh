<?php
// ─── HORIZON OOH — API Router ────────────────────────────────────────────
// Entry point: /backend/api/index.php
// Vite proxy (dev) or Nginx/Apache rewrite (prod) routes /api/* here.

declare(strict_types=1);

require_once dirname(__DIR__) . '/lib/bootstrap.php';

// ── Simple path-based router ──────────────────────────────────────────────
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$method = $_SERVER['REQUEST_METHOD'];

// Strip /api prefix if present
$route = preg_replace('#^/api#', '', $uri) ?: '/';

switch (true) {

    // GET /api/health
    case $route === '/health' && $method === 'GET':
        jsonOk([
            'service' => 'HORIZON OOH API',
            'version' => $CONFIG['api']['version'],
            'time'    => date('c'),
        ]);
        break;

    // POST /api/contact
    case $route === '/contact' && $method === 'POST':
        require_once __DIR__ . '/contact.php';
        break;

    // OPTIONS (pre-flight already handled in bootstrap/Cors)
    case $method === 'OPTIONS':
        http_response_code(204);
        exit;

    default:
        jsonError('Not found', 404);
}
