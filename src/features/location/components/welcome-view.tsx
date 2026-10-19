import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDirection } from '@/shared/i18n';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Button, Icon, type IconName, Text } from '@/shared/ui';

import { useGpsLocation } from '../hooks/use-gps-location';
import { GpsStatusMessage } from './gps-status-message';

const DAY: IconName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const FEATURES: { icon: IconName; title: 'welcome.f1Title' | 'welcome.f2Title' | 'welcome.f3Title'; body: 'welcome.f1Body' | 'welcome.f2Body' | 'welcome.f3Body' }[] = [
  { icon: 'timer', title: 'welcome.f1Title', body: 'welcome.f1Body' },
  { icon: 'bell', title: 'welcome.f2Title', body: 'welcome.f2Body' },
  { icon: 'mosque', title: 'welcome.f3Title', body: 'welcome.f3Body' },
];

/** First launch: what the app does, then share location or pick a city. */
export function WelcomeView() {
  const { t } = useTranslation();
  const { c } = useThemeColors();
  const { direction } = useDirection();
  const gps = useGpsLocation();

  return (
    <SafeAreaView className="flex-1 bg-paper px-6 dark:bg-paper-dark" style={{ direction }}>
      <View className="flex-row gap-2.5 pt-14">
        {DAY.map((icon, i) => (
          <Icon key={icon} name={icon} size={34} strokeWidth={1.6} color={i === 0 ? c.accent : c.ink} />
        ))}
      </View>
      <Text variant="display" className="mt-9" accessibilityRole="header">
        {t('welcome.title')}
      </Text>
      <Text variant="body" tone="muted" className="mt-3" style={{ fontSize: 17, lineHeight: 25 }}>
        {t('welcome.body')}
      </Text>

      <View className="mt-10 gap-4">
        {FEATURES.map((f) => (
          <View key={f.icon} className="flex-row items-center gap-3.5">
            <View className="size-11 items-center justify-center rounded-full bg-chip dark:bg-chip-dark">
              <Icon name={f.icon} size={20} color={c.ink} />
            </View>
            <View className="flex-1">
              <Text variant="label">{t(f.title)}</Text>
              <Text variant="caption" tone="muted">{t(f.body)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className="mt-auto gap-2.5 pb-6">
        <GpsStatusMessage status={gps.status} />
        <Button
          icon="locate"
          label={gps.status === 'locating' ? t('location.locating') : t('location.useMyLocation')}
          loading={gps.status === 'locating'}
          onPress={gps.locate}
        />
        <Button icon="search" variant="secondary" label={t('location.chooseCity')} onPress={() => router.push('/location')} />
        <View className="mt-1.5 flex-row items-center justify-center gap-1.5">
          <Icon name="lock" size={14} color={c.muted} strokeWidth={2} />
          <Text variant="tiny" tone="muted">{t('welcome.privacy')}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
