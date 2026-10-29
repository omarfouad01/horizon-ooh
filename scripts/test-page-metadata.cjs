const fs=require('fs'),assert=require('assert/strict');
const routes=JSON.parse(fs.readFileSync('public/ssg/manifest.json')).routes;
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#(?:39|x27);/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const rows=[];
function parse(html,route){
 const head=html.split('</head>')[0];
 const titles=[...head.matchAll(/<title>([\s\S]*?)<\/title>/g)];
 const desc=[...head.matchAll(/<meta name="description" content="([^"]*)"/g)];
 assert.equal(titles.length,1,route+' title count');assert.equal(desc.length,1,route+' description count');
 const title=decode(titles[0][1]),description=decode(desc[0][1]);assert.ok(title.trim()&&description.trim(),route+' nonempty');assert.doesNotMatch(title+' '+description,/\b(undefined|null)\b|\[object Object\]/i,route);
 for(const [key,expected]of[['og:title',title],['og:description',description],['twitter:title',title],['twitter:description',description]]){
  const match=head.match(new RegExp('<meta (?:name|property)="'+key+'" content="([^"]*)"'));assert.equal(decode(match?.[1]||''),expected,route+' '+key);
 }
 const canonical=head.match(/<link rel="canonical" href="([^"]*)"/)?.[1];assert.equal(canonical,'https://horizonooh.com'+(route==='/'?'':route),route+' canonical');
 if(route==='/ar'||route.startsWith('/ar/')){assert.match(title,/[\u0600-\u06ff]/,route+' Arabic title');assert.match(description,/[\u0600-\u06ff]/,route+' Arabic description');}
 return {route,title,description};
}
for(const route of routes) rows.push(parse(fs.readFileSync('public/ssg'+(route==='/'?'':route)+'/index.html','utf8'),route));
for(const key of ['title','description']){const seen=new Map();for(const row of rows){assert.ok(!seen.has(row[key]),key+' duplicate: '+row.route+' '+seen.get(row[key]));seen.set(row[key],row.route);}}
(async()=>{
 const sample=routes.filter(r=>/^\/(ar\/)?services\//.test(r)||['/','/ar','/about','/ar/about','/contact','/ar/contact','/projects','/ar/projects','/blog','/ar/blog','/locations','/ar/locations','/services','/ar/services','/privacy','/ar/privacy','/terms','/ar/terms'].includes(r));
 for(const prefix of ['/blog/','/projects/','/locations/']){const route=routes.find(r=>r.startsWith(prefix));if(route)sample.push(route,'/ar'+route);}
 const product=routes.find(r=>r.includes('/billboards/'));if(product)sample.push(product,'/ar'+product);
 for(let i=0;i<sample.length;i+=4)await Promise.all(sample.slice(i,i+4).map(async route=>{const response=await fetch('https://horizonooh.com'+route,{signal:AbortSignal.timeout(30000)});assert.equal(response.status,200,route);const live=parse(await response.text(),route);assert.deepEqual(live,rows.find(r=>r.route===route),route+' live/generated consistency');}));
 console.log(JSON.stringify({result:'PASS',generatedRoutes:rows.length,livePages:sample.length,duplicateTitles:0,duplicateDescriptions:0,invalidMetadata:0,arabicMetadataAndSelfCanonicals:'PASS',openGraphAndTwitter:'PASS',titlesOver110:rows.filter(r=>r.title.length>110).length}));
})().catch(e=>{console.error(e);process.exitCode=1});
