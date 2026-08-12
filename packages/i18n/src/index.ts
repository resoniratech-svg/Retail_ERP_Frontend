import enCommon from './en/common.json';
import arCommon from './ar/common.json';
import enPos from './en/pos.json';
import arPos from './ar/pos.json';
import enInventory from './en/inventory.json';
import arInventory from './ar/inventory.json';

export const resources = {
  en: {
    common: enCommon,
    pos: enPos,
    inventory: enInventory,
  },
  ar: {
    common: arCommon,
    pos: arPos,
    inventory: arInventory,
  },
} as const;

export type SupportedLanguage = 'en' | 'ar';
