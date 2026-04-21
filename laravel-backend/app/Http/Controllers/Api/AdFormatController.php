<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdFormat;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class AdFormatController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(AdFormat::orderBy('sort_order')->orderBy('name')->get()->map(fn($f) => [
            'id'          => $f->id,
            'name'        => $f->name,
            'slug'        => $f->slug,
            'label'       => $f->label ?? $f->name,
            'description' => $f->description,
            'width_m'     => $f->width_m,
            'height_m'    => $f->height_m,
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:120',
            'label'       => 'nullable|string',
            'description' => 'nullable|string',
            'width_m'     => 'nullable|numeric',
            'height_m'    => 'nullable|numeric',
            'sort_order'  => 'nullable|integer',
        ]);
        $data['slug']  = Str::slug($data['name']);
        $data['label'] = $data['label'] ?? $data['name'];
        return response()->json(AdFormat::create($data), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $f    = AdFormat::findOrFail($id);
        $data = $request->validate([
            'name'        => 'sometimes|string|max:120',
            'label'       => 'nullable|string',
            'description' => 'nullable|string',
            'width_m'     => 'nullable|numeric',
            'height_m'    => 'nullable|numeric',
            'sort_order'  => 'nullable|integer',
        ]);
        if (isset($data['name'])) $data['slug'] = Str::slug($data['name']);
        $f->update($data);
        return response()->json($f);
    }

    public function destroy(int $id): JsonResponse
    {
        AdFormat::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
