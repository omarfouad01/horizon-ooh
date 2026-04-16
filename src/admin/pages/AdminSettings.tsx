import { useState } from 'react'
import { useStore, settingsStore, trustStatStore, brandStore, processStore, resultStore, resetToDefaults } from '@/store/dataStore'
import { Btn, PageHeader, Field, TA, ArrayEditor } from '../ui'
import { Save, Plus, Trash2, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const s = useStore()
  const [tab, setTab] = useState<'general'|'stats'|'brands'|'process'|'results'>('general')
  const [settings, setSettings] = useState({ ...s.settings })
  const [stats,    setStats]    = useState([...s.trustStats])
  const [brands,   setBrands]   = useState([...s.clientBrands])
  const [proc,     setProc]     = useState([...s.process])
  const [results,  setResults]  = useState([...s.results])

  const TABS = ['general','stats','brands','process','results'] as const

  const saveGeneral = () => { settingsStore.update(settings); toast.success('Settings saved') }
  const saveStats   = () => { stats.forEach(s => trustStatStore.update(s.id, s)); toast.success('Stats saved') }
  const saveBrands  = () => { brandStore.set(brands); toast.success('Brands saved') }
  const saveProc    = () => { proc.forEach(p => processStore.update(p.id, p)); toast.success('Process saved') }
  const saveResults = () => { resultStore.set(results); toast.success('Results saved') }

  const reset = () => { if(confirm('Reset ALL content to factory defaults?')) { resetToDefaults(); toast.success('Reset complete'); window.location.reload() } }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader title="Settings" subtitle="Site-wide configuration"
        action={<Btn variant="ghost" size="sm" onClick={reset}><RotateCcw size={13}/>Reset to Defaults</Btn>}/>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-2xl w-fit">
        {TABS.map(t=><button key={t} onClick={()=>setTab(t)}
          className="px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all"
          style={tab===t?{background:'white',color:'#0B0F1A',boxShadow:'0 1px 3px rgba(11,15,26,0.1)'}:{color:'rgba(11,15,26,0.4)'}}>
          {t}
        </button>)}
      </div>

      {/* General */}
      {tab==='general'&&<div className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company Name" value={settings.companyName} onChange={(e:any)=>setSettings(p=>({...p,companyName:e.target.value}))}/>
            <Field label="Tagline"      value={settings.tagline}     onChange={(e:any)=>setSettings(p=>({...p,tagline:e.target.value}))}/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email"   value={settings.email}   onChange={(e:any)=>setSettings(p=>({...p,email:e.target.value}))}/>
            <Field label="Phone"   value={settings.phone}   onChange={(e:any)=>setSettings(p=>({...p,phone:e.target.value}))}/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Address"  value={settings.address}  onChange={(e:any)=>setSettings(p=>({...p,address:e.target.value}))}/>
            <Field label="WhatsApp" value={settings.whatsapp} onChange={(e:any)=>setSettings(p=>({...p,whatsapp:e.target.value}))}/>
          </div>
          <TA label="Meta Description" value={settings.metaDescription} onChange={(e:any)=>setSettings(p=>({...p,metaDescription:e.target.value}))} rows={2}/>
        </div>
        <Btn onClick={saveGeneral}><Save size={14}/>Save Settings</Btn>
      </div>}

      {/* Trust Stats */}
      {tab==='stats'&&<div className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="space-y-3 mb-4">
            {stats.map((st,i)=>(
              <div key={st.id} className="flex gap-3 items-center">
                <Field placeholder="Value" value={st.value} onChange={(e:any)=>setStats(s=>s.map((x,j)=>j===i?{...x,value:e.target.value}:x))} className="flex-1"/>
                <Field placeholder="Label" value={st.label} onChange={(e:any)=>setStats(s=>s.map((x,j)=>j===i?{...x,label:e.target.value}:x))} className="flex-1"/>
                <button onClick={()=>{ trustStatStore.remove(st.id); setStats(s=>s.filter((_,j)=>j!==i)) }} className="text-red-400 hover:text-red-600 p-1.5"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
          <Btn variant="ghost" size="sm" onClick={()=>{const n={id:Date.now().toString(),value:'',label:''};trustStatStore.add(n);setStats(s=>[...s,n])}}><Plus size={12}/>Add Stat</Btn>
        </div>
        <Btn onClick={saveStats}><Save size={14}/>Save Stats</Btn>
      </div>}

      {/* Client Brands */}
      {tab==='brands'&&<div className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <ArrayEditor label="Client Brands" value={brands} onChange={setBrands} placeholder="Add brand name…"/>
        </div>
        <Btn onClick={saveBrands}><Save size={14}/>Save Brands</Btn>
      </div>}

      {/* Process Steps */}
      {tab==='process'&&<div className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="space-y-3 mb-4">
            {proc.map((p,i)=>(
              <div key={p.id} className="grid grid-cols-4 gap-3 items-center">
                <Field placeholder="01"    value={p.step}        onChange={(e:any)=>setProc(s=>s.map((x,j)=>j===i?{...x,step:e.target.value}:x))}/>
                <Field placeholder="Label" value={p.label}       onChange={(e:any)=>setProc(s=>s.map((x,j)=>j===i?{...x,label:e.target.value}:x))}/>
                <div className="col-span-2 flex gap-2">
                  <Field placeholder="Description" value={p.description} onChange={(e:any)=>setProc(s=>s.map((x,j)=>j===i?{...x,description:e.target.value}:x))} className="flex-1"/>
                  <button onClick={()=>{ processStore.remove(p.id); setProc(s=>s.filter((_,j)=>j!==i)) }} className="text-red-400 hover:text-red-600 p-1.5"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
          <Btn variant="ghost" size="sm" onClick={()=>{ const n={id:Date.now().toString(),step:`0${proc.length+1}`,label:'',description:''}; processStore.add(n); setProc(s=>[...s,n]) }}><Plus size={12}/>Add Step</Btn>
        </div>
        <Btn onClick={saveProc}><Save size={14}/>Save Process</Btn>
      </div>}

      {/* Results */}
      {tab==='results'&&<div className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="space-y-3">
            {results.map((r,i)=>(
              <div key={i} className="grid grid-cols-3 gap-3">
                <Field placeholder="Value e.g. 2.7×" value={r.value}    onChange={(e:any)=>setResults(s=>s.map((x,j)=>j===i?{...x,value:e.target.value}:x))}/>
                <Field placeholder="Label"            value={r.label}    onChange={(e:any)=>setResults(s=>s.map((x,j)=>j===i?{...x,label:e.target.value}:x))}/>
                <Field placeholder="Sub-label"        value={r.sublabel} onChange={(e:any)=>setResults(s=>s.map((x,j)=>j===i?{...x,sublabel:e.target.value}:x))}/>
              </div>
            ))}
          </div>
        </div>
        <Btn onClick={saveResults}><Save size={14}/>Save Results</Btn>
      </div>}
    </div>
  )
}
