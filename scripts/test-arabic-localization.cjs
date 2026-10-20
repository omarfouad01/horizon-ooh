const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=path.resolve(__dirname,'..'),dict=JSON.parse(fs.readFileSync(path.join(root,'resources/react/i18n/publicArabic.json')));
function checkNavigationImports(dir){for(const file of fs.readdirSync(dir,{withFileTypes:true})){const target=path.join(dir,file.name);if(file.isDirectory())checkNavigationImports(target);else if(/\.tsx$/.test(file.name)){const source=fs.readFileSync(target,'utf8');if(/\bpublicPath\(/.test(source))assert.match(source,/import\s*\{[^}]*\bpublicPath\b[^}]*\}\s*from\s*['"]@\/i18n\/publicArabic['"]/,target+' missing navigation helper import');}}}
checkNavigationImports(path.join(root,'resources/react'));
function compile(file,imports){const taskModule={exports:{}};vm.runInNewContext(ts.transpile(fs.readFileSync(path.join(root,file),'utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React,esModuleInterop:true}),{exports:taskModule.exports,module:taskModule,require:name=>imports[name],URL});return taskModule.exports;}
const text=compile('resources/react/i18n/publicArabic.ts',{'./publicArabic.json':dict});
let isArabic=true;
const {LocalizedText,LocalizedElement}=compile('resources/react/components/Localized.tsx',{'react':React,'@/i18n/LangContext':{useLang:()=>({isAr:isArabic})},'@/i18n/publicArabic':text});
assert.equal(text.arabicText('Cairo'),'القاهرة');
assert.equal(text.arabicText('Avg. Recall'),'متوسط تذكّر العلامة التجارية');
assert.equal(text.arabicText('6 x 16 m'),'6 × 16 م');
assert.equal(text.arabicText('H-14455'),'H-14455');
assert.equal(text.arabicText('info@horizonooh.com'),'info@horizonooh.com');
assert.equal(text.arabicHref('/contact?billboard=H-14455'),'/ar/contact?billboard=H-14455');
for(const href of ['/ar/contact','/admin','/api/settings','/storage/media/image.jpg','mailto:info@horizonooh.com','https://example.com/contact'])assert.equal(text.arabicHref(href),href);
assert.equal(text.arabicHtml('<a href="/locations/cairo">Cairo</a>'),'<a href="/locations/cairo">القاهرة</a>');
const input=renderToStaticMarkup(React.createElement(LocalizedElement,{as:'input',name:'city',value:'Cairo',readOnly:true,placeholder:'Search'}));
assert.match(input,/name="city"/);assert.match(input,/value="Cairo"/);assert.match(input,/placeholder="بحث"/);
const onChange=()=>{};
function InspectProps(props){assert.equal(props.value,'Cairo');assert.equal(props.onChange,onChange);assert.equal(props.to,'/ar/contact');return React.createElement('a',{href:props.to},typeof props.children==='function'?props.children({isActive:true}):props.children);}
const link=renderToStaticMarkup(React.createElement(LocalizedElement,{as:InspectProps,to:'/contact',value:'Cairo',onChange},()=>React.createElement(LocalizedText,null,'View Details')));
assert.match(link,/href="\/ar\/contact"/);assert(link.includes('عرض التفاصيل'));
const schema=JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:'Horizon OOH',url:'https://horizonooh.com'});
const json=renderToStaticMarkup(React.createElement(LocalizedElement,{as:'script',type:'application/ld+json',dangerouslySetInnerHTML:{__html:schema}}));
assert.equal(json,'<script type="application/ld+json">'+schema+'</script>');
isArabic=false;
assert.equal(renderToStaticMarkup(React.createElement(LocalizedText,null,'Cairo')),'Cairo');
const english=renderToStaticMarkup(React.createElement(LocalizedElement,{as:'a',href:'/contact',title:'View Details'},'View Details'));
assert.equal(english,'<a href="/contact" title="View Details">View Details</a>');
console.log('PASS: Arabic labels, raw form values/handlers, render functions, contact identifiers, language links, HTML attributes and structured-data keys; English output unchanged');
