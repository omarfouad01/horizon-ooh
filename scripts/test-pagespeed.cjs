const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ts=require('typescript');
let token='',requests=0;
const instance={interceptors:{request:{use(){}},response:{use(){}}},get(_url,config){requests++;return Promise.resolve({data:{params:config?.params,request:requests}})}};
const sandbox={exports:{},console,setTimeout,clearTimeout,window:{location:{protocol:'https:',hostname:'horizonooh.com',port:''}},localStorage:{getItem(){return token;}},require(name){if(name==='axios')return {default:{create(){return instance;}}};throw Error(name);}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('resources/react/api/client.ts','utf8').replaceAll('import.meta.env','({})'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,sandbox);
(async()=>{
 const {cachedGet,clearApiCache}=sandbox.exports;
 await cachedGet('/locations',{params:{home:1}}); await cachedGet('/locations',{params:{full:1}}); await cachedGet('/locations');
 assert.equal(requests,3,'home, full and public inventories must have separate caches');
 await cachedGet('/locations',{params:{home:1}});assert.equal(requests,3);
 token='admin';await cachedGet('/locations',{params:{full:1}});assert.equal(requests,4,'auth scopes must not share cache');token='';
 clearApiCache('/locations');await cachedGet('/locations',{params:{home:1}});assert.equal(requests,5);
 await cachedGet('/sorted',{params:{b:2,a:1}});await cachedGet('/sorted',{params:{a:1,b:2}});assert.equal(requests,6);
 console.log('PASS: API cache query separation, auth separation, invalidation, normalized params');
 // Follow real static imports; dynamic routes must not contaminate the startup graph.
 const {parseAst}=require('rollup/parseAst');const path=require('node:path');
 const shell=fs.readFileSync('public/index.html','utf8');
 const entry=shell.match(/<script[^>]+src="([^"]+\.js)"/)[1];
 const seen=new Set();
 function walk(file){if(seen.has(file))return;seen.add(file);const ast=parseAst(fs.readFileSync(file,'utf8'));for(const node of ast.body){if(node.source&&typeof node.source.value==='string'&&node.source.value.startsWith('.'))walk(path.resolve(path.dirname(file),node.source.value));}}
 walk(path.resolve('public'+entry));
 const heavy=[...seen].filter(f=>/\/(?:admin|Admin|leaflet|framer-motion|charts)[^/]*\.js$/.test(f));
 assert.deepEqual(heavy,[],'Admin/map/animation code must remain outside startup graph');
 for(const route of ['','about/','services/','projects/','ar/about/']){
  const html=fs.readFileSync('public/ssg/'+route+'index.html','utf8');
  assert.equal(html.includes('<!--$!-->'),false,'Server Suspense boundary must finish: '+route);
  assert.ok(html.indexOf('id="horizon-ssg-state"') > html.indexOf('<div id="root">'), 'Hydration data must not block the first paint: '+route);
 }
 for(const f of ['public/ai-catalog.json','public/.well-known/ai-catalog.json','public/.well-known/ard.json'])assert.ok(Array.isArray(JSON.parse(fs.readFileSync(f)).entries));
 for(const file of ['public/ssg/index.html','public/ssg/ar/index.html']){
  const html=fs.readFileSync(file,'utf8');
  assert.ok(html.includes('data-horizon-critical-css'));
  assert.equal(/<link[^>]+rel="stylesheet"[^>]+index-[^"]+\.css/.test(html),false,'Homepage should not wait for its stylesheet');
 }
 console.log('PASS: startup graph excludes heavy routes, SSG has no unfinished Suspense, discovery JSON parses');
})().catch(e=>{console.error(e);process.exitCode=1;});
