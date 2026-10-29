const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert/strict');
const root = process.cwd();
const ts = require('typescript');
const modules = new Map();
function load(file) {
  if (modules.has(file)) return modules.get(file).exports;
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const module = {exports:{}}; modules.set(file,module);
  const requireSource = name => {
    let target = name.startsWith('@/') ? path.join(root,'resources/react',name.slice(2)) : path.resolve(path.dirname(file),name);
    if (!path.extname(target)) target += '.ts';
    return load(target);
  };
  const js = ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
  vm.runInNewContext('(function(require,module,exports){'+js+'\n})',{console})(requireSource,module,module.exports);
  return module.exports;
}
const {metadata} = load(path.join(root,'resources/react/lib/seo.ts'));
const {serviceMetadata} = load(path.join(root,'resources/react/lib/serviceMetadata.ts'));
(async()=>{
 const services=await(await fetch('https://horizonooh.com/api/services')).json();
 const titles=new Set(), descriptions=new Set();
 for(const service of services){
  // The actual API shape has name, not title: this must work after hydration.
  assert.ok(service.name); const result=serviceMetadata(service);
  for(const ar of [false,true]){
   const seo=metadata((ar?'/ar':'')+'/services/'+service.slug,ar,result);
   assert.ok(seo.title && seo.description);assert.doesNotMatch(seo.title+' '+seo.description,/undefined|null|\[object Object\]/i);
   assert.ok(!titles.has(seo.title));assert.ok(!descriptions.has(seo.description));titles.add(seo.title);descriptions.add(seo.description);
   if(ar){assert.match(seo.title,/[\u0600-\u06ff]/);assert.match(seo.description,/[\u0600-\u06ff]/);}
  }
 }
 for(const value of [undefined,null,'','undefined in Egypt | HORIZON OOH','[object Object]']){
  const seo=metadata('/services',false,{title:value,description:value});assert.doesNotMatch(seo.title+' '+seo.description,/undefined|null|\[object Object\]/i);
 }
 const custom=metadata('/blog/example',false,{title:'Custom editorial title',description:'Custom editorial description'});assert.equal(custom.title,'Custom editorial title');assert.equal(custom.description,'Custom editorial description');
 console.log(JSON.stringify({result:'PASS',serviceLocales:titles.size,invalidInputFallbacks:5,editorialOverrides:'preserved'}));
})().catch(e=>{console.error(e);process.exitCode=1});

