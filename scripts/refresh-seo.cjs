// Regenerate crawler HTML after CMS writes. Generate privately, publish each file atomically.
const fs = require('node:fs'), path = require('node:path'), {spawnSync, spawn} = require('node:child_process');
const root = path.resolve(__dirname, '..'), runtime = path.join(root, 'storage/app/seo-runtime');
const dirty = path.join(runtime, 'dirty'), lock = path.join(runtime, 'lock');
fs.mkdirSync(runtime, {recursive:true});
try { fs.mkdirSync(lock); } catch (e) {
  if (e.code !== 'EEXIST') throw e;
  try { const pid = Number(fs.readFileSync(path.join(lock, 'pid'), 'utf8')); process.kill(pid, 0); process.exit(0); }
  catch (err) { if (err.code !== 'ESRCH') process.exit(0); }
  fs.rmSync(lock, {recursive:true}); fs.mkdirSync(lock);
}
fs.writeFileSync(path.join(lock, 'pid'), String(process.pid));
let failed = false;
const safeRoute = route => route === '/' || /^\/(?:[A-Za-z0-9_-]+\/?)+$/.test(route);
try {
  while (fs.existsSync(dirty)) {
    fs.unlinkSync(dirty);
    const output = path.join(runtime, `build-${process.pid}`);
    try {
      const result = spawnSync(process.execPath, [path.join(root, 'scripts/generate-ssg.mjs')], {
        cwd:root, encoding:'utf8', maxBuffer:64*1024*1024, timeout:15*60*1000,
        env:{...process.env, SSG_API_BASE:'https://dev.horizonooh.com/api', SSG_OUTPUT_DIR:output, SSG_RUNTIME_DIR:runtime}
      });
      if (result.status !== 0) throw new Error(result.error?.message || result.stderr?.slice(-3000) || 'SEO generation failed');
      // A CMS save during rendering makes this snapshot stale; regenerate before publishing it.
      if (fs.existsSync(dirty)) continue;
      const manifest = JSON.parse(fs.readFileSync(path.join(output, 'manifest.json')));
      if (!manifest.routes?.length || !manifest.routes.every(safeRoute)) throw new Error('Invalid generated manifest');
      const live = path.join(root, 'public/ssg');
      const previous = fs.existsSync(path.join(live, 'manifest.json')) ? JSON.parse(fs.readFileSync(path.join(live,'manifest.json'))).routes : [];
      for (const route of manifest.routes) {
        const relative = route === '/' ? 'index.html' : `${route.slice(1)}/index.html`;
        const dest = path.join(live,relative); fs.mkdirSync(path.dirname(dest),{recursive:true});
        for (const suffix of ['.br', '.gz', '']) {
          fs.copyFileSync(path.join(output,relative)+suffix,dest+suffix+'.seo-tmp');
          fs.renameSync(dest+suffix+'.seo-tmp',dest+suffix);
        }
      }
      // Only files owned by the previous generated manifest can be removed.
      for (const route of previous) if (safeRoute(route) && !manifest.routes.includes(route)) {
        const dest = path.join(live,route.slice(1),'index.html');
        for (const suffix of ['', '.br', '.gz']) if (fs.existsSync(dest+suffix)) fs.unlinkSync(dest+suffix);
      }
      fs.copyFileSync(path.join(output,'manifest.json'),path.join(live,'manifest.json.seo-tmp'));
      fs.renameSync(path.join(live,'manifest.json.seo-tmp'),path.join(live,'manifest.json'));
      console.log(new Date().toISOString(), 'SEO refreshed:', manifest.routes.length, 'routes');
    } catch (e) { fs.writeFileSync(dirty,String(Date.now())); failed=true; throw e; }
    finally { fs.rmSync(output,{recursive:true,force:true}); }
  }
} finally {
  fs.rmSync(lock,{recursive:true,force:true});
  // Cover a CMS save arriving just as the previous worker releases its lock.
  if (!failed && fs.existsSync(dirty)) spawn(process.execPath,[__filename],{cwd:root,detached:true,stdio:'ignore'}).unref();
}
