<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = BlogPost::orderBy('sort_order')->orderBy('published_at', 'desc');
        if (!$request->filled('all')) $q->where('published', true);
        return response()->json($q->get());
    }

    public function show(string $slug): JsonResponse
    {
        return response()->json(BlogPost::where('slug', $slug)->firstOrFail());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'category'     => 'nullable|string',
            'author'       => 'nullable|string',
            'read_time'    => 'nullable|string',
            'image'        => 'nullable|string',
            'excerpt'      => 'nullable|string',
            'content'      => 'nullable|string',
            'tags'         => 'nullable|array',
            'featured'     => 'nullable|boolean',
            'published'    => 'nullable|boolean',
            'published_at' => 'nullable|date',
            'sort_order'   => 'nullable|integer',
        ]);
        $data['slug']         = Str::slug($data['title']);
        $data['published_at'] = $data['published_at'] ?? now();
        return response()->json(BlogPost::create($data), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $data = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'category'     => 'nullable|string',
            'author'       => 'nullable|string',
            'read_time'    => 'nullable|string',
            'image'        => 'nullable|string',
            'excerpt'      => 'nullable|string',
            'content'      => 'nullable|string',
            'tags'         => 'nullable|array',
            'featured'     => 'nullable|boolean',
            'published'    => 'nullable|boolean',
            'published_at' => 'nullable|date',
            'sort_order'   => 'nullable|integer',
        ]);
        if (isset($data['title'])) $data['slug'] = Str::slug($data['title']);
        $post->update($data);
        return response()->json($post);
    }

    public function destroy(int $id): JsonResponse
    {
        BlogPost::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
