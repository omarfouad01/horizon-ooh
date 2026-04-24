<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClientBrand;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ClientBrandController extends Controller
{
    private function transform(ClientBrand $b): array
    {
        return [
            'id'             => $b->id,
            'name'           => $b->name,
            'nameAr'         => $b->name_ar,
            'logo'           => $b->logo,
            'logoUrl'        => $b->logo_url ?? $b->logo,
            'industry'       => $b->industry,
            'website'        => $b->website,
            'description'    => $b->description,
            'descriptionAr'  => $b->description_ar,
            'sort_order'     => $b->sort_order,
        ];
    }

    public function index(): JsonResponse
    {
        return response()->json(
            ClientBrand::orderBy('sort_order')->orderBy('name')->get()->map(fn($b) => $this->transform($b))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'           => 'required|string|max:120',
            'logo'           => 'nullable|string',
            'logo_url'       => 'nullable|string',
            'logoUrl'        => 'nullable|string',
            'industry'       => 'nullable|string',
            'website'        => 'nullable|string',
            'description'    => 'nullable|string',
            'nameAr'         => 'nullable|string',
            'name_ar'        => 'nullable|string',
            'descriptionAr'  => 'nullable|string',
            'description_ar' => 'nullable|string',
            'sort_order'     => 'nullable|integer',
        ]);

        // Normalize camelCase → snake_case
        if (!isset($data['logo_url']) && isset($data['logoUrl']))           $data['logo_url']        = $data['logoUrl'];
        if (!isset($data['name_ar']) && isset($data['nameAr']))             $data['name_ar']          = $data['nameAr'];
        if (!isset($data['description_ar']) && isset($data['descriptionAr'])) $data['description_ar'] = $data['descriptionAr'];
        unset($data['logoUrl'], $data['nameAr'], $data['descriptionAr']);

        $b = ClientBrand::create($data);
        return response()->json($this->transform($b), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $b    = ClientBrand::findOrFail($id);
        $data = $request->validate([
            'name'           => 'sometimes|string|max:120',
            'logo'           => 'nullable|string',
            'logo_url'       => 'nullable|string',
            'logoUrl'        => 'nullable|string',
            'industry'       => 'nullable|string',
            'website'        => 'nullable|string',
            'description'    => 'nullable|string',
            'nameAr'         => 'nullable|string',
            'name_ar'        => 'nullable|string',
            'descriptionAr'  => 'nullable|string',
            'description_ar' => 'nullable|string',
            'sort_order'     => 'nullable|integer',
        ]);

        if (!isset($data['logo_url']) && isset($data['logoUrl']))             $data['logo_url']        = $data['logoUrl'];
        if (!isset($data['name_ar']) && isset($data['nameAr']))               $data['name_ar']          = $data['nameAr'];
        if (!isset($data['description_ar']) && isset($data['descriptionAr'])) $data['description_ar']   = $data['descriptionAr'];
        unset($data['logoUrl'], $data['nameAr'], $data['descriptionAr']);

        $b->update($data);
        return response()->json($this->transform($b));
    }

    public function destroy(int $id): JsonResponse
    {
        ClientBrand::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
