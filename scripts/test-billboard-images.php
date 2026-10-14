<?php
// Run from the project root. Uses only an in-memory database and a temporary disk.
require getcwd().'/vendor/autoload.php';
require getcwd().'/app/Models/BillboardImage.php';
require getcwd().'/app/Http/Controllers/Api/BillboardController.php';
$app = require getcwd().'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
config(['database.default' => 'image_test', 'database.connections.image_test' => [
    'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '',
]]);
$schema = Illuminate\Support\Facades\Schema::connection('image_test');
$schema->create('billboards', function ($t) {
    $t->id(); $t->string('code'); $t->string('slug'); $t->string('title');
    $t->integer('location_id')->nullable(); $t->integer('district_id')->nullable(); $t->timestamps();
});
foreach (['locations','districts'] as $table) $schema->create($table, fn($t) => $t->id());
$schema->create('billboard_images', function ($t) {
    $t->id(); $t->integer('billboard_id'); $t->string('url'); $t->string('path')->nullable();
    $t->string('alt')->nullable(); $t->boolean('is_primary')->default(false); $t->integer('sort_order')->default(0); $t->timestamps();
});
Illuminate\Support\Facades\Storage::fake('public');
$b = App\Models\Billboard::create(['code'=>'test','slug'=>'test','title'=>'Test']);
$other = App\Models\Billboard::create(['code'=>'other','slug'=>'other','title'=>'Other']);
$add = function ($billboard, $name, $primary) {
    Illuminate\Support\Facades\Storage::disk('public')->put($name.'.jpg', 'fixture');
    return App\Models\BillboardImage::create(['billboard_id'=>$billboard->id, 'url'=>'/storage/'.$name.'.jpg',
        'path'=>$name.'.jpg', 'sort_order'=>1, 'is_primary'=>$primary]);
};
$first=$add($b,'first',true); $second=$add($b,'second',false); $foreign=$add($other,'other',true);
$controller=new App\Http\Controllers\Api\BillboardController;
$check=function ($condition,$message) { if (!$condition) throw new RuntimeException($message); };
$save=function ($input) use ($controller,$b) { return $controller->update(new Illuminate\Http\Request($input),$b->id)->getData(true); };
$saved=$save(['image_alts'=>json_encode([['url'=>$second->url,'alt'=>'Real cover description'],['url'=>$foreign->url,'alt'=>'Must not change']]),'retained_image_urls'=>json_encode([$second->url])]);
$check($saved['images'][0]['alt']==='Real cover description','Saved alt must be returned');
$check($foreign->fresh()->alt===null,'Another billboard alt was changed');
$save(['image_alts'=>json_encode([['url'=>$second->url,'alt'=>'']])]);
$check($second->fresh()->alt==='','Explicit empty alt must be saved');
$check(count($saved['images'])===1,'Removed image must disappear from save response');
$check($second->fresh()->is_primary,'Remaining image must become primary');
$check(!Illuminate\Support\Facades\Storage::disk('public')->exists('first.jpg'),'Removed file remains');
$save([]);
$check($b->images()->count()===1,'Omitted image field must preserve images');
try { $save(['retained_image_urls'=>'null']); throw new RuntimeException('Invalid manifest accepted'); }
catch (Illuminate\Validation\ValidationException $e) {}
$saved=$save(['retained_image_urls'=>'[]']);
$check($saved['images']===[] && $b->images()->count()===0,'Removing last image failed');
$check(!Illuminate\Support\Facades\Storage::disk('public')->exists('second.jpg'),'Last file remains');
$check($other->images()->count()===1,'Another billboard was affected');
$schema->getConnection()->table('locations')->insert(['id'=>1]);
$upload=Illuminate\Http\UploadedFile::fake()->image('cover.jpg',60,40);
$request=Illuminate\Http\Request::create('/', 'POST', ['code'=>'new-upload','title'=>'New upload','location_id'=>1,'new_image_alts'=>['Uploaded cover description']], [], ['images'=>[$upload]]);
$created=$controller->store($request)->getData(true);
$check($created['images'][0]['alt']==='Uploaded cover description','New image alt was not persisted');

echo "PASS: saved removal, primary replacement, omitted field, malformed manifest, last image, disk removal, billboard isolation\n";
