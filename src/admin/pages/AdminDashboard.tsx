import { useStore } from '@/store/dataStore'
import { StatCard, PageHeader, Badge, Tbl, Th, Td, Tr } from '../ui'
import { MapPin, Monitor, Briefcase, BookOpen, MessageSquare, Star, Users } from 'lucide-react'

export default function AdminDashboard() {
  const s = useStore()
  const allBillboards = s.locations.flatMap(l => l.products || [])
  const newContacts   = s.contacts.filter(c => c.status === 'new')
  const STATUS:any={new:'red',read:'yellow',replied:'green',archived:'gray'}
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Dashboard" subtitle="Live overview of all site content"/>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard label="Locations"    value={s.locations.length}   icon={<MapPin size={18}/>}        color="navy"/>
        <StatCard label="Billboards"   value={allBillboards.length} icon={<Monitor size={18}/>}       color="red"/>
        <StatCard label="Services"     value={s.services.length}    icon={<Briefcase size={18}/>}     color="blue"/>
        <StatCard label="Projects"     value={s.projects.length}    icon={<Star size={18}/>}          color="green"/>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Blog Posts"   value={s.blogPosts.length}   icon={<BookOpen size={18}/>}      color="navy"/>
        <StatCard label="Total Contacts" value={s.contacts.length}  icon={<Users size={18}/>}         color="blue"/>
        <StatCard label="New Enquiries"  value={newContacts.length} icon={<MessageSquare size={18}/>} color="red"/>
        <StatCard label="Client Brands"  value={s.clientBrands.length} icon={<Star size={18}/>}       color="green"/>
      </div>
      {/* Recent contacts */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-gray-900">Recent Enquiries</h2>
          <Badge color="red">{newContacts.length} new</Badge>
        </div>
        {s.contacts.length === 0 && <p className="text-center text-xs text-gray-400 py-10">No contacts yet</p>}
        {s.contacts.slice(0,8).map(c=>(
          <div key={c.id} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{background:'#0B0F1A'}}>
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
              <p className="text-xs text-gray-400 truncate">{c.email}{c.company ? ` · ${c.company}` : ''}</p>
            </div>
            <Badge color={STATUS[c.status]||'gray'}>{c.status}</Badge>
            <span className="text-xs text-gray-400 flex-shrink-0">{new Date(c.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short'})}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
