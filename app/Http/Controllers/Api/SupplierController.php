<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Billboard;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{
    private function rules(bool $update = false): array
    {
        return [
            'name' => $update ? 'sometimes|required|string|max:255' : 'required|string|max:255',
            'contact' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'description' => 'nullable|string',
        ];
    }

    public function index(): JsonResponse
    {
        return response()->json(Supplier::orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        return response()->json(Supplier::create($request->validate($this->rules())), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->update($request->validate($this->rules(true)));
        return response()->json($supplier);
    }

    public function destroy(int $id): JsonResponse
    {
        return DB::transaction(function () use ($id) {
            $supplier = Supplier::query()->lockForUpdate()->findOrFail($id);
            $billboardCount = Billboard::where('supplier_id', $supplier->id)->count();
            if ($billboardCount > 0) {
                return response()->json([
                    'message' => 'This supplier is linked to billboards. Reassign those billboards before deleting the supplier.',
                    'billboards_count' => $billboardCount,
                ], 409);
            }
            $supplier->delete();
            return response()->json(['message' => 'Deleted']);
        });
    }
}
