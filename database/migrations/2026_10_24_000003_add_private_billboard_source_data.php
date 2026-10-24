<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void {Schema::table('billboards',function(Blueprint $t){if(!Schema::hasColumn('billboards','agency_price'))$t->decimal('agency_price',18,2)->nullable();if(!Schema::hasColumn('billboards','legacy_details'))$t->json('legacy_details')->nullable();});}
 public function down(): void { /* Preserve imported supplier prices and source details. */ }
};
