import { useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';
import Constants from 'expo-constants';

import { useLocationLabel, useLocationStore } from '@/features/location';
import { useNotificationPermission } from '@/features/notifications';
import { findMethod, PRAYERS, usePrayerDays, usePrayerParams } from '@/features/prayer-times';
import { DEMO_DAYS, DemoBanner, selectIsDemo, useTrackingStore } from '@/features/tracking';
import { currentLanguage } from '@/shared/i18n';
import { dateKeyAt, deviceUtcOffsetMin } from '@/shared/lib/date-key';
import { Button, Card, Screen, Switch, Text } from '@/shared/ui';

import { useSettingsStore } from '../store/settings-store';
import { SettingsGroup, SettingsRow } from './settings-group';

/** Settings (design S1): short grouped list; details live on their own pages. */
export function SettingsView() {
  const { t } = useTranslation();
  const lang = currentLanguage();
  const s = useSettingsStore();
  const location = useLocationStore((st) => st.location);
  const locationLabel = useLocationLabel(location);
  const { method: detected } = usePrayerDays(usePrayerParams());
  const permission = useNotificationPermission((st) => st.status);
  const isDemo = useTrackingStore(selectIsDemo);
  const { enableDemo, disableDemo, resetDemo } = useTrackingStore();
  const deviceToday = () => dateKeyAt(Date.now(), deviceUtcOffsetMin());

  const methodValue =
    s.calculationMethod === 'auto'
      ? t('settings.methodAuto')
      : (findMethod(s.calculationMethod)?.name[lang] ?? String(s.calculationMethod));
  const onCount = PRAYERS.filter((p) => s.alarms.prayers[p]).length;
  const alarmsValue = !s.alarms.enabled ? t('settings.off') : onCount === 5 ? t('settings.allFive') : t('settings.nOfFive', { n: onCount });
  const reminderValue =
    s.alarms.enabled && s.alarms.reminderEnabled ? t('settings.minutesBeforeEnd', { n: s.alarms.reminderMinutes }) : t('settings.off');
  const changed = PRAYERS.filter((p) => s.timeOffsets[p] !== 0).length + (s.ishaEnd !== 'fajr' ? 1 : 0) + (s.hijriOffset !== 0 ? 1 : 0);
  const adjustValue = changed ? t('adjust.nChanges', { n: changed }) : t('adjust.none');
  const themeValue = t(`settings.theme${s.theme === 'system' ? 'System' : s.theme === 'light' ? 'Light' : 'Dark'}`);
  const sunnahOn = Object.values(s.sunnahItems).filter(Boolean).length;
  const sunnahValue = s.sunnahEnabled ? t('sunnah.on', { n: sunnahOn }) : t('settings.off');
  const version = Constants.expoConfig?.version ?? '';

  return (
    <Screen title={t('tabs.settings')} contentClassName="gap-0 px-4">
      <DemoBanner />
      {permission === 'denied' && s.alarms.enabled ? (
        <Card className="mt-3 gap-2 bg-accent-soft dark:bg-accent-soft-dark">
          <Text variant="caption" weight="semibold" tone="accent">{t('settings.notificationsBlocked')}</Text>
          <Button variant="secondary" label={t('settings.openSettings')} onPress={() => void Linking.openSettings()} />
        </Card>
      ) : null}

      <SettingsGroup title={t('settings.sectionPrayerTimes')}>
        <SettingsRow icon="pin" label={t('location.title')} value={locationLabel?.split(/[,،]/)[0]} href="/location" />
        <SettingsRow icon="compass" label={t('settings.method')} value={methodValue} href="/calculation-method" />
        <SettingsRow icon="timer" label={t('adjust.title')} value={adjustValue} href="/adjust-times" />
        <SettingsRow icon="compass" label={t('qibla.title')} href="/qibla" />
        <SettingsRow icon="asr" label={t('settings.asrMethod')} value={s.asrMethod === 'hanafi' ? t('settings.asrHanafiShort') : t('settings.asrShafiShort')} href="/asr-method" />
      </SettingsGroup>

      <SettingsGroup title={t('settings.sectionTracking')}>
        <SettingsRow icon="crescent" label={t('sunnah.title')} value={sunnahValue} href="/sunnah" />
      </SettingsGroup>

      <SettingsGroup title={t('settings.sectionAlarms')}>
        <SettingsRow icon="bell" emphasis label={t('settings.alarmsEnabled')} value={alarmsValue} href="/alarms" />
        <SettingsRow icon="late" label={t('settings.reminderShort')} value={reminderValue} href="/alarms" />
      </SettingsGroup>

      <SettingsGroup title={t('settings.sectionAppearance')}>
        <SettingsRow icon="globe" label={t('settings.language')} value={s.language === 'ar' ? 'العربية' : 'English'} href="/language" />
        <SettingsRow icon="theme" label={t('settings.theme')} value={themeValue} href="/theme" />
      </SettingsGroup>

      <SettingsGroup title={t('settings.sectionMore')}>
        <SettingsRow
          icon="flask"
          label={t('settings.demoMode')}
          trailing={
            <Switch
              accessibilityLabel={t('settings.demoMode')}
              value={isDemo}
              onValueChange={(on) => (on ? enableDemo(deviceToday()) : disableDemo())}
            />
          }
        />
        {isDemo ? <SettingsRow icon="trash" label={t('settings.resetDemo')} onPress={() => resetDemo(deviceToday())} /> : null}
        <SettingsRow icon="info" label={t('settings.about')} value={`${t('welcome.title')} ${version}`} />
      </SettingsGroup>

      <View className="items-center gap-1 pb-4 pt-6">
        <Text variant="tiny" tone="faint">{t('settings.demoModeBody', { days: DEMO_DAYS })}</Text>
        <Text variant="tiny" tone="faint">{t('settings.dataSource')}</Text>
        {detected ? <Text variant="tiny" tone="faint">{detected.name}</Text> : null}
      </View>
    </Screen>
  );
}
