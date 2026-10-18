import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';

import { useLocationLabel, useLocationStore } from '@/features/location';
import { useNotificationPermission } from '@/features/notifications';
import { findMethod, PRAYERS, usePrayerDays, usePrayerParams } from '@/features/prayer-times';
import { currentLanguage } from '@/shared/i18n';
import { Button, SegmentedControl, Text } from '@/shared/ui';

import { REMINDER_MINUTE_OPTIONS, useSettingsStore } from '../store/settings-store';
import { MinutesPicker } from './minutes-picker';
import { SettingsSection } from './settings-section';
import { ControlRow, LinkRow, SwitchRow } from './settings-rows';

export function SettingsView() {
  const { t } = useTranslation();
  const lang = currentLanguage();
  const s = useSettingsStore();
  const location = useLocationStore((st) => st.location);
  const locationLabel = useLocationLabel(location);
  const { method: detected } = usePrayerDays(usePrayerParams());
  const permission = useNotificationPermission((st) => st.status);

  const methodLabel =
    s.calculationMethod === 'auto'
      ? detected
        ? t('settings.methodAutoDetail', { method: findMethod(detected.id)?.name[lang] ?? detected.name })
        : t('settings.methodAuto')
      : (findMethod(s.calculationMethod)?.name[lang] ?? String(s.calculationMethod));

  const alarmsOff = !s.alarms.enabled;

  return (
    <View className="gap-6">
      <SettingsSection title={t('settings.sectionLocation')}>
        <LinkRow label={t('location.title')} value={locationLabel} onPress={() => router.push('/location')} />
      </SettingsSection>

      <SettingsSection title={t('settings.sectionPrayerTimes')}>
        <LinkRow
          label={t('settings.calculationMethod')}
          value={methodLabel}
          onPress={() => router.push('/calculation-method')}
        />
        <ControlRow label={t('settings.asrMethod')}>
          <SegmentedControl
            value={s.asrMethod}
            onChange={s.setAsrMethod}
            options={[
              { value: 'shafi', label: t('settings.asrShafi') },
              { value: 'hanafi', label: t('settings.asrHanafi') },
            ]}
          />
        </ControlRow>
      </SettingsSection>

      <SettingsSection title={t('settings.sectionAlarms')}>
        {permission === 'denied' && s.alarms.enabled ? (
          <View className="gap-2 border-b border-slate-100 bg-amber-50 px-4 py-3 dark:border-slate-800 dark:bg-amber-950">
            <Text className="text-amber-800 dark:text-amber-300">{t('settings.notificationsBlocked')}</Text>
            <Button variant="secondary" label={t('settings.openSettings')} onPress={() => void Linking.openSettings()} />
          </View>
        ) : null}
        <SwitchRow
          label={t('settings.alarmsEnabled')}
          description={t('settings.alarmsEnabledBody')}
          value={s.alarms.enabled}
          onChange={(enabled) => s.updateAlarms({ enabled })}
        />
        {PRAYERS.map((p) => (
          <SwitchRow
            key={p}
            label={t(`prayers.${p}`)}
            value={s.alarms.prayers[p]}
            onChange={(on) => s.setPrayerAlarm(p, on)}
            disabled={alarmsOff}
          />
        ))}
        <SwitchRow
          label={t('settings.reminder')}
          description={t('settings.reminderBody')}
          value={s.alarms.reminderEnabled}
          onChange={(reminderEnabled) => s.updateAlarms({ reminderEnabled })}
          disabled={alarmsOff}
        />
        <ControlRow label={t('settings.reminderMinutes')}>
          <MinutesPicker
            options={REMINDER_MINUTE_OPTIONS}
            value={s.alarms.reminderMinutes}
            onChange={(reminderMinutes) => s.updateAlarms({ reminderMinutes })}
            label={(m) => t('settings.minutesBefore', { count: m })}
            disabled={alarmsOff || !s.alarms.reminderEnabled}
          />
        </ControlRow>
      </SettingsSection>

      <SettingsSection title={t('settings.sectionAppearance')}>
        <ControlRow label={t('settings.language')}>
          <SegmentedControl
            value={s.language}
            onChange={s.setLanguage}
            options={[
              { value: 'en', label: 'English' },
              { value: 'ar', label: 'العربية' },
            ]}
          />
        </ControlRow>
        <ControlRow label={t('settings.theme')}>
          <SegmentedControl
            value={s.theme}
            onChange={s.setTheme}
            options={[
              { value: 'system', label: t('settings.themeSystem') },
              { value: 'light', label: t('settings.themeLight') },
              { value: 'dark', label: t('settings.themeDark') },
            ]}
          />
        </ControlRow>
      </SettingsSection>

      <Text variant="muted" align="center">
        {t('settings.dataSource')}
      </Text>
    </View>
  );
}
