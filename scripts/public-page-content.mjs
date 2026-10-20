/** Match the public API's legacy-to-current page field aliases during SSG. */
export function locationPageContent(settings) {
  try {
    const value = settings?.locations_page_content;
    const raw = typeof value === 'string' ? JSON.parse(value) : value;
    if (!raw || !Object.keys(raw).length) return {};
    return { ...raw,
      eyebrow: raw.eyebrow ?? raw.heroEyebrow, eyebrowAr: raw.eyebrowAr ?? raw.heroEyebrowAr ?? '',
      title: raw.title ?? raw.heroTitle, titleAr: raw.titleAr ?? raw.heroTitleAr ?? '',
      titleAccent: raw.titleAccent, titleAccentAr: raw.titleAccentAr ?? '',
      subtitle: raw.subtitle ?? raw.heroSubtitle, subtitleAr: raw.subtitleAr ?? raw.heroSubtitleAr ?? '',
      ctaHelpText: raw.ctaHelpText ?? raw.ctaHelp, ctaHelpTextAr: raw.ctaHelpTextAr ?? raw.ctaHelpAr ?? '',
      ctaButton: raw.ctaButton ?? raw.ctaTalkText ?? raw.ctaExpert,
      ctaButtonAr: raw.ctaButtonAr ?? raw.ctaTalkTextAr ?? raw.ctaExpertAr ?? '',
      ctaWhatsApp: raw.ctaWhatsApp ?? raw.whatsappNumber,
      noResultsTitle: raw.noResultsTitle ?? raw.noResults ?? raw.noResultsText,
      noResultsTitleAr: raw.noResultsTitleAr ?? raw.noResultsAr ?? '',
      noResultsHint: raw.noResultsHint, noResultsHintAr: raw.noResultsHintAr ?? '',
    };
  } catch { return {}; }
}
export function projectPageContent(settings) {
  try { const value = settings?.projects_page_content; return (typeof value === 'string' ? JSON.parse(value) : value) || {}; }
  catch { return {}; }
}
