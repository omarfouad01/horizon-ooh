<?php
require dirname(__DIR__) . '/vendor/autoload.php';
require dirname(__DIR__) . '/app/Http/Middleware/CompressPublicJson.php';
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Middleware\CompressPublicJson;
$body = ['products' => array_fill(0, 1000, ['title' => 'Real billboard', 'lat' => 30.1, 'nameAr' => 'لوحة إعلانية'])];
$middleware = new CompressPublicJson;
$make = fn() => new JsonResponse($body);
$original = $make()->getContent();
function check($value, $message) { if (!$value) throw new RuntimeException($message); }
foreach (['gzip', 'br, gzip;q=0.8'] as $encoding) {
 $request = Request::create('/api/locations', 'GET', [], [], [], ['HTTP_ACCEPT_ENCODING' => $encoding]);
 $response = $middleware->handle($request, fn() => $make());
 check($response->headers->get('Content-Encoding') === 'gzip', 'gzip negotiation failed');
 check(gzdecode($response->getContent()) === $original, 'JSON changed');
 check(in_array('Accept-Encoding', $response->getVary()), 'Missing Vary');
 check(strlen($response->getContent()) < strlen($original)/2, 'Compression ineffective');
}
foreach (['gzip;q=0', 'identity', 'br', ''] as $encoding) {
 $request = Request::create('/api/locations', 'GET', [], [], [], ['HTTP_ACCEPT_ENCODING' => $encoding]);
 $response = $middleware->handle($request, fn() => $make());
 check(!$response->headers->has('Content-Encoding') && $response->getContent() === $original, 'Identity changed');
}
$request = Request::create('/api/locations', 'POST', [], [], [], ['HTTP_ACCEPT_ENCODING' => 'gzip']);
check(!$middleware->handle($request, fn() => $make())->headers->has('Content-Encoding'), 'Mutation compressed');
echo "PASS: gzip negotiation, identity/q=0 fallback, JSON byte equivalence, Vary, and mutation exclusion\n";
