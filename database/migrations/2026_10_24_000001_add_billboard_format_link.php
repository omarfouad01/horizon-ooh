<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up():void {if(!Schema::hasColumn('billboards','billboard_format_id'))Schema::table('billboards',function(Blueprint $t){$t->foreignId('billboard_format_id')->nullable()->constrained('billboard_formats')->nullOnDelete();});}
 public function down():void {}
};
