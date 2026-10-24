<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
return new class extends Migration {
 public function up(): void {
  DB::transaction(function(){
   $rows=DB::table('billboards')->select('id','code')->get();$planned=[];
   foreach($rows as$r){$code=preg_replace('/^Y-/','H-',$r->code);if(isset($planned[$code]))throw new RuntimeException('Billboard code collision: '.$code);$planned[$code]=$r->id;}
   foreach($rows as$r){$code=preg_replace('/^Y-/','H-',$r->code);if($code!==$r->code)DB::table('billboards')->where('id',$r->id)->update(['code'=>$code]);}
  });
 }
 public function down(): void { /* Preserve public identifiers on rollback; restore the private backup explicitly if needed. */ }
};
