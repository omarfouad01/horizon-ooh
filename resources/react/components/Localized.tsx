import React, {forwardRef} from 'react';
import {useLang} from '@/i18n/LangContext';
import {arabicText, arabicHtml, arabicHref} from '@/i18n/publicArabic';

function translateChildren(children: React.ReactNode): React.ReactNode {
  if (typeof children === 'string') return arabicText(children);
  if (Array.isArray(children)) return children.map(translateChildren);
  return children;
}

/** Returns text without a wrapper DOM element, so layout and event targets are unchanged. */
export function LocalizedText({children}: {children?: React.ReactNode}) {
  const {isAr} = useLang();
  return <>{isAr ? translateChildren(children) : children}</>;
}

/** Localize display attributes only; filter values, links, refs and handlers pass through. */
export const LocalizedElement = forwardRef<any, any>(function LocalizedElement({as: Element, children, ...props}, ref) {
  const {isAr} = useLang();
  const localized = {...props};
  const localize = isAr && !['script', 'style', 'code', 'pre'].includes(Element);
  if (localize) {
    if (!localized.download) for (const key of ['to', 'href']) if (typeof localized[key] === 'string') localized[key] = arabicHref(localized[key]);
    for (const key of ['alt', 'title', 'placeholder', 'aria-label', 'aria-valuetext']) {
      if (typeof localized[key] === 'string') localized[key] = arabicText(localized[key]);
    }
    if (localized.dangerouslySetInnerHTML?.__html) localized.dangerouslySetInnerHTML = {__html: arabicHtml(localized.dangerouslySetInnerHTML.__html)};
    if (['input', 'textarea', 'select'].includes(Element)) {
      localized.onInvalid = (event: React.InvalidEvent<HTMLInputElement>) => {
        props.onInvalid?.(event);
        const field = event.currentTarget;
        const validity = field.validity;
        const message = validity.valueMissing ? (field.type === 'checkbox' ? 'يرجى الموافقة للمتابعة.' : 'يرجى ملء هذا الحقل.')
          : validity.typeMismatch && field.type === 'email' ? 'يرجى إدخال بريد إلكتروني صحيح.'
          : validity.tooShort ? `يرجى إدخال ${field.minLength} أحرف على الأقل.`
          : validity.patternMismatch ? 'يرجى إدخال قيمة تطابق الصيغة المطلوبة.' : 'يرجى مراجعة القيمة المدخلة.';
        field.setCustomValidity(message);
      };
      localized.onInput = (event: React.FormEvent<HTMLInputElement>) => {
        event.currentTarget.setCustomValidity(''); props.onInput?.(event);
      };
    }
  }
  return React.createElement(Element, {...localized, ref}, localize ? translateChildren(children) : children);
});
