import clsx from 'clsx'
import React, { useRef } from 'react'
import { X, GripVertical, Plus, Loader2, Upload, Trash2, ImagePlus } from 'lucide-react'

const NAVY='#0B0F1A', RED='#D90429'

// Button
export function Btn({ variant='primary', size='md', loading, className, children, ...p }:any) {
  const base='inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none'
  const sizes:any={sm:'h-8 px-3 text-xs',md:'h-9 px-4 text-sm',lg:'h-11 px-6 text-sm'}
  const vars:any={
    primary:{background:RED,color:'white'},
    navy:{background:NAVY,color:'white'},
    ghost:{background:'transparent',color:NAVY,border:'1.5px solid rgba(11,15,26,0.15)'},
    danger:{background:'#ef4444',color:'white'},
  }
  return <button className={clsx(base,sizes[size],className)} style={vars[variant]} disabled={loading||p.disabled} {...p}>
    {loading&&<Loader2 size={13} className="animate-spin"/>}{children}
  </button>
}

// Input
export const Field = React.forwardRef<HTMLInputElement,any>(({label,error,hint,className,...p},ref)=>(
  <div className="flex flex-col gap-1.5">
    {label&&<label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>}
    <input ref={ref} className={clsx('h-9 px-3 rounded-xl border text-sm outline-none w-full',
      error?'border-red-400':'border-gray-200 focus:border-gray-400',className)} {...p}/>
    {error&&<span className="text-xs text-red-500">{error}</span>}
    {hint&&!error&&<span className="text-xs text-gray-400">{hint}</span>}
  </div>
))
Field.displayName='Field'

// Textarea
export const TA = React.forwardRef<HTMLTextAreaElement,any>(({label,error,className,...p},ref)=>(
  <div className="flex flex-col gap-1.5">
    {label&&<label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>}
    <textarea ref={ref} rows={3} className={clsx('px-3 py-2.5 rounded-xl border text-sm outline-none w-full resize-none',
      error?'border-red-400':'border-gray-200 focus:border-gray-400',className)} {...p}/>
    {error&&<span className="text-xs text-red-500">{error}</span>}
  </div>
))
TA.displayName='TA'

// Select
export const Sel = React.forwardRef<HTMLSelectElement,any>(({label,error,className,children,...p},ref)=>(
  <div className="flex flex-col gap-1.5">
    {label&&<label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>}
    <select ref={ref} className={clsx('h-9 px-3 rounded-xl border text-sm outline-none bg-white w-full',
      error?'border-red-400':'border-gray-200',className)} {...p}>{children}</select>
    {error&&<span className="text-xs text-red-500">{error}</span>}
  </div>
))
Sel.displayName='Sel'

// Modal
export function Modal({open,onClose,title,children,size='lg'}:any) {
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(11,15,26,0.55)'}}>
      <div className={clsx('bg-white rounded-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl',
        size==='xl'?'max-w-3xl':size==='lg'?'max-w-2xl':'max-w-xl')}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-black text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"><X size={16}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}

// Confirm
export function Confirm({open,title,message,onConfirm,onCancel,loading}:any) {
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(11,15,26,0.55)'}}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-sm font-black text-gray-900 mb-2">{title}</h3>
        <p className="text-xs text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Btn variant="ghost" size="sm" onClick={onCancel}>Cancel</Btn>
          <Btn variant="danger" size="sm" onClick={onConfirm} loading={loading}>Delete</Btn>
        </div>
      </div>
    </div>
  )
}

// Badge
export function Badge({color='gray',children}:any) {
  const c:any={green:'bg-green-50 text-green-700 border-green-200',yellow:'bg-yellow-50 text-yellow-700 border-yellow-200',
    red:'bg-red-50 text-red-600 border-red-200',blue:'bg-blue-50 text-blue-700 border-blue-200',
    gray:'bg-gray-100 text-gray-600 border-gray-200',navy:'bg-slate-800 text-white border-transparent'}
  return <span className={clsx('inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded-lg border',c[color])}>{children}</span>
}

// StatCard
export function StatCard({label,value,icon,color='navy'}:any) {
  const c:any={red:'bg-red-50 text-red-500',navy:'bg-slate-800 text-white',green:'bg-green-50 text-green-600',blue:'bg-blue-50 text-blue-600'}
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-4',c[color])}>{icon}</div>
      <p className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">{value}</p>
      <p className="text-xs font-medium text-gray-400">{label}</p>
    </div>
  )
}

// PageHeader
export function PageHeader({title,subtitle,action}:any) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">{title}</h1>
        {subtitle&&<p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action&&<div>{action}</div>}
    </div>
  )
}

// Table
export function Tbl({children,className}:any){return <div className={clsx('overflow-x-auto rounded-2xl border border-gray-100 bg-white',className)}><table className="w-full text-sm">{children}</table></div>}
export function Th({children,className,colSpan}:any){return <th colSpan={colSpan} className={clsx('px-4 py-3 text-left text-[10px] font-black text-gray-400 tracking-widest uppercase border-b border-gray-100 bg-gray-50/50',className)}>{children}</th>}
export function Td({children,className,colSpan,onClick}:{children?:React.ReactNode;className?:string;colSpan?:number;onClick?:(e:React.MouseEvent)=>void}){return <td colSpan={colSpan} onClick={onClick} className={clsx('px-4 py-3.5 border-b border-gray-50 text-gray-700',className)}>{children}</td>}
export function Tr({children,className,onClick}:any){return <tr className={clsx('hover:bg-gray-50 transition-colors',onClick&&'cursor-pointer',className)} onClick={onClick}>{children}</tr>}

