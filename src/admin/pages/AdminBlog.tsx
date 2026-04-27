import { useState } from 'react'
import { useStore, blogStore } from '@/store/dataStore'
import type { BlogPost } from '@/data'
import { Btn, PageHeader, Tbl, Th, Td, Tr, Badge, Confirm, Modal, Field, TA, ImagePicker } from '../ui'
import { Plus, Pencil, Trash2, GripVertical, MoveUp, MoveDown, X, AlignLeft, Heading2, List, Link2 } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────
type BlockType = 'h2' | 'p' | 'ul' | 'cta'
interface Block { id: string; type: BlockType; content?: string; items?: string[] }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

// ─── Block icons ─────────────────────────────────────────────────────────────
const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: 'h2',  label: 'Heading',   icon: <Heading2 size={14}/>,  desc: 'Section heading H2' },
  { type: 'p',   label: 'Paragraph', icon: <AlignLeft size={14}/>, desc: 'Text paragraph' },
  { type: 'ul',  label: 'List',      icon: <List size={14}/>,      desc: 'Bullet list' },
  { type: 'cta', label: 'CTA',       icon: <Link2 size={14}/>,     desc: 'Call to action banner' },
]

// ─── Single Block Editor ──────────────────────────────────────────────────────
function BlockEditor({ block, idx, total, onChange, onRemove, onMove }: {
  block: Block; idx: number; total: number;
  onChange: (b: Block) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const bt = BLOCK_TYPES.find(x => x.type === block.type)!

  const updateItem = (i: number, v: string) => {
    const items = [...(block.items || [])]
    items[i] = v
    onChange({ ...block, items })
  }
  const addItem = () => onChange({ ...block, items: [...(block.items || []), ''] })
  const removeItem = (i: number) => onChange({ ...block, items: (block.items || []).filter((_, j) => j !== i) })

  return (
    <div className="group relative flex gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors"
         style={{ boxShadow: '0 1px 4px rgba(11,15,26,0.04)' }}>
      {/* Grip + move */}
      <div className="flex flex-col items-center gap-0.5 pt-0.5 flex-shrink-0">
        <GripVertical size={14} className="text-gray-200 cursor-grab" />
        <button onClick={() => onMove(-1)} disabled={idx === 0}
          className="p-0.5 rounded text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors">
          <MoveUp size={11}/>
        </button>
        <button onClick={() => onMove(1)} disabled={idx === total - 1}
          className="p-0.5 rounded text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors">
          <MoveDown size={11}/>
        </button>
      </div>

      {/* Type badge */}
      <div className="flex-shrink-0 pt-0.5">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider"
             style={{ background: '#F5F5F6', color: '#666' }}>
          {bt.icon}<span>{bt.label}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {block.type === 'h2' && (
          <input value={block.content || ''} onChange={e => onChange({ ...block, content: e.target.value })}
            placeholder="Section heading text…"
            className="w-full text-[18px] font-bold text-gray-900 bg-transparent border-b border-gray-100 focus:border-navy outline-none pb-1 placeholder:text-gray-300"/>
        )}
        {block.type === 'p' && (
          <textarea value={block.content || ''} onChange={e => onChange({ ...block, content: e.target.value })}
            placeholder="Paragraph text…"
            rows={3}
            className="w-full text-[14px] text-gray-700 bg-transparent border border-gray-100 rounded-lg px-3 py-2 focus:border-navy outline-none resize-none placeholder:text-gray-300"/>
        )}
        {block.type === 'ul' && (
          <div className="space-y-2">
            {(block.items || []).map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-gray-300 text-[10px]">•</span>
                <input value={item} onChange={e => updateItem(i, e.target.value)}
                  placeholder={`List item ${i + 1}…`}
                  className="flex-1 text-[14px] text-gray-700 bg-transparent border-b border-gray-100 focus:border-navy outline-none placeholder:text-gray-300"/>
                <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-400 transition-colors"><X size={12}/></button>
              </div>
            ))}
            <button onClick={addItem}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 hover:text-gray-700 transition-colors mt-1">
              <Plus size={11}/>Add item
            </button>
          </div>
        )}
        {block.type === 'cta' && (
          <input value={block.content || ''} onChange={e => onChange({ ...block, content: e.target.value })}
            placeholder="CTA button label or call-to-action text…"
            className="w-full text-[14px] font-semibold text-gray-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 focus:border-amber-400 outline-none placeholder:text-gray-300"/>
        )}
      </div>

      {/* Remove */}
      <button onClick={onRemove}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all self-start">
        <Trash2 size={13}/>
      </button>
    </div>
  )
}

