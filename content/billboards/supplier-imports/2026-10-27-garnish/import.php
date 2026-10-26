<?php
$root='/home/horizon/public_html/horizonooh.com';$base='/home/horizon/deploy-backups/garnish-20261027';
chdir($root);require 'vendor/autoload.php';$app=require 'bootstrap/app.php';$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
$m=json_decode(file_get_contents($base.'/manifest.json'),true,512,JSON_THROW_ON_ERROR);
if(count($m['rows'])!==4||$m['site']!=='egypt'||file_exists($base.'/import-result.json'))throw new RuntimeException('Import already applied or manifest invalid');
$before=['billboards'=>DB::table('billboards')->orderBy('id')->get()->toArray(),'images'=>DB::table('billboard_images')->orderBy('id')->get()->toArray(),'suppliers'=>DB::table('suppliers')->orderBy('id')->get()->toArray()];
$hash=fn($a)=>hash('sha256',json_encode($a));
$oldHash=$hash($before);$backup=$base.'/backup-'.gmdate('Ymd-His');mkdir($backup,0700,true);
file_put_contents($backup.'/inventory-before.json',json_encode($before,JSON_UNESCAPED_UNICODE));chmod($backup.'/inventory-before.json',0600);
$dictPath=$root.'/resources/react/i18n/publicArabic.json';copy($dictPath,$backup.'/publicArabic.before.json');
foreach($m['rows']as$r){
 if(App\Models\Billboard::where('code',$r['code'])->exists())throw new RuntimeException('Code exists '.$r['code']);
 if(!App\Models\District::where('id',$r['district_id'])->where('location_id',2)->exists())throw new RuntimeException('District mismatch');
 foreach($r['images']as$i){$p=$base.'/prepared/'.$i['fileName'];if(hash_file('sha256',$p)!==$i['sha256']||getimagesize($p)[0]!==640||getimagesize($p)[1]!==380)throw new RuntimeException('Image mismatch');if(file_exists($root.'/public/images/'.$i['fileName']))throw new RuntimeException('Target file exists');}
}
if(App\Models\Supplier::find(244)?->name!=='Garnish ad')throw new RuntimeException('Supplier mismatch');
if(!in_array('--apply',$argv,true)){echo json_encode(['mode'=>'dry-run','new_records'=>4,'new_images'=>7,'existing_records'=>count($before['billboards']),'backup'=>$backup]);exit;}
$created=[];$copied=[];
try{
 DB::transaction(function()use($m,$root,$base,&$created,&$copied){
  foreach($m['rows']as$r){
   $slug=Str::slug($r['code'].' '.$r['title']);
   $data=Illuminate\Support\Arr::only($r,['code','title','name_ar','location_id','district_id','format','type','quantity','size','sqm','sides','brightness','supplier_id','availability','illuminated','lat','lng','description','description_ar']);
   $data+=['slug'=>$slug,'full_address'=>$r['address'],'price'=>null,'material'=>null,'featured'=>false,'sort_order'=>0];
   $b=App\Models\Billboard::create($data);
   foreach($r['images']as$i){$dest=$root.'/public/images/'.$i['fileName'];if(!copy($base.'/prepared/'.$i['fileName'],$dest))throw new RuntimeException('Copy failed');$copied[]=$dest;App\Models\BillboardImage::create(['billboard_id'=>$b->id,'path'=>'images/'.$i['fileName'],'url'=>$i['url'],'is_primary'=>$i['isPrimary'],'sort_order'=>$i['sortOrder'],'alt'=>$i['alt']]);}
   $created[]=['id'=>$b->id,'code'=>$b->code,'slug'=>$slug,'url'=>'https://horizonooh.com/locations/cairo/billboards/'.$slug];
  }
 });
}catch(Throwable $e){foreach($copied as$p)unlink($p);throw $e;}
$ids=array_column($created,'id');
$after=['billboards'=>DB::table('billboards')->whereNotIn('id',$ids)->orderBy('id')->get()->toArray(),'images'=>DB::table('billboard_images')->whereNotIn('billboard_id',$ids)->orderBy('id')->get()->toArray(),'suppliers'=>DB::table('suppliers')->orderBy('id')->get()->toArray()];
if($hash($after)!==$oldHash)throw new RuntimeException('Existing inventory changed; inspect backup');
$dict=json_decode(file_get_contents($dictPath),true,512,JSON_THROW_ON_ERROR);
$normalize=fn($s)=>strtolower(trim(preg_replace('/\s+/u',' ',$s)));
foreach($m['rows']as$r){$pairs=[[$r['title'],$r['name_ar']],[$r['address'],$r['address_ar']],[$r['description'],$r['description_ar']]];foreach($r['images']as$i)$pairs[]=[$i['alt'],$i['altAr']];foreach($pairs as[$en,$ar]){$dict[$normalize($en)]=$ar;$dict[$normalize($ar)]=$ar;}}
file_put_contents($dictPath,json_encode($dict,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)."\n");
$result=['records'=>$created,'images'=>count($copied),'existing_inventory_unchanged'=>true,'backup'=>$backup,'all_pins_approximate'=>true];
file_put_contents($base.'/import-result.json',json_encode($result,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));chmod($base.'/import-result.json',0600);
echo json_encode($result,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);