const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
const pending=new Map();const apis=new Proxy({}, {get(_t,name){return new Proxy({}, {get(_a,method){return ()=>new Promise(resolve=>pending.set(`${String(name)}.${String(method)}`,resolve));}});}});
const context={exports:{},console:{log(){},warn(){}},setTimeout,clearTimeout,document:{getElementById(){return {}; }},window:{location:{hostname:'horizonooh.com',pathname:'/'}},localStorage:{getItem(){return null;}},require(name){if(name==='zustand')return require('zustand');if(name==='@/api')return apis;if(name==='@/data')return {LOCATIONS:[],SERVICES:[],PROJECTS:[],BLOG_POSTS:[],TRUST_STATS:[],PROCESS:[],CLIENT_BRANDS:[]};if(name==='./publicCache')return {readPublicCache(){return null;},writePublicCache(){}};throw Error(name);}};
const source=fs.readFileSync('resources/react/store/apiStore.ts','utf8').replaceAll('import.meta.env','({})');vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,context);
(async()=>{
const store=context.exports.useApiStore;store.setState({loaded:true,readyPath:'/',settings:{name:'SSG content'},usingDemo:false});let contentUpdates=0;store.subscribe((next,previous)=>{if(next.settings!==previous.settings)contentUpdates++;});
const run=store.getState().reload();const settings=pending.get('settingsApi.all');assert(settings);pending.delete('settingsApi.all');settings({data:{name:'Live content'}});
for(let i=0;i<10;i++)await Promise.resolve();assert.equal(store.getState().settings.name,'SSG content','Keep the ready SSG document while collections refresh');assert.equal(contentUpdates,0);
for(const [key,resolve]of pending)resolve(key==='settingsApi.homeContent'?{data:{heroTitle:'Real title'}}:{data:[]});pending.clear();await run;
assert.equal(store.getState().settings.name,'Live content');assert.equal(store.getState().readyPath,'/');assert.equal(store.getState().loading,false);assert.equal(contentUpdates,1,'Publish a complete public refresh once');
console.log('PASS: ready SSG content remains visible; public API refresh publishes once, keeps fresh data and completes normally');
})().catch(e=>{console.error(e);process.exitCode=1});
