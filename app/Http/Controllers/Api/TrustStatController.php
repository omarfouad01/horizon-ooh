<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrustStat;
use App\Models\ProcessStep;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

// ── Trust Stats ──────────────────────────────────────────────────────────────
class TrustStatController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(TrustStat::orderBy('sort_order')->get());
    }
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['value'=>'required|string','label'=>'required|string','sublabel'=>'nullable|string','icon'=>'nullable|string','sort_order'=>'nullable|integer']);
        return response()->json(TrustStat::create($data), 201);
    }
    public function update(Request $request, int $id): JsonResponse
    {
        $s = TrustStat::findOrFail($id);
        $s->update($request->validate(['value'=>'sometimes|string','label'=>'sometimes|string','sublabel'=>'nullable|string','icon'=>'nullable|string','sort_order'=>'nullable|integer']));
        return response()->json($s);
    }
    public function destroy(int $id): JsonResponse
    {
        TrustStat::findOrFail($id)->delete();
        return response()->json(['message'=>'Deleted']);
    }
}