// ArrayEditor
export function ArrayEditor({label,value,onChange,placeholder}:any) {
  const [input,setInput] = React.useState('')
  const add = () => { if(input.trim()){onChange([...value,input.trim()]);setInput('')} }
  return (
    <div>
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">{label}</label>
      <div className="space-y-2 mb-3">
        {value.map((item:string,i:number)=>(
          <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
            <GripVertical size={11} className="text-gray-300 flex-shrink-0"/>
            <span className="flex-1 text-sm text-gray-700">{item}</span>
            <button type="button" onClick={()=>onChange(value.filter((_:any,j:number)=>j!==i))} className="text-gray-400 hover:text-red-500"><X size={13}/></button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder={placeholder||'Add item…'}
          onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();add()}}}
          className="flex-1 h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400"/>
        <Btn type="button" variant="ghost" size="sm" onClick={add}><Plus size={13}/>Add</Btn>
      </div>
    </div>
  )
}

// ── Shared helper ─────────────────────────────────────────────────────────────
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

// ── ImagePicker — single image with editable alt text ──────────────────────
// value    = data-URL or empty string
// altValue = current alt text
// onChange(url, alt) called on every change
export function ImagePicker({
  label,
  value,
  altValue = '',
  onChange,
}: {
  label?: string
  value: string
  altValue?: string
  onChange: (url: string, alt: string) => void
}) {
  const ref = useRef<HTMLInputElement>(null)

  function openPicker(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    ref.current?.click()
  }

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await readFileAsDataURL(file)
    const autoAlt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')
    onChange(url, altValue || autoAlt)
    e.target.value = ''
  }

  return (
    <div>
      {label && <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">{label}</label>}
      <div className="flex items-start gap-3">
        {value ? (
          <div className="relative group flex-shrink-0">
            <img src={value} alt={altValue || 'preview'} className="w-28 h-20 object-cover rounded-xl border border-gray-200"/>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-1.5">
              <button type="button" onClick={openPicker} title="Replace" className="bg-white/20 hover:bg-white/40 text-white rounded-lg p-1.5 transition-colors"><Upload size={13}/></button>
              <button type="button" onClick={() => onChange('', '')} title="Remove" className="bg-white/20 hover:bg-red-500 text-white rounded-lg p-1.5 transition-colors"><Trash2 size={13}/></button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={openPicker}
            className="w-28 h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-1.5 text-gray-400 flex-shrink-0">
            <ImagePlus size={18}/>
            <span className="text-[10px] font-medium">Upload image</span>
          </button>
        )}
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Alt text (SEO &amp; accessibility)</label>
          <input
            type="text"
            value={altValue}
            onChange={e => onChange(value, e.target.value)}
            placeholder={value ? 'Describe the image…' : 'Upload an image first'}
            disabled={!value}
            className="h-8 px-2.5 rounded-xl border border-gray-200 text-[12px] outline-none focus:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed w-full"
          />
          <p className="text-[10px] text-gray-400">
            {value ? 'Auto-filled from filename — edit if needed.' : 'Select an image file from your device.'}
          </p>
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={pick}/>
    </div>
  )
}

// ── ImagePicker — single image file upload ─────────────────────────────────
// ── ImageGalleryPicker — multiple images each with editable alt text ────────
export interface GalleryImage { url: string; alt: string }

export function ImageGalleryPicker({
  label,
  value,
  onChange,
}: {
  label?: string
  value: GalleryImage[]
  onChange: (imgs: GalleryImage[]) => void
}) {
  const ref = useRef<HTMLInputElement>(null)

  function openPicker(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    ref.current?.click()
  }

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const newImgs = await Promise.all(files.map(async f => ({
      url: await readFileAsDataURL(f),
      alt: f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
    })))
    onChange([...value, ...newImgs])
    e.target.value = ''
  }

  function updateAlt(i: number, alt: string) {
    onChange(value.map((img, j) => j === i ? { ...img, alt } : img))
  }

  function remove(i: number) { onChange(value.filter((_, j) => j !== i)) }

  return (
    <div>
      {label && <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">{label}</label>}
      <div className="flex flex-wrap gap-3">
        {value.map((img, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="relative group w-24 h-20">
              <img src={img.url} alt={img.alt} className="w-24 h-20 object-cover rounded-xl border border-gray-200"/>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <button type="button" onClick={() => remove(i)} className="text-white"><Trash2 size={14}/></button>
              </div>
            </div>
            <input
              type="text"
              value={img.alt}
              onChange={e => updateAlt(i, e.target.value)}
              placeholder="alt text…"
              className="w-24 h-6 px-1.5 text-[10px] rounded border border-gray-200 outline-none focus:border-gray-400 text-gray-600"
            />
          </div>
        ))}
        <button type="button" onClick={openPicker}
          className="w-24 h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-1 text-gray-400">
          <Upload size={16}/><span className="text-[10px]">Add photos</span>
        </button>
      </div>
      <p className="text-[10px] text-gray-400 mt-2">Filenames are auto-used as alt text — edit each one below its thumbnail.</p>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={pick}/>
    </div>
  )
}

// Build timestamp: Tue Apr 21 15:56:16 UTC 2026
