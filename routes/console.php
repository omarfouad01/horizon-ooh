<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('projects:migrate-base64-images', function () {
    $fields = ['cover_image', 'hero_image', 'client_logo'];
    $migrated = 0;

    DB::table('projects')->orderBy('id')->each(function ($project) use ($fields, &$migrated) {
        $updates = [];

        foreach ($fields as $field) {
            $value = $project->{$field} ?? null;
            if (!is_string($value) || !str_starts_with($value, 'data:image/')) {
                continue;
            }

            if (!preg_match('/^data:image\/(jpeg|jpg|png|gif|webp);base64,(.+)$/s', $value, $matches)) {
                $this->warn("Project {$project->id}: skipped malformed {$field} data URL.");
                continue;
            }

            $binary = base64_decode($matches[2], true);
            if ($binary === false) {
                $this->warn("Project {$project->id}: skipped invalid {$field} base64 data.");
                continue;
            }

            $extension = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
            $path = sprintf(
                'projects/migrated/%s-%s-%s.%s',
                $project->slug ?: "project-{$project->id}",
                str_replace('_', '-', $field),
                substr(hash('sha256', $binary), 0, 12),
                $extension,
            );

            Storage::disk('public')->put($path, $binary);
            $updates[$field] = Storage::disk('public')->url($path);
            $migrated++;
        }

        if ($updates !== []) {
            DB::table('projects')->where('id', $project->id)->update($updates);
        }
    });

    $this->info("Migrated {$migrated} inline project image(s) to public storage.");
})->purpose('Move legacy base64 project images into public storage');
