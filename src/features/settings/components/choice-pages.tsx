import { useTranslation } from 'react-i18next';

import { Screen } from '@/shared/ui';

import { useSettingsStore, type AsrMethod, type ThemePreference } from '../store/settings-store';
import { OptionList } from './option-list';

type PageProps = { onDone: () => void };

export function AsrMethodPage({ onDone }: PageProps) {
  const { t } = useTranslation();
  const value = useSettingsStore((s) => s.asrMethod);
  const set = useSettingsStore((s) => s.setAsrMethod);
  return (
    <Screen back={onDone} title={t('settings.asrMethod')}>
      <OptionList<AsrMethod>
        value={value}
        onSelect={(v) => {
          set(v);
          onDone();
        }}
        options={[
          { value: 'shafi', label: t('settings.asrShafi'), detail: t('settings.asrShafiBody') },
          { value: 'hanafi', label: t('settings.asrHanafi'), detail: t('settings.asrHanafiBody') },
        ]}
      />
    </Screen>
  );
}

export function LanguagePage({ onDone }: PageProps) {
  const { t } = useTranslation();
  const value = useSettingsStore((s) => s.language);
  const set = useSettingsStore((s) => s.setLanguage);
  return (
    <Screen back={onDone} title={t('settings.language')}>
      <OptionList
        value={value}
        onSelect={(v) => {
          set(v);
          onDone();
        }}
        options={[
          { value: 'en', label: 'English' },
          { value: 'ar', label: 'العربية', detail: t('settings.arabicBody') },
        ]}
      />
    </Screen>
  );
}

export function ThemePage({ onDone }: PageProps) {
  const { t } = useTranslation();
  const value = useSettingsStore((s) => s.theme);
  const set = useSettingsStore((s) => s.setTheme);
  return (
    <Screen back={onDone} title={t('settings.theme')}>
      <OptionList<ThemePreference>
        value={value}
        onSelect={(v) => {
          set(v);
          onDone();
        }}
        options={[
          { value: 'system', label: t('settings.themeSystem'), detail: t('settings.themeSystemBody') },
          { value: 'light', label: t('settings.themeLight') },
          { value: 'dark', label: t('settings.themeDark') },
        ]}
      />
    </Screen>
  );
}
