<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClientBrand;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ClientBrandController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(ClientBrand::orderBy('sort_order')->orderBy('name')->get()->map(fn($b) => [
            'id'       => $b->id,
            'name'     => $b->name,
            'logo'     => $b->logo,
            'logoUrl'  => $b->logo_url ?? $b->logo,
            'industry' => $b->industry,
            'website'  => $b->website,
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'       => 'required|string|max:120',
            'logo'       => 'nullable|string',
            'logo_url'   => 'nullable|string',
            'logoUrl'    => 'nullable|string',
            'industry'   => 'nullable|string',
            'website'    => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);
        // Accept camelCase alias from frontend
        if (!isset($data['logo_url']) && isset($data['logoUrl'])) $data['logo_url'] = $data['logoUrl'];
        unset($data['logoUrl']);
        $b = ClientBrand::create($data);
        return response()->json(['id' => $b->id, 'name' => $b->name, 'logoUrl' => $b->logo_url], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $b    = ClientBrand::findOrFail($id);
        $data = $request->validate([
            'name'       => 'sometimes|string|max:120',
            'logo'       => 'nullable|string',
            'logo_url'   => 'nullable|string',
            'logoUrl'    => 'nullable|string',
            'industry'   => 'nullable|string',
            'website'    => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);
        if (!isset($data['logo_url']) && isset($data['logoUrl'])) $data['logo_url'] = $data['logoUrl'];
        unset($data['logoUrl']);
        $b->update($data);
        return response()->json(['id' => $b->id, 'name' => $b->name, 'logoUrl' => $b->logo_url]);
    }

    public function destroy(int $id): JsonResponse
    {
        ClientBrand::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
