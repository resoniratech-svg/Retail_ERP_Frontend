/**
 * Formats a numeric value into Qatar Riyal (QAR / ر.ق) currency format.
 */
export function formatCurrency(amount: number, locale: 'en' | 'ar' = 'en', currencyCode: string = 'QAR'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  
  if (locale === 'ar') {
    const formattedNum = new Intl.NumberFormat('ar-QA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
    return `${formattedNum} ر.ق`;
  }

  const formattedNum = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
  return `QAR ${formattedNum}`;
}

export function formatQAR(amount: number, isArabic: boolean = false): string {
  return formatCurrency(amount, isArabic ? 'ar' : 'en', 'QAR');
}
