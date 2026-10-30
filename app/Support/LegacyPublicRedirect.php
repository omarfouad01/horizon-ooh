<?php
namespace App\Support;

/** Resolve former public URL shapes only to exact, currently generated pages. */
class LegacyPublicRedirect
{
    private const ALIASES = [
        // Three Angles west-Cairo inventory belongs to Giza; retain indexed URLs.
        'locations/cairo/billboards/gate-mehwar-el-shekh-zayed' => 'locations/giza/billboards/gate-mehwar-el-shekh-zayed',
        'locations/cairo/billboards/combo-mehwar-el-shehk-zayed' => 'locations/giza/billboards/combo-mehwar-el-shehk-zayed',
        'locations/cairo/billboards/uni-pole-el-shikh-zayed' => 'locations/giza/billboards/uni-pole-el-shikh-zayed',
        'locations/cairo/billboards/gate-mehwar-el-shikh-zayed' => 'locations/giza/billboards/gate-mehwar-el-shikh-zayed',
        'locations/cairo/billboards/succette-mehwar-el-shikh-zayed' => 'locations/giza/billboards/succette-mehwar-el-shikh-zayed',
        'locations/cairo/billboards/succette-mehwar-gamal-abdelnasr' => 'locations/giza/billboards/succette-mehwar-gamal-abdelnasr',
        'locations/cairo/billboards/mega-mall-of-egypt' => 'locations/giza/billboards/mega-mall-of-egypt',
        'locations/cairo/billboards/t-pole-mehwar-el-shikh-zayed' => 'locations/giza/billboards/t-pole-mehwar-el-shikh-zayed',
        'locations/cairo/billboards/uni-pole-desert-road-zayed-entrance' => 'locations/giza/billboards/uni-pole-desert-road-zayed-entrance',
        'locations/cairo/billboards/uni-pole-mehwar-el-shikh-zayed' => 'locations/giza/billboards/uni-pole-mehwar-el-shikh-zayed',
        'locations/cairo/billboards/t-pole-zayed' => 'locations/giza/billboards/t-pole-zayed',
        'locations/cairo/billboards/t-pole-zayed-travco' => 'locations/giza/billboards/t-pole-zayed-travco',
        'locations/cairo/billboards/t-pole-zayed-americana-plaza' => 'locations/giza/billboards/t-pole-zayed-americana-plaza',
        'locations/cairo/billboards/t-pole-zayed-500-500-hospital' => 'locations/giza/billboards/t-pole-zayed-500-500-hospital',
        'locations/cairo/billboards/t-pole-zayed-square' => 'locations/giza/billboards/t-pole-zayed-square',
        'locations/cairo/billboards/t-pole-zayed-doraa-square' => 'locations/giza/billboards/t-pole-zayed-doraa-square',
        'locations/cairo/billboards/t-pole-zayed-exit' => 'locations/giza/billboards/t-pole-zayed-exit',
        'locations/cairo/billboards/t-pole-zayed-tha-gate-mall' => 'locations/giza/billboards/t-pole-zayed-tha-gate-mall',
        'locations/cairo/billboards/t-pole-zayed-courtyard' => 'locations/giza/billboards/t-pole-zayed-courtyard',
        'locations/cairo/billboards/t-pole-zayed-infront-of-courtyard' => 'locations/giza/billboards/t-pole-zayed-infront-of-courtyard',
        'locations/cairo/billboards/t-pole-zayed-al-ahly-club-entrance' => 'locations/giza/billboards/t-pole-zayed-al-ahly-club-entrance',
        'locations/cairo/billboards/t-pole-zayed-mazar-mall' => 'locations/giza/billboards/t-pole-zayed-mazar-mall',
        'locations/cairo/billboards/succette-mehwar-el-shikh-zayed-cairo-1' => 'locations/giza/billboards/succette-mehwar-el-shikh-zayed-cairo-1',

        // Mall of Arabia belongs to Giza; preserve both language URLs after correction.
        'locations/cairo/billboards/uni-pole-6-oct-city-mall-of-arabia' => 'locations/giza/billboards/uni-pole-6-oct-city-mall-of-arabia',

        // AUD governorate corrections retain the original indexed URLs.
        'locations/giza/billboards/h-14166-digital-screen-rod-al-farag-axis' => 'locations/cairo/billboards/h-14166-digital-screen-rod-al-farag-axis',
        'locations/cairo/billboards/digital-screen-dahshur' => 'locations/giza/billboards/digital-screen-dahshur',

        // Retired Garnish duplicates; keep the updated inventory URLs.
        'locations/cairo/billboards/uni-poles-suez-rd' => 'locations/cairo/billboards/h-14472-uni-pole-suez-road-after-cairo-airport-exit',
        'product/uni-poles-suez-rd' => 'locations/cairo/billboards/h-14472-uni-pole-suez-road-after-cairo-airport-exit',
        'locations/cairo/billboards/gate-e-l-moshir-tantawy' => 'locations/cairo/billboards/h-14473-combo-el-mosher-tantawy-axis-gate-a1',
        'product/gate-e-l-moshir-tantawy' => 'locations/cairo/billboards/h-14473-combo-el-mosher-tantawy-axis-gate-a1',

        'home' => '',
        'about-us' => 'about',
        'about-us/why-choose-us' => 'about',
        'terms-and-conditions' => 'terms',
        // The old paginated inventory is now the searchable location directory.
        'products' => 'locations',
        'services/airport-advertising' => 'services/airport-advertising-in-egypt',
        'services/billboard-advertising' => 'services/billboard-advertising-in-egypt',
        'services/digital-out-of-home' => 'services/dooh-advertising-in-egypt',
    ];

