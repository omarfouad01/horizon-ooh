<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\QueryException;

class ServiceController extends Controller
{
    /** Cached list of actual DB columns for 'services' */
    private static ?array $columns = null;

    private static function cols(): array
    {
        if (self::$columns === null) {
            self::$columns = Schema::getColumnListing('services');
        }
        return self::$columns;
    }

    /** Safely read a column that may not exist in older deployments */
    private function col(Service $s, string $column): mixed
    {
        return in_array($column, self::cols()) ? $s->{$column} : null;
    }

    private function transform(Service $s): array
    {
        return [
            'id'                => $s->id,
            'slug'              => $s->slug,
            'name'              => $s->name,
            'shortTitle'        => $this->col($s, 'short_title'),
            'tagline'           => $this->col($s, 'tagline'),
            'icon'              => $s->icon,
            'eyebrow'           => $s->eyebrow,
            'headline'          => $s->headline,
            'description'       => $s->description,
            'longDescription'   => $this->col($s, 'long_description'),
            'whatIs'            => $this->col($s, 'what_is'),
            'whereUsed'         => $this->col($s, 'where_used'),
            'image'             => $s->image,
            'imageAlt'          => $this->col($s, 'image_alt'),
            'features'          => $s->features ?? [],
            'benefits'          => $this->col($s, 'benefits') ?? [],
            'process'           => $this->col($s, 'process') ?? [],
            'stats'             => $s->stats ?? [],
            'whyChoose'         => $this->col($s, 'why_choose') ?? [],
            'sort_order'        => $s->sort_order,
            'titleAr'           => $this->col($s, 'title_ar'),
            'descriptionAr'     => $this->col($s, 'description_ar'),
            'longDescriptionAr' => $this->col($s, 'long_description_ar'),
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
        try {
            $data = $this->validated($request);
            $base = Str::slug($data['short_title'] ?? $data['name'] ?? 'service');
            $data['slug'] = $this->uniqueSlug($base);
            $normalized   = $this->normalize($data);
            $normalized   = $this->safeData($normalized);
            $svc = Service::create($normalized);
            return response()->json($this->transform($svc), 201);
        } catch (QueryException $e) {
            return response()->json(['message' => 'Database error: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $svc  = Service::findOrFail($id);
            $data = $this->validated($request, true);
            if (isset($data['name']) || isset($data['short_title'])) {
                $newSlug = Str::slug($data['short_title'] ?? $data['name']);
                if ($newSlug !== $svc->slug) {
                    $data['slug'] = $this->uniqueSlug($newSlug, $svc->id);
                }
            }
            $normalized = $this->normalize($data);
            $normalized = $this->safeData($normalized);
            $svc->update($normalized);
            return response()->json($this->transform($svc));
        } catch (QueryException $e) {
            return response()->json(['message' => 'Database error: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
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
            'process'            => 'nullable|array',
            'stats'              => 'nullable|array',
            'why_choose'         => 'nullable|array',
            'whyChoose'          => 'nullable|array',
            'whyChoose.*.title'  => 'nullable|string',
            'whyChoose.*.text'   => 'nullable|string',
            'sort_order'         => 'nullable|integer',
            'title_ar'           => 'nullable|string',
            'titleAr'            => 'nullable|string',
            'description_ar'     => 'nullable|string',
            'descriptionAr'      => 'nullable|string',
            'long_description_ar'  => 'nullable|string',
            'longDescriptionAr'    => 'nullable|string',
        ]);
    }

    private function uniqueSlug(string $base, ?int $excludeId = null): string
    {
        $slug = $base ?: 'service';
        $n    = 1;
        while (true) {
            $q = Service::where('slug', $slug);
            if ($excludeId) $q->where('id', '!=', $excludeId);
            if (!$q->exists()) break;
            $slug = $base . '-' . $n++;
        }
        return $slug;
    }

    /** Filter out columns that do not exist yet in the DB (schema-safe) */
    private function safeData(array $data): array
    {
        $allowed = array_merge(self::cols(), ['slug']);
        return array_intersect_key($data, array_flip($allowed));
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
            'whyChoose'         => 'why_choose',
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
