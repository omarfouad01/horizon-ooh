<?php
use App\Models\Billboard;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
$folder=__DIR__;
chdir('/home/horizon/public_html/horizonooh.com');
require 'vendor/autoload.php';
$app=require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$rows=json_decode(file_get_contents("$folder/offers.json"),true,512,JSON_THROW_ON_ERROR);
if(count($rows)!==8 || count(array_unique(array_column($rows,'title')))!==count($rows))throw new RuntimeException('Incomplete catalogue');
if(is_file("$folder/applied.json"))throw new RuntimeException('Already imported');
$assets=array_unique(array_merge(...array_column($rows,'photos')));
foreach($assets as $asset){
 $source="$folder/asset-$asset.jpg";
 $target="$folder/framed-$asset.jpg";
 $args=['/usr/bin/convert',$source,'-colorspace','sRGB','-brightness-contrast','2x0','-modulate','100,103,100','-unsharp','0x0.5+0.35+0.02','-resize','640x380','-background','#0e1d2b','-gravity','center','-extent','640x380',"$folder/frame.png",'-compose','Over','-composite','-alpha','remove','-strip','-quality','86',$target];
 exec(implode(' ',array_map('escapeshellarg',$args)),$output,$status);
 if($status || !is_file($target) || array_slice(getimagesize($target),0,2)!==[640,380])throw new RuntimeException("Failed photo $asset");
}
foreach($rows as $r){
 if(empty($r['code']) && !DB::table('districts')->where('id',$r['district'])->where('location_id',$r['location'])->exists())throw new RuntimeException('Invalid district for '.$r['ref']);
}
echo count($rows)." records and ".count($assets)." distinct source photos prepared\n";
if(!in_array('--apply',$argv,true))exit;
$applied=[];$backup=[];$copied=[];
try{
 DB::transaction(function()use($folder,$rows,&$applied,&$backup,&$copied){
  $supplierId=125;
  if(DB::table('suppliers')->where('id',$supplierId)->value('name')!=='Etac')throw new RuntimeException('Wrong supplier');
  $highest=Billboard::where('code','regexp','^H-[0-9]+$')->orderByRaw('CAST(SUBSTRING(code,3) AS UNSIGNED) DESC')->lockForUpdate()->firstOrFail();
  $number=(int)substr($highest->code,2);
  foreach($rows as $r){
   $code=$r['code'] ?? null;$isExisting=(bool)$code;$title=$r['title'];$ar=$r['titleAr'];
   if($isExisting){
    $b=Billboard::where('code',$code)->lockForUpdate()->firstOrFail();
    if((int)$b->supplier_id!==$r['expectedSupplier'])throw new RuntimeException("Unexpected supplier for $code");
    $backup[]=$b->load('images')->toArray();
    if((int)$b->location_id!==$r['location'])throw new RuntimeException("Unexpected location for $code");
    if($r['adjust'])$b->forceFill(['lat'=>$r['lat'],'lng'=>$r['lng']])->saveOrFail();
    if(!$r['append'])$b->images()->delete();
   }else{
    if(Billboard::where('supplier_id',$supplierId)->where('title',$title)->exists())throw new RuntimeException("Duplicate $title");
    $code='H-'.++$number;
    $size=$r['size'];
    $dims=preg_match('/^([\d.]+) × ([\d.]+)$/u',$size,$m);
    $note=$r['description'].($r['approx']?' The pin shows the approximate roadside location.':'');
    $noteAr=$r['descriptionAr'].($r['approx']?' البن يوضح الموقع التقريبي على الطريق.':'');
    $b=Billboard::create(['code'=>$code,'slug'=>Str::slug("$code $title"),'title'=>$title,'name_ar'=>$ar,
     'description'=>$note,'description_ar'=>$noteAr,'full_address'=>$r['address'].', Egypt','type'=>$r['type'],'format'=>$r['type']==='Digital Screen' ? 'Digital' : 'Billboard',
     'size'=>$size,'width'=>$dims?(float)$m[1]:null,'height'=>$dims?(float)$m[2]:null,'sqm'=>$dims?(float)$m[1]*(float)$m[2]:null,
     'quantity'=>$r['quantity'],'sides'=>$r['sides'],'location_id'=>$r['location'],'district_id'=>$r['district'],
     'lat'=>$r['lat'],'lng'=>$r['lng'],'illuminated'=>$r['lit'],'material'=>null,'price'=>null,'availability'=>'available',
     'supplier_id'=>$supplierId,'sort_order'=>0,'featured'=>false]);
   }
   $published=[]; $offset=$r['append'] ? 1+(int)$b->images()->max('sort_order') : 0;
   foreach($r['photos'] as $i=>$asset){
    $file=strtolower($code).'-etac-'.($i+1).'.jpg';
    $path=public_path("images/$file");
    if(file_exists($path)||!copy($folder.'/framed-'.$asset.'.jpg',$path))throw new RuntimeException("File already exists or copy failed: $file");
    $copied[]=$path;chmod($path,0644);
    $alt=$title.' | '.$code.' | Photo '.($i+1);
    $b->images()->create(['path'=>"images/$file",'url'=>"/images/$file",'alt'=>$alt,'is_primary'=>!$r['append'] && $i===0,'sort_order'=>$offset+$i]);
    $published[]=$file;
   }
   $applied[]=['ref'=>$r['ref'],'code'=>$code,'slug'=>$b->slug,'region'=>$r['region'],'updated'=>$isExisting,'supplierId'=>(int)$b->supplier_id,'images'=>$published];
  }
  $flags=JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT|JSON_THROW_ON_ERROR;
  if(file_put_contents("$folder/backup.json",json_encode($backup,$flags),LOCK_EX)===false||file_put_contents("$folder/applied.json",json_encode($applied,$flags),LOCK_EX)===false)throw new RuntimeException('Backup or manifest failed');
 });
}catch(Throwable $e){
 foreach($copied as $path)unlink($path);
 if(is_file("$folder/applied.json"))unlink("$folder/applied.json");
 fwrite(STDERR,$e->getMessage().PHP_EOL);exit(1);
}
echo count($applied)." records applied\n";







