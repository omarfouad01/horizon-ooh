<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

// ── Suppliers ────────────────────────────────────────────────────────────────
class SupplierController extends Controller
{
    public function index(): JsonResponse { return response()->json(Supplier::orderBy('name')->get()); }
    public function store(Request $r): JsonResponse
    {
        return response()->json(Supplier::create($r->validate(['name'=>'required|string','contact'=>'nullable|string','email'=>'nullable|email','phone'=>'nullable|string','category'=>'nullable|string','notes'=>'nullable|string','description'=>'nullable|string'])), 201);
    }
    public function update(Request $r, int $id): JsonResponse
    {
        $s = Supplier::findOrFail($id);
        $s->update($r->validate(['name'=>'sometimes|string','contact'=>'nullable|string','email'=>'nullable|email','phone'=>'nullable|string','category'=>'nullable|string','notes'=>'nullable|string','description'=>'nullable|string']));
        return response()->json($s);
    }
    public function destroy(int $id): JsonResponse { Supplier::findOrFail($id)->delete(); return response()->json(['message'=>'Deleted']); }
}
