<?php
namespace App\Support;

class PublicSeoRefresh
{
    /** Remove an article's old static HTML immediately when withdrawing it. */
    public static function removeBlogPage(string $slug): void
    {
        if (!preg_match('/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/D', $slug)) return;
        foreach (['blog/', 'ar/blog/'] as $prefix) {
            foreach (['index.html', 'index.html.br', 'index.html.gz'] as $file) {
                $path = public_path('ssg/'.$prefix.$slug.'/'.$file);
                if (is_file($path) && !unlink($path)) throw new \RuntimeException('Could not invalidate the article page.');
            }
        }
    }

    private static bool $scheduled = false;

    public static function schedule(): void
    {
        if (app()->runningInConsole() || self::$scheduled) return;
        self::$scheduled = true;
        $directory = storage_path('app/seo-runtime');
        if (!is_dir($directory)) mkdir($directory, 0755, true);
        file_put_contents($directory . '/dirty', (string) microtime(true), LOCK_EX);
        app()->terminating(function () {
            if (!function_exists('exec')) return;
            $script = base_path('scripts/refresh-seo.cjs');
            $log = storage_path('logs/seo-refresh.log');
            exec('nohup node ' . escapeshellarg($script) . ' >> ' . escapeshellarg($log) . ' 2>&1 < /dev/null &');
        });
    }
}
