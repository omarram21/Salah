import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { ar } from './locales/ar';
import { en } from './locales/en';

export const LANGUAGES = ['en', 'ar'] as const;
export type Language = (typeof LANGUAGES)[number];

export const RTL_LANGUAGES: readonly Language[] = ['ar'];

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

export function getDeviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return isLanguage(code) ? code : 'en';
}

export function directionOf(language: Language) {
  return RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
}

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

/** Current UI language, narrowed to the ones we ship. */
export function currentLanguage(): Language {
  return isLanguage(i18n.language) ? i18n.language : 'en';
}

export { i18n };
export { DirectionProvider, useDirection, type Direction } from './direction';
export { useDateFormat } from './use-date-format';
export type { Translations } from './locales/en';
