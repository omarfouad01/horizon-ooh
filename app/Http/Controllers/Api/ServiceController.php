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
        return \App\Support\PublicImage::values([
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
            'editorial' => 'sometimes|array:approved',
            'editorial.approved' => 'required_with:editorial|array:en,ar,related',
            'editorial.approved.related' => 'required_with:editorial.approved|array|min:2|max:3',
            'editorial.approved.related.*' => 'required|string|distinct|exists:services,slug',
            'editorial.approved.en' => 'required_with:editorial.approved|array:title,description,heading,intro,cta,sections,card',
            'editorial.approved.ar' => 'required_with:editorial.approved|array:title,description,heading,intro,cta,sections,card',
            ...$this->approvedLocaleRules('en'),
            ...$this->approvedLocaleRules('ar'),
        ]);
    }

    private function approvedLocaleRules(string $locale): array
    {
        $key = "editorial.approved.{$locale}";

        return [
            "{$key}.title" => "required_with:{$key}|string|max:200",
            "{$key}.description" => "required_with:{$key}|string|max:300",
            "{$key}.heading" => "required_with:{$key}|string|max:200",
            "{$key}.intro" => "required_with:{$key}|string",
            "{$key}.card" => "required_with:{$key}|string",
            "{$key}.cta" => "required_with:{$key}|array:heading,description,button",
            "{$key}.cta.heading" => "required_with:{$key}|string",
            "{$key}.cta.description" => "required_with:{$key}|string",
            "{$key}.cta.button" => "required_with:{$key}|string",
            "{$key}.sections" => "required_with:{$key}|array|size:5",
            "{$key}.sections.*" => "required|array:heading,items",
            "{$key}.sections.*.heading" => "required|string",
            "{$key}.sections.*.items" => "required|array|min:1",
            "{$key}.sections.*.items.*" => "required|array:label,text",
            "{$key}.sections.*.items.*.label" => "sometimes|required|string",
            "{$key}.sections.*.items.*.text" => "required|string",
        ];
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
