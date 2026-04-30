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
        $data = $this->normalize($request->all());
        $validated = validator($data, [
            'step'        => 'nullable|integer',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon'        => 'nullable|string|max:100',
            'label'       => 'nullable|string|max:100',
            'sort_order'  => 'nullable|integer',
        ])->validate();
        return response()->json(ProcessStep::create($validated), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $s = ProcessStep::findOrFail($id);
        $data = $this->normalize($request->all());
        $validated = validator($data, [
            'step'        => 'nullable|integer',
            'title'       => 'sometimes|nullable|string|max:255',
            'description' => 'nullable|string',
            'icon'        => 'nullable|string|max:100',
            'label'       => 'nullable|string|max:100',
            'sort_order'  => 'nullable|integer',
        ])->validate();
        $s->update($validated);
        return response()->json($s);
    }

    public function destroy(int $id): JsonResponse
    {
        ProcessStep::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    /**
     * Normalize incoming data: cast step/sort_order to int,
     * convert empty strings to null for nullable integer fields.
     */
    private function normalize(array $data): array
    {
        // Cast step to integer — NEVER null (DB column is NOT NULL DEFAULT 1)
        if (isset($data['step']) && $data['step'] !== null && $data['step'] !== '') {
            $data['step'] = (int) $data['step'];
        } else {
            $data['step'] = 1;
        }

        // Cast sort_order to integer — NEVER null (DB column is NOT NULL DEFAULT 0)
        if (isset($data['sort_order']) && $data['sort_order'] !== null && $data['sort_order'] !== '') {
            $data['sort_order'] = (int) $data['sort_order'];
        } else {
            $data['sort_order'] = 0;
        }

        // Ensure title is never empty — fall back to label
        if (empty($data['title']) && !empty($data['label'])) {
            $data['title'] = $data['label'];
        }

        return $data;
    }
}
