<?php
// ─── HORIZON OOH — Mailer ────────────────────────────────────────────────
// Sends email via SMTP (reads driver/host/port/encryption/username/password
// from the mail config array).  Falls back to PHP mail() when driver is
// 'mail' or when no SMTP credentials are configured.
//
// No Composer dependency required — uses PHP's fsockopen() directly.
//
// ── Configuration reference (backend/config/config.php) ──────────────────
//   'mail' => [
//       'driver'     => 'smtp',              // 'smtp' | 'sendmail' | 'mail'
//       'host'       => 'smtp.gmail.com',    // SMTP hostname
//       'port'       => 587,                 // 587 (TLS/STARTTLS) or 465 (SSL)
//       'encryption' => 'tls',              // 'tls' (STARTTLS) | 'ssl' | ''
//       'username'   => 'you@gmail.com',
//       'password'   => 'app-password-here',
//       'from_email' => 'info@horizonooh.com',
//       'from_name'  => 'HORIZON OOH',
//       'to_email'   => 'info@horizonooh.com',
//   ],
//
// ── PHPMailer upgrade path ────────────────────────────────────────────────
// For high-volume production use, swap in PHPMailer (battle-tested, handles
// OAuth, attachments, bulk sending, etc.):
//
//   composer require phpmailer/phpmailer
//
// Then replace the SmtpClient calls in sendContactNotification() /
// sendContactAck() with:
//
//   $mail = new PHPMailer\PHPMailer\PHPMailer(true);
//   $mail->isSMTP();
//   $mail->Host       = $this->cfg['host'];
//   $mail->SMTPAuth   = true;
//   $mail->Username   = $this->cfg['username'];
//   $mail->Password   = $this->cfg['password'];
//   $mail->SMTPSecure = $this->cfg['encryption'] === 'ssl'
//                         ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
//                         : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
//   $mail->Port       = (int)$this->cfg['port'];
//   $mail->setFrom($this->cfg['from_email'], $this->cfg['from_name']);
//   $mail->addAddress($to);
//   $mail->isHTML(true);
//   $mail->Subject = $subject;
//   $mail->Body    = $body;
//   return $mail->send();
// ─────────────────────────────────────────────────────────────────────────

declare(strict_types=1);

class Mailer
{
    private array $cfg;

    public function __construct(array $mailConfig)
    {
        $this->cfg = $mailConfig;
    }

    // =========================================================================
    // Public send methods
    // =========================================================================

    /**
     * Send the campaign-enquiry notification to the HORIZON OOH team.
     *
     * @param array{name:string,email:string,phone:string,company:string,message:string} $data
     */
    public function sendContactNotification(array $data): bool
    {
        $to      = $this->cfg['to_email'];
        $subject = 'New Campaign Enquiry — ' . $data['name'];
        $body    = $this->buildNotificationBody($data);
        $replyTo = $data['email'];

        return $this->send($to, $subject, $body, $replyTo);
    }

    /**
     * Send an acknowledgement email to the person who submitted the form.
     */
    public function sendContactAck(array $data): bool
    {
        $to      = $data['email'];
        $subject = 'We received your enquiry — ' . $this->cfg['from_name'];
        $body    = $this->buildAckBody($data);

        return $this->send($to, $subject, $body);
    }

    // =========================================================================
    // Core send dispatcher
    // =========================================================================

    /**
     * Route to SMTP or fallback depending on config.
     */
    private function send(string $to, string $subject, string $body, string $replyTo = ''): bool
    {
        $driver      = strtolower($this->cfg['driver'] ?? 'smtp');
        $hasSmtpCfg  = !empty($this->cfg['host'])
                    && !empty($this->cfg['username'])
                    && !empty($this->cfg['password']);

        if ($driver === 'smtp' && $hasSmtpCfg) {
            try {
                return $this->sendViaSmtp($to, $subject, $body, $replyTo);
            } catch (\Throwable $e) {
                error_log('[HORIZON OOH] SMTP error: ' . $e->getMessage() . ' — falling back to mail()');
            }
        }

        // Fallback: native mail()
        return $this->sendViaNativeMail($to, $subject, $body, $replyTo);
    }

    // =========================================================================
    // SMTP implementation (fsockopen — no Composer required)
    // =========================================================================

