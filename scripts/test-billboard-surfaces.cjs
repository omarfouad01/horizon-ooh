const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=path.resolve(__dirname,'..'),dict=require(path.join(root,'resources/react/i18n/publicArabic.json'));
function compile(source,imports,extra={}){const m={exports:{}};vm.runInNewContext(ts.transpile(source,{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React,esModuleInterop:true}),{module:m,exports:m.exports,require:name=>imports[name],URL,React,...extra});return m.exports;}
const text=compile(fs.readFileSync(path.join(root,'resources/react/i18n/publicArabic.ts'),'utf8'),{'./publicArabic.json':dict});
const filters=compile(fs.readFileSync(path.join(root,'resources/react/lib/billboardTypes.ts'),'utf8'),{});
const options=filters.billboardFilterOptions([{label:'Billboard'}],[{label:'T-Pole'},{label:'T Pole'},{label:'Uni-pole'},{label:'Unipole'},{label:'Mega'},{label:'Mega Post'},{label:'Mirror'},{label:'Gate'}]);
assert.equal(options.length,6,'Aliases must not duplicate filter choices');
for(const [value,type]of [['T-Pole','T Pole'],['Uni-pole','Unipole'],['Mega','Mega Post'],['Mirror','Mirro']])assert(filters.matchesBillboardFilter([value],{type,adFormat:'Billboard'}));
assert(filters.matchesBillboardFilter(['Billboard'],{type:'Gate',adFormat:'Billboard'}));
assert(filters.matchesBillboardFilter([],{type:'Mirror'}));
assert(!filters.matchesBillboardFilter(['Gate'],{type:'Mirror',adFormat:'Billboard'}));
assert(!filters.matchesBillboardFilter(['Gate'],{type:'Mirror',adFormat:null}));
assert(!filters.matchesBillboardFilter(['Gate'],{type:null,adFormat:null}));
assert.equal(filters.billboardFilterOptions([{label:'Transit Ads'}],[{label:'Transportation Ads'}]).length,1);
assert(filters.matchesBillboardFilter(['Transit Ads'],{type:'Transportation Ads'}));
assert.equal(options.find(x=>x==='T-Pole'),'T-Pole','Original filter value must remain exact');
const original={type:'T Pole',adFormat:'Billboard'};filters.matchesBillboardFilter(['T-Pole'],original);assert.deepEqual(original,{type:'T Pole',adFormat:'Billboard'});
let isArabic=true;
const localized=compile(fs.readFileSync(path.join(root,'resources/react/components/Localized.tsx'),'utf8'),{'react':React,'@/i18n/LangContext':{useLang:()=>({isAr:isArabic})},'@/i18n/publicArabic':text});
const source=fs.readFileSync(path.join(root,'resources/react/pages/DesignSimulator.tsx'),'utf8');
const ast=ts.createSourceFile('DesignSimulator.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const card=ast.statements.find(s=>ts.isFunctionDeclaration(s)&&s.name?.text==='FormatCard');assert(card,'Missing real simulator card component');
const FormatCard=compile('export '+card.getText(ast),{}, {...localized,Layers:()=>null,CheckCircle2:()=>null}).FormatCard;
for(const [typeName,expected]of [['Uni-pole','يوني بول'],['Unipole','يوني بول'],['Mega Post','ميجا بوست'],['Tringle','تراينجل'],['Double Decker','دابل ديكر'],['Gate','بوابه'],['Mirror','مرايه']]){
 const template={id:7,typeName,mockupUrl:'/images/test.webp',sizeLabel:'8 x 24',panels:[{},{}]};
 const before=JSON.stringify(template);let clicked=false;
 const node=FormatCard({t:template,selected:false,onClick:()=>{clicked=true;}});node.props.onClick();assert(clicked,'Selection callback lost');
 const html=renderToStaticMarkup(node);assert(html.includes(expected));assert(html.includes('alt="'+expected+'"'));assert(!html.includes('دابل ديكر')||typeName==='Double Decker','Two panels incorrectly renamed Double Decker');assert.equal(JSON.stringify(template),before);
 isArabic=false;const english=renderToStaticMarkup(React.createElement(FormatCard,{t:template,selected:false,onClick:()=>{}}));assert(english.includes(typeName));isArabic=true;
}
assert.equal(text.arabicText('Airport advertising'),'إعلانات المطارات');assert.equal(text.arabicText('Transit Ads'),'إعلانات وسائل النقل');
console.log('PASS: technical filter aliases, category filters, non-matching results, raw values, simulator labels/alt/selection and two-panel type identity');
