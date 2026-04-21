<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProcessStep;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProcessStepController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(ProcessStep::orderBy('sort_order')->orderBy('step')->get());
    }
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['step'=>'nullable|integer','title'=>'required|string','description'=>'nullable|string','icon'=>'nullable|string','label'=>'nullable|string','sort_order'=>'nullable|integer']);
        return response()->json(ProcessStep::create($data), 201);
    }
    public function update(Request $request, int $id): JsonResponse
    {
        $s = ProcessStep::findOrFail($id);
        $s->update($request->validate(['step'=>'nullable|integer','title'=>'sometimes|string','description'=>'nullable|string','icon'=>'nullable|string','label'=>'nullable|string','sort_order'=>'nullable|integer']));
        return response()->json($s);
    }
    public function destroy(int $id): JsonResponse
    {
        ProcessStep::findOrFail($id)->delete();
        return response()->json(['message'=>'Deleted']);
    }
}
