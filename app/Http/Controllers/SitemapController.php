<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

/**
 * Serves the crawler-facing files. They are routed rather than kept as static
 * files under `public/` so every URL they contain is built from the domain the
 * app is actually deployed on.
 */
class SitemapController extends Controller
{
    /**
     * The public, crawlable pages, keyed by route name with their crawl priority.
     *
     * @var array<string, string>
     */
    protected const PAGES = [
        'home' => '1.0',
        'pricing' => '0.8',
        'privacy' => '0.5',
        'terms' => '0.5',
    ];

    /**
     * Serve robots.txt, pointing crawlers at the sitemap.
     */
    public function robots(): Response
    {
        $body = implode(PHP_EOL, [
            'User-agent: *',
            'Allow: /',
            '',
            'Sitemap: '.route('sitemap'),
            '',
        ]);

        return response($body, 200, ['Content-Type' => 'text/plain']);
    }

    /**
     * Serve the XML sitemap listing every page a search engine may index.
     */
    public function sitemap(): Response
    {
        $urls = collect(self::PAGES)
            ->map(fn (string $priority, string $name): string => sprintf(
                '    <url><loc>%s</loc><changefreq>weekly</changefreq><priority>%s</priority></url>',
                e(route($name)),
                $priority,
            ))
            ->implode(PHP_EOL);

        $xml = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        {$urls}
        </urlset>
        XML;

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }
}
