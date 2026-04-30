<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class LocationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Location::with(['districts', 'billboards.images'])
                ->orderBy('sort_order')->orderBy('city')
                ->get()
                ->map(fn($l) => $this->transform($l))
        );
    }

    public function show(string $slug): JsonResponse
    {
        $loc = Location::with(['districts', 'billboards.images'])
            ->where('slug', $slug)->firstOrFail();
        return response()->json($this->transform($loc));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'city'              => 'required|string|max:120',
            'city_ar'           => 'nullable|string|max:120',
            'headline'          => 'nullable|string',
            'headline_ar'       => 'nullable|string',
            'detail'            => 'nullable|string',
            'description'       => 'nullable|string',
            'description_ar'    => 'nullable|string',
            'long_description'  => 'nullable|string',
            'image'             => 'nullable|string',
            'available_formats' => 'nullable|array',
            'sort_order'        => 'nullable|integer',
        ]);

        $data['slug'] = Str::slug($data['city']);
        $loc = Location::create($data);
        return response()->json($this->transform($loc->load(['districts','billboards.images'])), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $loc  = Location::findOrFail($id);
        $data = $request->validate([
            'city'              => 'sometimes|string|max:120',
            'city_ar'           => 'nullable|string|max:120',
            'headline'          => 'nullable|string',
            'headline_ar'       => 'nullable|string',
            'detail'            => 'nullable|string',
            'description'       => 'nullable|string',
            'description_ar'    => 'nullable|string',
            'long_description'  => 'nullable|string',
            'image'             => 'nullable|string',
            'available_formats' => 'nullable|array',
            'sort_order'        => 'nullable|integer',
        ]);
        if (isset($data['city'])) $data['slug'] = Str::slug($data['city']);
        $loc->update($data);
        return response()->json($this->transform($loc->load(['districts','billboards.images'])));
    }

    public function destroy(int $id): JsonResponse
    {
        Location::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function transform(Location $l): array
    {
        return [
            'id'               => $l->id,
            'slug'             => $l->slug,
            'city'             => $l->city,
            'cityAr'           => $l->city_ar,
            'headline'         => $l->headline,
            'headlineAr'       => $l->headline_ar,
            'detail'           => $l->detail,
            'description'      => $l->description,
            'descriptionAr'    => $l->description_ar,
            'longDescription'  => $l->long_description,
            'image'            => $l->image,
            'availableFormats' => $l->available_formats ?? [],
            'sort_order'       => $l->sort_order,
            'districts'        => $l->districts->map(fn($d) => [
                'id'         => $d->id,
                'name'       => $d->name,
                'nameAr'     => $d->name_ar,
                'locationId' => $d->location_id,
            ])->values(),
            'products'         => $l->billboards->map(fn($b) => $this->transformBillboard($b, $l))->values(),
        ];
    }

    private function transformBillboard($b, Location $l): array
    {
        return [
            'id'             => $b->id,
            'code'           => $b->code,
            'slug'           => $b->slug,
            'title'          => $b->title,
            'nameAr'         => $b->name_ar,
            'locationId'     => $b->location_id,
            'citySlug'       => $l->slug,
            'city'           => $l->city,
            'cityAr'         => $l->city_ar,
            'district'       => $b->district?->name,
            'districtAr'     => $b->district?->name_ar,
            'district_id'    => $b->district_id,
            'format'         => $b->format,
            'type'           => $b->type,
            'quantity'       => $b->quantity,
            'supplierId'     => $b->supplier_id,
            'size'           => $b->size,
            'sqm'            => $b->sqm,
            'sides'          => $b->sides,
            'material'       => $b->material,
            'brightness'     => $b->brightness,
            'width'          => $b->width,
            'height'         => $b->height,
            'price'          => $b->price,
            'availability'   => $b->availability,
            'illuminated'    => $b->illuminated,
            'lat'            => $b->lat !== null ? (float) $b->lat : null,
            'lng'            => $b->lng !== null ? (float) $b->lng : null,
            'full_address'   => $b->full_address,
            'description'    => $b->description,
            'descriptionAr'  => $b->description_ar,
            'featured'       => $b->featured,
            'images'         => $b->images->map(fn($i) => [
                'id'         => $i->id,
                'url'        => $i->url,
                'is_primary' => $i->is_primary ?? false,
            ])->filter(fn($i) => !empty($i['url']))->values(),
        ];
    }
}
