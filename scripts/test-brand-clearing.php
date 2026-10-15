<?php
try {
$live=getenv('BRAND_TEST_APP') ?: dirname(__DIR__);$source=getenv('BRAND_TEST_SOURCE') ?: $live;
chdir($live);require 'vendor/autoload.php';require_once $source.'/app/Http/Controllers/Api/ClientBrandController.php';
$app=require 'bootstrap/app.php';$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
config(['database.default'=>'brand_memory','database.connections.brand_memory'=>['driver'=>'sqlite','database'=>':memory:','prefix'=>'']]);
Illuminate\Support\Facades\Schema::create('client_brands',function($t){$t->id();foreach((new App\Models\ClientBrand)->getFillable() as $field)$t->text($field)->nullable();$t->timestamps();});
$controller=new App\Http\Controllers\Api\ClientBrandController;$checks=0;
function checkBrand($condition,$message){global $checks;if(!$condition)throw new RuntimeException($message);$checks++;}
$seed=['name'=>'Fixture','name_ar'=>'اسم سابق','description'=>'Preserved English','description_ar'=>'وصف سابق','logo'=>'/legacy.svg','logo_url'=>'/current.svg','website'=>'https://example.invalid'];
foreach(['logoUrl','logo_url','logo'] as $key){
 $brand=App\Models\ClientBrand::create($seed);
 $result=$controller->update(new Illuminate\Http\Request([$key=>null]),$brand->id)->getData(true);
 checkBrand($brand->fresh()->logo===null && $brand->fresh()->logo_url===null,$key.' clears both logo columns');
 checkBrand($result['logoUrl']===null && $result['logo']===null,$key.' response has no fallback logo');
 checkBrand($brand->fresh()->name_ar===$seed['name_ar'],'Omitted Arabic name preserved');
}
foreach([['nameAr','descriptionAr'],['name_ar','description_ar']] as [$name,$description]){
 $brand=App\Models\ClientBrand::create($seed);
 $controller->update(new Illuminate\Http\Request([$name=>null,$description=>null]),$brand->id);
 checkBrand($brand->fresh()->name_ar===null && $brand->fresh()->description_ar===null,'Arabic null fields clear');
 checkBrand($brand->fresh()->logo_url===$seed['logo_url'],'Omitted logo preserved');
 checkBrand($brand->fresh()->description===$seed['description'],'English description preserved');
}
$brand=App\Models\ClientBrand::create($seed);
$controller->update(new Illuminate\Http\Request(['logoUrl'=>'','nameAr'=>'','descriptionAr'=>'']),$brand->id);
checkBrand($brand->fresh()->logo_url==='' && $brand->fresh()->logo===null,'Empty string clears logo without legacy fallback');
checkBrand($brand->fresh()->name_ar==='' && $brand->fresh()->description_ar==='','Empty strings clear Arabic fields');
$controller->update(new Illuminate\Http\Request(['logoUrl'=>'/replacement.svg','nameAr'=>'اسم جديد','descriptionAr'=>'وصف جديد']),$brand->id);
checkBrand($brand->fresh()->logo_url==='/replacement.svg' && $brand->fresh()->name_ar==='اسم جديد','Nonempty replacements persist');
$before=$brand->fresh()->getAttributes();
try{$controller->update(new Illuminate\Http\Request(['name'=>str_repeat('x',121),'logoUrl'=>null]),$brand->id);throw new RuntimeException('Invalid save accepted');}catch(Illuminate\Validation\ValidationException $e){$checks++;}
checkBrand($brand->fresh()->getAttributes()===$before,'Rejected save preserves all existing attributes');
$new=$controller->store(new Illuminate\Http\Request(['name'=>'New fixture','logoUrl'=>null,'nameAr'=>null,'descriptionAr'=>null]))->getData(true);
checkBrand($new['logoUrl']===null && $new['nameAr']===null && $new['descriptionAr']===null,'Create accepts intentionally blank fields');
echo json_encode(['result'=>'PASS','assertions'=>$checks,'database'=>'SQLite memory only'])."\n";
}catch(Throwable $e){fwrite(STDERR,$e->getMessage()."\n");exit(1);}
