const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
let releaseProjects;
const slowProjects = new Promise(resolve => { releaseProjects = resolve; });
const requests = [];
const apis = new Proxy({}, {get(_target, name) {
  return new Proxy({}, {get(_api, method) { return () => {
    requests.push(`${String(name)}.${String(method)}`);
    if (name === 'projectsApi' && method === 'all') return slowProjects;
    if (name === 'settingsApi' && method === 'aboutContent') return Promise.resolve({data:{heroTitle:'Real About'}});
    if (name === 'settingsApi') return Promise.resolve({data:{contact_page_content: JSON.stringify({heroTitle:'Real Contact',heroSubtitle:'Saved dashboard copy'})}});
    return Promise.resolve({data:[]});
  }; }});
}});
const sandbox = {exports:{}, console:{log(){},warn(){}}, setTimeout, clearTimeout,
  window:{location:{hostname:'horizonooh.com',pathname:'/projects'}},
  localStorage:{getItem(){return null;}},
  require(name) {
    if (name === 'zustand') return require('zustand');
    if (name === '@/api') return apis;
    if (name === '@/data') return {LOCATIONS:[],SERVICES:[],PROJECTS:[],BLOG_POSTS:[],TRUST_STATS:[],PROCESS:[],CLIENT_BRANDS:[]};
    if (name === './publicCache') return {readPublicCache(){return null;},writePublicCache(){}};
    throw Error(name);
  },
};
const source=fs.readFileSync('resources/react/store/apiStore.ts','utf8').replaceAll('import.meta.env','({})');
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,sandbox);
(async()=>{
  const store=sandbox.exports.useApiStore;
  for(let i=0;i<5;i++) await Promise.resolve();
  assert.equal(store.getState().loading,true);
  sandbox.window.location.pathname='/contact';
  await store.getState().reload();
  releaseProjects({data:[]});
  for(let i=0;i<30;i++) await new Promise(resolve=>setImmediate(resolve));
  assert.equal(store.getState().contactContent.heroTitle,'Real Contact','Navigation during an active request must load Contact without a browser reload');
  assert.equal(store.getState().loading,false);
  assert.ok(requests.filter(r=>r==='settingsApi.all').length >= 2,'Contact must request settings after the pending route completes');
  console.log('PASS: navigating to Contact during a slow previous-page request loads saved CMS content without reloading');
})().catch(e=>{console.error(e);process.exitCode=1;});
