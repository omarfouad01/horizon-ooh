<?php
// ─── HORIZON OOH — Backend Configuration ─────────────────────────────────
// Copy this file to config.php and fill in your values.
// NEVER commit config.php to Git.

return [

    // ── Application ────────────────────────────────────────────────────────
    'app' => [
        'name'        => 'HORIZON OOH',
        'env'         => getenv('APP_ENV') ?: 'production',   // 'development' | 'production'
        'url'         => getenv('APP_URL')  ?: 'https://horizonooh.com',
        'debug'       => false,
    ],

    // ── CORS ───────────────────────────────────────────────────────────────
    // Origins allowed to call this API.
    // In production set this to your exact frontend domain(s).
    'cors' => [
        'allowed_origins' => [
            getenv('CORS_ORIGIN') ?: 'https://horizonooh.com',
            'http://localhost:5173',   // Vite dev server
            'http://localhost:4173',   // Vite preview
        ],
    ],

    // ── Database (MySQL) ───────────────────────────────────────────────────
    'db' => [
        'host'    => getenv('DB_HOST')     ?: '127.0.0.1',
        'port'    => (int)(getenv('DB_PORT') ?: 3306),
        'name'    => getenv('DB_NAME')     ?: 'horizonooh',
        'user'    => getenv('DB_USER')     ?: 'root',
        'pass'    => getenv('DB_PASS')     ?: '',
        'charset' => 'utf8mb4',
    ],

    // ── Mail (SMTP via PHPMailer or native mail()) ─────────────────────────
    'mail' => [
        'driver'     => getenv('MAIL_DRIVER')     ?: 'smtp',   // 'smtp' | 'sendmail' | 'mail'
        'host'       => getenv('MAIL_HOST')        ?: 'smtp.gmail.com',
        'port'       => (int)(getenv('MAIL_PORT')  ?: 587),
        'encryption' => getenv('MAIL_ENCRYPTION')  ?: 'tls',
        'username'   => getenv('MAIL_USERNAME')    ?: '',
        'password'   => getenv('MAIL_PASSWORD')    ?: '',
        'from_email' => getenv('MAIL_FROM_EMAIL')  ?: 'info@horizonooh.com',
        'from_name'  => getenv('MAIL_FROM_NAME')   ?: 'HORIZON OOH',
        'to_email'   => getenv('MAIL_TO_EMAIL')    ?: 'info@horizonooh.com',
    ],

    // ── Rate limiting ─────────────────────────────────────────────────────
    'rate_limit' => [
        'contact_max_per_hour' => 10,  // max contact form submissions per IP per hour
    ],

    // ── API ───────────────────────────────────────────────────────────────
    'api' => [
        'version'    => 'v1',
        'secret_key' => getenv('API_SECRET_KEY') ?: 'change-this-to-a-random-string',
    ],
];
