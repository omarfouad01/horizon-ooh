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
 * SEO strategy:
 *   - Each URL appears ONCE in the sitemap (the canonical English URL).
 *   - <xhtml:link rel="alternate"> hreflang pairs are nested inside each <url>
 *     so Google/Ahrefs understand en↔ar relationship without duplicate entries.
 *   - /ar/ pages are NOT listed as separate sitemap entries — they are referenced
 *     only as alternates, preventing "non-canonical page in sitemap" Ahrefs errors.
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

        // ── Static pages (English only — /ar/ referenced via hreflang) ────────
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
            $urls->push(['path' => $path, 'priority' => $priority, 'freq' => $freq, 'lastmod' => $lastmod]);
        }

        // ── Services ──────────────────────────────────────────────────────────
        try {
            if (Schema::hasTable('services') && Schema::hasColumn('services', 'slug')) {
                Service::whereNotNull('slug')
                    ->orderBy('created_at', 'desc')
                    ->select(['id', 'slug', 'updated_at'])
                    ->each(function ($s) use (&$urls) {
                        if (!$s->slug) return;
                        $lm = $s->updated_at?->toAtomString() ?? now()->toAtomString();
                        $urls->push(['path' => "/services/{$s->slug}", 'priority' => '0.8', 'freq' => 'monthly', 'lastmod' => $lm]);
                    });
            }
        } catch (\Throwable $e) { }

        // ── Projects ──────────────────────────────────────────────────────────
        try {
            if (Schema::hasTable('projects') && Schema::hasColumn('projects', 'slug')) {
                Project::whereNotNull('slug')
                    ->orderBy('created_at', 'desc')
                    ->select(['id', 'slug', 'updated_at'])
                    ->each(function ($p) use (&$urls) {
                        if (!$p->slug) return;
                        $lm = $p->updated_at?->toAtomString() ?? now()->toAtomString();
                        $urls->push(['path' => "/projects/{$p->slug}", 'priority' => '0.7', 'freq' => 'monthly', 'lastmod' => $lm]);
                    });
            }
        } catch (\Throwable $e) { }

        // ── Locations (city pages) ─────────────────────────────────────────────
        try {
            if (Schema::hasTable('locations') && Schema::hasColumn('locations', 'slug')) {
                Location::whereNotNull('slug')
                    ->orderBy('created_at', 'desc')
                    ->select(['id', 'slug', 'updated_at'])
                    ->each(function ($l) use (&$urls) {
                        if (!$l->slug) return;
                        $lm = $l->updated_at?->toAtomString() ?? now()->toAtomString();
                        $urls->push(['path' => "/locations/{$l->slug}", 'priority' => '0.7', 'freq' => 'monthly', 'lastmod' => $lm]);
                    });
            }
        } catch (\Throwable $e) { }

        // ── Blog posts ────────────────────────────────────────────────────────
        try {
            if (Schema::hasTable('blog_posts') && Schema::hasColumn('blog_posts', 'slug')) {
                $blogModel = class_exists('\\App\\Models\\BlogPost') ? '\\App\\Models\\BlogPost' : null;
                if ($blogModel) {
                    $blogModel::whereNotNull('slug')
                        ->orderBy('created_at', 'desc')
                        ->select(['id', 'slug', 'updated_at'])
                        ->each(function ($post) use (&$urls) {
                            if (!$post->slug) return;
                            $lm = $post->updated_at?->toAtomString() ?? now()->toAtomString();
                            $urls->push(['path' => "/blog/{$post->slug}", 'priority' => '0.7', 'freq' => 'monthly', 'lastmod' => $lm]);
                        });
                }
            }
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
                        // English canonical only — /ar/ referenced via hreflang inside the entry
                        $urls->push([
                            'path'     => "/locations/{$city}/billboards/{$b->slug}",
                            'priority' => '0.6',
                            'freq'     => 'monthly',
                            'lastmod'  => $lm,
                        ]);
                    });
            }
        } catch (\Throwable $e) { }

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

    /**
     * Build a <urlset> XML string with xhtml:link hreflang pairs.
     *
     * Each English URL entry includes:
     *   <xhtml:link rel="alternate" hreflang="en"        href="...english..." />
     *   <xhtml:link rel="alternate" hreflang="ar"        href="...arabic..."  />
     *   <xhtml:link rel="alternate" hreflang="x-default" href="...english..." />
     *
     * The /ar/ URLs are NOT emitted as separate <url> entries.
     * This eliminates the "non-canonical page in sitemap" Ahrefs error.
     */
    private function buildUrlsetXml(\Illuminate\Support\Collection $urls): string
    {
        $base    = $this->base;
        $entries = $urls->map(function ($u) use ($base) {
            $path    = $u['path'];
            $enUrl   = $base . $path;
            $arPath  = ($path === '/') ? '/ar' : '/ar' . $path;
            $arUrl   = $base . $arPath;

            $loc     = htmlspecialchars($enUrl,  ENT_XML1);
            $locAr   = htmlspecialchars($arUrl,  ENT_XML1);
            $lastmod = htmlspecialchars($u['lastmod'] ?? now()->toAtomString(), ENT_XML1);
            $freq    = htmlspecialchars($u['freq'],     ENT_XML1);
            $prio    = htmlspecialchars($u['priority'], ENT_XML1);

            return implode("\n", [
                "  <url>",
                "    <loc>{$loc}</loc>",
                "    <lastmod>{$lastmod}</lastmod>",
                "    <changefreq>{$freq}</changefreq>",
                "    <priority>{$prio}</priority>",
                "    <xhtml:link rel=\"alternate\" hreflang=\"en\"        href=\"{$loc}\" />",
                "    <xhtml:link rel=\"alternate\" hreflang=\"ar\"        href=\"{$locAr}\" />",
                "    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"{$loc}\" />",
                "  </url>",
            ]);
        })->implode("\n");

        return <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
{$entries}
</urlset>
XML;
    }
}
