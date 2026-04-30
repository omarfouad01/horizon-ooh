import { useState, useEffect, useRef } from 'react'
import { Icon } from '@iconify/react'

// ─── Curated icon suggestions for outdoor advertising services ────────────────
const SUGGESTED_ICONS = [
  // Billboards & OOH
  { icon: 'ph:presentation-chart-bold',  label: 'Billboard' },
  { icon: 'ph:image-square-bold',        label: 'Banner' },
  { icon: 'ph:monitor-bold',             label: 'Digital Screen' },
  { icon: 'ph:device-mobile-bold',       label: 'Mobile/DOOH' },
  { icon: 'ph:buildings-bold',           label: 'Urban/City' },
  { icon: 'ph:map-pin-bold',             label: 'Location Pin' },
  { icon: 'ph:map-trifold-bold',         label: 'Map' },
  { icon: 'ph:road-horizon-bold',        label: 'Highway' },
  { icon: 'ph:broadcast-bold',           label: 'Broadcast' },
  { icon: 'ph:megaphone-bold',           label: 'Megaphone' },
  { icon: 'ph:star-bold',                label: 'Star/Premium' },
  { icon: 'ph:eye-bold',                 label: 'Visibility' },
  { icon: 'ph:lightbulb-bold',           label: 'Illuminated' },
  { icon: 'ph:sun-bold',                 label: 'Daylight' },
  { icon: 'ph:moon-bold',                label: 'Night' },
  { icon: 'ph:storefront-bold',          label: 'Retail/Mall' },
  { icon: 'ph:airplane-bold',            label: 'Airport' },
  { icon: 'ph:train-bold',               label: 'Transit' },
  { icon: 'ph:car-bold',                 label: 'Street' },
  { icon: 'ph:traffic-sign-bold',        label: 'Traffic/Road' },
  { icon: 'ph:flag-bold',                label: 'Flag Banner' },
  { icon: 'ph:wall-bold',                label: 'Wall Mural' },
  { icon: 'ph:frame-corners-bold',       label: 'Frame/Panel' },
  { icon: 'ph:squares-four-bold',        label: 'Multi-Panel' },
  { icon: 'ph:layout-bold',              label: 'Layout' },
  { icon: 'ph:stack-bold',               label: 'Double Decker' },
  { icon: 'ph:chart-bar-bold',           label: 'Analytics' },
  { icon: 'ph:users-bold',               label: 'Audience' },
  { icon: 'ph:target-bold',              label: 'Targeting' },
  { icon: 'ph:trend-up-bold',            label: 'Growth' },
  { icon: 'ph:camera-bold',              label: 'Photo/Media' },
  { icon: 'ph:video-bold',               label: 'Video' },
  { icon: 'ph:lightning-bold',           label: 'LED/Electric' },
  { icon: 'ph:palette-bold',             label: 'Creative' },
  { icon: 'ph:paint-roller-bold',        label: 'Printing' },
  { icon: 'ph:certificate-bold',         label: 'Premium/Award' },
  { icon: 'ph:trophy-bold',              label: 'Award' },
  { icon: 'ph:handshake-bold',           label: 'Partnership' },
  { icon: 'ph:briefcase-bold',           label: 'Business' },
  { icon: 'ph:gear-six-bold',            label: 'Operations' },
]

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<{ icon: string; label: string }[]>([])
  const [searching, setSearching] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Search Iconify API when user types
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        // Search Iconify API — ph: (Phosphor) prefix for consistent style
        const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefix=ph&limit=40`)
        if (res.ok) {
          const data = await res.json()
          const icons = (data.icons ?? []).map((name: string) => ({
            icon: name,
            label: name.replace('ph:', '').replace(/-bold$/, '').replace(/-/g, ' '),
          }))
          setResults(icons)
        }
      } catch { /* network error — fall back to suggestions */ }
      finally { setSearching(false) }
    }, 350)
    return () => clearTimeout(timer)
  }, [query])

  const displayed = query.trim()
    ? results
    : SUGGESTED_ICONS

  return (
    <div ref={ref} className="relative">
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
        Service Icon
      </label>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 h-10 px-3 w-full rounded-xl border border-gray-200 hover:border-gray-400 bg-white transition-colors text-left"
      >
        {value ? (
          <>
            <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0">
              <Icon icon={value} width={18} height={18} className="text-gray-700" />
            </span>
            <span className="text-[13px] text-gray-700 truncate flex-1 font-mono">{value}</span>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange('') }}
              className="text-gray-300 hover:text-red-500 text-xs font-bold transition-colors px-1"
            >✕</button>
          </>
        ) : (
          <span className="text-[13px] text-gray-400">Click to pick an icon…</span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
             style={{ maxHeight: 380 }}>
          {/* Search bar */}
          <div className="p-3 border-b border-gray-100 sticky top-0 bg-white z-10">
            <input
              autoFocus
              type="text"
              placeholder="Search 275,000+ icons… (e.g. billboard, screen, city)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full h-9 px-3 text-[13px] rounded-xl border border-gray-200 outline-none focus:border-gray-400 bg-gray-50"
            />
          </div>

          {/* Section label */}
          <div className="px-3 pt-2 pb-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {query.trim()
                ? searching ? 'Searching…' : `${results.length} results`
                : 'Suggested icons for outdoor advertising'}
            </p>
          </div>

          {/* Icon grid */}
          <div className="overflow-y-auto px-3 pb-3" style={{ maxHeight: 280 }}>
            {displayed.length === 0 && !searching && (
              <p className="text-center text-[12px] text-gray-400 py-8">No icons found — try a different term</p>
            )}
            <div className="grid grid-cols-8 gap-1.5">
              {displayed.map(({ icon, label }) => (
                <button
                  key={icon}
                  type="button"
                  title={label}
                  onClick={() => { onChange(icon); setOpen(false); setQuery('') }}
                  className={[
                    'flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all hover:border-blue-400 hover:bg-blue-50',
                    value === icon
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent bg-gray-50',
                  ].join(' ')}
                >
                  <Icon icon={icon} width={20} height={20} className={value === icon ? 'text-blue-600' : 'text-gray-600'} />
                  <span className="text-[8px] text-gray-400 truncate w-full text-center leading-none" style={{ maxWidth: 52 }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer hint */}
          <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/50">
            <p className="text-[10px] text-gray-400 text-center">
              Powered by <strong>Iconify</strong> · 275,000+ icons · Type to search any icon
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Icon renderer for website (fetches from Iconify CDN) ─────────────────────
interface ServiceIconProps {
  icon: string
  size?: number
  className?: string
  color?: string
}

export function ServiceIcon({ icon, size = 32, className = '', color }: ServiceIconProps) {
  if (!icon) return null
  return (
    <Icon
      icon={icon}
      width={size}
      height={size}
      className={className}
      style={color ? { color } : undefined}
    />
  )
}
