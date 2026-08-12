export function formatNumber(value: number, decimals: number = 2, locale: 'en' | 'ar' = 'en'): string {
  if (isNaN(value)) return '0';
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-QA' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
