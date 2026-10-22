// Matching only: keep saved values, selection IDs and URL parameters untouched.
export function billboardTypeKey(value?: string | null): string {
  const key = (value ?? '').toLowerCase().replace(/[\s_-]+/g, '');
  return ({mega: 'megapost', unipoles: 'unipole', mirro: 'mirror',
    digitalscreens: 'digitalscreen', digitascreens: 'digitalscreen',
    transitads: 'transportationads', rooftop: 'rooftop', soset: 'succette'} as Record<string, string>)[key] || key;
}

export function billboardFilterOptions(formats: any[], types: any[]): string[] {
  const seen = new Set<string>();
  return [...formats, ...types].map(item => item.label ?? item.name).filter((label): label is string => {
    if (typeof label !== 'string' || !label.trim()) return false;
    const key = billboardTypeKey(label);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).sort();
}

export function matchesBillboardFilter(selected: string[], product: {type?: string; adFormat?: string}): boolean {
  return selected.length === 0 || selected.some(value => {
    const key = billboardTypeKey(value);
    return key === billboardTypeKey(product.type) || key === billboardTypeKey(product.adFormat);
  });
}
