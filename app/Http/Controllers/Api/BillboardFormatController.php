<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BillboardFormat;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class BillboardFormatController extends Controller
{
    private function transform(BillboardFormat $f): array {
        return [
            'id'         => $f->id,
            'name'       => $f->name,
            'slug'       => $f->slug,
            'label'      => $f->label ?? $f->name,
            'sort_order' => $f->sort_order ?? 0,
        ];
    }

    public function index(): JsonResponse {
        return response()->json(
            BillboardFormat::orderBy('sort_order')->orderBy('name')->get()->map(fn($f) => $this->transform($f))
        );
    }

    public function store(Request $request): JsonResponse {
        $input = $request->all();
        if (empty($input['name']) && !empty($input['label'])) $input['name'] = $input['label'];

        $data = validator($input, [
            'name'       => 'required|string|max:120',
            'label'      => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ])->validate();

        $base = Str::slug($data['name']); $slug = $base; $i = 1;
        while (BillboardFormat::where('slug', $slug)->exists()) $slug = $base . '-' . $i++;
        $data['slug']  = $slug;
        $data['label'] = $data['label'] ?? $data['name'];

        return response()->json($this->transform(BillboardFormat::create($data)), 201);
    }

    public function update(Request $request, int $id): JsonResponse {
        $f = BillboardFormat::findOrFail($id);
        $input = $request->all();
        if (empty($input['name']) && !empty($input['label'])) $input['name'] = $input['label'];

        $data = validator($input, [
            'name'       => 'sometimes|string|max:120',
            'label'      => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ])->validate();

        if (isset($data['name'])) {
            $base = Str::slug($data['name']); $slug = $base; $i = 1;
            while (BillboardFormat::where('slug', $slug)->where('id','!=',$id)->exists()) $slug = $base.'-'.$i++;
            $data['slug'] = $slug;
        }
        if (!isset($data['label']) && isset($data['name'])) $data['label'] = $data['name'];

        $f->update($data);
        return response()->json($this->transform($f));
    }

    public function destroy(int $id): JsonResponse {
        BillboardFormat::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
