export interface LanguageConfig {
  code: 'en' | 'ar';
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
];

export const DEFAULT_LANGUAGE: LanguageConfig = LANGUAGES[0];
