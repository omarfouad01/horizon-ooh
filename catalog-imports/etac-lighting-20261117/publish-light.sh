set -euo pipefail
base=$HOME/deploy-backups/etac-lighting-20261117
root=$HOME/public_html/horizonooh.com
build=$HOME/deploy-backups/services-redesign-20261114-212848/build
cd "$base"
if [ ! -f applied.json ]; then php apply-light.php; fi
cd "$root"
php artisan optimize:clear > "$base/cache-clear.log"
cd "$build"
export ETAC_MANIFEST="$base/applied.json"
temp=scripts/.generate-etac-lighting-20261117.mjs
trap 'rm -f "$temp"' EXIT
python3 -c 'from pathlib import Path; p=Path("scripts/generate-ssg.mjs"); text=p.read_text(); old="const routes = getStaticPublicRoutes(snapshot);"; assert text.count(old)==1; new="""const importedRows = JSON.parse(readFileSync(process.env.ETAC_MANIFEST, "utf8")); const imported = new Set(importedRows.map(r => r.slug)); const regions = new Set(importedRows.map(r => "/locations/" + r.region));
const routes = getStaticPublicRoutes(snapshot).filter(route => {
  const canonical = route.replace(/^\/ar(?=\/|$)/, "") || "/";
  return canonical === "/locations" || regions.has(canonical) || (canonical.includes("/billboards/") && imported.has(canonical.split("/").pop()));
});"""; Path("scripts/.generate-etac-lighting-20261117.mjs").write_text(text.replace(old,new))'
SSG_API_BASE=https://horizonooh.com/api SSG_OUTPUT_DIR="$base/new-ssg" node "$temp" > "$base/ssg.log" 2>&1
node - "$root" "$base" <<'JS'
const fs=require('node:fs'), path=require('node:path');
const [root,base]=process.argv.slice(2);
const live=root+'/public/ssg';
const add=base+'/new-ssg';
const rows=JSON.parse(fs.readFileSync(base+'/applied.json'));
const manifest=JSON.parse(fs.readFileSync(live+'/manifest.json'));
const delta=JSON.parse(fs.readFileSync(add+'/manifest.json'));
const originals=base+'/previous-ssg';
const versions=['index.html','index.html.gz','index.html.br'];
for(const row of rows) for(const prefix of ['', '/ar']){
 const route=prefix+'/locations/'+row.region+'/billboards/'+row.slug;
 if(!delta.routes.includes(route))throw Error('Missing '+route);
 const html=fs.readFileSync(path.join(add,route,'index.html'),'utf8');
 for(const name of row.images)if(!html.includes(name))throw Error('Missing '+name+' in '+route);
}
for(const route of delta.routes){
 const dst=path.join(live,route), from=path.join(add,route), backup=path.join(originals,route);
 fs.mkdirSync(dst,{recursive:true});fs.mkdirSync(backup,{recursive:true});
 for(const name of versions){
  const src=path.join(from,name), target=path.join(dst,name);
  if(fs.existsSync(target))fs.copyFileSync(target,path.join(backup,name));
  fs.copyFileSync(src,target+'.etac');
  fs.renameSync(target+'.etac',target);
 }
}
fs.copyFileSync(live+'/manifest.json',originals+'/manifest.json');
manifest.routes=[...new Set(manifest.routes.concat(delta.routes))];
manifest.routeCount=manifest.routes.length;
fs.writeFileSync(live+'/manifest.json.etac',JSON.stringify(manifest,null,2)+'\n');
fs.renameSync(live+'/manifest.json.etac',live+'/manifest.json');
console.log(delta.routes.length+' refreshed static routes');
JS



