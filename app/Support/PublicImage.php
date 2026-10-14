<?php
namespace App\Support;

use Illuminate\Support\Facades\Storage;

/** Give legacy inline images a stable, cacheable URL without changing their DB value. */
final class PublicImage
{
    public static function values(mixed $value, int $maxWidth = 1600, int $maxHeight = 1600): mixed
    {
        if (is_array($value)) return array_map(fn($item) => self::values($item, $maxWidth, $maxHeight), $value);
        if (!is_string($value) || !str_starts_with($value, 'data:image/')) return $value;
        if (!preg_match('/^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/s', $value, $match)) return $value;
        $binary = base64_decode($match[2], true);
        if ($binary === false || strlen($binary) > 10 * 1024 * 1024 || !@getimagesizefromstring($binary)) return $value;
        $extension = in_array($match[1], ['jpeg','jpg']) ? 'jpg' : $match[1];
        $webp = $extension !== 'gif' && function_exists('imagewebp') && function_exists('imagecreatefromstring');
        $path = 'media/inline/'.hash('sha256', $binary.'|'.$maxWidth.'|'.$maxHeight.'|'.($webp ? 'webp-v1' : 'original')).'.'.($webp ? 'webp' : $extension);
        try {
            $disk = Storage::disk('public');
            if (!$disk->exists($path)) {
                if ($webp) {
                    $image = @imagecreatefromstring($binary);
                    if (!$image) return $value;
                    if (!imageistruecolor($image)) imagepalettetotruecolor($image);
                    $scale = min(1, $maxWidth / imagesx($image), $maxHeight / imagesy($image));
                    if ($scale < 1) {
                        $scaled = imagescale($image, max(1, (int) round(imagesx($image) * $scale)));
                        imagedestroy($image);
                        if (!$scaled) return $value;
                        $image = $scaled;
                    }
                    imagealphablending($image, false);
                    imagesavealpha($image, true);
                    ob_start();
                    $ok = imagewebp($image, null, 82);
                    $encoded = ob_get_clean();
                    imagedestroy($image);
                    if (!$ok || !$encoded) return $value;
                    $binary = $encoded;
                }
                if (!$disk->put($path, $binary)) return $value;
            }
            return '/storage/'.$path;
        } catch (\Throwable $e) {
            return $value;
        }
    }
}
