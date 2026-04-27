<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SimulatorTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class SimulatorTemplateController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(SimulatorTemplate::orderBy('type_name')->orderBy('size_label')->get()->map(fn($t) => $this->transform($t)));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'typeName'  => 'required|string|max:120',
            'sizeLabel' => 'nullable|string|max:120',
            'mockupUrl' => 'nullable|string',
            'mockup'    => 'nullable|image|max:10240',
            'notes'     => 'nullable|string',
        ]);

        $mockupUrl = $request->input('mockupUrl');
        $panels    = $this->parsePanels($request->input('panels'));

        // Direct file upload takes priority over URL
        if ($request->hasFile('mockup')) {
            $path      = $request->file('mockup')->store('simulator-templates', 'public');
            $mockupUrl = Storage::disk('public')->url($path);
        }

        $tpl = SimulatorTemplate::create([
            'type_name'  => $request->input('typeName'),
            'size_label' => $request->input('sizeLabel', ''),
            'mockup_url' => $mockupUrl,
            'panels'     => $panels,
            'notes'      => $request->input('notes'),
        ]);

        return response()->json($this->transform($tpl), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tpl = SimulatorTemplate::findOrFail($id);

        $request->validate([
            'typeName'  => 'sometimes|string|max:120',
            'sizeLabel' => 'sometimes|nullable|string|max:120',
            'mockupUrl' => 'sometimes|nullable|string',
            'mockup'    => 'nullable|image|max:10240',
            'notes'     => 'nullable|string',
        ]);

        $updates = [];

        if ($request->has('typeName'))  $updates['type_name']  = $request->input('typeName');
        if ($request->has('sizeLabel')) $updates['size_label'] = $request->input('sizeLabel', '');
        if ($request->has('notes'))     $updates['notes']      = $request->input('notes');
        if ($request->has('panels'))    $updates['panels']     = $this->parsePanels($request->input('panels'));

        $mockupUrl = $request->has('mockupUrl') ? $request->input('mockupUrl') : $tpl->mockup_url;

        // Direct file upload takes priority over URL
        if ($request->hasFile('mockup')) {
            // Remove old stored mockup
            if ($tpl->mockup_url && str_contains($tpl->mockup_url, '/simulator-templates/')) {
                $oldPath = 'simulator-templates/' . basename($tpl->mockup_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path      = $request->file('mockup')->store('simulator-templates', 'public');
            $mockupUrl = Storage::disk('public')->url($path);
        }

        $updates['mockup_url'] = $mockupUrl;

        $tpl->update($updates);

        return response()->json($this->transform($tpl->fresh()));
    }

    public function destroy(int $id): JsonResponse
    {
        $tpl = SimulatorTemplate::findOrFail($id);
        // Clean up stored mockup
        if ($tpl->mockup_url && str_contains($tpl->mockup_url, '/simulator-templates/')) {
            $oldPath = 'simulator-templates/' . basename($tpl->mockup_url);
            Storage::disk('public')->delete($oldPath);
        }
        $tpl->delete();
        return response()->json(['message' => 'Deleted']);
    }

    /** Parse panels — accepts array or JSON string (from FormData) */
    private function parsePanels(mixed $panels): array
    {
        if (is_array($panels)) return $panels;
        if (is_string($panels) && $panels !== '') {
            $decoded = json_decode($panels, true);
            return is_array($decoded) ? $decoded : [];
        }
        return [];
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
