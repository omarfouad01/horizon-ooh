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
            'sort_order'  => $f->sort_order ?? 0,
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        // Accept either 'name' or 'label' — frontend may send either
        $input = $request->all();
        if (empty($input['name']) && !empty($input['label'])) {
            $input['name'] = $input['label'];
        }

        $data = validator($input, [
            'name'        => 'required|string|max:120',
            'label'       => 'nullable|string',
            'description' => 'nullable|string',
            'width_m'     => 'nullable|numeric',
            'height_m'    => 'nullable|numeric',
            'sort_order'  => 'nullable|integer',
        ])->validate();

        // Generate unique slug
        $baseSlug = Str::slug($data['name']);
        $slug = $baseSlug;
        $i = 1;
        while (AdFormat::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $i++;
        }
        $data['slug']  = $slug;
        $data['label'] = $data['label'] ?? $data['name'];

        $format = AdFormat::create($data);

        return response()->json([
            'id'          => $format->id,
            'name'        => $format->name,
            'slug'        => $format->slug,
            'label'       => $format->label ?? $format->name,
            'description' => $format->description,
            'width_m'     => $format->width_m,
            'height_m'    => $format->height_m,
            'sort_order'  => $format->sort_order ?? 0,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $f = AdFormat::findOrFail($id);

        // Accept either 'name' or 'label'
        $input = $request->all();
        if (empty($input['name']) && !empty($input['label'])) {
            $input['name'] = $input['label'];
        }

        $data = validator($input, [
            'name'        => 'sometimes|string|max:120',
            'label'       => 'nullable|string',
            'description' => 'nullable|string',
            'width_m'     => 'nullable|numeric',
            'height_m'    => 'nullable|numeric',
            'sort_order'  => 'nullable|integer',
        ])->validate();

        if (isset($data['name'])) {
            $baseSlug = Str::slug($data['name']);
            $slug = $baseSlug;
            $i = 1;
            while (AdFormat::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $baseSlug . '-' . $i++;
            }
            $data['slug'] = $slug;
        }
        // Keep label in sync with name if not explicitly provided
        if (!isset($data['label']) && isset($data['name'])) {
            $data['label'] = $data['name'];
        }

        $f->update($data);

        return response()->json([
            'id'          => $f->id,
            'name'        => $f->name,
            'slug'        => $f->slug,
            'label'       => $f->label ?? $f->name,
            'description' => $f->description,
            'width_m'     => $f->width_m,
            'height_m'    => $f->height_m,
            'sort_order'  => $f->sort_order ?? 0,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        AdFormat::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
