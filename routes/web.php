<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SitemapController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| All non-API requests are served by the React SPA's index.html.
| The React app uses HashRouter, so all routing is handled client-side.
| Laravel only needs to return the index.html for every web request.
|
*/

// ── Sitemap & Robots — must be before the SPA catch-all ─────────────────────
Route::get('/sitemap.xml', [SitemapController::class, 'index']);
Route::get('/robots.txt',  [SitemapController::class, 'robots']);

// ── SPA catch-all ─────────────────────────────────────────────────────────────
Route::get('/{any?}', function () {
    // $indexPath = public_path('app/index.html');
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
