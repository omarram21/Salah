import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { formatWallTime } from '@/shared/lib/format';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Icon, type IconName, Screen, Switch, Text } from '@/shared/ui';

import { KAHF_HOUR_OPTIONS, SUHOOR_MINUTE_OPTIONS, useSettingsStore } from '../store/settings-store';
import { SettingsGroup } from './settings-group';

/** Friday (Jumu'ah, Al-Kahf) and Ramadan (Suhoor / Iftar, fasting) settings, plus previews. */
export function OccasionsSettingsView() {
  const { t } = useTranslation();
  const friday = useSettingsStore((s) => s.friday);
  const ramadan = useSettingsStore((s) => s.ramadan);
  const preview = useSettingsStore((s) => s.preview);
  const updateFriday = useSettingsStore((s) => s.updateFriday);
  const updateRamadan = useSettingsStore((s) => s.updateRamadan);
  const setPreview = useSettingsStore((s) => s.setPreview);
  const labels = { am: t('common.am'), pm: t('common.pm') };

  return (
    <Screen back title={t('occasions.title')} contentClassName="gap-0 px-4">
      <SettingsGroup title={t('occasions.fridaySection')}>
        <SwitchRow icon="mosque" label={t('occasions.jumuahLabel')} body={t('occasions.jumuahLabelBody')} value={friday.jumuahLabel} onChange={(jumuahLabel) => updateFriday({ jumuahLabel })} />
        <SwitchRow icon="list" label={t('occasions.kahfReminder')} body={t('occasions.kahfReminderBody')} value={friday.kahfReminder} onChange={(kahfReminder) => updateFriday({ kahfReminder })}>
          <Chips
            options={KAHF_HOUR_OPTIONS.map((h) => ({ value: h, label: formatWallTime(`${String(h).padStart(2, '0')}:00`, labels) }))}
            value={friday.kahfHour}
            disabled={!friday.kahfReminder}
            onSelect={(kahfHour) => updateFriday({ kahfHour })}
          />
        </SwitchRow>
      </SettingsGroup>

      <SettingsGroup title={t('occasions.ramadanSection')}>
        <SwitchRow icon="crescent" label={t('occasions.ramadanMode')} body={t('occasions.ramadanModeBody')} value={ramadan.enabled} onChange={(enabled) => updateRamadan({ enabled })} />
        <SwitchRow
          icon="fajr"
          label={t('occasions.suhoorReminder')}
          body={t('occasions.suhoorReminderBody')}
          value={ramadan.enabled && ramadan.suhoorReminder}
          disabled={!ramadan.enabled}
          onChange={(suhoorReminder) => updateRamadan({ suhoorReminder })}>
          <Chips
            options={SUHOOR_MINUTE_OPTIONS.map((m) => ({ value: m, label: t('occasions.minutes', { n: m }) }))}
            value={ramadan.suhoorMinutes}
            disabled={!ramadan.enabled || !ramadan.suhoorReminder}
            onSelect={(suhoorMinutes) => updateRamadan({ suhoorMinutes })}
          />
        </SwitchRow>
      </SettingsGroup>
      <Text variant="tiny" tone="faint" className="px-2 pt-2">{t('occasions.iftarNote')}</Text>

      <SettingsGroup title={t('occasions.previewSection')}>
        <SwitchRow icon="flask" label={t('occasions.previewFriday')} value={preview.friday} onChange={(on) => setPreview({ friday: on })} />
        <SwitchRow icon="flask" label={t('occasions.previewRamadan')} value={preview.ramadan} onChange={(on) => setPreview({ ramadan: on })} />
      </SettingsGroup>
      <Text variant="tiny" tone="faint" className="px-2 pt-2">{t('occasions.previewBody')}</Text>
    </Screen>
  );
}

function SwitchRow({
  icon,
  label,
  body,
  value,
  disabled,
  onChange,
  children,
}: {
  icon: IconName;
  label: string;
  body?: string;
  value: boolean;
  disabled?: boolean;
  onChange: (on: boolean) => void;
  children?: ReactNode;
}) {
  const { c } = useThemeColors();
  return (
    <View className="gap-2.5 py-3" style={{ opacity: disabled ? 0.4 : 1 }}>
      <View className="flex-row items-center gap-3">
        <Icon name={icon} size={18} color={c.muted} />
        <View className="flex-1">
          <Text variant="label">{label}</Text>
          {body ? <Text variant="tiny" tone="muted">{body}</Text> : null}
        </View>
        <Switch accessibilityLabel={label} value={value} disabled={disabled} onValueChange={onChange} />
      </View>
      {children}
    </View>
  );
}

function Chips<T extends number>({ options, value, disabled, onSelect }: { options: { value: T; label: string }[]; value: T; disabled?: boolean; onSelect: (v: T) => void }) {
  return (
    <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2 ps-[30px]" style={{ opacity: disabled ? 0.4 : 1 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityLabel={o.label}
            accessibilityState={{ selected: on, disabled }}
            disabled={disabled}
            onPress={() => onSelect(o.value)}
            className={`h-[34px] items-center justify-center rounded-full px-3 ${on ? 'bg-ink dark:bg-ink-dark' : 'bg-chip dark:bg-chip-dark'}`}>
            <Text variant="caption" weight="semibold" tone={on ? 'inverse' : 'ink'} tabular>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
