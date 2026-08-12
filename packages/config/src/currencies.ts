export interface CurrencyConfig {
  code: string;
  name: string;
  nameAr: string;
  symbol: string;
  symbolAr: string;
  decimals: number;
  isDefault?: boolean;
}

export const DEFAULT_CURRENCY: CurrencyConfig = {
  code: 'QAR',
  name: 'Qatari Riyal',
  nameAr: 'ريال قطري',
  symbol: 'QAR',
  symbolAr: 'ر.ق',
  decimals: 2,
  isDefault: true,
};

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  DEFAULT_CURRENCY,
  { code: 'USD', name: 'US Dollar', nameAr: 'دولار أمريكي', symbol: '$', symbolAr: '$', decimals: 2 },
  { code: 'EUR', name: 'Euro', nameAr: 'يورو', symbol: '€', symbolAr: '€', decimals: 2 },
  { code: 'SAR', name: 'Saudi Riyal', nameAr: 'ريال سعودي', symbol: 'SAR', symbolAr: 'ر.س', decimals: 2 },
  { code: 'AED', name: 'UAE Dirham', nameAr: 'درهم إماراتي', symbol: 'AED', symbolAr: 'د.إ', decimals: 2 },
];
