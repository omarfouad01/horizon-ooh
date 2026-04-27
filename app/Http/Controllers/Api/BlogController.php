<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    private function transform(BlogPost $p): array
    {
        return [
            'id'           => $p->id,
            'slug'         => $p->slug,
            'title'        => $p->title,
            'titleAr'      => $p->title_ar,
            'category'     => $p->category,
            'author'       => $p->author,
            'readTime'     => $p->read_time,
            'image'        => $p->image,
            'excerpt'      => $p->excerpt,
            'content'      => $p->content,
            'body'         => $p->body ?? [],
            'bodyAr'       => $p->body_ar ?? [],
            'tags'         => $p->tags ?? [],
            'metaTitle'    => $p->meta_title,
            'metaDesc'     => $p->meta_desc,
            'featured'     => (bool) $p->featured,
            'published'    => (bool) $p->published,
            'publishedAt'  => $p->published_at?->toISOString(),
            'sort_order'   => $p->sort_order,
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $q = BlogPost::orderBy('sort_order')->orderBy('published_at', 'desc');
        if (!$request->filled('all')) $q->where('published', true);
        return response()->json($q->get()->map(fn($p) => $this->transform($p)));
    }

    public function show(string $slug): JsonResponse
    {
        return response()->json($this->transform(BlogPost::where('slug', $slug)->firstOrFail()));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug']         = Str::slug($data['title'] ?? ('post-' . time()));
        $data['published_at'] = $data['published_at'] ?? now();
        $data = $this->normalize($data);
        $post = BlogPost::create($data);
        return response()->json($this->transform($post), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $data = $this->validated($request, true);
        if (isset($data['title'])) $data['slug'] = Str::slug($data['title']);
        $data = $this->normalize($data);
        $post->update($data);
        return response()->json($this->transform($post));
    }

    public function destroy(int $id): JsonResponse
    {
        BlogPost::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function validated(Request $r, bool $optional = false): array
    {
        $rule = $optional ? 'sometimes' : 'required';
        return $r->validate([
            'title'        => "{$rule}|string|max:255",
            'title_ar'     => 'nullable|string',
            'titleAr'      => 'nullable|string',
            'category'     => 'nullable|string',
            'author'       => 'nullable|string',
            'read_time'    => 'nullable|string',
            'readTime'     => 'nullable|string',
            'image'        => 'nullable|string',
            'excerpt'      => 'nullable|string',
            'content'      => 'nullable|string',
            'body'         => 'nullable|array',
            'body_ar'      => 'nullable|array',
            'bodyAr'       => 'nullable|array',
            'tags'         => 'nullable|array',
            'meta_title'   => 'nullable|string',
            'metaTitle'    => 'nullable|string',
            'meta_desc'    => 'nullable|string',
            'metaDesc'     => 'nullable|string',
            'featured'     => 'nullable|boolean',
            'published'    => 'nullable|boolean',
            'published_at' => 'nullable|date',
            'sort_order'   => 'nullable|integer',
        ]);
    }

    private function normalize(array $d): array
    {
        $map = [
            'titleAr'   => 'title_ar',
            'readTime'  => 'read_time',
            'bodyAr'    => 'body_ar',
            'metaTitle' => 'meta_title',
            'metaDesc'  => 'meta_desc',
        ];
        foreach ($map as $camel => $snake) {
            if (array_key_exists($camel, $d)) {
                if (!array_key_exists($snake, $d)) $d[$snake] = $d[$camel];
                unset($d[$camel]);
            }
        }
        return $d;
    }
}