    /**
     * Send an HTML email over SMTP using raw fsockopen() sockets.
     *
     * Supports:
     *   - Plain TCP (port 25, no encryption)
     *   - STARTTLS (port 587, encryption = 'tls')
     *   - SSL/TLS wrapper (port 465, encryption = 'ssl')
     *   - LOGIN and PLAIN AUTH mechanisms
     *
     * @throws \RuntimeException on any SMTP protocol error
     */
    private function sendViaSmtp(string $to, string $subject, string $body, string $replyTo = ''): bool
    {
        $host       = $this->cfg['host'];
        $port       = (int)($this->cfg['port'] ?? 587);
        $encryption = strtolower($this->cfg['encryption'] ?? 'tls');
        $username   = $this->cfg['username'];
        $password   = $this->cfg['password'];
        $fromEmail  = $this->cfg['from_email'];
        $fromName   = $this->cfg['from_name'];
        $timeout    = 30;

        // ── Open connection ──────────────────────────────────────────────────
        if ($encryption === 'ssl') {
            $connHost = 'ssl://' . $host;
        } else {
            $connHost = $host;
        }

        $errno  = 0;
        $errstr = '';
        $sock   = @fsockopen($connHost, $port, $errno, $errstr, $timeout);

        if ($sock === false) {
            throw new \RuntimeException("SMTP connect failed ({$connHost}:{$port}): [{$errno}] {$errstr}");
        }

        stream_set_timeout($sock, $timeout);

        // ── Read greeting ────────────────────────────────────────────────────
        $this->smtpExpect($sock, 220, 'greeting');

        // ── EHLO ─────────────────────────────────────────────────────────────
        $this->smtpCmd($sock, 'EHLO ' . $this->smtpHostname(), 250);

        // ── STARTTLS upgrade ─────────────────────────────────────────────────
        if ($encryption === 'tls') {
            $this->smtpCmd($sock, 'STARTTLS', 220);
            if (!stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new \RuntimeException('STARTTLS crypto negotiation failed.');
            }
            // Re-issue EHLO after TLS upgrade
            $this->smtpCmd($sock, 'EHLO ' . $this->smtpHostname(), 250);
        }

        // ── AUTH LOGIN ───────────────────────────────────────────────────────
        $this->smtpCmd($sock, 'AUTH LOGIN', 334);
        $this->smtpCmd($sock, base64_encode($username), 334);
        $this->smtpCmd($sock, base64_encode($password), 235);

        // ── Envelope ─────────────────────────────────────────────────────────
        $this->smtpCmd($sock, 'MAIL FROM:<' . $fromEmail . '>', 250);
        $this->smtpCmd($sock, 'RCPT TO:<' . $to . '>',          250);

        // ── DATA ─────────────────────────────────────────────────────────────
        $this->smtpCmd($sock, 'DATA', 354);

        $msgId   = '<' . time() . '.' . md5(uniqid('', true)) . '@' . $this->smtpHostname() . '>';
        $date    = date('r');
        $encSubj = $this->encodeHeader($subject);

        $headers  = "Date: {$date}\r\n";
        $headers .= "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <{$fromEmail}>\r\n";
        $headers .= "To: <{$to}>\r\n";
        if ($replyTo) {
            $headers .= "Reply-To: <{$replyTo}>\r\n";
        }
        $headers .= "Subject: {$encSubj}\r\n";
        $headers .= "Message-ID: {$msgId}\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "Content-Transfer-Encoding: base64\r\n";
        $headers .= "X-Mailer: HORIZON-OOH-Mailer/1.0\r\n";

        // Body as base64 (avoids dot-stuffing issues with binary data)
        $encodedBody = chunk_split(base64_encode($body));

        fwrite($sock, $headers . "\r\n" . $encodedBody . "\r\n.\r\n");
        $this->smtpExpect($sock, 250, 'end of DATA');

        // ── QUIT ─────────────────────────────────────────────────────────────
        fwrite($sock, "QUIT\r\n");
        fclose($sock);

        return true;
    }

    // =========================================================================
    // SMTP helpers
    // =========================================================================

    /** Send a command and assert the expected reply code. */
    private function smtpCmd($sock, string $cmd, int $expect): string
    {
        fwrite($sock, $cmd . "\r\n");
        return $this->smtpExpect($sock, $expect, $cmd);
    }

    /** Read lines until a non-continuation line is found; assert reply code. */
    private function smtpExpect($sock, int $expect, string $context): string
    {
        $response = '';
        while ($line = fgets($sock, 512)) {
            $response .= $line;
            // A line like "250 " (space after code) is the last line.
            // A line like "250-" (dash) means more lines follow.
            if (strlen($line) >= 4 && $line[3] !== '-') {
                break;
            }
        }
        $code = (int)substr($response, 0, 3);
        if ($code !== $expect) {
            throw new \RuntimeException(
                "SMTP unexpected response for [{$context}]: expected {$expect}, got {$code}: " . trim($response)
            );
        }
        return $response;
    }

    /** Return the local hostname for EHLO. */
    private function smtpHostname(): string
    {
        return gethostname() ?: 'localhost';
    }

    /** Encode a header value as UTF-8 Base64 Q-encoding if it has non-ASCII chars. */
    private function encodeHeader(string $value): string
    {
        if (preg_match('/[^\x20-\x7E]/', $value)) {
            return '=?UTF-8?B?' . base64_encode($value) . '?=';
        }
        return $value;
    }

    // =========================================================================
    // Fallback: PHP native mail()
    // =========================================================================

