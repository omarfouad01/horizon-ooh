const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
const source=fs.readFileSync('resources/react/store/apiStore.ts','utf8');
const part=source.slice(source.indexOf('function toSlug('),source.indexOf('function normLoc('));
const context={exports:{}};vm.runInNewContext(ts.transpileModule(part,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
const normalize=context.exports.normProduct;
const detail={id:13337,slug:'t-pole-college-of-art-al-mansoura',title:'T-POLE - COLLEGE OF ART - AL MANSOURA',nameAr:'تى بول - كلية الفنون - المنصورة',citySlug:'dakahlia',format:'billboard',images:[{url:'/test.webp',alt:'Saved cover'}],lat:'31.0393856',lng:'31.3537235'};
const p=normalize(detail,0);assert.equal(p.nameEn,detail.title);assert.equal(p.name,detail.title);assert.equal(p.nameAr,detail.nameAr);assert.equal(p.citySlug,'dakahlia');assert.equal(p.images[0].alt,'Saved cover');assert.equal(p.lat,31.0393856);
const existing=normalize({...detail,nameEn:'Saved English',images:['/existing.webp']},0);assert.equal(existing.nameEn,'Saved English');assert.equal(existing.images[0].url,'/existing.webp');
console.log('PASS: detail API title, Arabic name, image fields, coordinates and normalized response compatibility');
