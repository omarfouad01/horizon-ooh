<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SimulatorTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SimulatorTemplateController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(SimulatorTemplate::orderBy('type_name')->orderBy('size_label')->get()->map(fn($t) => $this->transform($t)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'typeName'  => 'required|string|max:120',
            'sizeLabel' => 'required|string|max:120',
            'mockupUrl' => 'required|string',
            'panels'    => 'required|array',
            'notes'     => 'nullable|string',
        ]);

        $tpl = SimulatorTemplate::create([
            'type_name'  => $data['typeName'],
            'size_label' => $data['sizeLabel'],
            'mockup_url' => $data['mockupUrl'],
            'panels'     => $data['panels'],
            'notes'      => $data['notes'] ?? null,
        ]);

        return response()->json($this->transform($tpl), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tpl  = SimulatorTemplate::findOrFail($id);
        $data = $request->validate([
            'typeName'  => 'sometimes|string|max:120',
            'sizeLabel' => 'sometimes|string|max:120',
            'mockupUrl' => 'sometimes|string',
            'panels'    => 'sometimes|array',
            'notes'     => 'nullable|string',
        ]);

        $tpl->update(array_filter([
            'type_name'  => $data['typeName']  ?? null,
            'size_label' => $data['sizeLabel'] ?? null,
            'mockup_url' => $data['mockupUrl'] ?? null,
            'panels'     => $data['panels']    ?? null,
            'notes'      => $data['notes']     ?? null,
        ], fn($v) => $v !== null));

        return response()->json($this->transform($tpl->fresh()));
    }

    public function destroy(int $id): JsonResponse
    {
        SimulatorTemplate::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function transform(SimulatorTemplate $t): array
    {
        return [
            'id'        => $t->id,
            'typeName'  => $t->type_name,
            'sizeLabel' => $t->size_label,
            'mockupUrl' => $t->mockup_url,
            'panels'    => $t->panels,
            'notes'     => $t->notes,
        ];
    }
}
