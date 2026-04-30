<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add type column (subtype like Unipole, Rooftop…)
        if (!Schema::hasColumn('billboards', 'type')) {
            Schema::table('billboards', function (Blueprint $table) {
                $table->string('type')->nullable()->after('format');
            });
        }
        // Add quantity column
        if (!Schema::hasColumn('billboards', 'quantity')) {
            Schema::table('billboards', function (Blueprint $table) {
                $table->unsignedInteger('quantity')->default(1)->after('type');
            });
        }
    }

    public function down(): void
    {
        Schema::table('billboards', function (Blueprint $table) {
            $table->dropColumn(['type', 'quantity']);
        });
    }
};
