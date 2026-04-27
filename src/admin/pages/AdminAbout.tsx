
import { useState } from 'react'
import { useStore, aboutStore, trustStatStore, type AboutContent, type WhyChooseItem, type AboutStat } from '@/store/dataStore'
import { Btn, Field, TA, PageHeader } from '../ui'
import { Save, Plus, Trash2, Pencil, X, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'

// ── Inline small Modal ────────────────────────────────────────────────────────
function InlineModal({ open, title, onClose, children }: { open:boolean;title:string;onClose:()=>void;children:React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(11,15,26,0.55)'}}>
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"><X size={16}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Section card wrapper ──────────────────────────────────────────────────────
function Card({ title, children, action }: { title:string; children:React.ReactNode; action?:React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6" style={{boxShadow:'0 1px 4px rgba(11,15,26,0.06)'}}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-[13px] font-bold text-gray-700 tracking-[0.04em] uppercase">{title}</h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id:'hero',    label:'Hero & Intro'    },
  { id:'body',    label:'About Copy'      },
  { id:'why',     label:'Why Choose'      },
  { id:'stats',   label:'Key Numbers'     },
  { id:'brands',  label:'Client Brands'   },
  { id:'trust',   label:'Trust Stats'     },
] as const
type Tab = typeof TABS[number]['id']

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminAbout() {
  const store = useStore()
  const about = store.about

  const [tab,   setTab]   = useState<Tab>('hero')
  const [saved, setSaved] = useState(false)

  // Drafts — each section manages its own local state, flushed on save
  const [draft, setDraft] = useState<Partial<AboutContent>>({})
  const merged: AboutContent = { ...about, ...draft }

  function patch(p: Partial<AboutContent>) { setDraft(d => ({...d,...p})) }

  function save() {
    aboutStore.update(merged)
    setDraft({})
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // ── Why Choose modals
  const [whyModal, setWhyModal] = useState<{ open:boolean; item:WhyChooseItem|null }>({ open:false, item:null })
  const [whyForm,  setWhyForm]  = useState({ num:'', title:'', desc:'' })
  function openAddWhy()  { setWhyForm({num:String(((merged.whyItems||[]).length+1)).padStart(2,'0'),title:'',desc:''}); setWhyModal({open:true,item:null}) }
  function openEditWhy(w:WhyChooseItem){ setWhyForm({num:w.num,title:w.title,desc:w.desc}); setWhyModal({open:true,item:w}) }
  function saveWhy() {
    if (whyModal.item) {
      patch({ whyItems: (merged.whyItems||[]).map(x => x.id===whyModal.item!.id ? {...x,...whyForm} : x) })
    } else {
      patch({ whyItems: [...(merged.whyItems||[]), { id:String(Date.now()), ...whyForm }] })
    }
    setWhyModal({open:false,item:null})
  }
  function removeWhy(id:string) { patch({ whyItems: (merged.whyItems||[]).filter(x=>x.id!==id) }) }

  // ── Key Stats modals
  const [statModal, setStatModal] = useState<{ open:boolean; item:AboutStat|null }>({ open:false, item:null })
  const [statForm,  setStatForm]  = useState({ value:'', label:'', sub:'' })
  function openAddStat()  { setStatForm({value:'',label:'',sub:''}); setStatModal({open:true,item:null}) }
  function openEditStat(s:AboutStat){ setStatForm({value:s.value,label:s.label,sub:s.sub}); setStatModal({open:true,item:s}) }
  function saveStat() {
    if (statModal.item) {
      patch({ keyStats: (merged.keyStats||[]).map(x => x.id===statModal.item!.id ? {...x,...statForm} : x) })
    } else {
      patch({ keyStats: [...(merged.keyStats||[]), { id:String(Date.now()), ...statForm }] })
    }
    setStatModal({open:false,item:null})
  }
  function removeStat(id:string) { patch({ keyStats: (merged.keyStats||[]).filter(x=>x.id!==id) }) }

  // ── Trust Stats (direct store)
  const [tsModal, setTsModal] = useState<{ open:boolean; item:any }>({ open:false, item:null })
  const [tsForm,  setTsForm]  = useState({ value:'', label:'' })
  function openAddTs()   { setTsForm({value:'',label:''}); setTsModal({open:true,item:null}) }
  function openEditTs(s:any){ setTsForm({value:s.value,label:s.label}); setTsModal({open:true,item:s}) }
  function saveTs() {
    if (tsModal.item) trustStatStore.update(tsModal.item.id, tsForm)
    else              trustStatStore.add(tsForm)
    setTsModal({open:false,item:null})
  }

  // ── Brands


  // ── Dark paragraphs helpers
  function setPara(i:number, v:string) {
    const arr = [...merged.darkParagraphs]
    arr[i] = v
    patch({ darkParagraphs: arr })
  }
  function addPara()    { patch({ darkParagraphs: [...merged.darkParagraphs, ''] }) }
  function removePara(i:number) { patch({ darkParagraphs: merged.darkParagraphs.filter((_,j)=>j!==i) }) }

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <PageHeader
        title="About Us"
        subtitle="Control every text section on the About page"
        action={
          <Btn onClick={save} className="flex items-center gap-2">
            <Save size={14}/>
            {saved ? '✓ Saved!' : 'Save All Changes'}
          </Btn>
        }
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold transition-all"
            style={tab===t.id ? {background:'white',color:'#0B0F1A',boxShadow:'0 1px 3px rgba(11,15,26,0.1)'} : {color:'rgba(11,15,26,0.45)'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── HERO & INTRO ───────────────────────────────────────── */}
      {tab==='hero' && (
        <>
          <Card title="Hero Banner">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Eyebrow Text"  value={merged.heroEyebrow}  onChange={e=>patch({heroEyebrow:e.target.value})}  placeholder="Our Story"/>
              <Field label="Headline"      value={merged.heroTitle}    onChange={e=>patch({heroTitle:e.target.value})}    placeholder="About Horizon OOH."/>
              <Field label="Accent (italic)"value={merged.heroAccent}  onChange={e=>patch({heroAccent:e.target.value})}  placeholder="We control visibility."/>
            </div>
          </Card>

          <Card title="Intro Section — Two Columns">
            <div className="space-y-4">
              <Field label="Left — Big Headline" value={merged.introHeadline} onChange={e=>patch({introHeadline:e.target.value})}/>
              <TA    label="Right — Paragraph 1" value={merged.introParagraph1} onChange={e=>patch({introParagraph1:e.target.value})} rows={4}/>
              <TA    label="Right — Paragraph 2" value={merged.introParagraph2} onChange={e=>patch({introParagraph2:e.target.value})} rows={4}/>
            </div>
          </Card>

          <Card title="SEO Expertise Section">
            <div className="space-y-4">
              <Field label="Section Heading" value={merged.seoHeading}   onChange={e=>patch({seoHeading:e.target.value})}/>
              <TA    label="Right Paragraph" value={merged.seoParagraph} onChange={e=>patch({seoParagraph:e.target.value})} rows={5}/>
            </div>
          </Card>
        </>
      )}

      {/* ── ABOUT COPY (navy section) ─────────────────────────── */}
      {tab==='body' && (
        <Card title="Full About — Navy Section" action={<Btn onClick={addPara} className="text-[12px] px-3 py-1.5 flex items-center gap-1"><Plus size={12}/>Add Paragraph</Btn>}>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Field label="Title (first line)"  value={merged.darkTitle}  onChange={e=>patch({darkTitle:e.target.value})}  placeholder="More than media."/>
            <Field label="Accent (second line)" value={merged.darkAccent} onChange={e=>patch({darkAccent:e.target.value})} placeholder="A visibility partner."/>
          </div>
          <div className="space-y-4">
            {merged.darkParagraphs.map((p, i) => (
              <div key={i} className="relative">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Paragraph {i+1}</label>
                <div className="flex gap-2">
                  <TA value={p} onChange={e=>setPara(i,e.target.value)} rows={3}/>
                  <button onClick={()=>removePara(i)} className="text-gray-300 hover:text-red-500 transition-colors self-start mt-1 p-1"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── WHY CHOOSE ────────────────────────────────────────── */}
      {tab==='why' && (
        <>
          <Card title="Section Heading">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Title"  value={merged.whyTitle}  onChange={e=>patch({whyTitle:e.target.value})}  placeholder="Five reasons brands"/>
              <Field label="Accent" value={merged.whyAccent} onChange={e=>patch({whyAccent:e.target.value})} placeholder="choose us."/>
            </div>
          </Card>

          <Card title="Why Choose Items" action={<Btn onClick={openAddWhy} className="text-[12px] px-3 py-1.5 flex items-center gap-1"><Plus size={12}/>Add Item</Btn>}>
            <div className="space-y-2">
              {merged.whyItems.map((item,i) => (
                <div key={item.id} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-50 transition-colors">
                  <span className="text-[11px] font-black tracking-wider mt-0.5 flex-shrink-0" style={{color:'#D90429',minWidth:24}}>{item.num}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900">{item.title}</p>
                    <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-2">{item.desc}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={()=>openEditWhy(item)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"><Pencil size={13}/></button>
                    <button onClick={()=>removeWhy(item.id)}className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13}/></button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* ── KEY NUMBERS ───────────────────────────────────────── */}
      {tab==='stats' && (
        <Card title="Key Numbers / Statistics" action={<Btn onClick={openAddStat} className="text-[12px] px-3 py-1.5 flex items-center gap-1"><Plus size={12}/>Add Stat</Btn>}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {merged.keyStats.map(s => (
              <div key={s.id} className="p-5 border border-gray-100 rounded-xl bg-gray-50/60 relative group">
                <p className="text-[32px] font-black leading-none tracking-[-0.05em] mb-1" style={{color:'#D90429'}}>{s.value}</p>
                <p className="text-[14px] font-bold text-gray-900">{s.label}</p>
                <p className="text-[11px] text-gray-400 tracking-wider uppercase mt-1">{s.sub}</p>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>openEditStat(s)}  className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-gray-700 shadow-sm"><Pencil size={11}/></button>
                  <button onClick={()=>removeStat(s.id)} className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-500 shadow-sm"><Trash2 size={11}/></button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── CLIENT BRANDS ─────────────────────────────────────── */}
      {tab==='brands' && (
        <Card title="Client Brands">
          <div className="flex flex-wrap gap-3 mb-5">
            {store.clientBrands.map(b => (
              <div key={b.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                {b.logoUrl && <img src={b.logoUrl} alt={b.name} style={{height:24,width:'auto',objectFit:'contain',maxWidth:48,flexShrink:0}}/>}
                <span className="text-[12px] font-semibold text-gray-700 tracking-wider uppercase">{b.name}</span>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-[12px] text-blue-700">
            ℹ️ To add, edit, or upload logos for client brands, go to <strong>Settings → Brands</strong>.
          </div>
        </Card>
      )}

      {/* ── TRUST STATS ───────────────────────────────────────── */}
      {tab==='trust' && (
        <Card title="Trust Stats (used on Home & other pages)" action={<Btn onClick={openAddTs} className="text-[12px] px-3 py-1.5 flex items-center gap-1"><Plus size={12}/>Add Stat</Btn>}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {store.trustStats.map(s => (
              <div key={s.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/60 relative group">
                <p className="text-[28px] font-black leading-none tracking-[-0.04em] mb-1" style={{color:'#0B0F1A'}}>{s.value}</p>
                <p className="text-[12px] font-semibold text-gray-500">{s.label}</p>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>openEditTs(s)}                    className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-gray-700 shadow-sm"><Pencil size={11}/></button>
                  <button onClick={()=>trustStatStore.remove(s.id)}      className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-500 shadow-sm"><Trash2 size={11}/></button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────────── */}

      {/* Why Choose modal */}
      <InlineModal open={whyModal.open} title={whyModal.item ? 'Edit Why Choose' : 'Add Why Choose'} onClose={()=>setWhyModal({open:false,item:null})}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Number (e.g. 01)" value={whyForm.num}   onChange={e=>setWhyForm(f=>({...f,num:e.target.value}))}/>
            <Field label="Title"            value={whyForm.title} onChange={e=>setWhyForm(f=>({...f,title:e.target.value}))}/>
          </div>
          <TA    label="Description"        value={whyForm.desc}  onChange={e=>setWhyForm(f=>({...f,desc:e.target.value}))} rows={3}/>
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <Btn onClick={()=>setWhyModal({open:false,item:null})} className="bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</Btn>
            <Btn onClick={saveWhy}>{whyModal.item ? 'Save Changes' : 'Add Item'}</Btn>
          </div>
        </div>
      </InlineModal>

      {/* Key Stat modal */}
      <InlineModal open={statModal.open} title={statModal.item ? 'Edit Stat' : 'Add Key Stat'} onClose={()=>setStatModal({open:false,item:null})}>
        <div className="space-y-4">
          <Field label="Value (e.g. 9,500+)" value={statForm.value} onChange={e=>setStatForm(f=>({...f,value:e.target.value}))}/>
          <Field label="Label"               value={statForm.label} onChange={e=>setStatForm(f=>({...f,label:e.target.value}))}/>
          <Field label="Sub-label"           value={statForm.sub}   onChange={e=>setStatForm(f=>({...f,sub:e.target.value}))}/>
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <Btn onClick={()=>setStatModal({open:false,item:null})} className="bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</Btn>
            <Btn onClick={saveStat}>{statModal.item ? 'Save Changes' : 'Add Stat'}</Btn>
          </div>
        </div>
      </InlineModal>

      {/* Trust Stat modal */}
      <InlineModal open={tsModal.open} title={tsModal.item ? 'Edit Trust Stat' : 'Add Trust Stat'} onClose={()=>setTsModal({open:false,item:null})}>
        <div className="space-y-4">
          <Field label="Value (e.g. 9,500+)" value={tsForm.value} onChange={e=>setTsForm(f=>({...f,value:e.target.value}))}/>
          <Field label="Label"               value={tsForm.label} onChange={e=>setTsForm(f=>({...f,label:e.target.value}))}/>
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <Btn onClick={()=>setTsModal({open:false,item:null})} className="bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</Btn>
            <Btn onClick={saveTs}>{tsModal.item ? 'Save Changes' : 'Add Stat'}</Btn>
          </div>
        </div>
      </InlineModal>
    </div>
  )
}
