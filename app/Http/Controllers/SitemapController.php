<?php
namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Project;
use App\Models\Location;
use App\Models\Billboard;
use Illuminate\Support\Facades\Schema;

/**
 * SitemapController — generates a sitemap INDEX from the database.
 *
 * Architecture (handles 3,000+ billboards without memory issues):
 *   GET /sitemap.xml                  → sitemap index listing all sub-sitemaps
 *   GET /sitemap-static.xml           → pages, services, projects, locations, blog
 *   GET /sitemap-billboards-{page}.xml → 500 billboards per file
 *
 * All sub-sitemaps include /ar/ alternate URLs for Arabic SEO.
 */
class SitemapController extends Controller
{
    private string $base    = 'https://horizonooh.com';
    private int    $perPage = 500;   // billboards per sub-sitemap

    // ─────────────────────────────────────────────────────────────────────────
    // GET /sitemap.xml  →  sitemap index
    // ─────────────────────────────────────────────────────────────────────────
    public function index(): \Illuminate\Http\Response
    {
        $sitemaps = collect();

        // Static sub-sitemap (pages, services, projects, locations, blog)
        $sitemaps->push([
            'loc'     => "{$this->base}/sitemap-static.xml",
            'lastmod' => now()->toAtomString(),
        ]);

        // Billboard sub-sitemaps — one file per $perPage chunk
        try {
            if (Schema::hasTable('billboards') && Schema::hasColumn('billboards', 'slug')) {
                $total = Billboard::whereNotNull('slug')->count();
                $pages = (int) ceil($total / $this->perPage);
                for ($i = 1; $i <= max($pages, 1); $i++) {
                    $sitemaps->push([
                        'loc'     => "{$this->base}/sitemap-billboards-{$i}.xml",
                        'lastmod' => now()->toAtomString(),
                    ]);
                }
            }
        } catch (\Throwable $e) { }

        $entries = $sitemaps->map(function ($s) {
            $loc     = htmlspecialchars($s['loc'],     ENT_XML1);
            $lastmod = htmlspecialchars($s['lastmod'], ENT_XML1);
            return "  <sitemap>\n    <loc>{$loc}</loc>\n    <lastmod>{$lastmod}</lastmod>\n  </sitemap>";
        })->implode("\n");

        $xml = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{$entries}
</sitemapindex>
XML;

        return response($xml, 200)
            ->header('Content-Type', 'application/xml; charset=UTF-8')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /sitemap-static.xml  →  pages, services, projects, locations, blog
    // ─────────────────────────────────────────────────────────────────────────
    public function staticSitemap(): \Illuminate\Http\Response
    {
        $now  = now()->toAtomString();
        $urls = collect();

        // ── Static pages (English + Arabic) ───────────────────────────────────
        $statics = [
            ['/',                 '1.0',  'weekly',  $now],
            ['/about',            '0.8',  'monthly', $now],
            ['/services',         '0.9',  'monthly', $now],
            ['/projects',         '0.9',  'weekly',  $now],
            ['/locations',        '0.8',  'monthly', $now],
            ['/blog',             '0.8',  'weekly',  $now],
            ['/contact',          '0.7',  'yearly',  $now],
            ['/design-simulator', '0.6',  'monthly', $now],
        ];
        foreach ($statics as [$path, $priority, $freq, $lastmod]) {
            $urls->push(['path' => $path,    'priority' => $priority, 'freq' => $freq, 'lastmod' => $lastmod]);
            $arPath = ($path === '/') ? '/ar' : '/ar' . $path;
            $urls->push(['path' => $arPath,  'priority' => $priority, 'freq' => $freq, 'lastmod' => $lastmod]);
        }

        // ── Services ──────────────────────────────────────────────────────────
        try {
            Service::orderBy('sort_order')->cursor()->each(function ($s) use (&$urls) {
                if (!$s->slug) return;
                $lm = $s->updated_at?->toAtomString() ?? now()->toAtomString();
                $urls->push(['path' => "/services/{$s->slug}",    'priority' => '0.8', 'freq' => 'monthly', 'lastmod' => $lm]);
                $urls->push(['path' => "/ar/services/{$s->slug}", 'priority' => '0.8', 'freq' => 'monthly', 'lastmod' => $lm]);
            });
        } catch (\Throwable $e) { }

        // ── Projects ──────────────────────────────────────────────────────────
        try {
            Project::orderBy('sort_order')->cursor()->each(function ($p) use (&$urls) {
                if (!$p->slug) return;
                $lm = $p->updated_at?->toAtomString() ?? now()->toAtomString();
                $urls->push(['path' => "/projects/{$p->slug}",   'priority' => '0.7', 'freq' => 'monthly', 'lastmod' => $lm]);
                $urls->push(['path' => "/ar/projects/{$p->slug}",'priority' => '0.7', 'freq' => 'monthly', 'lastmod' => $lm]);
            });
        } catch (\Throwable $e) { }

        // ── Locations ─────────────────────────────────────────────────────────
        try {
            Location::orderBy('sort_order')->cursor()->each(function ($l) use (&$urls) {
                if (!$l->slug) return;
                $lm = $l->updated_at?->toAtomString() ?? now()->toAtomString();
                $urls->push(['path' => "/locations/{$l->slug}",    'priority' => '0.7', 'freq' => 'monthly', 'lastmod' => $lm]);
                $urls->push(['path' => "/ar/locations/{$l->slug}", 'priority' => '0.7', 'freq' => 'monthly', 'lastmod' => $lm]);
            });
        } catch (\Throwable $e) { }

        // ── Blog Posts ────────────────────────────────────────────────────────
        try {
            \App\Models\BlogPost::orderBy('created_at', 'desc')->cursor()->each(function ($post) use (&$urls) {
                if (!$post->slug) return;
                $lm = $post->updated_at?->toAtomString() ?? now()->toAtomString();
                $urls->push(['path' => "/blog/{$post->slug}",    'priority' => '0.7', 'freq' => 'monthly', 'lastmod' => $lm]);
                $urls->push(['path' => "/ar/blog/{$post->slug}", 'priority' => '0.7', 'freq' => 'monthly', 'lastmod' => $lm]);
            });
        } catch (\Throwable $e) { }

        return response($this->buildUrlsetXml($urls), 200)
            ->header('Content-Type', 'application/xml; charset=UTF-8')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /sitemap-billboards-{page}.xml  →  500 billboards per file
    // ─────────────────────────────────────────────────────────────────────────
    public function billboardSitemap(int $page = 1): \Illuminate\Http\Response
    {
        $urls = collect();

        try {
            if (Schema::hasTable('billboards') && Schema::hasColumn('billboards', 'slug')) {
                Billboard::with('location:id,slug')
                    ->whereNotNull('slug')
                    ->orderBy('created_at', 'desc')
                    ->select(['id', 'slug', 'location_id', 'updated_at'])
                    ->forPage($page, $this->perPage)
                    ->cursor()
                    ->each(function ($b) use (&$urls) {
                        if (!$b->slug || !$b->location?->slug) return;
                        $city = $b->location->slug;
                        $lm   = $b->updated_at?->toAtomString() ?? now()->toAtomString();
                        $urls->push(['path' => "/locations/{$city}/billboards/{$b->slug}",    'priority' => '0.6', 'freq' => 'monthly', 'lastmod' => $lm]);
                        $urls->push(['path' => "/ar/locations/{$city}/billboards/{$b->slug}", 'priority' => '0.6', 'freq' => 'monthly', 'lastmod' => $lm]);
                    });
            }
        } catch (\Throwable $e) { }

        // Return empty urlset if page is out of range (graceful)
        return response($this->buildUrlsetXml($urls), 200)
            ->header('Content-Type', 'application/xml; charset=UTF-8')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /robots.txt
    // ─────────────────────────────────────────────────────────────────────────
    public function robots(): \Illuminate\Http\Response
    {
        $content = implode("\n", [
            'User-agent: *',
            'Allow: /',
            'Disallow: /login',
            'Disallow: /signup',
            'Disallow: /profile',
            'Disallow: /admin',
            '',
            "Sitemap: {$this->base}/sitemap.xml",
            '',
        ]);

        return response($content, 200)
            ->header('Content-Type', 'text/plain; charset=UTF-8')
            ->header('Cache-Control', 'public, max-age=86400');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────
    private function buildUrlsetXml(\Illuminate\Support\Collection $urls): string
    {
        $entries = $urls->map(function ($u) {
            $loc     = e($this->base . $u['path']);
            $lastmod = htmlspecialchars($u['lastmod'] ?? now()->toAtomString(), ENT_XML1);
            $freq    = htmlspecialchars($u['freq'],     ENT_XML1);
            $prio    = htmlspecialchars($u['priority'], ENT_XML1);
            return "  <url>\n    <loc>{$loc}</loc>\n    <lastmod>{$lastmod}</lastmod>\n    <changefreq>{$freq}</changefreq>\n    <priority>{$prio}</priority>\n  </url>";
        })->implode("\n");

        return <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
{$entries}
</urlset>
XML;
    }
}