// ─── Blog Form ────────────────────────────────────────────────────────────────
function BlogForm({ editing, onClose }: { editing?: BlogPost | null; onClose: () => void }) {
  const isEdit = !!editing
  const [formTab, setFormTab] = useState<'en'|'ar'>('en')
  const [f, setF] = useState({
    title:       editing?.title    || '',
    excerpt:     editing?.excerpt  || '',
    category:    editing?.category || 'Industry Guide',
    readTime:    editing?.readTime || '5 min read',
    date:        editing?.date     || '',
    image:       editing?.image    || '',
    imageAlt:    (editing as any)?.imageAlt    || '',
    tags:        (editing as any)?.tags        || [] as string[],
    titleAr:     (editing as any)?.titleAr     || '',
    excerptAr:   (editing as any)?.excerptAr   || '',
    metaTitle:   (editing as any)?.metaTitle   || '',
    metaDesc:    (editing as any)?.metaDesc    || '',
  })
  const [blocks, setBlocks] = useState<Block[]>(
    (editing?.body || []).map(b => ({ ...b, id: uid() })) as Block[]
  )
  const [blocksAr, setBlocksAr] = useState<Block[]>(
    ((editing as any)?.bodyAr || []).map((b: any) => ({ ...b, id: uid() })) as Block[]
  )
  const [tagInput, setTagInput] = useState('')
  const [addMenu,  setAddMenu]  = useState(false)
  const [addMenuAr,setAddMenuAr]= useState(false)

  const set = (k: string, v: any) => setF(p => ({ ...p, [k]: v }))

  function addBlock(type: BlockType) {
    const b: Block = { id: uid(), type, content: '', items: type === 'ul' ? [''] : undefined }
    setBlocks(p => [...p, b])
    setAddMenu(false)
  }
  function updateBlock(id: string, upd: Block) {
    setBlocks(p => p.map(b => b.id === id ? upd : b))
  }
  function removeBlock(id: string) {
    setBlocks(p => p.filter(b => b.id !== id))
  }
  function moveBlock(idx: number, dir: -1 | 1) {
    const arr = [...blocks]
    const to = idx + dir
    if (to < 0 || to >= arr.length) return
    ;[arr[idx], arr[to]] = [arr[to], arr[idx]]
    setBlocks(arr)
  }

  function addTag() {
    const t = tagInput.trim()
    if (t && !f.tags.includes(t)) set('tags', [...f.tags, t])
    setTagInput('')
  }

  function save(e: React.FormEvent) {
    e.preventDefault()
    if (!f.title.trim()) { toast.error('Title is required'); return }
    const slug = f.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const body   = blocks.map(({ id: _id, ...rest }) => rest)
    const bodyAr = blocksAr.map(({ id: _id, ...rest }) => rest)
    const data = { ...f, slug, body, bodyAr, metaTitle: f.metaTitle, metaDesc: f.metaDesc }
    if (isEdit && editing) blogStore.update(editing.id, data)
    else                   blogStore.add(data as any)
    toast.success(isEdit ? 'Post updated' : 'Post created')
    onClose()
  }

  return (
    <form onSubmit={save} className="space-y-5">
      {/* Language tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 w-fit">
        <button type="button" onClick={()=>setFormTab('en')}
          className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all ${formTab==='en' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
          🇬🇧 English
        </button>
        <button type="button" onClick={()=>setFormTab('ar')}
          className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all ${formTab==='ar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          style={formTab==='ar' ? {color:'#D90429'} : {}}>
          🌐 Arabic — عربي
        </button>
      </div>

      {/* ── ENGLISH TAB ── */}
      {formTab === 'en' && (
      <div className="grid grid-cols-1 gap-4">
        <Field label="Title *" value={f.title} onChange={(e: any) => set('title', e.target.value)} required/>
        <TA label="Excerpt (shown in list view)" value={f.excerpt} onChange={(e: any) => set('excerpt', e.target.value)} rows={2}/>
      </div>
      )}

      {/* ── ARABIC TAB ── */}
      {formTab === 'ar' && (
      <div className="grid grid-cols-1 gap-4 p-4 rounded-xl" style={{background:'#FFF8F8', border:'1px solid #FFE0E0'}}>
        <p className="text-[11px] text-gray-400">اترك الحقول فارغة لعرض النص الإنجليزي افتراضياً.</p>
        <Field label="Arabic Title (العنوان)" value={f.titleAr||''} onChange={(e: any) => set('titleAr', e.target.value)} dir="rtl" placeholder="عنوان المقال بالعربية"/>
        <TA label="Arabic Excerpt (الوصف المختصر)" value={f.excerptAr||''} onChange={(e: any) => set('excerptAr', e.target.value)} rows={2} dir="rtl" placeholder="ملخص المقال بالعربية"/>
      </div>
      )}
      {formTab === 'en' && (
      <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Field label="Category"  value={f.category}  onChange={(e: any) => set('category', e.target.value)}/>
        <Field label="Read Time" value={f.readTime}   onChange={(e: any) => set('readTime', e.target.value)} placeholder="5 min read"/>
        <Field label="Date"      value={f.date}       onChange={(e: any) => set('date', e.target.value)}     placeholder="March 2026"/>
      </div>
      <ImagePicker
        label="Cover Image"
        value={f.image}
        altValue={f.imageAlt}
        onChange={(url, alt) => { set('image', url); set('imageAlt', alt) }}
      />
      {/* SEO */}
      <div className="p-4 rounded-xl border border-gray-100" style={{background:'#F9FAFB'}}>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">🔍 SEO Meta Tags</p>
        <div className="space-y-3">
          <Field label="Meta Title (overrides page title in Google)" value={f.metaTitle} onChange={(e: any) => set('metaTitle', e.target.value)} placeholder={`${f.title} | HORIZON OOH`}/>
          <Field label="Meta Description (shown in search results, 150–160 chars)" value={f.metaDesc} onChange={(e: any) => set('metaDesc', e.target.value)} placeholder="Write a compelling 1–2 sentence summary of this post for Google…"/>
          {f.metaDesc && (
            <p className={`text-[11px] font-medium ${ f.metaDesc.length > 160 ? 'text-red-500' : f.metaDesc.length > 130 ? 'text-amber-500' : 'text-green-600'}`}>
              {f.metaDesc.length} / 160 chars {f.metaDesc.length > 160 ? '— too long!' : f.metaDesc.length > 130 ? '— almost there' : '— good length'}
            </p>
          )}
        </div>
      </div>
      </>
      )}

      {/* Tags */}
      {formTab === 'en' && (
      <div>
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {f.tags.map((t: string) => (
            <span key={t} className="flex items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1 text-[12px] text-gray-600">
              {t}
              <button type="button" onClick={() => set('tags', f.tags.filter((x: string) => x !== t))} className="text-gray-400 hover:text-red-500">
                <X size={10}/>
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={tagInput} onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            placeholder="Add tag…" className="h-8 px-3 rounded-lg border border-gray-200 text-[13px] outline-none focus:border-gray-400 flex-1"/>
          <button type="button" onClick={addTag}
            className="px-3 h-8 rounded-lg bg-gray-100 text-[12px] font-semibold text-gray-600 hover:bg-gray-200">Add</button>
        </div>
      </div>
      )}

      {/* ── ENGLISH Content blocks ── */}
      {formTab === 'en' && (
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Content Blocks (English)</label>
          <div className="relative">
            <button type="button" onClick={() => setAddMenu(p => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy text-white text-[12px] font-semibold hover:bg-navy/90 transition-colors"
              style={{ background: '#0B0F1A' }}>
              <Plus size={12}/> Add Block
            </button>
            {addMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-gray-100 shadow-xl z-10 overflow-hidden">
                {BLOCK_TYPES.map(bt => (
                  <button key={bt.type} type="button" onClick={() => addBlock(bt.type)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors">
                    <span className="text-gray-500">{bt.icon}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-800">{bt.label}</p>
                      <p className="text-[11px] text-gray-400">{bt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {blocks.length === 0 && (
          <div className="text-center py-10 rounded-xl border-2 border-dashed border-gray-100 text-gray-300 text-[13px]">
            No content yet — click <strong>Add Block</strong> to start writing
          </div>
        )}

        <div className="space-y-2.5">
          {blocks.map((b, i) => (
            <BlockEditor key={b.id} block={b} idx={i} total={blocks.length}
              onChange={upd => updateBlock(b.id, upd)}
              onRemove={() => removeBlock(b.id)}
              onMove={dir => moveBlock(i, dir)}/>
          ))}
        </div>
      </div>
      )}

      {/* ── ARABIC Content blocks ── */}
      {formTab === 'ar' && (
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-[11px] font-bold tracking-wider uppercase" style={{color:'#D90429',fontSize:11}}>🌐 محتوى المقال بالعربية — Arabic Body Blocks</label>
          <div className="relative">
            <button type="button" onClick={() => setAddMenuAr(p => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[12px] font-semibold hover:opacity-90 transition-colors"
              style={{ background: '#D90429' }}>
              <Plus size={12}/> Add Arabic Block
            </button>
            {addMenuAr && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-gray-100 shadow-xl z-10 overflow-hidden">
                {BLOCK_TYPES.map(bt => (
                  <button key={bt.type} type="button" onClick={() => { const b: Block = { id: uid(), type: bt.type, content: '', items: bt.type === 'ul' ? [''] : undefined }; setBlocksAr(p => [...p, b]); setAddMenuAr(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors">
                    <span className="text-gray-500">{bt.icon}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-800">{bt.label}</p>
                      <p className="text-[11px] text-gray-400">{bt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {blocksAr.length === 0 && (
          <div className="text-center py-10 rounded-xl border-2 border-dashed text-[13px]" style={{borderColor:'#FFE0E0',color:'#D90429',opacity:0.5}}>
            لا يوجد محتوى بعد — انقر على <strong>Add Arabic Block</strong> لبدء الكتابة
          </div>
        )}
        <div className="space-y-2.5">
          {blocksAr.map((b, i) => (
            <BlockEditor key={b.id} block={b} idx={i} total={blocksAr.length}
              onChange={upd => setBlocksAr(p => p.map(x => x.id === b.id ? upd : x))}
              onRemove={() => setBlocksAr(p => p.filter(x => x.id !== b.id))}
              onMove={dir => { const arr=[...blocksAr]; const to=i+dir; if(to>=0&&to<arr.length){[arr[i],arr[to]]=[arr[to],arr[i]]; setBlocksAr(arr)} }}/>
          ))}
        </div>
      </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-3 border-t border-gray-100 sticky bottom-0 bg-white py-3">
        <Btn variant="ghost" type="button" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">{isEdit ? 'Save Changes' : 'Publish Post'}</Btn>
      </div>
    </form>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminBlog() {
  const { blogPosts } = useStore()
  const [form, setForm] = useState(false)
  const [edit, setEdit] = useState<BlogPost | null>(null)
  const [del,  setDel]  = useState<BlogPost | null>(null)
  const [q,    setQ]    = useState('')

  const filtered = q
    ? blogPosts.filter(p => p.title.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase()))
    : blogPosts

  function openEdit(p: BlogPost) { setEdit(p); setForm(true) }
  function openNew()              { setEdit(null); setForm(true) }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Blog Posts" subtitle={`${blogPosts.length} posts`}
        action={<Btn onClick={openNew}><Plus size={13}/>New Post</Btn>}/>

      {/* Search */}
      <div className="mb-4">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search posts…"
          className="h-9 px-3 rounded-xl border border-gray-200 text-[13px] outline-none focus:border-gray-400 w-64"/>
      </div>

      <Tbl>
        <thead>
          <tr>
            <Th>Title</Th>
            <Th>Category</Th>
            <Th>Blocks</Th>
            <Th>Date</Th>
            <Th className="w-24">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            <Tr key={p.id}>
              <Td>
                <div className="flex items-start gap-3">
                  {p.image && <img src={p.image} alt={(p as any).imageAlt || ''} className="w-10 h-10 object-cover rounded-lg flex-shrink-0"/>}
                  <div>
                    <div className="font-semibold text-gray-900 max-w-xs truncate">{p.title}</div>
                    <div className="text-xs text-gray-400 line-clamp-1 max-w-xs">{p.excerpt}</div>
                  </div>
                </div>
              </Td>
              <Td><Badge color="blue">{p.category}</Badge></Td>
              <Td><span className="text-[13px] text-gray-500">{p.body?.length || 0} blocks</span></Td>
              <Td className="text-xs text-gray-500">{p.date}</Td>
              <Td>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                    onClick={() => openEdit(p)}><Pencil size={13}/></button>
                  <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    onClick={() => setDel(p)}><Trash2 size={13}/></button>
                </div>
              </Td>
            </Tr>
          ))}
          {filtered.length === 0 && (
            <Tr><Td colSpan={5} className="text-center text-gray-400 py-10">No posts found</Td></Tr>
          )}
        </tbody>
      </Tbl>

      <Modal open={form} onClose={() => setForm(false)} title={edit ? `Edit — ${edit.title}` : 'New Blog Post'} size="xl">
        {form && <BlogForm editing={edit} onClose={() => setForm(false)}/>}
      </Modal>

      <Confirm open={!!del} title="Delete Post" message={`Delete "${del?.title}"? This cannot be undone.`}
        onConfirm={() => { if (del) { blogStore.remove(del.id); toast.success('Post deleted'); setDel(null) } }}
        onCancel={() => setDel(null)}/>
    </div>
  )
}
// GUID: 385ea0819fc048248559a75ca2bf0c68
