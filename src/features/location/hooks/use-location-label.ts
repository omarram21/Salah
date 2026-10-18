import { useTranslation } from 'react-i18next';

import { isLanguage } from '@/shared/i18n';

import { findCity } from '../data/cities';
import type { AppLocation } from '../model/types';

/** Location name in the current UI language (built-in cities are translated). */
export function useLocationLabel(location: AppLocation | null): string | null {
  const { i18n } = useTranslation();
  if (!location) return null;
  const city = findCity(location.cityId);
  if (!city) return location.label;
  const lang = isLanguage(i18n.language) ? i18n.language : 'en';
  return `${city.name[lang]}, ${city.country[lang]}`;
}
