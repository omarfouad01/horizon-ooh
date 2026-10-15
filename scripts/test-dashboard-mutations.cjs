const fs=require('fs'),vm=require('vm'),assert=require('assert'),ts=require('typescript');
const source=fs.readFileSync('resources/react/store/dataStore.ts','utf8').replace('import.meta.env.VITE_API_URL','undefined');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
let state={settings:{companyName:'Original'},homeContent:{title:'Original'},about:{title:'Original'},aboutContent:{title:'Original'},locationsContent:{title:'Original'},contactContent:{title:'Original'},projectsContent:{title:'Original'}};
let fail=true,calls=0,reloads=0,clears=0;
state.reload=async()=>{reloads++};
const useApiStore={getState:()=>state,setState:change=>{state={...state,...(typeof change==='function'?change(state):change)}}};
const update=async()=>{calls++;if(fail)throw Error('Fixture save rejected');return {data:{ok:true}}};
const api=new Proxy({settingsApi:{update,updateHomeContent:update,updateAboutContent:update}},{get:(target,key)=>target[key]||{}});
const context={module:{exports:{}},exports:{},console:{error(){}},setTimeout(){},window:{location:{hostname:'horizonooh.com'}},localStorage:{getItem(){return null}},require:name=>name==='./apiStore'?{useApiStore,HAS_API:true}:name==='@/api'?api:name==='@/api/client'?{clearApiCache(){clears++}}:{},FormData:class{}};
vm.runInNewContext(code,context);const stores=context.exports;
(async()=>{
 for(const name of ['settingsStore','homeStore','locationsContentStore','contactContentStore','projectsContentStore','aboutStore']){
  const before=JSON.stringify(state);await assert.rejects(stores[name].update({title:'Rejected'}),/Fixture save rejected/);
  assert.equal(JSON.stringify(state),before,`${name} must preserve existing data after failure`);
 }
 assert.equal(reloads,0);assert.equal(clears,0);
 fail=false;
 for(const name of ['settingsStore','homeStore','locationsContentStore','contactContentStore','projectsContentStore','aboutStore'])await stores[name].update({title:'Accepted'});
 assert.equal(reloads,6);assert.equal(clears,6);assert.equal(calls,12);
 console.log('PASS: six CMS stores preserve data on rejected saves and await successful writes before cache refresh.');
})().catch(error=>{console.error(error);process.exit(1)});
