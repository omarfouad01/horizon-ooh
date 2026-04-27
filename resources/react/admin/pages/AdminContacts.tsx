import { useState } from 'react'
import { useStore, contactStore } from '@/store/dataStore'
import { Btn, PageHeader, Tbl, Th, Td, Tr, Badge, Confirm, Modal, Sel } from '../ui'
import { Trash2, Eye, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

const SC:any={new:'red',read:'yellow',replied:'green',archived:'gray'}

export default function AdminContacts() {
  const { contacts } = useStore()
  const [filter,setFilter] = useState('')
  const [view,  setView]   = useState<any>(null)
  const [del,   setDel]    = useState<any>(null)
  const list = filter ? contacts.filter(c=>c.status===filter) : contacts
  const markRead = (c:any) => { if(c.status==='new') contactStore.update(c.id,{status:'read'}) }
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Contacts" subtitle="Enquiries from the website"
        action={
          <Sel value={filter} onChange={(e:any)=>setFilter(e.target.value)}
            options={[
              {value:'',label:'All'},
              {value:'new',label:'New'},{value:'read',label:'Read'},
              {value:'replied',label:'Replied'},{value:'archived',label:'Archived'}
            ]}/>}/>
      <Tbl>
        <thead><tr><Th>Name</Th><Th>Company</Th><Th>Message</Th><Th>Date</Th><Th>Status</Th><Th className="w-24">Actions</Th></tr></thead>
        <tbody>
          {list.length===0&&<tr><Td colSpan={6} className="text-center py-10 text-xs text-gray-400">No contacts yet</Td></tr>}
          {list.map(c=>(
            <Tr key={c.id} onClick={()=>{setView(c);markRead(c)}}>
              <Td><div className="font-semibold">{c.name}</div><div className="text-xs text-gray-400">{c.email}</div></Td>
              <Td className="text-sm text-gray-600">{c.company||'—'}</Td>
              <Td className="max-w-xs truncate text-xs text-gray-500">{c.subject||c.message?.slice(0,60)}</Td>
              <Td className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'2-digit'})}</Td>
              <Td><Badge color={SC[c.status]||'gray'}>{c.status}</Badge></Td>
              <Td onClick={(e:any)=>e.stopPropagation()}><div className="flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700" onClick={()=>{setView(c);markRead(c)}}><Eye size={13}/></button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" onClick={()=>setDel(c)}><Trash2 size={13}/></button>
              </div></Td>
            </Tr>
          ))}
        </tbody>
      </Tbl>
      {/* View modal */}
      <Modal open={!!view} onClose={()=>setView(null)} title="Contact Details" size="md">
        {view&&<div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Name</p><p className="font-semibold text-gray-900">{view.name}</p></div>
            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Company</p><p className="text-gray-700">{view.company||'—'}</p></div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={`mailto:${view.email}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"><Mail size={13}/>{view.email}</a>
            {view.phone&&<a href={`tel:${view.phone}`} className="flex items-center gap-1.5 text-sm text-green-600 hover:underline"><Phone size={13}/>{view.phone}</a>}
          </div>
          {view.subject&&<div><p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Subject</p><p className="text-sm text-gray-700">{view.subject}</p></div>}
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Message</p>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{view.message}</div></div>
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <Sel value={view.status} onChange={(e:any)=>{contactStore.update(view.id,{status:e.target.value as any});setView({...view,status:e.target.value})}}
                options={[
                  {value:'new',label:'New'},{value:'read',label:'Read'},
                  {value:'replied',label:'Replied'},{value:'archived',label:'Archived'}
                ]}/>
            </div>
            <a href={`mailto:${view.email}`} className="flex-1"><Btn className="w-full" size="sm">Reply by Email</Btn></a>
          </div>
        </div>}
      </Modal>
      <Confirm open={!!del} title="Delete Contact" message={`Delete message from "${del?.name}"?`}
        onConfirm={()=>{contactStore.remove(del.id);toast.success('Deleted');setDel(null)}} onCancel={()=>setDel(null)}/>
    </div>
  )
}
