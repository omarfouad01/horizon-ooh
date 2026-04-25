<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BillboardSize;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BillboardSizeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(BillboardSize::orderBy('label')->get()->map(fn($s) => [
            'id'      => $s->id,
            'label'   => $s->label,
            'widthM'  => $s->width_m,
            'heightM' => $s->height_m,
            'notes'   => $s->notes,
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'label'   => 'required|string|max:120',
            'widthM'  => 'nullable|numeric',
            'heightM' => 'nullable|numeric',
            'notes'   => 'nullable|string',
        ]);

        $size = BillboardSize::create([
            'label'    => $data['label'],
            'width_m'  => $data['widthM'] ?? null,
            'height_m' => $data['heightM'] ?? null,
            'notes'    => $data['notes'] ?? null,
        ]);

        return response()->json([
            'id'      => $size->id,
            'label'   => $size->label,
            'widthM'  => $size->width_m,
            'heightM' => $size->height_m,
            'notes'   => $size->notes,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $size = BillboardSize::findOrFail($id);
        $data = $request->validate([
            'label'   => 'sometimes|string|max:120',
            'widthM'  => 'nullable|numeric',
            'heightM' => 'nullable|numeric',
            'notes'   => 'nullable|string',
        ]);

        $size->update([
            'label'    => $data['label']   ?? $size->label,
            'width_m'  => $data['widthM']  ?? $size->width_m,
            'height_m' => $data['heightM'] ?? $size->height_m,
            'notes'    => $data['notes']   ?? $size->notes,
        ]);

        return response()->json([
            'id'      => $size->id,
            'label'   => $size->label,
            'widthM'  => $size->width_m,
            'heightM' => $size->height_m,
            'notes'   => $size->notes,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        BillboardSize::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
