<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SitemapController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| The React app uses BrowserRouter with real URL paths (no #/).
| Laravel serves index.html for every non-API, non-asset request so
| React Router can handle client-side navigation on page load/refresh.
|
*/

// ── Sitemap & Robots — must be before the SPA catch-all ─────────────────────
Route::get('/sitemap.xml', [SitemapController::class, 'index']);
Route::get('/robots.txt',  [SitemapController::class, 'robots']);

// ── Dynamic Favicon — serves the admin-uploaded favicon from DB ───────────────
// Ensures /favicon.ico ALWAYS returns the latest icon set in Dashboard → Settings → Logo & Favicon.
Route::get('/favicon.ico', function () {
    $faviconUrl = null;
    try {
        $setting = \App\Models\Setting::where('key', 'faviconUrl')->first();
        if ($setting) {
            $decoded    = json_decode($setting->value, true);
            $faviconUrl = is_string($decoded) ? $decoded : $setting->value;
        }
    } catch (\Throwable $e) { /* DB not ready — fall through */ }

    // External URL → redirect permanently (Google follows 301s)
    if ($faviconUrl && str_starts_with($faviconUrl, 'http')) {
        return redirect()->away($faviconUrl, 301)
            ->header('Cache-Control', 'public, max-age=3600');
    }

    // Base64 data URI → decode and serve inline
    if ($faviconUrl && str_starts_with($faviconUrl, 'data:')) {
        if (preg_match('/^data:([^;]+);base64,(.+)$/', $faviconUrl, $m)) {
            return response(base64_decode($m[2]), 200)
                ->header('Content-Type',  $m[1])
                ->header('Cache-Control', 'public, max-age=3600')
                ->header('X-Favicon-Source', 'dashboard');
        }
    }

    // Fall back to static file
    $static = public_path('favicon.ico');
    if (file_exists($static)) {
        return response()->file($static, [
            'Content-Type'  => 'image/x-icon',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    return response('Not found', 404);
});

// ── SPA catch-all — serves index.html for ALL public routes ──────────────────
// This is required for BrowserRouter: visiting /services directly must return
// index.html so React Router can boot and render the correct page.
Route::get('/{any?}', function () {
    $indexPath = public_path('index.html');

    // If Vite hasn't built yet (e.g. fresh clone before npm run build),
    // show a friendly message instead of a 404.
    if (!file_exists($indexPath)) {
        return response(
            '<h2 style="font-family:sans-serif;padding:2rem">
              Frontend not built yet.<br>
              Run <code>npm install && npm run build</code> from the project root.
             </h2>',
            200
        )->header('Content-Type', 'text/html');
    }

    return response()->file($indexPath);
})->where('any', '.*');
