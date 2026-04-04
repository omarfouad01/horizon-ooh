<?php
// ─── HORIZON OOH — Rate Limiter (file-based, no Redis required) ──────────

declare(strict_types=1);

class RateLimiter
{
    private string $storageDir;
    private int    $maxRequests;
    private int    $windowSeconds;

    public function __construct(int $maxRequests = 10, int $windowSeconds = 3600)
    {
        $this->storageDir    = sys_get_temp_dir() . '/horizon_ooh_rate';
        $this->maxRequests   = $maxRequests;
        $this->windowSeconds = $windowSeconds;

        if (!is_dir($this->storageDir)) {
            mkdir($this->storageDir, 0700, true);
        }
    }

    /**
     * Check if the given key (e.g. IP address) has exceeded the rate limit.
     *
     * @throws \RuntimeException  If limit exceeded.
     */
    public function check(string $key): void
    {
        $file = $this->storageDir . '/' . md5($key) . '.json';
        $now  = time();

        $data = ['count' => 0, 'window_start' => $now];

        if (file_exists($file)) {
            $raw = json_decode(file_get_contents($file) ?: '{}', true);
            if (is_array($raw)) {
                $data = $raw;
            }
        }

        // Reset window if expired
        if (($now - ($data['window_start'] ?? $now)) > $this->windowSeconds) {
            $data = ['count' => 0, 'window_start' => $now];
        }

        $data['count'] = ($data['count'] ?? 0) + 1;
        file_put_contents($file, json_encode($data), LOCK_EX);

        if ($data['count'] > $this->maxRequests) {
            $retry = $this->windowSeconds - ($now - $data['window_start']);
            header('Retry-After: ' . max(1, $retry));
            throw new \RuntimeException(
                "Too many requests. Please wait {$retry} seconds before trying again.",
                429
            );
        }
    }
}
