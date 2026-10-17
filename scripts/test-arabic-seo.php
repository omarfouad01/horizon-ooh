<?php
try {
// Production data is never accessed: models use an isolated SQLite database.
$live=getenv('DASHBOARD_TEST_APP') ?: dirname(__DIR__);
$source=getenv('DASHBOARD_TEST_SOURCE') ?: $live;
chdir($live);require 'vendor/autoload.php';
foreach(['app/Models/User.php','app/Models/BlogPost.php','app/Http/Controllers/Api/BlogController.php','app/Http/Controllers/Api/UserController.php','app/Http/Middleware/DashboardAccess.php','app/Providers/AppServiceProvider.php','app/Support/PublicSeoRefresh.php'] as $file)require_once $source.'/'.$file;
$app=require $live.'/bootstrap/app.php';$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
config(['database.default'=>'fix_memory','database.connections.fix_memory'=>['driver'=>'sqlite','database'=>':memory:','prefix'=>''],'cache.default'=>'array','session.driver'=>'array']);
$isolatedPublic=sys_get_temp_dir().'/horizon-publishing-'.bin2hex(random_bytes(8));
$app->usePublicPath($isolatedPublic);
$schema=Illuminate\Support\Facades\Schema::connection('fix_memory');
$schema->create('users',function($t){$t->id();foreach(['name','email','password','role','phone','company','source','notes'] as $field)$t->text($field)->nullable();$t->timestamps();});
$schema->create('blog_posts',function($t){$t->id();foreach((new App\Models\BlogPost)->getFillable() as $field){if($field==='published')$t->boolean($field)->default(true);else $t->text($field)->nullable();}$t->timestamps();});
$assertions=0;function check($value,$message){global $assertions;if(!$value)throw new RuntimeException($message);$assertions++;}
$middleware=new App\Http\Middleware\DashboardAccess;
$users=[];
foreach(['user','viewer','editor','admin'] as $role){
 $users[$role]=App\Models\User::create(['name'=>'Fixture','email'=>$role.'@example.invalid','password'=>Illuminate\Support\Facades\Hash::make('fixture-password'),'role'=>$role]);
 foreach([['GET','/api/users',$role==='admin'],['PUT','/api/settings',$role==='admin'],['POST','/api/blog',in_array($role,['admin','editor'])],['GET','/api/contacts',$role!=='user'],['DELETE','/api/billboards/1',$role==='admin'||$role==='editor']] as [$method,$path,$allowed]){
  $r=Illuminate\Http\Request::create($path,$method);$r->setUserResolver(fn()=>$users[$role]);
  $response=$middleware->handle($r,fn()=>response()->json(['ok'=>true]));
  check($response->getStatusCode()===($allowed?200:403),"$role $method $path authorization");
 }
}
check((new App\Models\User)->getJWTCustomClaims()['role']==='user','Null role must never become admin');
$usersController=new App\Http\Controllers\Api\UserController;
check($usersController->update(new Illuminate\Http\Request(['role'=>'viewer']),$users['admin']->id)->getStatusCode()===422,'Last admin cannot be demoted');
check($usersController->destroy($users['admin']->id)->getStatusCode()===422,'Last admin cannot be deleted');
$published=App\Models\BlogPost::create(['slug'=>'custom-short-slug','title'=>'Article title','body'=>[],'published'=>true]);
$draft=App\Models\BlogPost::create(['slug'=>'fixture-draft','title'=>'Draft','body'=>[],'published'=>false]);
$controller=new App\Http\Controllers\Api\BlogController;
foreach(['user','viewer','editor','admin'] as $role){
 Illuminate\Support\Facades\Auth::guard('api')->setUser($users[$role]);
 $list=$controller->index(new Illuminate\Http\Request(['all'=>'1']))->getData(true);
 check(count($list)===($role==='user'?1:2),"$role draft listing");
 try{$controller->show('fixture-draft');$found=true;}catch(Illuminate\Database\Eloquent\ModelNotFoundException $e){$found=false;}
 check($found===($role!=='user'),"$role draft detail");
}
Illuminate\Support\Facades\Auth::forgetGuards();
check(count($controller->index(new Illuminate\Http\Request(['all'=>1,'full'=>1]))->getData(true))===1,'Anonymous all/full cannot expose drafts');
try{$controller->show('fixture-draft');throw new RuntimeException('Anonymous draft exposed');}catch(Illuminate\Database\Eloquent\ModelNotFoundException $e){$assertions++;}
$controller->update(new Illuminate\Http\Request(['title'=>'Article title','excerptAr'=>'مقتطف عربي']),$published->id);
check($published->fresh()->slug==='custom-short-slug','Same-title save preserves slug');
$controller->update(new Illuminate\Http\Request(['title'=>'Changed title']),$published->id);
check($published->fresh()->slug==='custom-short-slug','Changed-title save preserves slug');
check($controller->show('custom-short-slug')->getData(true)['excerptAr']==='مقتطف عربي','Arabic excerpt persists');
$router=$app->make('router');$router->setRoutes(new Illuminate\Routing\RouteCollection);
$router->group(['prefix'=>'api','middleware'=>'api'],fn()=>require $source.'/routes/api.php');
$route=$router->getRoutes()->match(Illuminate\Http\Request::create('/api/billboards/next-code'));
check(str_ends_with($route->getActionName(),'@nextCode'),'next-code static route resolves correctly');
check(in_array(App\Http\Middleware\DashboardAccess::class,$route->gatherMiddleware()),'next-code guarded by dashboard permission');

$new=$controller->store(new Illuminate\Http\Request(['title'=>'Publish button payload fixture','body'=>[['type'=>'p','content'=>'Original body']]]))->getData(true);
echo json_encode(['test'=>'dashboard_create_payload_omits_published','response_published'=>$new['published'],'database_published'=>App\Models\BlogPost::find($new['id'])->published])."\n";
check($new['published']===false && !App\Models\BlogPost::find($new['id'])->published,'New article defaults safely to draft in response and database');
check(App\Models\BlogPost::find($new['id'])->published_at===null,'Draft has no publication timestamp');
$controller->update(new Illuminate\Http\Request(['title'=>'Edited fixture','excerptAr'=>'نص محفوظ','body'=>[['type'=>'p','content'=>'Saved draft body']],'published'=>false]),$new['id']);
check(App\Models\BlogPost::find($new['id'])->body[0]['content']==='Saved draft body','Draft body persisted');
check(!App\Models\BlogPost::find($new['id'])->published,'Draft stays unpublished');
$controller->update(new Illuminate\Http\Request(['published'=>true]),$new['id']);
check($controller->show($new['slug'])->getData(true)['published']===true,'Published article becomes publicly readable');
check(App\Models\BlogPost::find($new['id'])->published_at!==null,'First publication receives a timestamp');
foreach(['blog/','ar/blog/'] as $prefix){$directory=$isolatedPublic.'/ssg/'.$prefix.$new['slug'];mkdir($directory,0700,true);foreach(['index.html','index.html.br','index.html.gz'] as $file)file_put_contents($directory.'/'.$file,'fixture');}
$controller->update(new Illuminate\Http\Request(['published'=>false]),$new['id']);
foreach(['blog/','ar/blog/'] as $prefix){foreach(['index.html','index.html.br','index.html.gz'] as $file)check(!file_exists($isolatedPublic.'/ssg/'.$prefix.$new['slug'].'/'.$file),'Withdrawn static article removed immediately');}
try{$controller->show($new['slug']);throw new RuntimeException('Unpublished article remains publicly readable');}catch(Illuminate\Database\Eloquent\ModelNotFoundException $e){$assertions++;}
$controller->update(new Illuminate\Http\Request(['metaTitle'=>'English SEO', 'metaDesc'=>'English description', 'metaTitleAr'=>'عنوان عربي مستقل', 'metaDescAr'=>'وصف عربي مستقل']),$new['id']);
Illuminate\Support\Facades\Auth::guard('api')->setUser($users['admin']);
$metadata=$controller->index(new Illuminate\Http\Request(['all'=>'1']))->getData(true);
$stored=App\Models\BlogPost::find($new['id']);
check($stored->meta_title_ar==='عنوان عربي مستقل','Arabic SEO title persisted');
check($stored->meta_desc_ar==='وصف عربي مستقل','Arabic SEO description persisted');
check($stored->meta_title==='English SEO','English SEO remains independent');
check(collect($metadata)->firstWhere('id',$new['id'])['metaTitleAr']==='عنوان عربي مستقل','API returns Arabic SEO');
$controller->update(new Illuminate\Http\Request(['title'=>'Unrelated edit']),$new['id']);
check(App\Models\BlogPost::find($new['id'])->meta_title_ar==='عنوان عربي مستقل','Omitted Arabic metadata preserved');
$controller->update(new Illuminate\Http\Request(['metaTitleAr'=>null,'metaDescAr'=>null]),$new['id']);
check(App\Models\BlogPost::find($new['id'])->meta_title_ar===null,'Arabic metadata can be cleared');
check(App\Models\BlogPost::find($new['id'])->meta_title==='English SEO','Clearing Arabic never clears English');
echo json_encode(['result'=>'PASS' ,'assertions'=>$assertions,'lifecycle'=>'draft save -> publish -> unpublish','database'=>'SQLite memory only'])."\n";
}catch(Throwable $e){fwrite(STDERR,$e->getMessage()."\n");exit(1);}
