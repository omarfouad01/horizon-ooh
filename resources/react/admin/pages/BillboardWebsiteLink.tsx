import { ExternalLink } from 'lucide-react'
import { useLang } from '@/i18n/LangContext'
import { productHref } from '@/lib/routes'

// Resolve persisted slugs from the owning location, never from editable names.
export default function BillboardWebsiteLink({ billboard, locations, compact = false }: {
  billboard: any; locations: any[]; compact?: boolean
}) {
  const { lang } = useLang()
  if (!billboard?.id || !billboard.slug) return null
  const locationId = billboard._locId ?? billboard.locationId ?? billboard.location_id
  const location = locations.find(l => locationId != null && String(l.id) === String(locationId))
    ?? locations.find(l => (l.products || []).some((p: any) => String(p.id) === String(billboard.id)))
    ?? locations.find(l => l.slug === billboard.citySlug)
  if (!location?.slug) return null
  const label = lang === 'ar' ? 'عرض على الموقع' : 'View on Website'
  const hint = lang === 'ar' ? 'يعرض النسخة المحفوظة في تبويب جديد؛ احفظ التعديلات أولًا لمراجعتها.' : 'Opens the saved version in a new tab. Save changes first to see updates.'
  return <a
    href={productHref(lang, encodeURIComponent(location.slug), encodeURIComponent(billboard.slug))}
    target="_blank" rel="noopener noreferrer"
    aria-label={label + ' — ' + (billboard.code || billboard.nameEn || billboard.title || '')}
    title={hint}
    className={compact
      ? 'inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 whitespace-nowrap'
      : 'inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 whitespace-nowrap'}
  ><ExternalLink size={compact ? 13 : 15}/>{label}</a>
}
