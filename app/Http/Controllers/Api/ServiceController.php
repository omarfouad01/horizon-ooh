<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Service::orderBy('sort_order')->orderBy('name')->get());
    }

    public function show(string $slug): JsonResponse
    {
        return response()->json(Service::where('slug', $slug)->firstOrFail());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'             => 'required|string|max:120',
            'icon'             => 'nullable|string',
            'eyebrow'          => 'nullable|string',
            'headline'         => 'nullable|string',
            'description'      => 'nullable|string',
            'long_description' => 'nullable|string',
            'image'            => 'nullable|string',
            'features'         => 'nullable|array',
            'stats'            => 'nullable|array',
            'sort_order'       => 'nullable|integer',
        ]);
        $data['slug'] = Str::slug($data['name']);
        return response()->json(Service::create($data), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $svc  = Service::findOrFail($id);
        $data = $request->validate([
            'name'             => 'sometimes|string|max:120',
            'icon'             => 'nullable|string',
            'eyebrow'          => 'nullable|string',
            'headline'         => 'nullable|string',
            'description'      => 'nullable|string',
            'long_description' => 'nullable|string',
            'image'            => 'nullable|string',
            'features'         => 'nullable|array',
            'stats'            => 'nullable|array',
            'sort_order'       => 'nullable|integer',
        ]);
        if (isset($data['name'])) $data['slug'] = Str::slug($data['name']);
        $svc->update($data);
        return response()->json($svc);
    }

    public function destroy(int $id): JsonResponse
    {
        Service::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
