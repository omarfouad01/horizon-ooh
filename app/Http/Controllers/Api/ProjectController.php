<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Database\QueryException;

class ProjectController extends Controller
{
    private function transform(Project $p): array
    {
        return [
            'id'                    => $p->id,
            'slug'                  => $p->slug,
            'title'                 => $p->title,
            'titleAr'               => $p->title_ar,
            'client'                => $p->client,
            'clientLogo'            => $p->client_logo,
            'clientLogoAlt'         => $p->client_logo_alt,
            'clientIndustry'        => $p->client_industry,
            'clientDescription'     => $p->client_description,
            'clientPageDescription' => $p->client_page_description,
            'campaignBrief'         => $p->campaign_brief,
            'category'              => $p->category,
            'eyebrow'               => $p->eyebrow,
            'tagline'               => $p->tagline,
            'taglineAr'             => $p->tagline_ar,
            'description'           => $p->description,
            'longDescription'       => $p->long_description,
            'overview'              => $p->overview,
            'overviewAr'            => $p->overview_ar,
            'objective'             => $p->objective,
            'objectiveAr'           => $p->objective_ar,
            'execution'             => $p->execution,
            'executionAr'           => $p->execution_ar,
            'coverImage'            => $p->cover_image,
            'coverImageAlt'         => $p->cover_image_alt,
            'heroImage'             => $p->hero_image,
            'heroImageAlt'          => $p->hero_image_alt,
            'images'                => $p->images ?? [],
            'galleryImages'         => $p->gallery_images ?? [],
            'results'               => $p->results_json ?? [],
            'stats'                 => $p->stats ?? [],
            'tags'                  => $p->tags ?? [],
            'keywords'              => $p->keywords ?? [],
            'location'              => $p->location,
            'city'                  => $p->city,
            'year'                  => $p->year,
            'duration'              => $p->duration,
            'featured'              => (bool) $p->featured,
            'sort_order'            => $p->sort_order,
        ];
    }

    public function index(): JsonResponse
    {
        return response()->json(
            Project::orderBy('sort_order')->orderBy('title')->get()->map(fn($p) => $this->transform($p))
        );
    }

