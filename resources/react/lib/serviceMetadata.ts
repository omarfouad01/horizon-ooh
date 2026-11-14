import { summary } from './seo';
import content from './serviceEditorial.json';

export const editorialServices: Record<string, (typeof content)[keyof typeof content]> = content;

export function getServiceEditorial(service: Record<string, any>) {
  const defaults = editorialServices[service.slug];
  return defaults ? {
    ...defaults,
    ...service.editorial,
    faq: service.editorial?.faq ?? [{
      question: defaults.question, questionAr: defaults.questionAr,
      answer: defaults.answer, answerAr: defaults.answerAr,
    }, ...defaults.faq],
  } as typeof defaults : undefined;
}

export function serviceMetadata(service: Record<string, any>) {
  const row = getServiceEditorial(service);
  const name = service.title || service.name || service.shortTitle || 'Services';
  return {
    title: `${row?.en || name} | HORIZON OOH`,
    description: summary(row?.description || service.description || service.longDescription || name),
    titleAr: `${row?.ar || service.titleAr || 'خدمات هورايزون'} | هورايزون`,
    descriptionAr: summary(row?.descriptionAr || service.descriptionAr || service.longDescriptionAr || 'تواصل مع هورايزون لمعرفة تفاصيل الخدمة.'),
  };
}
