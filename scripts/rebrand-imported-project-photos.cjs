const fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto');
const base=process.env.PROJECT_PHOTO_BRANDING_WORKSPACE;
if(!base)throw Error('Set PROJECT_PHOTO_BRANDING_WORKSPACE to a private staging directory containing inventory.json and the two supplied PNG logo files.');
const rows=JSON.parse(fs.readFileSync(base+'/inventory.json','utf8'));
const NAVY='#0e1b2b',RED='#d90429',WHITE='#ffffff';
const within=(n,a,b)=>n>=a&&n<=b;
function profile(n){
 if([90,103,104,105,106,107,158].includes(n))return 'unbranded';
 if(n<=2)return 'audio-badge';
 if(within(n,3,11)||within(n,19,29)||within(n,35,42))return 'white-frame';
 if(n===12)return 'transparent-br';
 if(n===18||n===34)return 'transparent-bl';
 if(within(n,13,17)||within(n,141,145))return 'small-sign-bl';
 if(n===30)return 'linkem-br-wide';if(n===31)return 'linkem-tr';if(n===32)return 'linkem-tr-night';if(n===33)return 'linkem-br-portrait';
 if(within(n,43,48)||within(n,147,152))return 'sign-br-large';
 if(within(n,49,56))return 'sign-br-small';
 if(within(n,57,83))return 'sign-br-middle';
 if(within(n,84,89)||within(n,91,102)||within(n,108,117)||within(n,153,157)||n===159)return 'sign-bl-portrait';
 if(n===118)return 'hp-cover';if(n===131)return 'sam-cover';
 if(within(n,119,130)||within(n,132,140))return 'gradient-frame';
 if(n===146)return 'fabex-cover';throw Error('Unclassified image '+n);
}
fs.mkdirSync(base+'/rendered',{recursive:true});fs.mkdirSync(base+'/prepared',{recursive:true});fs.mkdirSync(base+'/after-thumbs',{recursive:true});
function convert(args){return cp.execFileSync('convert',['-limit','thread','2',...args],{maxBuffer:1024*1024*8});}
const requested=(process.argv[2]||'').split(',').map(Number).filter(Boolean);
const ledger=[];
for(const p of rows){
 if(requested.length&&!requested.includes(p.index))continue;
 const type=profile(p.index),w=p.width,h=p.height,n=String(p.index).padStart(3,'0'),out=base+'/rendered/'+p.sha256+'.webp';
 if(type==='unbranded'){ledger.push({...p,profile:type,changed:false});continue;}
 const args=[p.file],masks=[],preserved=[];
 const rect=(r,color)=>{const [x,y,rw,rh]=r.map((v,i)=>Math.round(v*(i%2===0?w:h)));args.push('-fill',color,'-draw',`rectangle ${x},${y} ${x+rw-1},${y+rh-1}`);masks.push([x,y,rw,rh]);return[x,y,rw,rh];};
 const insert=(file,x,y,rw,rh)=>args.push('(',file,'-resize',`${Math.round(rw*w)}x${Math.round(rh*h)}`,')','-gravity','northwest','-geometry',`+${Math.round(x*w)}+${Math.round(y*h)}`,'-compose','Over','-composite');
 const badge=(r,dark=false)=>{const[x,y,rw,rh]=rect(r,dark?NAVY:WHITE);const f=base+(dark?'/horizon-light.png':'/horizon-dark.png');const maxW=Math.round(rw*.84),maxH=Math.round(rh*.80);args.push('(',f,'-resize',`${maxW}x${maxH}`,'-background','none','-gravity','center','-extent',`${rw}x${rh}`,')','-gravity','northwest','-geometry',`+${x}+${y}`,'-compose','Over','-composite');};
 const text=(s,x,y,size,color=WHITE,gravity='northwest')=>args.push('-gravity',gravity,'-font','AvantGarde-Book','-pointsize',String(Math.round(size*w)),'-fill',color,'-annotate',`+${Math.round(x*w)}+${Math.round(y*h)}`,s);
 const contact=(r)=>{rect(r,RED);const[x,y,rw,rh]=r;const size=Math.min(.022,rh*h/w*.64);text('horizonooh.com  |  +20 100 720 77 88',x+rw*.16,y+rh*.10,size);};
 const preserveRounded=(r,radius)=>{const[x,y,rw,rh]=r.map((v,i)=>Math.round(v*(i%2===0?w:h)));const crop=base+'/prepared/'+n+'-'+preserved.length+'.png';convert([p.file,'-crop',`${rw}x${rh}+${x}+${y}`,'+repage','(', '-size',`${rw}x${rh}`,'xc:none','-fill','white','-draw',`roundrectangle 0,0 ${rw-1},${rh-1} ${Math.round(radius*w)},${Math.round(radius*w)}`,')','-alpha','off','-compose','CopyOpacity','-composite',crop]);args.push('(',crop,')','-gravity','northwest','-geometry',`+${x}+${y}`,'-compose','Over','-composite');preserved.push({crop:[x,y,rw,rh],radius:Math.round(radius*w)});};
 if(type==='audio-badge')badge([0,.031,.310,.094]);
 if(type==='white-frame'){
  badge([.045,0,.210,.081]);
  rect([.079,.948,.843,.052],WHITE);insert(base+'/horizon-dark.png',.105,.952,.135,.045);
  text('horizonooh.com',.30,.958,.022,NAVY);text('+20 100 720 77 88',.60,.958,.022,NAVY);
 }
 if(type==='transparent-br')badge([.66,.85,.34,.15],true);
 if(type==='transparent-bl')badge([.015,.84,.36,.16],true);
 if(type==='small-sign-bl'){
  badge([.055,.825,.180,.083]);contact([.15,.936,.85,.036]);
 }
 if(type==='linkem-br-wide')badge([.781,.831,.219,.135]);
 if(type==='linkem-tr')badge([.74,.075,.26,.121]);
 if(type==='linkem-tr-night')badge([.706,.027,.294,.122]);
 if(type==='linkem-br-portrait')badge([.596,.875,.404,.093]);
 if(type==='sign-br-large'){
  badge([.777,.782,.202,.106]);contact([.027,.93,.844,.045]);
 }
 if(type==='sign-br-middle'){
  badge([.780,.790,.199,.109]);contact([.054,.940,.812,.042]);
 }
 if(type==='sign-br-small'){
  badge([.777,.814,.195,.087]);contact([.054,.932,.812,.034]);
 }
 if(type==='sign-bl-portrait'){
  badge([.056,.841,.186,.077]);contact([.161,.951,.771,.032]);
 }
 if(type==='gradient-frame'){
  badge([.020,.014,.205,.041]);
  rect([0,.884,1,.116],NAVY);insert(base+'/horizon-light.png',.035,.905,.235,.077);
  text('horizonooh.com',.51,.918,.025);text('+20 100 720 77 88',.51,.949,.022);
 }
 if(type==='fabex-cover')badge([.426,.035,.151,.099],true);
 if(type==='hp-cover'||type==='sam-cover'){
  // The source covers use the old agency symbol as a background pattern and large stand.
  // Rebuild that agency-only background, keeping advertiser artwork as original pixel crops.
  rect([0,0,1,1],NAVY);text('horizonooh.com',.025,.028,.025);text('OUTDOOR 2026',.40,.028,.025);text('+20 100 720 77 88',.765,.030,.021);
  if(type==='hp-cover'){
   preserveRounded([.136,.281,.720,.331],.080);
   insert(base+'/horizon-light.png',.235,.715,.530,.180);
  }else{
   preserveRounded([.185,.212,.296,.465],.065);preserveRounded([.519,.212,.296,.465],.065);
   insert(base+'/horizon-light.png',.27,.748,.46,.15);
  }
  // Retain the client's original white logo in the lower-right corner.
  const rr=type==='hp-cover'?[.872,.880,.100,.098]:[.82,.91,.16,.064];
  const[x,y,rw,rh]=rr.map((v,i)=>Math.round(v*(i%2===0?w:h)));
  const client=base+'/prepared/'+n+'-client.png';
  convert([p.file,'-crop',`${rw}x${rh}+${x}+${y}`,'+repage','-colorspace','Gray','-threshold','78%','-alpha','copy','-fill','white','-colorize','100',client]);
  args.push('(',client,')','-gravity','northwest','-geometry',`+${x}+${y}`,'-compose','Over','-composite');
 }
 args.push('-strip','-define','webp:lossless=true','-define','webp:method=1','-quality','100',out);
 if(!fs.existsSync(out)||process.env.PHOTO_REBRAND_FORCE==='1')convert(args);
 const dim=cp.execFileSync('identify',['-format','%w %h',out],{encoding:'utf8'}).trim();if(dim!==w+' '+h)throw Error('Dimensions changed '+p.index);
 const sha=crypto.createHash('sha256').update(fs.readFileSync(out)).digest('hex');
 ledger.push({...p,profile:type,changed:true,output:out,outputSha256:sha,outputBytes:fs.statSync(out).size,masks,preserved});
 convert([out,'-thumbnail','280x190','-background','#eeeeee','-gravity','center','-extent','280x220','-gravity','south','-fill','#111111','-font','AvantGarde-Book','-pointsize','11','-annotate','+0+4',n+' '+type,base+'/after-thumbs/'+n+'.png']);
 console.log('Prepared '+n+' '+type+' '+fs.statSync(out).size);
}
const ledgerFile=base+(requested.length?'/sample-ledger.json':'/render-ledger.json');fs.writeFileSync(ledgerFile,JSON.stringify(ledger,null,2));
if(!requested.length){for(let i=0;i<rows.length;i+=28){const files=rows.slice(i,i+28).map(p=>base+(profile(p.index)==='unbranded'?'/thumbs/':'/after-thumbs/')+String(p.index).padStart(3,'0')+'.png');cp.execFileSync('montage',[...files,'-tile','4x','-geometry','+4+4','-background','#bbbbbb',base+'/after-sheet-'+(Math.floor(i/28)+1)+'.jpg']);}}
console.log(JSON.stringify({prepared:ledger.filter(r=>r.changed).length,unbranded:ledger.filter(r=>!r.changed).length,bytes:ledger.reduce((n,r)=>n+(r.outputBytes||0),0),ledgerFile}));



