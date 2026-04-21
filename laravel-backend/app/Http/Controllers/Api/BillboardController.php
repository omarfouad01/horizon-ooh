<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Billboard;
use App\Models\BillboardImage;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BillboardController extends Controller
{
    // ── Public ───────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $q = Billboard::with(['location', 'district', 'images']);
        if ($request->filled('location_id'))  $q->where('location_id', $request->location_id);
        if ($request->filled('format'))       $q->where('format', $request->format);
        if ($request->filled('availability')) $q->where('availability', $request->availability);
        if ($request->filled('featured'))     $q->where('featured', true);

        return response()->json(
            $q->orderBy('sort_order')->orderBy('code')
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
            'code'         => 'required|string|unique:billboards,code',
            'title'        => 'nullable|string',
            'location_id'  => 'required|exists:locations,id',
            'district_id'  => 'nullable|exists:districts,id',
            'format'       => 'nullable|string',
            'width'        => 'nullable|numeric',
            'height'       => 'nullable|numeric',
            'price'        => 'nullable|numeric',
            'availability' => 'nullable|string',
            'illuminated'  => 'nullable|boolean',
            'lat'          => 'nullable|numeric',
            'lng'          => 'nullable|numeric',
            'full_address' => 'nullable|string',
            'description'  => 'nullable|string',
            'featured'     => 'nullable|boolean',
            'sort_order'   => 'nullable|integer',
        ]);

        $data['slug'] = $this->makeSlug($data['code'], $data['title'] ?? '');
        $b = Billboard::create($data);

        // Handle uploaded images
        $this->handleImageUploads($request, $b);

        return response()->json($this->transform($b->load(['location','district','images'])), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $b = Billboard::findOrFail($id);
        $data = $request->validate([
            'code'         => "sometimes|string|unique:billboards,code,{$id}",
            'title'        => 'nullable|string',
            'location_id'  => 'sometimes|exists:locations,id',
            'district_id'  => 'nullable|exists:districts,id',
            'format'       => 'nullable|string',
            'width'        => 'nullable|numeric',
            'height'       => 'nullable|numeric',
            'price'        => 'nullable|numeric',
            'availability' => 'nullable|string',
            'illuminated'  => 'nullable|boolean',
            'lat'          => 'nullable|numeric',
            'lng'          => 'nullable|numeric',
            'full_address' => 'nullable|string',
            'description'  => 'nullable|string',
            'featured'     => 'nullable|boolean',
            'sort_order'   => 'nullable|integer',
        ]);

        if (isset($data['code']) || isset($data['title'])) {
            $data['slug'] = $this->makeSlug($data['code'] ?? $b->code, $data['title'] ?? $b->title ?? '');
        }

        $b->update($data);
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
            $path = $file->store("billboards/{$b->id}", 'public');
            $url  = Storage::disk('public')->url($path);
            BillboardImage::create([
                'billboard_id' => $b->id,
                'path'         => $path,
                'url'          => $url,
                'is_primary'   => $b->images()->count() === 0,
                'sort_order'   => ++$order,
            ]);
        }
    }

    private function makeSlug(string $code, string $title): string
    {
        $base = Str::slug($code . ($title ? '-' . $title : ''));
        $slug = $base;
        $i    = 1;
        while (Billboard::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }

    private function transform(Billboard $b): array
    {
        return [
            'id'           => $b->id,
            'code'         => $b->code,
            'slug'         => $b->slug,
            'title'        => $b->title,
            'locationId'   => $b->location_id,
            'citySlug'     => $b->location?->slug,
            'city'         => $b->location?->city,
            'district'     => $b->district?->name,
            'district_id'  => $b->district_id,
            'format'       => $b->format,
            'width'        => $b->width,
            'height'       => $b->height,
            'price'        => $b->price,
            'availability' => $b->availability,
            'illuminated'  => $b->illuminated,
            'lat'          => $b->lat,
            'lng'          => $b->lng,
            'full_address' => $b->full_address,
            'description'  => $b->description,
            'featured'     => $b->featured,
            'sort_order'   => $b->sort_order,
            'images'       => $b->images->map(fn($i) => [
                'id'         => $i->id,
                'url'        => $i->url,
                'is_primary' => $i->is_primary,
            ])->values(),
            'created_at'   => $b->created_at?->toISOString(),
        ];
    }
}
