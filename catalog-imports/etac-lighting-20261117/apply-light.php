<?php
chdir('/home/horizon/public_html/horizonooh.com');
require 'vendor/autoload.php';
$app=require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$digital=['H-15173','H-14127','H-14130'];
$backlit=['H-15174','H-15175'];
$source=json_decode(file_get_contents(dirname(__DIR__).'/etac-20261117/applied.json'),true,512,JSON_THROW_ON_ERROR);
$manifest=array_values(array_filter($source,fn($r)=>in_array($r['code'],[...$digital,...$backlit],true)));
if(count($manifest)!==5)throw new RuntimeException('Expected five records');
DB::transaction(function()use($digital,$backlit,$manifest){
 $backups=[];
 foreach($manifest as $row){
  $b=App\Models\Billboard::where('code',$row['code'])->lockForUpdate()->firstOrFail();
  $isDigital=in_array($b->code,$digital,true);
  if((int)$b->supplier_id!==$row['supplierId']||$b->type!==($isDigital?'Digital Screen':'Uni-pole'))throw new RuntimeException('Unexpected listing '.$b->code);
  $backups[]=$b->only(['code','brightness','illuminated']);
  $b->updateOrFail(['brightness'=>$isDigital?'Digital LED':'Back Light','illuminated'=>true]);
 }
 foreach(['backup.json'=>$backups,'applied.json'=>$manifest] as $file=>$data){
  if(file_put_contents(__DIR__.'/'.$file,json_encode($data,JSON_PRETTY_PRINT|JSON_THROW_ON_ERROR),LOCK_EX)===false)throw new RuntimeException('Write failed');
 }
});

