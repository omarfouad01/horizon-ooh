import { useState } from 'react'
import { useStore, blogStore } from '@/store/dataStore'
import { Btn, PageHeader, Tbl, Th, Td, Tr, Badge, Confirm, Modal, Field, TA, ArrayEditor } from '../ui'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

function BlogForm({ editing, onClose }: any) {
  const init = editing || { title:'', excerpt:'', category:'Industry Guide', readTime:'5 min read', date:'', image:'', body:[] }
  const [f,setF]     = useState({...init})
  const [tags,setTags] = useState<string[]>(init.tags||[])
  const set = (k:string,v:any)=>setF((p:any)=>({...p,[k]:v}))
  const save = (e:React.FormEvent)=>{
    e.preventDefault()
    const data = { ...f, tags, slug: f.title.toLowerCase().replace(/[^a-z0-9]+/g,'-') }
    if(editing) blogStore.update(editing.id, data)
    else        blogStore.add(data)
    toast.success(editing?'Updated':'Created'); onClose()
  }
  return (
    <form onSubmit={save} className="space-y-4">
      <Field label="Title *" value={f.title} onChange={(e:any)=>set('title',e.target.value)} required/>
      <TA label="Excerpt *" value={f.excerpt} onChange={(e:any)=>set('excerpt',e.target.value)} rows={2} required/>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Category"  value={f.category}  onChange={(e:any)=>set('category',e.target.value)}/>
        <Field label="Read Time" value={f.readTime}   onChange={(e:any)=>set('readTime',e.target.value)}  placeholder="5 min read"/>
        <Field label="Date"      value={f.date}       onChange={(e:any)=>set('date',e.target.value)}      placeholder="March 2026"/>
      </div>
      <Field label="Image URL" value={f.image} onChange={(e:any)=>set('image',e.target.value)}/>
      <ArrayEditor label="Tags" value={tags} onChange={setTags} placeholder="e.g. OOH, Egypt"/>
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-xs font-bold text-blue-700 mb-1">Blog Content</p>
        <p className="text-xs text-blue-600">Create the post first. Advanced content section editing (headings, paragraphs, lists) coming soon.</p>
      </div>
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <Btn variant="ghost" type="button" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">{editing?'Save':'Create Post'}</Btn>
      </div>
    </form>
  )
}

export default function AdminBlog() {
  const { blogPosts } = useStore()
  const [form,setForm]=useState(false); const [edit,setEdit]=useState<any>(null); const [del,setDel]=useState<any>(null)
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Blog Posts" subtitle={`${blogPosts.length} posts`}
        action={<Btn onClick={()=>{setEdit(null);setForm(true)}}><Plus size={13}/>New Post</Btn>}/>
      <Tbl><thead><tr><Th>Title</Th><Th>Category</Th><Th>Date</Th><Th className="w-24">Actions</Th></tr></thead>
        <tbody>
          {blogPosts.map(p=>(
            <Tr key={p.id}>
              <Td><div className="font-semibold max-w-xs truncate">{p.title}</div><div className="text-xs text-gray-400">{p.readTime}</div></Td>
              <Td><Badge color="blue">{p.category}</Badge></Td>
              <Td className="text-xs text-gray-500">{p.date}</Td>
              <Td><div className="flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700" onClick={()=>{setEdit(p);setForm(true)}}><Pencil size={13}/></button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" onClick={()=>setDel(p)}><Trash2 size={13}/></button>
              </div></Td>
            </Tr>
          ))}
        </tbody>
      </Tbl>
      <Modal open={form} onClose={()=>setForm(false)} title={edit?`Edit — ${edit.title}`:'New Blog Post'} size="xl">
        <BlogForm editing={edit} onClose={()=>setForm(false)}/>
      </Modal>
      <Confirm open={!!del} title="Delete Post" message={`Delete "${del?.title}"?`}
        onConfirm={()=>{blogStore.remove(del.id);toast.success('Deleted');setDel(null)}} onCancel={()=>setDel(null)}/>
    </div>
  )
}
