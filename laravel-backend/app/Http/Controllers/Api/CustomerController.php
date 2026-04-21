<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    public function index(): JsonResponse { return response()->json(Customer::orderBy('name')->get()); }
    public function store(Request $r): JsonResponse
    {
        return response()->json(Customer::create($r->validate(['name'=>'required|string','email'=>'nullable|email','phone'=>'nullable|string','company'=>'nullable|string','industry'=>'nullable|string','notes'=>'nullable|string'])), 201);
    }
    public function update(Request $r, int $id): JsonResponse
    {
        $c = Customer::findOrFail($id);
        $c->update($r->validate(['name'=>'sometimes|string','email'=>'nullable|email','phone'=>'nullable|string','company'=>'nullable|string','industry'=>'nullable|string','notes'=>'nullable|string']));
        return response()->json($c);
    }
    public function destroy(int $id): JsonResponse { Customer::findOrFail($id)->delete(); return response()->json(['message'=>'Deleted']); }
}
