import { useState } from 'react'
import { useStore, siteUserStore, type SiteUser } from '@/store/dataStore'
import { Btn, PageHeader, Modal, Field, TA } from '../ui'
import { Trash2, Eye, Search, Users, Mail, Phone, User } from 'lucide-react'

const SOURCE_BADGE: any = {
  signup:  { label:'Sign Up',  bg:'bg-green-50 text-green-700 border-green-200' },
  login:   { label:'Login',    bg:'bg-blue-50 text-blue-700 border-blue-200' },
  contact: { label:'Contact',  bg:'bg-yellow-50 text-yellow-700 border-yellow-200' },
}

export default function AdminUsers() {
  const store = useStore()
  const [search,  setSearch]  = useState('')
  const [srcFilter,setSrc]    = useState('')
  const [view,    setView]    = useState<SiteUser|null>(null)
  const [delId,   setDelId]   = useState<string|null>(null)

  const filtered = store.siteUsers.filter(u => {
    const q = search.toLowerCase()
    const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchS = !srcFilter || u.source === srcFilter
    return matchQ && matchS
  })

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <PageHeader
        title="Website Users"
        subtitle={`${store.siteUsers.length} user${store.siteUsers.length!==1?'s':''} registered via the website`}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email…"
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-[13px] outline-none focus:border-gray-400 bg-white"/>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl flex-shrink-0">
          {[['','All'],['signup','Sign Up'],['login','Login'],['contact','Contact Form']].map(([v,l])=>(
            <button key={v} onClick={()=>setSrc(v)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={srcFilter===v?{background:'white',color:'#0B0F1A',boxShadow:'0 1px 3px rgba(11,15,26,0.1)'}:{color:'rgba(11,15,26,0.4)'}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {filtered.length===0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4"><Users size={28} className="text-gray-300"/></div>
          <p className="text-[15px] font-semibold text-gray-400">{store.siteUsers.length===0?'No users yet':'No results'}</p>
          <p className="text-[13px] text-gray-300 mt-1">Users appear here when they sign up, log in, or fill in the Contact form.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(u=>{
            const sb = SOURCE_BADGE[u.source] || SOURCE_BADGE.signup
            return (
              <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 group cursor-pointer hover:border-gray-200 transition-colors shadow-sm"
                style={{boxShadow:'0 1px 4px rgba(11,15,26,0.06)'}} onClick={()=>setView(u)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-[14px] font-bold text-gray-500">{(u.name||u.email||'?').charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-gray-900 leading-tight truncate">{u.name || 'Anonymous'}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-lg border mt-0.5 ${sb.bg}`}>{sb.label}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>{ if(delId===u.id){siteUserStore.remove(u.id);setDelId(null)} else setDelId(u.id) }}
                      className={`p-1.5 rounded-lg transition-colors ${delId===u.id?'bg-red-500 text-white':'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}><Trash2 size={13}/></button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  {u.email && <div className="flex items-center gap-2 text-[12px] text-gray-600"><Mail size={11} className="text-gray-400 flex-shrink-0"/><span className="truncate">{u.email}</span></div>}
                  {u.phone && <div className="flex items-center gap-2 text-[12px] text-gray-600"><Phone size={11} className="text-gray-400 flex-shrink-0"/>{u.phone}</div>}
                </div>
                <div className="flex justify-between items-center mt-auto border-t border-gray-50 pt-2">
                  <span className="text-[10px] text-gray-400">Joined {new Date(u.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'2-digit'})}</span>
                  <span className="text-[10px] text-gray-400">Last seen {new Date(u.lastSeen).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'2-digit'})}</span>
                </div>
                {delId===u.id && <p className="text-[11px] text-red-500 font-semibold bg-red-50 rounded-lg px-3 py-2">Click 🗑 again to confirm deletion</p>}
              </div>
            )
          })}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!view} onClose={()=>setView(null)} title="User Details" size="md">
        {view && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                <span className="text-[20px] font-bold text-gray-500">{(view.name||view.email||'?').charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-[16px] font-bold text-gray-900">{view.name || 'Anonymous'}</p>
                <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-lg border mt-1 ${(SOURCE_BADGE[view.source]||SOURCE_BADGE.signup).bg}`}>
                  {(SOURCE_BADGE[view.source]||SOURCE_BADGE.signup).label}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                <a href={`mailto:${view.email}`} className="text-[13px] text-blue-600 hover:underline">{view.email}</a></div>
              {view.phone&&<div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                <a href={`tel:${view.phone}`} className="text-[13px] text-green-600 hover:underline">{view.phone}</a></div>}
            </div>
            <div className="grid grid-cols-2 gap-4 text-[12px] text-gray-500">
              <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Registered</p>{new Date(view.createdAt).toLocaleString('en-GB')}</div>
              <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Last Seen</p>{new Date(view.lastSeen).toLocaleString('en-GB')}</div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</p>
              <textarea className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[13px] text-gray-700 outline-none focus:border-gray-400 resize-none" rows={3}
                value={view.notes||''} onChange={e=>{ siteUserStore.update(view.id,{notes:e.target.value}); setView({...view,notes:e.target.value}) }}
                placeholder="Add notes about this user…"/>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
