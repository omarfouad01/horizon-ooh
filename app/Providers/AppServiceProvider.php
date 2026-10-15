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
        \Illuminate\Support\Facades\RateLimiter::for('login', function (\Illuminate\Http\Request $request) {
            $email = mb_strtolower(trim((string) $request->input('email', '')));
            return [
                \Illuminate\Cache\RateLimiting\Limit::perMinute(5)->by('login-account:'.$email.'|'.$request->ip()),
                \Illuminate\Cache\RateLimiting\Limit::perMinute(30)->by('login-ip:'.$request->ip()),
            ];
        });
        if (!$this->app->runningInConsole()) {
            foreach ([\App\Models\Billboard::class, \App\Models\BillboardImage::class, \App\Models\Location::class, \App\Models\Project::class, \App\Models\Service::class, \App\Models\BlogPost::class, \App\Models\Setting::class, \App\Models\ClientBrand::class, \App\Models\TrustStat::class, \App\Models\ProcessStep::class, \App\Models\District::class, \App\Models\AdFormat::class, \App\Models\BillboardFormat::class] as $model) {
                if (!class_exists($model)) continue;
                $model::saved(fn () => \App\Support\PublicSeoRefresh::schedule());
                $model::deleted(fn () => \App\Support\PublicSeoRefresh::schedule());
            }
        }
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
