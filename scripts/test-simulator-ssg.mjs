import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {gzipSync,gunzipSync,brotliDecompressSync} from 'node:zlib';
const stage='/home/horizon/deploy-backups/performance-20261019/stage';
const live='/home/horizon/public_html/horizonooh.com';
const old=JSON.parse(fs.readFileSync(live+'/public/ssg/manifest.json'));
const next=JSON.parse(fs.readFileSync(stage+'/public/ssg/manifest.json'));
assert(old.routes.every(r=>next.routes.includes(r)), 'Existing routes removed');
assert.equal(next.routes.length,old.routes.length+2);
for(const route of ['/design-simulator','/ar/design-simulator']){
 const file=stage+'/public/ssg'+route+'/index.html';
 const bytes=fs.readFileSync(file),html=bytes.toString();
 assert.match(html,/<h1\b/);assert.match(html,/data-horizon-seo/);
 assert.match(html,/<meta name="robots" content="noindex, follow"/);
 assert.match(html,new RegExp('rel="canonical" href="https://dev.horizonooh.com'+route+'"'));
 assert(!html.includes('horizon_site_token'));assert(!html.includes('horizon_site_user'));
 const data=JSON.parse(html.match(/<script id="horizon-ssg-state" type="application\/json">([\s\S]*?)<\/script>/)[1]);
 assert(data.loaded&&!data.usingDemo);assert.equal(data.simulatorTemplates.length,7);
 assert(!data.designUploads&&!data.users&&!data.customers&&!data.suppliers);
 assert(data.simulatorTemplates.every(t=>t.mockupUrl.startsWith('/storage/')&&t.panels.length));
 const current=JSON.parse(fs.readFileSync('/home/horizon/deploy-backups/performance-20261019/simulator-api-after.json'));
 for(const t of current){const saved=data.simulatorTemplates.find(v=>v.id===String(t.id));assert.deepEqual(saved.panels,t.panels);assert.equal(saved.mockupUrl,t.mockupUrl);}
 assert.deepEqual(gunzipSync(fs.readFileSync(file+'.gz')),bytes);
 assert.deepEqual(brotliDecompressSync(fs.readFileSync(file+'.br')),bytes);
 console.log(JSON.stringify({route,html:bytes.length,gzip:fs.statSync(file+'.gz').size,br:fs.statSync(file+'.br').size,templates:data.simulatorTemplates.length}));
}
console.log('PASS: EN/AR simulator first-paint HTML, no personal state, exact template coordinates/URLs, compression and existing route coverage');
