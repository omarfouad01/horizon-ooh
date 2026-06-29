<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ── Fix: Apache strips Authorization header when using mod_rewrite/CGI ──
        // The .htaccess passes it as HTTP_AUTHORIZATION env var.
        // This ensures Laravel's Request object sees the token correctly.
        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            request()->headers->set('Authorization', $_SERVER['HTTP_AUTHORIZATION']);
        }
        // Also handle REDIRECT_HTTP_AUTHORIZATION (some Apache setups use this)
        elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            request()->headers->set('Authorization', $_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
        }
    }
}
