import { summary } from './seo';
import content from './serviceEditorial.json';

export const editorialServices: Record<string, (typeof content)[keyof typeof content]> = content;

export function serviceMetadata(service: Record<string, any>) {
  const row = editorialServices[service.slug];
  const name = service.title || service.name || service.shortTitle || 'Services';
  return {
    title: `${row?.en || name} | HORIZON OOH`,
    description: summary(row?.description || service.description || service.longDescription || name),
    titleAr: `${row?.ar || service.titleAr || 'خدمات هورايزون'} | هورايزون`,
    descriptionAr: summary(row?.descriptionAr || service.descriptionAr || service.longDescriptionAr || 'تواصل مع هورايزون لمعرفة تفاصيل الخدمة.'),
  };
}
