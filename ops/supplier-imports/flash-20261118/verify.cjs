const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = 'work/flash';
const rows = JSON.parse(fs.readFileSync(path.join(root, 'applied.json')));
const offers = new Map(JSON.parse(fs.readFileSync(path.join(root, 'offers.json'))).map(row => [row.ref,row]));
const origin = process.env.WATAR_SITE_ORIGIN || 'https://horizonooh.com';
async function request(route){
 for(let attempt=0;attempt<3;attempt++){
  try {
   const r=await fetch(origin+route,{signal:AbortSignal.timeout(12000),headers:{'Cache-Control':'no-cache'}});
   assert.equal(r.status,200,route);
   return r;
  } catch(error) { if(attempt===2)throw error; }
 }
}
const result = [];
let cursor=0;
const workers=Array.from({length:10},async()=>{
 while(cursor<rows.length){
  const row=rows[cursor++];
  const source=offers.get(row.ref);
  try {
   const page = '/locations/'+row.region+'/billboards/'+row.slug;
   const [entry, en, ar] = await Promise.all([
    request('/api/billboards/'+row.slug).then(r=>r.json()),
    request(page).then(r=>r.text()),
    request('/ar'+page).then(r=>r.text())
   ]);
   assert.equal(entry.code,row.code);
   assert.equal(+entry.supplierId,row.supplierId);
   assert.ok(+entry.lat && +entry.lng,'valid map pin');
   if(source.adjust){assert.ok(Math.abs(+entry.lat-source.lat)<0.000002);assert.ok(Math.abs(+entry.lng-source.lng)<0.000002);}
   if(!row.updated){
    assert.equal(entry.availability,'available');
    assert.equal(entry.price,null); assert.equal(entry.brightness,source.brightness); assert.equal(+entry.sides,source.sides); assert.equal(entry.size,source.size);
    assert.equal(+entry.quantity,source.quantity);
    assert.ok(Math.abs(+entry.lat-source.lat)<0.000002);
    assert.ok(Math.abs(+entry.lng-source.lng)<0.000002);
   }
   for(const name of row.images){
    assert.ok(en.includes(name)&&ar.includes(name),'image absent from both localized pages: '+name);
    const response=await request('/images/'+name);
    assert.match(response.headers.get('content-type'),/^image\//);
    await response.body.cancel();
   }
   result.push({code:row.code,ok:true});
  }catch(error){result.push({code:row.code,ok:false,error:String(error)});}
 }
});
Promise.all(workers).then(()=>{
 const failures=result.filter(item=>!item.ok);
 console.log(JSON.stringify({total:rows.length,passed:rows.length-failures.length,photos:rows.reduce((n,r)=>n+r.images.length,0),failures},null,2));
 if(failures.length)process.exitCode=1;
});