    private function sendViaNativeMail(string $to, string $subject, string $body, string $replyTo = ''): bool
    {
        $from = $this->cfg['from_email'];
        $name = $this->cfg['from_name'];

        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: {$name} <{$from}>\r\n";
        if ($replyTo) {
            $headers .= "Reply-To: <{$replyTo}>\r\n";
        }
        $headers .= "X-Mailer: HORIZON-OOH-Mailer/1.0\r\n";

        return mail($to, $subject, $body, $headers);
    }

    // =========================================================================
    // HTML email templates
    // =========================================================================

    private function buildNotificationBody(array $d): string
    {
        $rows = '';
        foreach ([
            'Name'    => htmlspecialchars($d['name'],    ENT_QUOTES, 'UTF-8'),
            'Email'   => htmlspecialchars($d['email'],   ENT_QUOTES, 'UTF-8'),
            'Phone'   => htmlspecialchars($d['phone']   ?: '—', ENT_QUOTES, 'UTF-8'),
            'Company' => htmlspecialchars($d['company'] ?: '—', ENT_QUOTES, 'UTF-8'),
            'Message' => nl2br(htmlspecialchars($d['message'], ENT_QUOTES, 'UTF-8')),
        ] as $label => $value) {
            $rows .= "<tr>
                <td style='padding:10px 16px;font-weight:700;background:#f5f5f6;font-family:Inter,sans-serif;font-size:13px;color:#0B0F1A;width:130px;vertical-align:top'>{$label}</td>
                <td style='padding:10px 16px;font-family:Inter,sans-serif;font-size:14px;color:#4a4a5a'>{$value}</td>
            </tr>";
        }

        $submitted = htmlspecialchars(date('d M Y, H:i'), ENT_QUOTES, 'UTF-8');
        $ip        = htmlspecialchars($_SERVER['REMOTE_ADDR'] ?? 'unknown', ENT_QUOTES, 'UTF-8');

        return "<!DOCTYPE html><html><body style='margin:0;padding:0;background:#f5f5f6;font-family:Inter,sans-serif'>
        <table width='100%' cellpadding='0' cellspacing='0'><tr><td align='center' style='padding:48px 16px'>
        <table width='600' cellpadding='0' cellspacing='0' style='background:#fff'>
          <tr><td style='background:#0B0F1A;padding:32px 40px'>
            <table cellpadding='0' cellspacing='0'><tr>
              <td style='background:#D90429;width:10px;height:32px;margin-right:12px'></td>
              <td style='padding-left:12px;color:#fff;font-size:15px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase'>HORIZON OOH</td>
            </tr></table>
            <p style='color:rgba(255,255,255,0.5);margin:12px 0 0;font-size:13px'>New campaign enquiry received</p>
          </td></tr>
          <tr><td style='padding:40px'>
            <h2 style='color:#0B0F1A;font-size:22px;margin:0 0 24px;letter-spacing:-0.02em'>New Enquiry from " . htmlspecialchars($d['name'], ENT_QUOTES, 'UTF-8') . "</h2>
            <table width='100%' cellpadding='0' cellspacing='0' style='border:1px solid rgba(11,15,26,0.08)'>{$rows}</table>
            <p style='margin:32px 0 0;color:rgba(11,15,26,0.4);font-size:12px'>Submitted: {$submitted} EET &middot; IP: {$ip}</p>
          </td></tr>
        </table></td></tr></table></body></html>";
    }

    private function buildAckBody(array $d): string
    {
        $firstName = htmlspecialchars($d['name'], ENT_QUOTES, 'UTF-8');

        return "<!DOCTYPE html><html><body style='margin:0;padding:0;background:#f5f5f6;font-family:Inter,sans-serif'>
        <table width='100%' cellpadding='0' cellspacing='0'><tr><td align='center' style='padding:48px 16px'>
        <table width='600' cellpadding='0' cellspacing='0' style='background:#fff'>
          <tr><td style='background:#0B0F1A;padding:32px 40px'>
            <table cellpadding='0' cellspacing='0'><tr>
              <td style='background:#D90429;width:10px;height:32px'></td>
              <td style='padding-left:12px;color:#fff;font-size:15px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase'>HORIZON OOH</td>
            </tr></table>
          </td></tr>
          <tr><td style='padding:40px'>
            <h2 style='color:#0B0F1A;font-size:24px;margin:0 0 16px;letter-spacing:-0.03em'>We received your enquiry, {$firstName}.</h2>
            <p style='color:rgba(11,15,26,0.5);font-size:15px;line-height:1.75;margin:0 0 24px'>One of our media strategists will review your campaign brief and be in touch within 24 hours.</p>
            <table cellpadding='0' cellspacing='0'><tr>
              <td style='background:#D90429;padding:0 32px;height:48px'>
                <a href='https://horizonooh.com' style='color:#fff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;line-height:48px;display:block'>Visit Our Website</a>
              </td>
            </tr></table>
            <p style='margin:40px 0 0;color:rgba(11,15,26,0.3);font-size:12px'>HORIZON OOH &middot; Cairo, Egypt</p>
          </td></tr>
        </table></td></tr></table></body></html>";
    }
}