    public function show(string $slug): JsonResponse
    {
        return response()->json($this->transform(Project::where('slug', $slug)->firstOrFail()));
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $data = $this->validated($request);
            $data['slug'] = $this->uniqueSlug(Str::slug($data['title'] ?? ('project-' . time())));
            $data = $this->handleCover($request, $data);
            $data = $this->normalize($data);
            // Remove any keys not in $fillable to avoid mass-assignment issues
            $data = $this->stripUnknownKeys($data);
            return response()->json($this->transform(Project::create($data)), 201);
        } catch (QueryException $e) {
            return response()->json(['message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $p    = Project::findOrFail($id);
            $data = $this->validated($request, true);
            if (isset($data['title'])) {
                $newSlug = Str::slug($data['title']);
                // Only enforce uniqueness if slug changed
                if ($newSlug !== $p->slug) {
                    $data['slug'] = $this->uniqueSlug($newSlug, $p->id);
                }
            }
            $data = $this->handleCover($request, $data, $p->cover_image);
            $data = $this->normalize($data);
            $data = $this->stripUnknownKeys($data);
            $p->update($data);
            return response()->json($this->transform($p));
        } catch (QueryException $e) {
            return response()->json(['message' => 'Database error: ' . $e->getMessage()], 500);
        }
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
            'title'                 => "{$rule}|string|max:200",
            'title_ar'              => 'nullable|string',
            'titleAr'               => 'nullable|string',
            'client'                => 'nullable|string',
            'client_logo'           => 'nullable|string',
            'clientLogo'            => 'nullable|string',
            'client_logo_alt'       => 'nullable|string',
            'clientLogoAlt'         => 'nullable|string',
            'client_industry'       => 'nullable|string',
            'clientIndustry'        => 'nullable|string',
            'client_description'    => 'nullable|string',
            'clientDescription'     => 'nullable|string',
            'client_page_description' => 'nullable|string',
            'clientPageDescription' => 'nullable|string',
            'campaign_brief'        => 'nullable|string',
            'campaignBrief'         => 'nullable|string',
            'category'              => 'nullable|string',
            'eyebrow'               => 'nullable|string',
            'tagline'               => 'nullable|string',
            'tagline_ar'            => 'nullable|string',
            'taglineAr'             => 'nullable|string',
            'description'           => 'nullable|string',
            'long_description'      => 'nullable|string',
            'longDescription'       => 'nullable|string',
            'overview'              => 'nullable|string',
            'overview_ar'           => 'nullable|string',
            'overviewAr'            => 'nullable|string',
            'objective'             => 'nullable|string',
            'objective_ar'          => 'nullable|string',
            'objectiveAr'           => 'nullable|string',
            'execution'             => 'nullable|string',
            'execution_ar'          => 'nullable|string',
            'executionAr'           => 'nullable|string',
            'cover_image'           => 'nullable|string',
            'coverImage'            => 'nullable|string',
            'cover_image_alt'       => 'nullable|string',
            'coverImageAlt'         => 'nullable|string',
            'hero_image'            => 'nullable|string',
            'heroImage'             => 'nullable|string',
            'hero_image_alt'        => 'nullable|string',
            'heroImageAlt'          => 'nullable|string',
            'images'                => 'nullable|array',
            'gallery_images'        => 'nullable|array',
            'galleryImages'         => 'nullable|array',
            'results'               => 'nullable|array',
            'results_json'          => 'nullable|array',
            'stats'                 => 'nullable|array',
            'tags'                  => 'nullable|array',
            'keywords'              => 'nullable|array',
            'location'              => 'nullable|string',
            'city'                  => 'nullable|string',
            'year'                  => 'nullable|string',
            'duration'              => 'nullable|string',
            'featured'              => 'nullable|boolean',
            'sort_order'            => 'nullable|integer',
        ]);
    }

    /** Generate a unique slug, appending -N if necessary */
    private function uniqueSlug(string $base, ?int $excludeId = null): string
    {
        $slug = $base;
        $n    = 1;
        while (true) {
            $q = Project::where('slug', $slug);
            if ($excludeId) $q->where('id', '!=', $excludeId);
            if (!$q->exists()) break;
            $slug = $base . '-' . $n++;
        }
        return $slug;
    }

    /** Strip keys not in Project::$fillable to prevent mass-assignment errors */
    private function stripUnknownKeys(array $data): array
    {
        $allowed = (new Project)->getFillable();
        // Also allow 'slug' which is fillable but may not appear in $fillable explicitly
        return array_intersect_key($data, array_flip(array_merge($allowed, ['slug'])));
    }

    private function handleCover(Request $request, array $data, ?string $old = null): array
    {
        if ($request->hasFile('cover_image')) {
            if ($old && !str_starts_with($old, 'http')) Storage::disk('public')->delete($old);
            $path = $request->file('cover_image')->store('projects', 'public');
            $data['cover_image'] = Storage::disk('public')->url($path);
        } elseif ($request->filled('cover_image') || $request->filled('coverImage')) {
            $data['cover_image'] = $request->cover_image ?? $request->coverImage;
        }
        return $data;
    }

    /** Map camelCase keys from React to snake_case for Eloquent mass-assignment */
    private function normalize(array $d): array
    {
        $map = [
            'titleAr'               => 'title_ar',
            'clientLogo'            => 'client_logo',
            'clientLogoAlt'         => 'client_logo_alt',
            'clientIndustry'        => 'client_industry',
            'clientDescription'     => 'client_description',
            'clientPageDescription' => 'client_page_description',
            'campaignBrief'         => 'campaign_brief',
            'taglineAr'             => 'tagline_ar',
            'longDescription'       => 'long_description',
            'overviewAr'            => 'overview_ar',
            'objectiveAr'           => 'objective_ar',
            'executionAr'           => 'execution_ar',
            'coverImage'            => 'cover_image',
            'coverImageAlt'         => 'cover_image_alt',
            'heroImage'             => 'hero_image',
            'heroImageAlt'          => 'hero_image_alt',
            'galleryImages'         => 'gallery_images',
            'results'               => 'results_json',    // frontend sends "results", DB col is results_json
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
