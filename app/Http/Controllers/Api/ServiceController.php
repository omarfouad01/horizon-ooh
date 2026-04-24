<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    private function transform(Service $s): array
    {
        return [
            'id'                => $s->id,
            'slug'              => $s->slug,
            'name'              => $s->name,
            'shortTitle'        => $s->short_title,
            'tagline'           => $s->tagline,
            'icon'              => $s->icon,
            'eyebrow'           => $s->eyebrow,
            'headline'          => $s->headline,
            'description'       => $s->description,
            'longDescription'   => $s->long_description,
            'whatIs'            => $s->what_is,
            'whereUsed'         => $s->where_used,
            'image'             => $s->image,
            'imageAlt'          => $s->image_alt,
            'features'          => $s->features ?? [],
            'benefits'          => $s->benefits ?? [],
            'stats'             => $s->stats ?? [],
            'sort_order'        => $s->sort_order,
            'titleAr'           => $s->title_ar,
            'descriptionAr'     => $s->description_ar,
            'longDescriptionAr' => $s->long_description_ar,
        ];
    }

    public function index(): JsonResponse
    {
        return response()->json(
            Service::orderBy('sort_order')->orderBy('name')->get()->map(fn($s) => $this->transform($s))
        );
    }

    public function show(string $slug): JsonResponse
    {
        return response()->json($this->transform(Service::where('slug', $slug)->firstOrFail()));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug'] = Str::slug($data['short_title'] ?? $data['name']);
        $svc = Service::create($this->normalize($data));
        return response()->json($this->transform($svc), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $svc  = Service::findOrFail($id);
        $data = $this->validated($request, true);
        if (isset($data['name']) || isset($data['short_title'])) {
            $data['slug'] = Str::slug($data['short_title'] ?? $data['name']);
        }
        $svc->update($this->normalize($data));
        return response()->json($this->transform($svc));
    }

    public function destroy(int $id): JsonResponse
    {
        Service::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function validated(Request $r, bool $optional = false): array
    {
        $rule = $optional ? 'sometimes' : 'required';
        return $r->validate([
            'name'               => "{$rule}|string|max:200",
            'short_title'        => 'nullable|string|max:200',
            'shortTitle'         => 'nullable|string|max:200',
            'tagline'            => 'nullable|string',
            'icon'               => 'nullable|string',
            'eyebrow'            => 'nullable|string',
            'headline'           => 'nullable|string',
            'description'        => 'nullable|string',
            'long_description'   => 'nullable|string',
            'longDescription'    => 'nullable|string',
            'what_is'            => 'nullable|string',
            'whatIs'             => 'nullable|string',
            'where_used'         => 'nullable|string',
            'whereUsed'          => 'nullable|string',
            'image'              => 'nullable|string',
            'image_alt'          => 'nullable|string',
            'imageAlt'           => 'nullable|string',
            'features'           => 'nullable|array',
            'benefits'           => 'nullable|array',
            'stats'              => 'nullable|array',
            'sort_order'         => 'nullable|integer',
            'title_ar'           => 'nullable|string',
            'titleAr'            => 'nullable|string',
            'description_ar'     => 'nullable|string',
            'descriptionAr'      => 'nullable|string',
            'long_description_ar'  => 'nullable|string',
            'longDescriptionAr'    => 'nullable|string',
        ]);
    }

    /** Convert camelCase keys sent from React to snake_case for Eloquent */
    private function normalize(array $d): array
    {
        $map = [
            'shortTitle'        => 'short_title',
            'longDescription'   => 'long_description',
            'whatIs'            => 'what_is',
            'whereUsed'         => 'where_used',
            'imageAlt'          => 'image_alt',
            'titleAr'           => 'title_ar',
            'descriptionAr'     => 'description_ar',
            'longDescriptionAr' => 'long_description_ar',
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
