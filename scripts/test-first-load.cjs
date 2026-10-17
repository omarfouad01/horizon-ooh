const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}};
const flush=async()=>{for(let i=0;i<30;i++)await Promise.resolve()};
function setup(path, handlers={}, token=null){
 const calls=[];let state;const values={horizon_token:token,horizon_user:JSON.stringify({role:'admin'})};
 const apis=new Proxy({}, {get:(_,name)=>new Proxy({}, {get:(_,method)=>(...args)=>{const key=`${String(name)}.${String(method)}`;calls.push({key,args});return handlers[key]?.(...args)??Promise.resolve({data:[]})}})});
 const context={exports:{},console:{log(){},warn(){}},setTimeout,clearTimeout,window:{location:{hostname:'horizonooh.com',pathname:path}},document:{getElementById:()=>({})},localStorage:{getItem:k=>values[k]??null},require(name){if(name==='zustand')return{create:init=>{state=init(p=>{state={...state,...p}},()=>state);return{getState:()=>state}}};if(name==='@/api')return apis;if(name==='./publicCache')return{readPublicCache:()=>null,writePublicCache(){}};if(name==='@/data')return{LOCATIONS:[],SERVICES:[],PROJECTS:[],BLOG_POSTS:[],TRUST_STATS:[],PROCESS:[],CLIENT_BRANDS:[]};throw Error(name)}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('resources/react/store/apiStore.ts','utf8').replaceAll('import.meta.env','({})'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,context);
 return{...context.exports,calls,context,values};
}
(async()=>{
 const slow=deferred();const a=setup('/projects',{'projectsApi.all':()=>slow.promise,'settingsApi.all':()=>Promise.resolve({data:{tagline:'Live'}}),'settingsApi.aboutContent':()=>Promise.resolve({data:{heroTitle:'Real About'}})});
 const old=a.useApiStore.getState().reload();await flush();assert.equal(a.useApiStore.getState().settings.tagline,'Live','fast settings appear before slow projects');
 a.context.window.location.pathname='/about';await a.useApiStore.getState().reload();assert.equal(a.useApiStore.getState().about.heroTitle,'Real About');assert.equal(a.useApiStore.getState().loading,false,'new route does not wait for previous request');slow.resolve({data:[{id:9,title:'stale'}]});await old;assert.equal(a.useApiStore.getState().projects.length,0,'stale response discarded');
 const b=setup('/admin/blog',{'blogApi.all':()=>Promise.resolve({data:[{id:1,title:'Draft',published:false}]}),'settingsApi.all':()=>Promise.resolve({data:{tagline:'Real'}})},'test-token');const loading=b.useApiStore.getState().reload();await flush();assert.equal(b.useApiStore.getState().blogPosts.length,1,'public reads do not wait for auth');assert.ok(!b.calls.some(c=>c.key==='contactsApi.all'),'private requests gated');b.resolveTokenValidity(true);await loading;assert.ok(b.calls.some(c=>c.key==='contactsApi.all'));assert.ok(!b.calls.some(c=>c.key==='locationsApi.all'),'blog editor skips inventory');assert.equal(b.useApiStore.getState().readyPath,'/admin/blog');
 b.context.window.location.pathname='/admin/settings';await b.useApiStore.getState().reload();assert.equal(b.useApiStore.getState().readyPath,'/admin/settings');assert.ok(b.calls.some(c=>c.key==='clientBrandsApi.all'));
 const c=setup('/admin',{},'test-token');c.resolveTokenValidity(true);await c.useApiStore.getState().reload();assert.deepEqual(c.calls.find(c=>c.key==='locationsApi.all').args,[false,true],'dashboard uses compact inventory');
 const d=setup('/contact',{'settingsApi.all':()=>Promise.reject(new Error('offline'))});await d.useApiStore.getState().reload();assert.equal(d.useApiStore.getState().loading,false);assert.ok(d.useApiStore.getState().error,'read failure surfaces retry UI');
 // The gate can transition from public to authenticated on SPA navigation.
 const e=setup('/contact',{},'test-token');await e.useApiStore.getState().reload();e.resolveTokenValidity(true);e.context.window.location.pathname='/admin/contacts';await e.useApiStore.getState().reload();assert.ok(e.calls.some(c=>c.key==='contactsApi.all'));
 const module={exports:{},setTimeout:fn=>{fn();return 1}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('resources/react/api/readRetry.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,module);const retry=module.exports.readWithRetry;
 let n=0;assert.equal(await retry(async()=>{if(!n++)throw{response:{status:503}};return'OK'}),'OK');assert.equal(n,2);
 for(const status of [401,403,404,422]){n=0;await assert.rejects(retry(async()=>{n++;throw{response:{status}}}));assert.equal(n,1)}
 n=0;await assert.rejects(retry(async()=>{n++;throw new Error('network')}));assert.equal(n,2,'network retry bounded');
 n=0;await assert.rejects(retry(async()=>{n++;throw{response:{status:429,headers:{'retry-after':'60'}}}}));assert.equal(n,1,'respect long throttling delay');
 n=0;await assert.rejects(retry(async()=>{n++;throw{code:'ERR_CANCELED'}}));assert.equal(n,1);
 console.log('PASS: progressive data, immediate route navigation, stale response isolation, private auth gate, compact dashboard, route-scoped editors, failure recovery, bounded transient retries, no retry on validation/auth/cancel');
})().catch(e=>{console.error(e);process.exitCode=1});
