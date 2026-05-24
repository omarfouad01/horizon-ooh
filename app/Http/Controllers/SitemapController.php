<?php
namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Project;
use App\Models\Location;
use App\Models\Billboard;
use Illuminate\Support\Facades\Schema;

/**
 * SitemapController — generates a live XML sitemap from the database.
 * Served at GET /sitemap.xml
 * Also generates robots.txt at GET /robots.txt
 */
class SitemapController extends Controller
{
    private string $base = 'https://horizonooh.com';

    /** GET /sitemap.xml */
    public function index(): \Illuminate\Http\Response
    {
        $now = now()->toAtomString();

        $urls = collect();

        // ── Static pages ──────────────────────────────────────────────────────
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
            $urls->push(compact('path', 'priority', 'freq', 'lastmod'));
        }

        // ── Services ──────────────────────────────────────────────────────────
        try {
            Service::orderBy('sort_order')->get(['slug', 'updated_at'])
                ->each(function ($s) use (&$urls) {
                    if (!$s->slug) return;
                    $urls->push([
                        'path'     => "/services/{$s->slug}",
                        'priority' => '0.8',
                        'freq'     => 'monthly',
                        'lastmod'  => $s->updated_at?->toAtomString() ?? now()->toAtomString(),
                    ]);
                });
        } catch (\Throwable $e) { /* table may not exist yet */ }

        // ── Projects ──────────────────────────────────────────────────────────
        try {
            Project::orderBy('sort_order')->get(['slug', 'updated_at'])
                ->each(function ($p) use (&$urls) {
                    if (!$p->slug) return;
                    $urls->push([
                        'path'     => "/projects/{$p->slug}",
                        'priority' => '0.7',
                        'freq'     => 'monthly',
                        'lastmod'  => $p->updated_at?->toAtomString() ?? now()->toAtomString(),
                    ]);
                });
        } catch (\Throwable $e) { }

        // ── Locations ─────────────────────────────────────────────────────────
        try {
            Location::orderBy('sort_order')->get(['slug', 'updated_at'])
                ->each(function ($l) use (&$urls) {
                    if (!$l->slug) return;
                    $urls->push([
                        'path'     => "/locations/{$l->slug}",
                        'priority' => '0.7',
                        'freq'     => 'monthly',
                        'lastmod'  => $l->updated_at?->toAtomString() ?? now()->toAtomString(),
                    ]);
                });
        } catch (\Throwable $e) { }

        // ── Billboards (individual product pages) ─────────────────────────────
        try {
            if (Schema::hasTable('billboards') && Schema::hasColumn('billboards', 'slug')) {
                Billboard::with('location')
                    ->whereNotNull('slug')
                    ->orderBy('created_at', 'desc')
                    ->get(['id', 'slug', 'location_id', 'updated_at'])
                    ->each(function ($b) use (&$urls) {
                        if (!$b->slug || !$b->location) return;
                        $citySlug = $b->location->slug ?? '';
                        if (!$citySlug) return;
                        $urls->push([
                            'path'     => "/locations/{$citySlug}/billboards/{$b->slug}",
                            'priority' => '0.6',
                            'freq'     => 'monthly',
                            'lastmod'  => $b->updated_at?->toAtomString() ?? now()->toAtomString(),
                        ]);
                    });
            }
        } catch (\Throwable $e) { }

        // ── Blog Posts ────────────────────────────────────────────────────────
        try {
            \App\Models\BlogPost::orderBy('created_at', 'desc')->get(['slug', 'updated_at'])
                ->each(function ($post) use (&$urls) {
                    if (!$post->slug) return;
                    $urls->push([
                        'path'     => "/blog/{$post->slug}",
                        'priority' => '0.7',
                        'freq'     => 'monthly',
                        'lastmod'  => $post->updated_at?->toAtomString() ?? now()->toAtomString(),
                    ]);
                });
        } catch (\Throwable $e) { }

        // ── Build XML ─────────────────────────────────────────────────────────
        $xml = $this->buildXml($urls);

        return response($xml, 200)
            ->header('Content-Type', 'application/xml; charset=UTF-8')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    /** GET /robots.txt */
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

    private function buildXml(\Illuminate\Support\Collection $urls): string
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
