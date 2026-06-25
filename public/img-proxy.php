<?php
/**
 * img-proxy.php — on-the-fly image resize + WebP conversion with disk cache.
 * GET /img-proxy.php?src=<filename>&w=<width>&h=<height>
 *
 * Safety: any failure (missing file, bad params, GD error) falls back to a
 * 302 redirect to the original unmodified image — never a broken <img>.
 */

$imagesDir = __DIR__ . '/images/';
$cacheDir  = __DIR__ . '/imgcache/';

$src = isset($_GET['src']) ? basename((string)$_GET['src']) : '';
$w   = isset($_GET['w']) ? (int)$_GET['w'] : 0;
$h   = isset($_GET['h']) ? (int)$_GET['h'] : 0;

function fallback(string $imagesDir, string $src): void {
    $path = $imagesDir . $src;
    if ($src !== '' && is_file($path)) {
        header('Location: /images/' . rawurlencode($src), true, 302);
    } else {
        http_response_code(404);
    }
    exit;
}

// ── Validate inputs ─────────────────────────────────────────────────────
if ($src === '' || $w <= 0 || $h <= 0) {
    fallback($imagesDir, $src);
}

// Cap dimensions to prevent abuse
$w = min($w, 1600);
$h = min($h, 1600);

$srcPath = $imagesDir . $src;
if (!is_file($srcPath)) {
    fallback($imagesDir, $src);
}

$ext = strtolower(pathinfo($srcPath, PATHINFO_EXTENSION));
if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'], true)) {
    fallback($imagesDir, $src);
}

// ── Cache lookup ─────────────────────────────────────────────────────────
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}
$cacheKey  = md5($src . '_' . $w . 'x' . $h . '_' . filemtime($srcPath)) . '.webp';
$cachePath = $cacheDir . $cacheKey;

if (is_file($cachePath)) {
    header('Content-Type: image/webp');
    header('Cache-Control: public, max-age=31536000, immutable');
    header('Content-Length: ' . filesize($cachePath));
    readfile($cachePath);
    exit;
}

// ── Load source image ──────────────────────────────────────────────────
try {
    switch ($ext) {
        case 'jpg':
        case 'jpeg':
            $srcImg = @imagecreatefromjpeg($srcPath);
            break;
        case 'png':
            $srcImg = @imagecreatefrompng($srcPath);
            break;
        case 'webp':
            $srcImg = @imagecreatefromwebp($srcPath);
            break;
        case 'gif':
            $srcImg = @imagecreatefromgif($srcPath);
            break;
        default:
            $srcImg = false;
    }

    if (!$srcImg) {
        fallback($imagesDir, $src);
    }

    $srcW = imagesx($srcImg);
    $srcH = imagesy($srcImg);

    // "cover" crop: scale to fill target box, then center-crop excess
    $scale  = max($w / $srcW, $h / $srcH);
    $scaledW = (int)ceil($srcW * $scale);
    $scaledH = (int)ceil($srcH * $scale);

    $resized = imagecreatetruecolor($scaledW, $scaledH);
    // preserve transparency for png
    imagealphablending($resized, false);
    imagesavealpha($resized, true);
    imagecopyresampled($resized, $srcImg, 0, 0, 0, 0, $scaledW, $scaledH, $srcW, $srcH);
    imagedestroy($srcImg);

    $cropX = (int)(($scaledW - $w) / 2);
    $cropY = (int)(($scaledH - $h) / 2);

    $final = imagecreatetruecolor($w, $h);
    imagealphablending($final, false);
    imagesavealpha($final, true);
    imagecopy($final, $resized, 0, 0, $cropX, $cropY, $w, $h);
    imagedestroy($resized);

    // Save to cache then serve
    $ok = @imagewebp($final, $cachePath, 78);
    imagedestroy($final);

    if (!$ok || !is_file($cachePath)) {
        fallback($imagesDir, $src);
    }

    header('Content-Type: image/webp');
    header('Cache-Control: public, max-age=31536000, immutable');
    header('Content-Length: ' . filesize($cachePath));
    readfile($cachePath);
} catch (\Throwable $e) {
    fallback($imagesDir, $src);
}
