<?php
// ─── HORIZON OOH — Mailer ────────────────────────────────────────────────
// Simple wrapper around PHP's mail() or native SMTP socket.
// Drop in PHPMailer for production SMTP if preferred.

declare(strict_types=1);

class Mailer
{
    private array $cfg;

    public function __construct(array $mailConfig)
    {
        $this->cfg = $mailConfig;
    }

    /**
     * Send the contact notification to the HORIZON OOH team.
     *
     * @param array{name:string, email:string, phone:string, company:string, message:string} $data
     */
    public function sendContactNotification(array $data): bool
    {
        $to      = $this->cfg['to_email'];
        $from    = $this->cfg['from_email'];
        $name    = $this->cfg['from_name'];
        $subject = 'New Campaign Enquiry — ' . $data['name'];

        $body = $this->buildNotificationBody($data);

        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: {$name} <{$from}>\r\n";
        $headers .= "Reply-To: {$data['name']} <{$data['email']}>\r\n";
        $headers .= "X-Mailer: PHP/" . PHP_VERSION . "\r\n";

        return mail($to, $subject, $body, $headers);
    }

    /**
     * Send an acknowledgement to the person who submitted the form.
     */
    public function sendContactAck(array $data): bool
    {
        $to      = $data['email'];
        $from    = $this->cfg['from_email'];
        $name    = $this->cfg['from_name'];
        $subject = 'We received your enquiry — ' . $name;

        $body = $this->buildAckBody($data);

        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: {$name} <{$from}>\r\n";
        $headers .= "X-Mailer: PHP/" . PHP_VERSION . "\r\n";

        return mail($to, $subject, $body, $headers);
    }

    // ── HTML email templates ────────────────────────────────────────────

    private function buildNotificationBody(array $d): string
    {
        $rows = '';
        foreach ([
            'Name'    => $d['name'],
            'Email'   => $d['email'],
            'Phone'   => $d['phone']   ?: '—',
            'Company' => $d['company'] ?: '—',
            'Message' => nl2br(htmlspecialchars($d['message'])),
        ] as $label => $value) {
            $rows .= "<tr>
                <td style='padding:10px 16px;font-weight:700;background:#f5f5f6;font-family:Inter,sans-serif;font-size:13px;color:#0B0F1A;width:130px;vertical-align:top'>{$label}</td>
                <td style='padding:10px 16px;font-family:Inter,sans-serif;font-size:14px;color:#4a4a5a'>{$value}</td>
            </tr>";
        }

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
            <h2 style='color:#0B0F1A;font-size:22px;margin:0 0 24px;letter-spacing:-0.02em'>New Enquiry from {$d['name']}</h2>
            <table width='100%' cellpadding='0' cellspacing='0' style='border:1px solid rgba(11,15,26,0.08)'>{$rows}</table>
            <p style='margin:32px 0 0;color:rgba(11,15,26,0.4);font-size:12px'>Submitted: " . date('d M Y, H:i') . " EET · IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "</p>
          </td></tr>
        </table></td></tr></table></body></html>";
    }

    private function buildAckBody(array $d): string
    {
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
            <h2 style='color:#0B0F1A;font-size:24px;margin:0 0 16px;letter-spacing:-0.03em'>We received your enquiry, {$d['name']}.</h2>
            <p style='color:rgba(11,15,26,0.5);font-size:15px;line-height:1.75;margin:0 0 24px'>One of our media strategists will review your campaign brief and be in touch within 24 hours.</p>
            <table cellpadding='0' cellspacing='0'><tr>
              <td style='background:#D90429;padding:0 32px;height:48px'>
                <a href='https://horizonooh.com' style='color:#fff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;line-height:48px;display:block'>Visit Our Website</a>
              </td>
            </tr></table>
            <p style='margin:40px 0 0;color:rgba(11,15,26,0.3);font-size:12px'>HORIZON OOH · Cairo, Egypt · +20 2 1234 5678</p>
          </td></tr>
        </table></td></tr></table></body></html>";
    }
}
