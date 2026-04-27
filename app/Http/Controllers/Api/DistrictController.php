<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\District;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DistrictController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = District::with('location');
        if ($request->filled('location_id')) {
            $q->where('location_id', $request->location_id);
        }
        return response()->json(
            $q->orderBy('name')->get()->map(fn($d) => $this->transform($d))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:120',
            'name_ar'     => 'nullable|string|max:120',
            'location_id' => 'required|exists:locations,id',
        ]);
        // accept locationId alias from frontend
        if (!isset($data['location_id']) && $request->filled('locationId')) {
            $data['location_id'] = $request->locationId;
        }
        $d = District::create($data);
        return response()->json($this->transform($d->load('location')), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $d    = District::findOrFail($id);
        $data = $request->validate([
            'name'        => 'sometimes|string|max:120',
            'name_ar'     => 'nullable|string|max:120',
            'location_id' => 'sometimes|exists:locations,id',
        ]);
        if ($request->filled('locationId') && !isset($data['location_id'])) {
            $data['location_id'] = $request->locationId;
        }
        $d->update($data);
        return response()->json($this->transform($d->load('location')));
    }

    public function destroy(int $id): JsonResponse
    {
        District::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function transform(District $d): array
    {
        return [
            'id'            => $d->id,
            'name'          => $d->name,
            'nameAr'        => $d->name_ar,
            'locationId'    => $d->location_id,
            'location_slug' => $d->location?->slug,
        ];
    }
}
