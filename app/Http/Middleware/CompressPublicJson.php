<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Compress large read responses without changing their JSON or access controls. */
class CompressPublicJson
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        if (!$request->isMethod('GET') || $response->getStatusCode() !== 200
            || $response->headers->has('Content-Encoding')
            || !str_contains($response->headers->get('Content-Type', ''), 'application/json')) return $response;
        // Both compressed and identity representations must vary on negotiation.
        $response->setVary('Accept-Encoding', false);
        $acceptsGzip = false;
        foreach (explode(',', $request->header('Accept-Encoding', '')) as $encoding) {
            $parts = array_map('trim', explode(';', $encoding));
            if (strtolower($parts[0]) !== 'gzip') continue;
            $quality = 1.0;
            foreach (array_slice($parts, 1) as $parameter) {
                if (preg_match('/^q\s*=\s*([0-9.]+)$/i', $parameter, $match)) $quality = (float) $match[1];
            }
            $acceptsGzip = $quality > 0;
            break;
        }
        $content = $response->getContent();
        if (!$acceptsGzip || !is_string($content) || strlen($content) < 1024 || !function_exists('gzencode')) return $response;
        $compressed = gzencode($content, 5);
        if ($compressed === false || strlen($compressed) >= strlen($content)) return $response;
        $response->setContent($compressed);
        $response->headers->set('Content-Encoding', 'gzip');
        $response->headers->set('Content-Length', (string) strlen($compressed));
        return $response;
    }
}