    public static function destination(string $path): ?string
    {
        [$locale, $relative] = self::parts($path);
        if ($locale !== 'en' && !isset(self::ALIASES[$relative])
            && !preg_match('#^(?:product|project)/[A-Za-z0-9_-]+$#D', $relative)) return null;
        $file = public_path('ssg/manifest.json');
        if (!is_file($file)) return null;
        $manifest = json_decode(file_get_contents($file), true);
        return self::resolve($path, $manifest['routes'] ?? []);
    }

    public static function resolve(string $path, array $routes): ?string
    {
        $path = trim($path, '/');
        if ($path === '' || !preg_match('#^[A-Za-z0-9/_-]+$#D', $path)) return null;
        [$locale, $relative] = self::parts($path);
        $prefix = $locale === 'ar' ? '/ar' : '';
        $target = null;
        if (array_key_exists($relative, self::ALIASES)) {
            $target = $prefix . '/' . self::ALIASES[$relative];
            $target = rtrim($target, '/') ?: '/';
        } elseif (preg_match('#^(product|project)/([A-Za-z0-9_-]+)$#D', $relative, $match)) {
            $suffix = ($match[1] === 'product' ? '/billboards/' : '/projects/') . $match[2];
            $routePrefix = $prefix . ($match[1] === 'product' ? '/locations/' : '/projects/');
            $matches = array_values(array_filter($routes, fn ($route) => is_string($route)
                && str_starts_with($route, $routePrefix) && str_ends_with($route, $suffix)));
            if (count($matches) === 1) $target = $matches[0];
        } elseif ($locale === 'en') {
            $target = '/' . $relative;
        }
        // No guessed replacements, open redirects, or redirects for missing/draft pages.
        if (!$target || $target === '/' . $path || !in_array($target, $routes, true)) return null;
        return $target;
    }

    private static function parts(string $path): array
    {
        $path = trim($path, '/');
        if (preg_match('#^(ar|en)(?:/(.*))?$#D', $path, $match)) return [$match[1], $match[2] ?? ''];
        return ['', $path];
    }
}
