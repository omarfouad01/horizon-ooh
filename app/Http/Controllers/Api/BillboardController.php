<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Billboard;
use App\Models\BillboardImage;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BillboardController extends Controller
{
    // ── Column whitelist (all columns the app might send) ─────────────────────
    private const ALLOWED = [
        'code', 'slug', 'title', 'name_ar', 'location_id', 'district_id',
        'format', 'type', 'quantity', 'size', 'sqm', 'sides',
        'material', 'brightness', 'width', 'height', 'price',
        'availability', 'illuminated', 'lat', 'lng', 'full_address',
        'description', 'description_ar', 'featured', 'sort_order', 'supplier_id',
    ];

    /** Strip fields whose DB column doesn't exist yet (migration safety) */
    private function safeData(array $data): array
    {
        $existing = Schema::getColumnListing('billboards');
        return array_filter(
            $data,
            fn($k) => in_array($k, $existing, true),
            ARRAY_FILTER_USE_KEY
        );
    }

    // ── Public ───────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $q = Billboard::with(['location', 'district', 'images']);
        if ($request->filled('location_id'))  $q->where('location_id', $request->location_id);
        if ($request->filled('format'))       $q->where('format', $request->format);
        if ($request->filled('availability')) $q->where('availability', $request->availability);
        if ($request->filled('featured'))     $q->where('featured', true);

        return response()->json(
            $q->orderBy('created_at', 'desc')
              ->get()->map(fn($b) => $this->transform($b))
        );
    }

    public function show(string $slug): JsonResponse
    {
        $b = Billboard::with(['location', 'district', 'images'])->where('slug', $slug)->firstOrFail();
        return response()->json($this->transform($b));
    }

    public function nextCode(): JsonResponse
    {
        $last = Billboard::orderByRaw("CAST(REGEXP_REPLACE(code, '[^0-9]', '') AS UNSIGNED) DESC")->first();
        $num  = $last ? (int) preg_replace('/\D/', '', $last->code) + 1 : 1;
        return response()->json(['code' => 'H-' . str_pad($num, 4, '0', STR_PAD_LEFT)]);
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'           => 'required|string|unique:billboards,code',
            'title'          => 'nullable|string',
            'name_ar'        => 'nullable|string',
            'location_id'    => 'required|exists:locations,id',
            'district_id'    => 'nullable|exists:districts,id',
            'format'         => 'nullable|string',
            'type'           => 'nullable|string',
            'quantity'       => 'nullable|integer',
            'size'           => 'nullable|string',
            'sqm'            => 'nullable|numeric',
            'sides'          => 'nullable|integer',
            'material'       => 'nullable|string',
            'brightness'     => 'nullable|string',
            'width'          => 'nullable|numeric',
            'height'         => 'nullable|numeric',
            'price'          => 'nullable|numeric',
            'availability'   => 'nullable|string',
            'illuminated'    => 'nullable|boolean',
            'lat'            => 'nullable|numeric',
            'lng'            => 'nullable|numeric',
            'full_address'   => 'nullable|string',
            'description'    => 'nullable|string',
            'description_ar' => 'nullable|string',
            'featured'       => 'nullable|boolean',
            'sort_order'     => 'nullable|integer',
            'supplier_id'    => 'nullable|integer',
        ]);

        $data['slug'] = $this->makeSlug($data['code'], $data['title'] ?? '');

        // Only keep fields that actually exist in the DB right now
        $b = Billboard::create($this->safeData($data));

        $this->handleImageUploads($request, $b);

        return response()->json($this->transform($b->load(['location','district','images'])), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $b    = Billboard::findOrFail($id);
        $data = $request->validate([
            'code'           => "sometimes|string|unique:billboards,code,{$id}",
            'title'          => 'nullable|string',
            'name_ar'        => 'nullable|string',
            'location_id'    => 'sometimes|exists:locations,id',
            'district_id'    => 'nullable|exists:districts,id',
            'format'         => 'nullable|string',
            'type'           => 'nullable|string',
            'quantity'       => 'nullable|integer',
            'size'           => 'nullable|string',
            'sqm'            => 'nullable|numeric',
            'sides'          => 'nullable|integer',
            'material'       => 'nullable|string',
            'brightness'     => 'nullable|string',
            'width'          => 'nullable|numeric',
            'height'         => 'nullable|numeric',
            'price'          => 'nullable|numeric',
            'availability'   => 'nullable|string',
            'illuminated'    => 'nullable|boolean',
            'lat'            => 'nullable|numeric',
            'lng'            => 'nullable|numeric',
            'full_address'   => 'nullable|string',
            'description'    => 'nullable|string',
            'description_ar' => 'nullable|string',
            'featured'       => 'nullable|boolean',
            'sort_order'     => 'nullable|integer',
            'supplier_id'    => 'nullable|integer',
        ]);

        if (isset($data['code']) || isset($data['title'])) {
            $data['slug'] = $this->makeSlug($data['code'] ?? $b->code, $data['title'] ?? $b->title ?? '', $id);
        }

        // Only update columns that actually exist in the DB right now
        $b->update($this->safeData($data));
        $this->handleImageUploads($request, $b);

        return response()->json($this->transform($b->load(['location','district','images'])));
    }

    public function destroy(int $id): JsonResponse
    {
        $b = Billboard::findOrFail($id);
        foreach ($b->images as $img) {
            if ($img->path) Storage::disk('public')->delete($img->path);
        }
        $b->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function deleteImage(Request $request, int $id): JsonResponse
    {
        $data = $request->validate(['media_id' => 'required|integer']);
        $img  = BillboardImage::where('billboard_id', $id)->where('id', $data['media_id'])->firstOrFail();
        if ($img->path) Storage::disk('public')->delete($img->path);
        $img->delete();
        return response()->json(['message' => 'Image deleted']);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function handleImageUploads(Request $request, Billboard $b): void
    {
        if (!$request->hasFile('images')) return;
        $order = $b->images()->max('sort_order') ?? 0;
        foreach ($request->file('images') as $file) {
            // Try to save as WebP for better compression; fall back to original format
            [$path, $url] = $this->storeImageAsWebP($file, "billboards/{$b->id}");
            BillboardImage::create([
                'billboard_id' => $b->id,
                'path'         => $path,
                'url'          => $url,
                'is_primary'   => $b->images()->count() === 0,
                'sort_order'   => ++$order,
            ]);
        }
    }

    /**
     * Store an uploaded image, converting to WebP if the GD extension supports it.
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
                $newW = 1600;
                $newH = (int)round($origH * $ratio);
                $dst = imagecreatetruecolor($newW, $newH);
                imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
                imagedestroy($src);
                $src = $dst;
            }

            $filename = \Illuminate\Support\Str::random(20) . '.webp';
            $path     = $directory . '/' . $filename;
            $fullPath = Storage::disk('public')->path($path);
            Storage::disk('public')->makeDirectory($directory);
            imagewebp($src, $fullPath, 82);
            imagedestroy($src);
            return [$path, Storage::disk('public')->url($path)];
        } catch (\Throwable $e) {
            \Log::warning('WebP conversion failed, storing original: ' . $e->getMessage());
            $path = $file->store($directory, 'public');
            return [$path, Storage::disk('public')->url($path)];
        }
    }

    private function makeSlug(string $code, string $title, ?int $excludeId = null): string
    {
        $base  = Str::slug($code . ($title ? '-' . $title : ''));
        $slug  = $base;
        $i     = 1;
        $query = Billboard::where('slug', $slug);
        if ($excludeId) $query->where('id', '!=', $excludeId);
        while ($query->clone()->exists()) {
            $slug  = $base . '-' . $i++;
            $query = Billboard::where('slug', $slug);
            if ($excludeId) $query->where('id', '!=', $excludeId);
        }
        return $slug;
    }

    private function transform(Billboard $b): array
    {
        $cols = Schema::getColumnListing('billboards');

        return [
            'id'             => $b->id,
            'code'           => $b->code,
            'slug'           => $b->slug,
            'title'          => $b->title,
            'nameAr'         => in_array('name_ar', $cols)        ? $b->name_ar        : null,
            'locationId'     => $b->location_id,
            'citySlug'       => $b->location?->slug,
            'city'           => $b->location?->city,
            'cityAr'         => $b->location?->city_ar ?? null,
            'district'       => $b->district?->name,
            'districtAr'     => $b->district?->name_ar ?? null,
            'district_id'    => $b->district_id,
            'format'         => $b->format,
            'type'           => in_array('type', $cols)           ? $b->type           : null,
            'quantity'       => in_array('quantity', $cols)       ? $b->quantity       : 1,
            'size'           => in_array('size', $cols)           ? $b->size           : null,
            'sqm'            => in_array('sqm', $cols)            ? $b->sqm            : null,
            'sides'          => in_array('sides', $cols)          ? $b->sides          : 1,
            'material'       => in_array('material', $cols)       ? $b->material       : null,
            'brightness'     => in_array('brightness', $cols)     ? $b->brightness     : null,
            'width'          => $b->width,
            'height'         => $b->height,
            'price'          => $b->price,
            'availability'   => $b->availability,
            'illuminated'    => $b->illuminated,
            'lat'            => $b->lat  !== null ? (float) $b->lat  : null,
            'lng'            => $b->lng  !== null ? (float) $b->lng  : null,
            'full_address'   => $b->full_address,
            'description'    => $b->description,
            'descriptionAr'  => in_array('description_ar', $cols) ? $b->description_ar : null,
            'featured'       => $b->featured,
            'sort_order'     => $b->sort_order,
            'supplierId'     => in_array('supplier_id', $cols)    ? $b->supplier_id    : null,
            'images'         => $b->images->map(fn($i) => [
                'id'         => $i->id,
                'url'        => $i->url,
                'is_primary' => $i->is_primary,
            ])->values(),
            'created_at'     => $b->created_at?->toISOString(),
        ];
    }
}
