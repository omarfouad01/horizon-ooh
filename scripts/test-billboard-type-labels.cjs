const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
const dictionary=require(path.join(root,'resources/react/i18n/publicArabic.json'));
const moduleResult={exports:{}};
vm.runInNewContext(ts.transpile(fs.readFileSync(path.join(root,'resources/react/i18n/publicArabic.ts'),'utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}),{module:moduleResult,exports:moduleResult.exports,require:()=>dictionary,URL});
const {arabicText}=moduleResult.exports;
const dir=path.join(root,'public/ssg');
const routes=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'))).routes.filter(r=>r.startsWith('/ar/')&&r.includes('/billboards/'));
assert(routes.length>0,'No generated Arabic billboard pages');
const types=new Map();
for(const route of routes){
 const html=fs.readFileSync(path.join(dir,route,'index.html'),'utf8');
 const state=JSON.parse(html.match(/<script id="horizon-ssg-state" type="application\/json">([\s\S]*?)<\/script>/)[1]);
 const product=state.locations.flatMap(l=>l.products||[]).find(p=>p.slug===route.split('/').pop());
 assert(product,route+' missing product');
 const clean=html.replace(/<!--[\s\S]*?-->/g,'').replace(/<script\b[\s\S]*?<\/script>/g,'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
 const labels=[...clean.matchAll(/النوع\s+(.+?)\s+الأوجه/g)].map(m=>m[1]);
 assert.equal(labels.length,2,route+' must include hero and specification type');
 const expected=arabicText(product.type||'[Not set]');
 assert(!/[A-Za-z]/.test(expected),'Untranslated type: '+product.type);
 assert.deepEqual(labels,[expected,expected],route+' type display differs');
 types.set(product.type,(types.get(product.type)||0)+1);
}
console.log(JSON.stringify({pages:routes.length,distinctRawTypes:types.size,heroAndSpecificationMismatches:0,types:[...types.keys()]}));
