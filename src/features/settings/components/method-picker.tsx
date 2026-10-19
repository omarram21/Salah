import { useTranslation } from 'react-i18next';

import { CALCULATION_METHODS } from '@/features/prayer-times';
import { currentLanguage } from '@/shared/i18n';
import { Screen } from '@/shared/ui';

import { useSettingsStore, type CalculationMethodSetting } from '../store/settings-store';
import { OptionList } from './option-list';

/** AlAdhan methods, with "Automatic" (region default) first. */
export function MethodPicker({ detectedName, onDone }: { detectedName: string | null; onDone: () => void }) {
  const { t } = useTranslation();
  const lang = currentLanguage();
  const value = useSettingsStore((s) => s.calculationMethod);
  const setValue = useSettingsStore((s) => s.setCalculationMethod);

  return (
    <Screen back={onDone} title={t('settings.calculationMethod')}>
      <OptionList<CalculationMethodSetting>
        value={value}
        onSelect={(v) => {
          setValue(v);
          onDone();
        }}
        options={[
          {
            value: 'auto',
            label: t('settings.methodAuto'),
            detail: [t('settings.methodAutoBody'), detectedName].filter(Boolean).join(' · '),
          },
          ...CALCULATION_METHODS.map((m) => ({ value: m.id, label: m.name[lang] })),
        ]}
      />
    </Screen>
  );
}
