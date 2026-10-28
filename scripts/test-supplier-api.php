<?php
// CLI regression checks. All fixture writes are rolled back, including on failure.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
chdir(dirname(__DIR__));require 'vendor/autoload.php';$app=require 'bootstrap/app.php';$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\Api\SupplierController;
use App\Models\Supplier;
use App\Models\Billboard;
function expectSupplier(bool $ok,string $message):void{if(!$ok)throw new RuntimeException($message);}
$beforeSuppliers=hash('sha256',DB::table('suppliers')->orderBy('id')->get()->toJson());$beforeBillboards=hash('sha256',DB::table('billboards')->orderBy('id')->get()->toJson());$level=DB::transactionLevel();$failure=null;DB::beginTransaction();
try{
 $c=new SupplierController();$suffix=bin2hex(random_bytes(6));$data=['name'=>'QA Supplier '.$suffix,'contact'=>'QA Contact','email'=>'qa-'.$suffix.'@example.test','phone'=>'+201001234567','category'=>null,'description'=>'Description must remain','notes'=>'Separate private notes'];
 $created=$c->store(Request::create('/api/suppliers','POST',$data));expectSupplier($created->getStatusCode()===201,'Create response');$id=$created->getData(true)['id'];
 $c->update(Request::create('/api/suppliers/'.$id,'PUT',['phone'=>'+201009999999']),$id);$s=Supplier::findOrFail($id);expectSupplier($s->description===$data['description']&&$s->notes===$data['notes']&&$s->email===$data['email'],'Partial updates must retain omitted fields');
 $c->update(Request::create('/api/suppliers/'.$id,'PUT',['description'=>null]),$id);$s=Supplier::findOrFail($id);expectSupplier($s->description===null&&$s->notes===$data['notes'],'Clear description without clearing notes');
 $c->update(Request::create('/api/suppliers/'.$id,'PUT',['notes'=>null]),$id);expectSupplier(Supplier::findOrFail($id)->notes===null,'Clear notes');
 foreach([['name'=>'   '],['email'=>'not-an-email']]as$bad){$failed=false;try{$c->update(Request::create('/api/suppliers/'.$id,'PUT',$bad),$id);}catch(ValidationException $e){$failed=true;}expectSupplier($failed,'Invalid input rejected');}expectSupplier(Supplier::findOrFail($id)->name===$data['name'],'Invalid update must not change stored data');
 $location=App\Models\Location::query()->firstOrFail();$b=Billboard::create(['code'=>'QA-SUPPLIER-'.$suffix,'slug'=>'qa-supplier-'.$suffix,'title'=>'QA Supplier linked fixture','location_id'=>$location->id,'supplier_id'=>$id,'format'=>'Billboard','type'=>'Uni-pole','quantity'=>1,'sides'=>2,'lat'=>30,'lng'=>31,'featured'=>false,'sort_order'=>0]);
 $blocked=$c->destroy($id);expectSupplier($blocked->getStatusCode()===409&&Supplier::whereKey($id)->exists()&&Billboard::whereKey($b->id)->exists(),'Linked supplier and billboard must survive deletion attempt');$b->delete();$deleted=$c->destroy($id);expectSupplier($deleted->getStatusCode()===200&&!Supplier::whereKey($id)->exists(),'Unlinked supplier can be deleted');
}catch(Throwable $e){$failure=$e;}finally{while(DB::transactionLevel()>$level)DB::rollBack();}
expectSupplier(hash('sha256',DB::table('suppliers')->orderBy('id')->get()->toJson())===$beforeSuppliers,'Supplier fixture rollback must preserve all existing data');expectSupplier(hash('sha256',DB::table('billboards')->orderBy('id')->get()->toJson())===$beforeBillboards,'Billboard fixture rollback must preserve all existing data');if($failure)throw$failure;echo 'PASS supplier API: create, partial update, clear fields, validation, linked-delete protection, unlinked delete; all fixture writes rolled back'.PHP_EOL;
