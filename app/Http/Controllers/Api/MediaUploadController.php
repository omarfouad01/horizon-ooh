<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Generic media upload endpoint.
 * Accepts multipart/form-data POST with a 'file' field.
 * Converts to WebP if GD supports it, otherwise stores original.
 * Returns a public URL to the stored file.
 */
class MediaUploadController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file'   => 'required|file|mimes:jpeg,jpg,png,gif,webp,svg|max:10240',
            'folder' => 'nullable|string|max:64|regex:/^[a-zA-Z0-9_\-\/]+$/',
        ]);

        $folder = $request->input('folder', 'media');
        $file   = $request->file('file');

        [$path, $url] = $this->storeImageAsWebP($file, $folder);

        return response()->json(['url' => $url, 'path' => $path], 201);
    }

    /**
     * Store an uploaded image, converting to WebP if GD supports it.
     * Returns [storage-path, public-URL].
     */
    private function storeImageAsWebP($file, string $directory): array
    {
        $canWebP = function_exists('imagewebp') && function_exists('imagecreatefromstring');
        if (!$canWebP) {
            $path = $file->store($directory, 'public');
            return [$path, Storage::disk('public')->url($path)];
        }
        try {
            $imageData = file_get_contents($file->getRealPath());
            $src = imagecreatefromstring($imageData);
            if (!$src) throw new \RuntimeException('imagecreatefromstring failed');

            // Resize if wider than 1600px
            $origW = imagesx($src);
            $origH = imagesy($src);
            if ($origW > 1600) {
                $ratio = 1600 / $origW;
                $newW  = 1600;
                $newH  = (int) round($origH * $ratio);
                $dst   = imagecreatetruecolor($newW, $newH);
                imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
                imagedestroy($src);
                $src = $dst;
            }

            $filename = Str::random(20) . '.webp';
            $path     = $directory . '/' . $filename;
            $fullPath = Storage::disk('public')->path($path);
            Storage::disk('public')->makeDirectory($directory);
            imagewebp($src, $fullPath, 82);
            imagedestroy($src);

            return [$path, Storage::disk('public')->url($path)];
        } catch (\Throwable $e) {
            \Log::warning('WebP conversion failed in MediaUpload, storing original: ' . $e->getMessage());
            $path = $file->store($directory, 'public');
            return [$path, Storage::disk('public')->url($path)];
        }
    }
}
