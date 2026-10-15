<?php
try {
$live=getenv('DASHBOARD_TEST_APP') ?: dirname(__DIR__);$stage=getenv('DASHBOARD_TEST_SOURCE') ?: $live;
chdir($live);require 'vendor/autoload.php';require $stage.'/app/Http/Controllers/Api/UserController.php';
$app=require 'bootstrap/app.php';$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
config(['database.default'=>'users_memory','database.connections.users_memory'=>['driver'=>'sqlite','database'=>':memory:','prefix'=>''],'cache.default'=>'array']);
Illuminate\Support\Facades\Schema::create('users',function($t){$t->id();foreach(['name','email','password','role','source','phone','company','notes'] as $f)$t->text($f)->nullable();$t->timestamps();});
$controller=new App\Http\Controllers\Api\UserController;$checks=0;
function ok($value,$message){global $checks;if(!$value)throw new RuntimeException($message);$checks++;}
$owner=App\Models\User::create(['name'=>'Owner fixture','email'=>'owner@example.invalid','role'=>'admin','source'=>'legacy']);
$visitor=App\Models\User::create(['name'=>'Visitor fixture','email'=>'visitor@example.invalid','role'=>'user','source'=>'dashboard']);
$dashboard=$controller->index(new Illuminate\Http\Request(['scope'=>'dashboard']))->getData(true);
ok(count($dashboard)===1 && $dashboard[0]['id']===$owner->id,'Legacy owner appears by role despite old source');
$website=$controller->index(new Illuminate\Http\Request(['scope'=>'website']))->getData(true);
ok(count($website)===1 && $website[0]['id']===$visitor->id,'Ordinary account retained in website list regardless source');
$response=$controller->store(new Illuminate\Http\Request(['name'=>'New fixture','email'=>'new@example.invalid','role'=>'viewer','password'=>'fixture-password-123','source'=>'dashboard']));
ok($response->getStatusCode()===201,'Create user succeeds');$created=$response->getData(true);
ok($created['role']==='viewer','Requested viewer role persists');
ok(Illuminate\Support\Facades\Hash::check('fixture-password-123',App\Models\User::find($created['id'])->password),'Password hashed correctly');
$controller->update(new Illuminate\Http\Request(['role'=>'editor','name'=>'Edited fixture']),$created['id']);
ok(App\Models\User::find($created['id'])->role==='editor','Role can change to editor');
ok(App\Models\User::find($created['id'])->name==='Edited fixture','Other edits persist');
try{$controller->store(new Illuminate\Http\Request(['name'=>'Duplicate fixture','email'=>'owner@example.invalid','role'=>'editor','password'=>'fixture-password-123']));throw new RuntimeException('Duplicate email accepted');}catch(Illuminate\Validation\ValidationException $e){ok(isset($e->errors()['email']),'Duplicate email has field-specific validation');}
$before=App\Models\User::count();
$controller->update(new Illuminate\Http\Request(['role'=>'user']),$created['id']);
ok(App\Models\User::count()===$before,'Revoking access does not delete account');
ok(App\Models\User::find($created['id'])->role==='user','Access can be revoked');
ok(count($controller->index(new Illuminate\Http\Request(['scope'=>'dashboard']))->getData(true))===1,'Revoked user leaves dashboard list');
ok($controller->update(new Illuminate\Http\Request(['role'=>'user']),$owner->id)->getStatusCode()===422,'Last admin cannot lose access');
ok($controller->destroy($owner->id)->getStatusCode()===422,'Last admin cannot be deleted');
echo json_encode(['result'=>'PASS','assertions'=>$checks,'database'=>'SQLite memory only'])."\n";
}catch(Throwable $e){fwrite(STDERR,$e->getMessage()."\n");exit(1);}
