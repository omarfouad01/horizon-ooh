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
