const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
let raw = null, blocked = false;
const sandbox = {
  exports: {}, Date, Set, Object, JSON, Number,
  window: { location: { pathname: '/projects' } },
  document: { getElementById: () => null },
  localStorage: {
    getItem: () => { if (blocked) throw Error('blocked'); return raw; },
    setItem: (_key, value) => { if (blocked) throw Error('quota'); raw = value; },
  },
};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('resources/react/store/publicCache.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, sandbox);
const { readPublicCache: read, writePublicCache: write } = sandbox.exports;
assert.equal(read(), null);
write({settings: {headerLogoUrl: '/logo.png'}, projects: [{id:1}], contacts: [{email:'private'}], suppliers: [1], token: 'secret'});
assert.equal(read().settings.headerLogoUrl, '/logo.png');
assert.equal(read().projects.length, 1);
assert.equal(raw.includes('private'), false);
assert.equal(raw.includes('secret'), false);
const saved = raw;
sandbox.window.location.pathname = '/admin';
assert.equal(read(), null);
write({settings: {headerLogoUrl: '/admin.png'}});
assert.equal(raw, saved);
sandbox.window.location.pathname = '/';
sandbox.document.getElementById = () => ({});
assert.equal(read(), null);
sandbox.document.getElementById = () => null;
raw = JSON.stringify({...JSON.parse(saved), savedAt: Date.now()-8*86400000});
assert.equal(read(), null);
raw = '{invalid'; assert.equal(read(), null);
blocked = true; assert.equal(read(), null); write({settings: {}});
blocked = false; raw = saved;
write({settings: {huge: 'a'.repeat(3*1024*1024)}});
assert.equal(raw, saved);
write({settings: {}, projects: []});
assert.equal(read().projects.length, 0);
console.log('PASS: cache restore, public allowlist, admin exclusion, SSG hydration, expiry, corruption, quota, size limit, empty collections');
