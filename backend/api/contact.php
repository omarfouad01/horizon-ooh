<?php
// ─── HORIZON OOH — POST /api/contact ─────────────────────────────────────
// Handles campaign enquiry form submissions.
// Validates input → saves to DB → sends notification email → sends ack email.

declare(strict_types=1);

// bootstrap.php already loaded by index.php
require_once LIB_DIR . '/Validator.php';
require_once LIB_DIR . '/Database.php';
require_once LIB_DIR . '/Mailer.php';
require_once LIB_DIR . '/RateLimiter.php';

// ── Only POST ─────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonMethodNotAllowed();
}

// ── Rate limit (per IP) ───────────────────────────────────────────────────
try {
    $limiter = new RateLimiter(
        (int)($CONFIG['rate_limit']['contact_max_per_hour'] ?? 10),
        3600
    );
    $limiter->check($_SERVER['REMOTE_ADDR'] ?? 'unknown');
} catch (\RuntimeException $e) {
    jsonError($e->getMessage(), $e->getCode() ?: 429);
}

// ── Parse body ────────────────────────────────────────────────────────────
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';

if (str_contains($contentType, 'application/json')) {
    $raw  = file_get_contents('php://input');
    $body = json_decode($raw ?: '{}', true);
    if (!is_array($body)) {
        jsonError('Invalid JSON body.', 400);
    }
} else {
    $body = $_POST;
}

// ── Sanitise ──────────────────────────────────────────────────────────────
$name    = Validator::sanitize($body['name']    ?? '');
$email   = Validator::sanitize($body['email']   ?? '');
$phone   = Validator::sanitize($body['phone']   ?? '');
$company = Validator::sanitize($body['company'] ?? '');
$message = Validator::sanitize($body['message'] ?? '');

// ── Validate ──────────────────────────────────────────────────────────────
$v = new Validator();
$v->required('name',    $name)
  ->minLength('name',   $name, 2)
  ->maxLength('name',   $name, 120)
  ->required('email',   $email)
  ->email('email',      $email)
  ->maxLength('email',  $email, 255)
  ->phone('phone',      $phone)
  ->maxLength('company',$company, 200)
  ->required('message', $message)
  ->minLength('message',$message, 10)
  ->maxLength('message',$message, 2000);

if ($v->fails()) {
    jsonError('Validation failed.', 422, $v->errors());
}

// ── Honeypot (anti-spam) ──────────────────────────────────────────────────
// If a bot fills the hidden field, silently discard.
if (!empty($body['website'])) {
    // Pretend success so bots don't retry.
    jsonOk(['message' => 'Your message has been received. We will be in touch within 24 hours.']);
}

// ── Persist to database (if configured) ───────────────────────────────────
$leadId = null;
try {
    $pdo = Database::connect($CONFIG['db']);
    $pdo->exec("CREATE TABLE IF NOT EXISTS contact_leads (
        id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(120)  NOT NULL,
        email      VARCHAR(255)  NOT NULL,
        phone      VARCHAR(30)   NOT NULL DEFAULT '',
        company    VARCHAR(200)  NOT NULL DEFAULT '',
        message    TEXT          NOT NULL,
        ip_address VARCHAR(45)   NOT NULL DEFAULT '',
        user_agent VARCHAR(500)  NOT NULL DEFAULT '',
        created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $stmt = $pdo->prepare(
        "INSERT INTO contact_leads (name, email, phone, company, message, ip_address, user_agent)
         VALUES (:name, :email, :phone, :company, :message, :ip, :ua)"
    );
    $stmt->execute([
        ':name'    => $name,
        ':email'   => $email,
        ':phone'   => $phone,
        ':company' => $company,
        ':message' => $message,
        ':ip'      => $_SERVER['REMOTE_ADDR']    ?? '',
        ':ua'      => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
    ]);
    $leadId = (int)$pdo->lastInsertId();
} catch (\Throwable $e) {
    // DB failure is not fatal — we still send the email.
    error_log('[HORIZON OOH] DB error on contact: ' . $e->getMessage());
}

// ── Send emails ───────────────────────────────────────────────────────────
$mailer = new Mailer($CONFIG['mail']);
$data   = compact('name', 'email', 'phone', 'company', 'message');

$notified = false;
$acked    = false;

try {
    $notified = $mailer->sendContactNotification($data);
    $acked    = $mailer->sendContactAck($data);
} catch (\Throwable $e) {
    error_log('[HORIZON OOH] Mail error: ' . $e->getMessage());
}

// ── Respond ───────────────────────────────────────────────────────────────
jsonOk([
    'message'  => 'Your message has been received. We will be in touch within 24 hours.',
    'lead_id'  => $leadId,
]);
