const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
let release,reads=0;
const source=fs.readFileSync('resources/react/store/publicNavigation.ts','utf8');
const html='<script id="horizon-ssg-state" type="application/json">'+JSON.stringify({loaded:true,usingDemo:false,settings:{name:'Horizon'},about:{heroTitle:'Real About'},suppliers:[{secret:true}],blogPosts:[{id:1,published:true},{id:2,published:false}]})+'</script>';
const context={exports:{},setTimeout,clearTimeout,AbortController,fetch:async()=>{reads++;return new Promise(resolve=>release=()=>resolve({ok:true,redirected:false,text:async()=>html}))}};
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
const nav=context.exports;
(async()=>{
for(const path of ['/','/ar','/about','/ar/contact','/locations','/blog'])assert(nav.isSnapshotRoute(path));
for(const path of ['/admin','/ar/admin','/login','//evil.com','/blog/unpublished','/about/other'])assert(!nav.isSnapshotRoute(path));
const parsed=nav.parsePublicSnapshot(html);assert.equal(parsed.about.heroTitle,'Real About');assert(!('suppliers' in parsed));assert.equal(parsed.blogPosts.length,1);
assert.equal(nav.parsePublicSnapshot(html.replace('"usingDemo":false','"usingDemo":true')),null);
assert.equal(nav.parsePublicSnapshot('<script id="horizon-ssg-state">broken</script>'),null);
const first=nav.loadPublicSnapshot('/about'),second=nav.loadPublicSnapshot('/about');assert.equal(reads,1);release();await Promise.all([first,second]);
assert.equal(nav.cachedPublicSnapshot('/about').about.heroTitle,'Real About');await nav.loadPublicSnapshot('/about');assert.equal(reads,1,'cached navigation needs no network');
await nav.loadPublicSnapshot('/admin');assert.equal(reads,1,'private routes never fetched');
console.log('PASS: main-page SSG navigation, real snapshot, draft/private-field exclusion, deduplication and instant revisit cache');
})().catch(e=>{console.error(e);process.exitCode=1});
