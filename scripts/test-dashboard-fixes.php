<?php
try {
// Production data is never accessed: models use an isolated SQLite database.
$live=getenv('DASHBOARD_TEST_APP') ?: dirname(__DIR__);
$source=getenv('DASHBOARD_TEST_SOURCE') ?: $live;
chdir($live);require 'vendor/autoload.php';
foreach(['app/Models/User.php','app/Models/BlogPost.php','app/Http/Controllers/Api/BlogController.php','app/Http/Controllers/Api/UserController.php','app/Http/Middleware/DashboardAccess.php','app/Providers/AppServiceProvider.php'] as $file)require_once $source.'/'.$file;
$app=require $live.'/bootstrap/app.php';$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
config(['database.default'=>'fix_memory','database.connections.fix_memory'=>['driver'=>'sqlite','database'=>':memory:','prefix'=>''],'cache.default'=>'array','session.driver'=>'array']);
$schema=Illuminate\Support\Facades\Schema::connection('fix_memory');
$schema->create('users',function($t){$t->id();foreach(['name','email','password','role','phone','company','source','notes'] as $field)$t->text($field)->nullable();$t->timestamps();});
$schema->create('blog_posts',function($t){$t->id();foreach((new App\Models\BlogPost)->getFillable() as $field)$t->text($field)->nullable();$t->timestamps();});
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
// Both login aliases share a limiter bucket. Invalid fixture attempts only.
Illuminate\Support\Facades\Auth::forgetGuards();
for($i=0;$i<6;$i++){
 $r=Illuminate\Http\Request::create($i%2?'/api/login':'/api/auth/login','POST',['email'=>'absent@example.invalid','password'=>'invalid'],[],[],['HTTP_ACCEPT'=>'application/json','REMOTE_ADDR'=>'192.0.2.10']);
 $app->instance('request',$r);
 try{$response=$router->dispatch($r);$status=$response->getStatusCode();}catch(Illuminate\Http\Exceptions\ThrottleRequestsException $e){$status=429;}
 check($status===($i===5?429:401),'Login aliases share attempt limit '.$i);
}
$reflection=new ReflectionProperty($app,'isRunningInConsole');$reflection->setValue($app,false);
(new App\Providers\AppServiceProvider($app))->boot();
foreach([App\Models\TrustStat::class,App\Models\ProcessStep::class,App\Models\District::class,App\Models\AdFormat::class,App\Models\BillboardFormat::class] as $model){
 check(count($app['events']->getListeners('eloquent.saved: '.$model))>0,$model.' refreshes static pages when saved');
 check(count($app['events']->getListeners('eloquent.deleted: '.$model))>0,$model.' refreshes static pages when deleted');
}
echo json_encode(['result'=>'PASS','assertions'=>$assertions,'database'=>'SQLite memory only'])."\n";
} catch (Throwable $error) {
    fwrite(STDERR, $error->getMessage()."\n");
    exit(1);
}
