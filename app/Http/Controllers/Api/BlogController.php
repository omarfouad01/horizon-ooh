<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Database\QueryException;

class BlogController extends Controller
{
    private function canReadDrafts(): bool
    {
        try {
            return in_array(auth('api')->user()?->role, ['admin', 'editor', 'viewer'], true);
        } catch (\Throwable $e) {
            return false;
        }
    }

    private function transform(BlogPost $p): array
    {
        return \App\Support\PublicImage::values([
            'id'           => $p->id,
            'slug'         => $p->slug,
            'title'        => $p->title,
            'titleAr'      => $p->title_ar,
            'category'     => $p->category,
            'author'       => $p->author,
            'readTime'     => $p->read_time,
            'image'        => $p->image,
            'imageAlt' => $p->image_alt,
            'excerpt'      => $p->excerpt,
            'excerptAr'    => $p->excerpt_ar,
            'content'      => $p->content,
            'body'         => $p->body ?? [],
            'bodyAr'       => $p->body_ar ?? [],
            'tags'         => $p->tags ?? [],
            'metaTitle'    => $p->meta_title,
            'metaDesc'     => $p->meta_desc,
            'featured'     => (bool) $p->featured,
            'published'    => (bool) $p->published,
            'publishedAt'  => $p->published_at?->toISOString(),
            'updatedAt' => $p->updated_at?->toISOString(),
            'sort_order'   => $p->sort_order,
        ]);
    }

    /** Lightweight cards for listing pages; article bodies are fetched by slug. */
    private function transformList(BlogPost $p): array
    {
        return collect($this->transform($p))
            ->except(['content', 'body', 'bodyAr'])
            ->all();
    }

    public function index(Request $request): JsonResponse
    {
        $q = BlogPost::orderBy('sort_order')->orderBy('published_at', 'desc');
        if (!($request->boolean('all') && $this->canReadDrafts())) $q->where('published', true);
        $full = $request->boolean('all') || $request->boolean('full');
        return response()->json($q->get()->map(
            fn($p) => $full ? $this->transform($p) : $this->transformList($p)
        ));
    }

    public function show(string $slug): JsonResponse
    {
        $query = BlogPost::where('slug', $slug);
        if (!$this->canReadDrafts()) $query->where('published', true);
        return response()->json($this->transform($query->firstOrFail()));
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $data = $this->validated($request);
            $data['slug']         = $this->uniqueSlug(Str::slug($data['title'] ?? ('post-' . time())));
            $data['published'] = $data['published'] ?? false;
            $data['published_at'] = $data['published'] ? ($data['published_at'] ?? now()) : null;
            $data = $this->normalize($data);
            $data = $this->stripUnknownKeys($data);
            $post = BlogPost::create($data);
            return response()->json($this->transform($post->fresh()), 201);
        } catch (QueryException $e) {
            return response()->json(['message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $post = BlogPost::findOrFail($id);
            $data = $this->validated($request, true);
            if (!empty($data['published']) && !$post->published_at) $data['published_at'] = $data['published_at'] ?? now();
            // Keep published URLs stable when editing an article or its title.
            $data = $this->normalize($data);
            $data = $this->stripUnknownKeys($data);
            $post->update($data);
            if (!$post->published) \App\Support\PublicSeoRefresh::removeBlogPage($post->slug);
            return response()->json($this->transform($post));
        } catch (QueryException $e) {
            return response()->json(['message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $post->delete();
        \App\Support\PublicSeoRefresh::removeBlogPage($post->slug);
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
            'imageAlt' => 'nullable|string|max:1000',
            'image_alt' => 'nullable|string|max:1000',
            'excerpt'      => 'nullable|string',
            'excerptAr'    => 'nullable|string',
            'excerpt_ar'   => 'nullable|string',
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

    private function uniqueSlug(string $base, ?int $excludeId = null): string
    {
        $slug = $base;
        $n    = 1;
        while (true) {
            $q = BlogPost::where('slug', $slug);
            if ($excludeId) $q->where('id', '!=', $excludeId);
            if (!$q->exists()) break;
            $slug = $base . '-' . $n++;
        }
        return $slug;
    }

    private function stripUnknownKeys(array $data): array
    {
        $allowed = (new BlogPost)->getFillable();
        return array_intersect_key($data, array_flip(array_merge($allowed, ['slug'])));
    }

    private function normalize(array $d): array
    {
        $map = [
            'imageAlt' => 'image_alt',
            'titleAr'   => 'title_ar',
            'excerptAr' => 'excerpt_ar',
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
