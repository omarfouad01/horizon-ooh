<?php
// ─── HORIZON OOH — CORS Handler ──────────────────────────────────────────

declare(strict_types=1);

class Cors
{
    /**
     * Sets CORS headers and handles pre-flight OPTIONS requests.
     *
     * @param string[] $allowedOrigins  List of allowed origins.
     */
    public static function handle(array $allowedOrigins): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Only echo back the origin if it is in the allow-list.
        if (in_array($origin, $allowedOrigins, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        }

        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Max-Age: 86400');
        header('Vary: Origin');

        // Respond immediately to pre-flight requests.
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
