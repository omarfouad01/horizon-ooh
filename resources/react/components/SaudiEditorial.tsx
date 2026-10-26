import copy from '@/content/saudi-editorial.json'
import { useLang } from '@/i18n/LangContext'
import { Link } from 'react-router-dom'
import { langPath } from '@/lib/routes'

type Section = {title: string; titleAr: string; paragraphs: string[]; paragraphsAr: string[]}
export default function SaudiEditorial({ page }: { page: keyof typeof copy }) {
  const { isAr, lang } = useLang()
  const sections = copy[page] as Section[]
  return <section className="bg-white py-16 sm:py-24" aria-label={isAr ? 'دليل تخطيط الحملة' : 'Campaign planning guide'}>
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px]" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
        {sections.map((section, index) => <article key={index} className="border-t border-[#0B0F1A]/10 pt-7">
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug mb-5 text-[#0B0F1A]">{isAr ? section.titleAr : section.title}</h2>
          {(isAr ? section.paragraphsAr : section.paragraphs).map((paragraph, p) =>
            <p key={p} className="text-base leading-[1.95] text-[#0B0F1A]/70 mb-4">{paragraph}</p>)}
        </article>)}
      </div>
      <nav aria-label={isAr ? 'خطوات تخطيط الحملة' : 'Campaign planning links'} className="flex flex-wrap gap-5 mt-12 text-sm font-bold text-[#D90429]">
        <Link to={langPath(lang, '/locations')}>{isAr ? 'استكشف مواقع اليافطات' : 'Explore billboard locations'}</Link>
        <Link to={langPath(lang, '/services')}>{isAr ? 'خدمات الحملة' : 'Campaign services'}</Link>
        <Link to={langPath(lang, '/projects')}>{isAr ? 'شاهد الأعمال' : 'View projects'}</Link>
        <Link to={langPath(lang, '/contact')}>{isAr ? 'ناقش حملتك' : 'Discuss your campaign'}</Link>
      </nav>
    </div>
  </section>
}
