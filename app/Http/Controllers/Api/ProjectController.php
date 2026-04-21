<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Project::orderBy('sort_order')->orderBy('title')->get());
    }

    public function show(string $slug): JsonResponse
    {
        return response()->json(Project::where('slug', $slug)->firstOrFail());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug'] = Str::slug($data['title']);
        $data = $this->handleCover($request, $data);
        return response()->json(Project::create($data), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $p    = Project::findOrFail($id);
        $data = $this->validated($request, optional: true);
        if (isset($data['title'])) $data['slug'] = Str::slug($data['title']);
        $data = $this->handleCover($request, $data, $p->cover_image);
        $p->update($data);
        return response()->json($p);
    }

    public function destroy(int $id): JsonResponse
    {
        $p = Project::findOrFail($id);
        if ($p->cover_image && !str_starts_with($p->cover_image, 'http')) {
            Storage::disk('public')->delete($p->cover_image);
        }
        $p->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function validated(Request $request, bool $optional = false): array
    {
        $rule = $optional ? 'sometimes' : 'required';
        return $request->validate([
            'title'            => "{$rule}|string|max:200",
            'client'           => 'nullable|string',
            'category'         => 'nullable|string',
            'eyebrow'          => 'nullable|string',
            'description'      => 'nullable|string',
            'long_description' => 'nullable|string',
            'images'           => 'nullable|array',
            'stats'            => 'nullable|array',
            'year'             => 'nullable|string',
            'featured'         => 'nullable|boolean',
            'sort_order'       => 'nullable|integer',
        ]);
    }

    private function handleCover(Request $request, array $data, ?string $old = null): array
    {
        if ($request->hasFile('cover_image')) {
            if ($old && !str_starts_with($old, 'http')) Storage::disk('public')->delete($old);
            $path = $request->file('cover_image')->store('projects', 'public');
            $data['cover_image'] = Storage::disk('public')->url($path);
        } elseif ($request->filled('cover_image')) {
            $data['cover_image'] = $request->cover_image;
        }
        return $data;
    }
}
